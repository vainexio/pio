// Live pricing: products, price lists, rates and keywords live in MongoDB and are
// edited from Discord with /pricing. storage/settings_.js only seeds the first run.
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const { EmbedBuilder, ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = Discord;

const settings = require('../storage/settings_.js')
const { shop, emojis, colors } = settings

const pricingSchema = new mongoose.Schema({
  id: String,
  data: mongoose.Schema.Types.Mixed,
  previous: mongoose.Schema.Types.Mixed,
  updatedBy: String,
  note: String,
  updatedAt: Date,
})
const pricingModel = mongoose.model('SloopiePricing', pricingSchema)
const DOC_ID = 'main'

let meta = {}
let pendingEdits = new Map()

/*
  HELPERS
*/
function clone(value) { return JSON.parse(JSON.stringify(value)) }
function clean(text) { return String(text || '').trim() }
function same(a, b) { return clean(a).toLowerCase() === clean(b).toLowerCase() }
function splitList(text) { return [...new Set(String(text || '').split(/[,\n]/).map(k => k.trim().toLowerCase()).filter(k => k))] }
function round2(n) { return Math.round(n * 100) / 100 }
function peso(n) { return '₱' + round2(n) }
// 1000 → 1k, 1500 → 1.5k, 500 → 500
function compact(n) { return n >= 1000 ? round2(n / 1000) + 'k' : String(n) }
function isPrice(v) { return v === undefined || v === null || (typeof v === 'number' && isFinite(v) && v >= 0) }
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
function oneLine(text, max = 60) {
  text = String(text).replace(/\n+/g, ' ').trim()
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}
function ratePer(rate) { return rate.per > 0 ? rate.per : 1000 }
function rateUnit(rate) { return rate.unit || 'robux' }
// Reseller/booster price, falling back to the customer price when none is set
function pick(entry, reseller) { return reseller && entry.rs > 0 ? entry.rs : entry.price }

function normalize(list) {
  for (let cat of list) {
    cat.keywords = Array.isArray(cat.keywords) ? cat.keywords : []
    cat.types = Array.isArray(cat.types) ? cat.types : []
    for (let type of cat.types) {
      type.keywords = Array.isArray(type.keywords) ? type.keywords : []
      type.children = Array.isArray(type.children) ? type.children : []
    }
  }
  return list
}

// Swap the live list in place so every `shop.pricelists` reference sees it
function setLive(list) {
  shop.pricelists.splice(0, shop.pricelists.length, ...normalize(list))
}
// The settings_.js defaults are live until load() finishes
normalize(shop.pricelists)

/*
  STORAGE
*/
async function load() {
  try {
    let doc = await pricingModel.findOne({ id: DOC_ID }).lean()
    if (!doc) {
      await commit(clone(shop.pricelists), 'settings_.js', 'first-run seed')
      console.log('Pricing: seeded database from settings_.js')
      return
    }
    setLive(doc.data)
    meta = { updatedBy: doc.updatedBy, updatedAt: doc.updatedAt, note: doc.note }
    console.log('Pricing: loaded ' + shop.pricelists.length + ' products from database')
  } catch (err) {
    console.error('Pricing: failed to load, using settings_.js defaults |', err.message)
  }
}

async function commit(list, by, note) {
  list = normalize(list)
  let previous = clone(shop.pricelists)
  meta = { updatedBy: by, updatedAt: new Date(), note: note }
  await pricingModel.updateOne({ id: DOC_ID }, { data: list, previous: previous, ...meta }, { upsert: true })
  setLive(list)
}

// Swaps the live pricing with the one saved before the last change
async function undo(by) {
  let doc = await pricingModel.findOne({ id: DOC_ID }).lean()
  if (!doc || !Array.isArray(doc.previous)) return null
  let undone = doc.note
  meta = { updatedBy: by, updatedAt: new Date(), note: 'undo of "' + undone + '"' }
  await pricingModel.updateOne({ id: DOC_ID }, { data: doc.previous, previous: doc.data, ...meta })
  setLive(doc.previous)
  return undone
}

function validate(list) {
  if (!Array.isArray(list)) return ['The file must contain a list `[ ... ]` of products.']
  let errors = []
  let isWords = v => v === undefined || (Array.isArray(v) && v.every(k => typeof k === 'string'))
  list.forEach((cat, i) => {
    if (!cat || typeof cat.name !== 'string' || !cat.name.trim()) return errors.push('Product #' + (i + 1) + ' needs a "name".')
    let where = '"' + cat.name + '"'
    if (!isWords(cat.keywords)) errors.push(where + ': "keywords" must be a list of words.')
    if (!Array.isArray(cat.types)) return errors.push(where + ': "types" must be a list.')
    cat.types.forEach((type, j) => {
      if (!type || typeof type.parent !== 'string' || !type.parent.trim()) return errors.push(where + ': price list #' + (j + 1) + ' needs a "parent" name.')
      let at = where + ' › "' + type.parent + '"'
      if (!isWords(type.keywords)) errors.push(at + ': "keywords" must be a list of words.')
      if (type.children !== undefined && !Array.isArray(type.children)) errors.push(at + ': "children" must be a list.')
      for (let child of type.children || []) {
        if (!child || typeof child.name !== 'string') errors.push(at + ': every entry needs a "name".')
        else if (!isPrice(child.price) || !isPrice(child.rs)) errors.push(at + ': "' + oneLine(child.name) + '" has an invalid price.')
      }
      let rate = type.rate
      if (rate !== undefined && rate !== null && (typeof rate !== 'object' || typeof rate.price !== 'number' || !isPrice(rate.price) || !isPrice(rate.rs) || !isPrice(rate.per))) {
        errors.push(at + ': "rate" needs a "price" number.')
      }
    })
    if (cat.defaultType && !cat.types.find(t => t && same(t.parent, cat.defaultType))) errors.push(where + ': "defaultType" doesn\'t match any of its price lists.')
  })
  return errors
}

/*
  ORDER MATCHING & QUOTES
*/
function hasKeyword(text, keyword) {
  keyword = clean(keyword).toLowerCase()
  if (!keyword) return false
  return new RegExp('(^|[^a-z0-9])' + escapeRegex(keyword)).test(String(text).toLowerCase())
}

// Finds which price list a ticket order is for. Price-list keywords beat product
// keywords and the longest match wins, so "robux gift" picks gifting over the
// Robux default. Products only match on their own keywords when they set a defaultType.
function findOrderType(text) {
  let best = null
  for (let cat of shop.pricelists) {
    for (let type of cat.types) {
      for (let keyword of type.keywords) {
        if (hasKeyword(text, keyword) && (!best || keyword.length > best.keyword.length)) best = { category: cat, type, keyword }
      }
    }
  }
  if (best) return best
  for (let cat of shop.pricelists) {
    let type = cat.defaultType && cat.types.find(t => same(t.parent, cat.defaultType))
    let keyword = type && cat.keywords.find(k => hasKeyword(text, k))
    if (keyword) return { category: cat, type, keyword }
  }
  return null
}

// One keyword per orderable price list, for the order form hint
function orderKeywords() {
  let words = []
  for (let cat of shop.pricelists) {
    for (let type of cat.types) {
      if (type.keywords[0] && !words.includes(type.keywords[0])) words.push(type.keywords[0])
    }
  }
  return words
}

// "1k and 500" → [{count 1, value 1000}, {count 1, value 500}], "2x 799" → [{count 2, value 799}]
function readAmounts(text) {
  let regex = /(?:(\d+)\s*[x×]\s*)?(?<![\d.])(\d+(?:\.\d+)?)(k(?![a-z]))?/gi
  let amounts = []
  let match
  while ((match = regex.exec(String(text))) !== null) {
    let count = match[1] ? parseInt(match[1]) : 1
    let value = Math.round(parseFloat(match[2]) * (match[3] ? 1000 : 1))
    if (count > 0 && value > 0) amounts.push({ count, value })
  }
  return amounts
}

function ratePrice(rate, amount, reseller) {
  return round2(amount * pick(rate, reseller) / ratePer(rate))
}

// Prices a ticket order. Amounts above the biggest tier are split into chunks of it
// (2500 → 1000 + 1000 + 500). Amounts with no matching tier use the rate when there
// is one; otherwise the whole order comes back as "none" so staff quote it by hand.
function quote(type, amountText, reseller) {
  let none = { price: 'none', items: [] }
  let amounts = readAmounts(amountText)
  if (amounts.length === 0) return none

  let items = []
  function add(name, unitPrice) {
    let found = items.find(i => i.name === name && i.unitPrice === unitPrice)
    if (found) { found.count++; found.total = round2(found.total + unitPrice) }
    else items.push({ name, count: 1, unitPrice, total: unitPrice })
  }

  let tiers = type.children.filter(c => c.price > 0 && !isNaN(parseInt(c.name)))
  if (tiers.length === 0) {
    if (!type.rate) return none
    let total = amounts.reduce((sum, a) => sum + a.count * a.value, 0)
    let price = ratePrice(type.rate, total, reseller)
    add(total + ' ' + rateUnit(type.rate), price)
    return { price, items }
  }

  let largest = Math.max(...tiers.map(t => parseInt(t.name)))
  let chunks = []
  for (let { count, value } of amounts) {
    if (chunks.length + Math.ceil(value / largest) * count > 200) return none
    let parts = []
    for (let left = value; left > 0; left -= largest) parts.push(Math.min(left, largest))
    for (let i = 0; i < count; i++) chunks.push(...parts)
  }
  for (let chunk of chunks) {
    let tier = tiers.find(t => parseInt(t.name) === chunk)
    if (tier) add(tier.name, pick(tier, reseller))
    else if (type.rate) add(chunk + ' ' + rateUnit(type.rate), ratePrice(type.rate, chunk, reseller))
    else return none
  }
  return { price: round2(items.reduce((sum, i) => sum + i.total, 0)), items }
}

// Lines for the pricelist embeds: the rate first, then every entry
function displayEntries(type, reseller) {
  let entries = []
  if (type.rate) entries.push({ name: compact(ratePer(type.rate)) + ' ' + rateUnit(type.rate), price: pick(type.rate, reseller) })
  for (let child of type.children) entries.push({ name: child.name, price: reseller ? pick(child, true) : child.price })
  return entries
}

/*
  ADMIN COMMAND: /pricing
*/
function findProduct(list, name, loose) {
  return list.find(c => same(c.name, name)) || (loose ? list.find(c => c.keywords.some(k => same(k, name))) : undefined)
}
function findType(cat, name, loose) {
  return cat.types.find(t => same(t.parent, name)) || (loose ? cat.types.find(t => t.keywords.some(k => same(k, name))) : undefined)
}
function describeRate(rate) {
  return peso(rate.price) + (rate.rs > 0 ? ' / ' + peso(rate.rs) : '') + ' per ' + compact(ratePer(rate)) + ' ' + rateUnit(rate)
}
function keywordList(words) { return words.length ? words.map(k => '`' + k + '`').join(' ') : '*none*' }

function fail(inter, text) {
  let embed = new EmbedBuilder().setDescription(emojis.x + ' ' + text).setColor(colors.red)
  if (inter.deferred || inter.replied) return inter.editReply({ embeds: [embed] })
  return inter.reply({ embeds: [embed], ephemeral: true })
}

function lastChange() {
  if (!meta.note) return null
  return 'Last change: ' + meta.note + (meta.updatedBy ? ' by ' + meta.updatedBy : '')
}

function productEmbed(cat) {
  let lines = [
    '**Keywords:** ' + keywordList(cat.keywords) + (cat.defaultType ? '\n**Orders default to:** ' + cat.defaultType : ''),
    '**Pricelist:** ' + (cat.channel ? '<#' + cat.channel + '>' : '*none*') + ' · **Reseller:** ' + (cat.rs ? '<#' + cat.rs + '>' : '*none*'),
  ]
  for (let type of cat.types) {
    lines.push('', '__**' + type.parent + '**__' + (type.hidden ? ' *(hidden from pricelist)*' : ''))
    lines.push('keywords: ' + (type.keywords.length ? keywordList(type.keywords) : '*none — tickets won\'t auto-price this*'))
    if (type.rate) lines.push('rate: **' + describeRate(type.rate) + '**')
    for (let child of type.children) {
      lines.push('﹒ ' + oneLine(child.name) + (child.price > 0 ? ' — ' + peso(child.price) + (child.rs > 0 && child.rs !== child.price ? ' / ' + peso(child.rs) : '') : ''))
    }
  }
  let text = lines.join('\n')
  if (text.length > 4000) text = text.slice(0, 3990) + '\n…'
  let embed = new EmbedBuilder().setTitle(cat.name).setDescription(text).setColor(colors.none)
  if (lastChange()) embed.setFooter({ text: lastChange() })
  return embed
}

function overviewEmbed() {
  let lines = []
  for (let cat of shop.pricelists) {
    lines.push('**' + cat.name + '** — ' + keywordList(cat.keywords))
    for (let type of cat.types) {
      let summary = []
      let tiers = type.children.filter(c => c.price > 0).length
      if (type.rate) summary.push(describeRate(type.rate))
      if (tiers) summary.push(tiers + ' prices')
      lines.push('﹒ ' + type.parent + ' — ' + (summary.join(', ') || 'no prices') + (type.hidden ? ' *(hidden)*' : '') + (type.keywords.length ? ' · ' + keywordList(type.keywords) : ''))
    }
    lines.push('')
  }
  let text = lines.join('\n') || 'No products yet. Create one with `/pricing edit`.'
  if (text.length > 4000) text = text.slice(0, 3990) + '\n…'
  return new EmbedBuilder()
    .setTitle('Pricing')
    .setDescription(text)
    .setColor(colors.none)
    .setFooter({ text: [lastChange(), 'See one product with /pricing view product:<name>'].filter(t => t).join(' · ') })
}

function savedEmbed(text) {
  return new EmbedBuilder()
    .setDescription(emojis.check + ' ' + text + '\n-# Run `.setpr` and `.setpr rs` to repost the pricelist channels. `/pricing undo` reverts this.')
    .setColor(colors.green)
}

// "+5" → add ₱5, "-10%" → minus 10%
function parseChange(text) {
  let match = clean(text).replace(/₱/g, '').match(/^([+-])\s*(\d+(?:\.\d+)?)\s*(%?)$/)
  if (!match) return null
  return { amount: Number(match[2]) * (match[1] === '-' ? -1 : 1), percent: match[3] === '%' }
}

function formatEntry(child) {
  let name = child.name.replace(/\n/g, '\\n')
  if (!(child.price > 0)) return name
  return name + ' = ' + child.price + (child.rs !== undefined && child.rs !== null ? ' / ' + child.rs : '')
}

// One entry per line: "name = price", "name = price / reseller", or just "name" for notes
function parseEntries(text) {
  let entries = []
  let errors = []
  for (let line of String(text).split('\n')) {
    if (!line.trim()) continue
    let at = line.lastIndexOf('=')
    if (at === -1) {
      entries.push({ name: line.trim().replace(/\\n/g, '\n') })
      continue
    }
    let name = line.slice(0, at).trim().replace(/\\n/g, '\n')
    let prices = line.slice(at + 1).split('/').map(p => p.replace(/[₱,\s]/g, ''))
    let price = prices[0] === '' ? NaN : Number(prices[0])
    let rs = prices.length > 1 ? (prices[1] === '' ? NaN : Number(prices[1])) : undefined
    if (!name || prices.length > 2 || !(price >= 0) || (rs !== undefined && !(rs >= 0))) {
      errors.push('`' + oneLine(line, 80) + '` — write it as `name = price` or `name = price / reseller`')
      continue
    }
    let entry = { name, price }
    if (rs !== undefined) entry.rs = rs
    entries.push(entry)
  }
  return { entries, errors }
}

// "500" or "315 / 310" → { price, rs }, blank → null
function parseRate(text) {
  text = clean(text).replace(/[₱,\s]/g, '')
  if (!text) return { value: null }
  let parts = text.split('/')
  let price = Number(parts[0])
  let rs = parts.length > 1 ? Number(parts[1]) : undefined
  if (parts.length > 2 || parts[0] === '' || !(price >= 0) || (rs !== undefined && (parts[1] === '' || !(rs >= 0)))) {
    return { error: 'Rate must look like `500` or `315 / 310` (price per 1,000, then the reseller price).' }
  }
  return { value: rs !== undefined ? { price, rs } : { price } }
}

function textInput(id, label, description, style, value, placeholder) {
  let input = new TextInputBuilder().setCustomId(id).setStyle(style).setRequired(false)
  if (style === TextInputStyle.Paragraph) input.setMaxLength(4000)
  if (value) input.setValue(value)
  if (placeholder) input.setPlaceholder(placeholder)
  return new LabelBuilder().setLabel(label).setDescription(description).setTextInputComponent(input)
}

async function showEditModal(inter, productName, typeName) {
  productName = clean(productName)
  typeName = clean(typeName)
  if (!productName) return fail(inter, 'Give the product a name.')
  if (productName.length > 80 || typeName.length > 80) return fail(inter, 'Names must be 80 characters or less.')
  let cat = findProduct(shop.pricelists, productName)
  let type = cat && typeName ? findType(cat, typeName) : null
  let token = Math.random().toString(36).slice(2, 10)
  let modal = new ModalBuilder().setCustomId('pricingEdit-' + token)

  if (typeName) {
    let entries = (type ? type.children : []).map(formatEntry).join('\n')
    if (entries.length > 4000) return fail(inter, 'This price list is too long to edit here. Use `/pricing export`, edit the file, then `/pricing import`.')
    let rate = type && type.rate ? type.rate.price + (type.rate.rs !== undefined && type.rate.rs !== null ? ' / ' + type.rate.rs : '') : ''
    modal.setTitle(((type ? 'Edit ' : 'New ') + (cat ? cat.name : productName) + ' › ' + (type ? type.parent : typeName)).slice(0, 45))
    modal.addLabelComponents(
      textInput('keywords', 'Order keywords', 'Comma separated. A ticket naming one of these gets priced with this list.', TextInputStyle.Short, type ? type.keywords.join(', ') : '', 'e.g. payout, pay out'),
      textInput('rate', 'Rate per 1,000 (optional)', 'Price / reseller price. Prices any amount, e.g. 1.5k = 1.5 × rate.', TextInputStyle.Short, rate, 'e.g. 500  or  315 / 310'),
      textInput('entries', 'Prices', 'One per line: name = price / reseller. Lines without = are notes.', TextInputStyle.Paragraph, entries, '100 robux = 40 / 35\n200 robux = 75\n*covered tax*'),
      textInput('visible', 'Show on pricelist channels?', 'yes or no', TextInputStyle.Short, type && type.hidden ? 'no' : 'yes'),
    )
  } else {
    modal.setTitle(((cat ? 'Edit ' : 'New product: ') + (cat ? cat.name : productName)).slice(0, 45))
    modal.addLabelComponents(
      textInput('keywords', 'Keywords', 'Comma separated. Used by "how much" replies.', TextInputStyle.Short, cat ? cat.keywords.join(', ') : '', 'e.g. robux, rbx'),
      textInput('defaultType', 'Default price list for orders (optional)', 'Used for tickets that only match the keywords above.', TextInputStyle.Short, cat ? cat.defaultType : '', 'e.g. Via Gamepass'),
      textInput('channel', 'Pricelist channel ID', 'Where .setpr posts this product.', TextInputStyle.Short, cat ? cat.channel : ''),
      textInput('rs', 'Reseller pricelist channel ID', 'Where .setpr rs posts this product.', TextInputStyle.Short, cat ? cat.rs : ''),
      textInput('image', 'Banner image URL', 'Shown under the pricelist embed.', TextInputStyle.Short, cat ? cat.image : ''),
    )
  }
  pendingEdits.set(token, { product: cat ? cat.name : productName, type: typeName ? (type ? type.parent : typeName) : null })
  await inter.showModal(modal)
}

async function handleModal(inter) {
  let target = pendingEdits.get(inter.customId.replace('pricingEdit-', ''))
  if (!target) return fail(inter, 'This edit form expired. Run `/pricing edit` again.')
  pendingEdits.delete(inter.customId.replace('pricingEdit-', ''))
  let field = id => inter.fields.getTextInputValue(id)

  let next = clone(shop.pricelists)
  let cat = findProduct(next, target.product)
  if (!cat) {
    cat = { name: target.product, keywords: [], channel: '', rs: '', status: 1, image: '', types: [] }
    next.push(cat)
  }
  let errors = []
  let label = cat.name

  if (target.type) {
    let type = findType(cat, target.type)
    if (!type) {
      type = { parent: target.type, keywords: [], children: [] }
      cat.types.push(type)
    }
    label += ' › ' + type.parent
    type.keywords = splitList(field('keywords'))
    let rate = parseRate(field('rate'))
    if (rate.error) errors.push(rate.error)
    else if (rate.value) {
      type.rate = { per: 1000, unit: 'robux', ...type.rate, ...rate.value }
      if (rate.value.rs === undefined) delete type.rate.rs
    }
    else delete type.rate
    let parsed = parseEntries(field('entries'))
    errors.push(...parsed.errors)
    type.children = parsed.entries
    if (/^(no|n|false|hide|hidden|0)$/i.test(clean(field('visible')))) type.hidden = true
    else delete type.hidden
  } else {
    cat.keywords = splitList(field('keywords'))
    let defaultType = clean(field('defaultType'))
    let found = defaultType && findType(cat, defaultType)
    if (defaultType && !found) errors.push('**' + cat.name + '** has no price list called **' + defaultType + '**. Create it first with `/pricing edit product:' + cat.name + ' type:' + defaultType + '`.')
    if (found) cat.defaultType = found.parent
    else delete cat.defaultType
    for (let key of ['channel', 'rs']) {
      let id = clean(field(key))
      if (id && !/^\d{15,21}$/.test(id)) errors.push('`' + id + '` is not a channel ID.')
      cat[key] = id
    }
    cat.image = clean(field('image'))
    if (cat.image && !/^https?:\/\/\S+$/i.test(cat.image)) errors.push('Banner image must be a link starting with https://')
  }

  if (errors.length) {
    let text = 'Nothing was saved:\n- ' + errors.slice(0, 10).join('\n- ')
    if (target.type && field('entries').length <= 1500) text += '\n\nYour prices, so you can copy them back in:\n```\n' + field('entries') + '\n```'
    return fail(inter, text)
  }
  await commit(next, inter.user.username, 'edit ' + label)
  await inter.reply({ embeds: [savedEmbed('Saved **' + label + '**.'), productEmbed(cat)], ephemeral: true })
}

async function handleAutocomplete(inter) {
  let focused = inter.options.getFocused(true)
  let query = clean(focused.value).toLowerCase()
  let names = []
  if (focused.name === 'product') names = shop.pricelists.map(c => c.name)
  else if (focused.name === 'type') {
    let cat = findProduct(shop.pricelists, inter.options.getString('product'), true)
    names = cat ? cat.types.map(t => t.parent) : []
  }
  let choices = names.filter(n => n.toLowerCase().includes(query)).slice(0, 25).map(n => ({ name: n.slice(0, 100), value: n.slice(0, 100) }))
  await inter.respond(choices).catch(err => console.log('Pricing autocomplete |', err.message))
}

async function handleCommand(inter) {
  let sub = inter.options.getSubcommand()
  let productName = inter.options.getString('product')
  let typeName = inter.options.getString('type')
  let who = inter.user.username

  if (sub === 'view') {
    if (!productName) return inter.reply({ embeds: [overviewEmbed()], ephemeral: true })
    let cat = findProduct(shop.pricelists, productName, true)
    if (!cat) return fail(inter, 'No product called **' + productName + '**.')
    return inter.reply({ embeds: [productEmbed(cat)], ephemeral: true })
  }
  if (sub === 'edit') return showEditModal(inter, productName, typeName)

  if (sub === 'undo') {
    let undone = await undo(who)
    if (!undone) return fail(inter, 'There is no earlier pricing to go back to.')
    return inter.reply({ embeds: [savedEmbed('Reverted the last change (' + undone + '). Run `/pricing undo` again to redo it.')], ephemeral: true })
  }

  if (sub === 'export') {
    let file = new AttachmentBuilder(Buffer.from(JSON.stringify(shop.pricelists, null, 2)), { name: 'pricing.json' })
    return inter.reply({ content: 'Current pricing. Edit it and send it back with `/pricing import`.', files: [file], ephemeral: true })
  }

  if (sub === 'import') {
    let attachment = inter.options.getAttachment('file')
    if (attachment.size > 1000000) return fail(inter, 'That file is too big for a pricing file.')
    await inter.deferReply({ ephemeral: true })
    let list
    try {
      list = JSON.parse(await fetch(attachment.url).then(res => res.text()))
    } catch (err) {
      return fail(inter, 'That file isn\'t valid JSON:\n```' + err.message + '```')
    }
    let errors = validate(list)
    if (errors.length) return fail(inter, 'Nothing was imported:\n- ' + errors.slice(0, 15).join('\n- '))
    await commit(list, who, 'import of ' + attachment.name)
    return inter.editReply({ embeds: [savedEmbed('Imported **' + list.length + '** products from `' + attachment.name + '`.'), overviewEmbed()] })
  }

  // The rest change an existing product
  let next = clone(shop.pricelists)
  let cat = findProduct(next, productName, true)
  if (!cat) return fail(inter, 'No product called **' + productName + '**. Create it with `/pricing edit`.')
  let type = typeName ? findType(cat, typeName, true) : null
  if (typeName && !type) return fail(inter, '**' + cat.name + '** has no price list called **' + typeName + '**.')

  if (sub === 'rate') {
    if (!type) return fail(inter, 'Pick which price list of **' + cat.name + '** gets the rate.')
    let before = type.rate ? describeRate(type.rate) : 'no rate'
    type.rate = { per: 1000, unit: 'robux', ...type.rate, price: inter.options.getNumber('price') }
    let reseller = inter.options.getNumber('reseller')
    if (reseller !== null) type.rate.rs = reseller
    await commit(next, who, 'rate of ' + cat.name + ' › ' + type.parent)
    let warning = type.keywords.length ? '' : '\n' + emojis.warning + ' This price list has no order keywords, so tickets won\'t auto-price it. Add some with `/pricing edit`.'
    return inter.reply({ embeds: [savedEmbed('**' + cat.name + ' › ' + type.parent + '**\n' + before + ' → **' + describeRate(type.rate) + '**' + warning)], ephemeral: true })
  }

  if (sub === 'adjust') {
    let change = parseChange(inter.options.getString('change'))
    if (!change) return fail(inter, 'Write the change like `+5`, `-10`, `+5%` or `-3%`.')
    let applyTo = inter.options.getString('apply_to') || 'both'
    let bump = v => Math.max(0, change.percent ? Math.round(v * (1 + change.amount / 100)) : round2(v + change.amount))
    let changes = []
    for (let t of type ? [type] : cat.types) {
      let entries = t.children.filter(c => c.price > 0).map(c => ({ entry: c, name: oneLine(c.name, 40) }))
      if (t.rate) entries.unshift({ entry: t.rate, name: 'rate per ' + compact(ratePer(t.rate)) })
      for (let { entry, name } of entries) {
        let customerBefore = entry.price
        let resellerBefore = pick(entry, true)
        // An unset reseller price follows the customer price, so pin it when only customers change
        if (applyTo !== 'reseller') entry.price = bump(entry.price)
        if (applyTo === 'customer' && !(entry.rs > 0)) entry.rs = resellerBefore
        if (applyTo === 'reseller' || (applyTo === 'both' && entry.rs > 0)) entry.rs = bump(resellerBefore)
        let parts = []
        if (entry.price !== customerBefore) parts.push(peso(customerBefore) + ' → ' + peso(entry.price))
        if (pick(entry, true) !== resellerBefore) parts.push('reseller ' + peso(resellerBefore) + ' → ' + peso(pick(entry, true)))
        if (parts.length) changes.push(t.parent + ' › ' + name + ': ' + parts.join(' · '))
      }
    }
    if (changes.length === 0) return fail(inter, 'Nothing to change there.')
    let scope = cat.name + (type ? ' › ' + type.parent : '')
    await commit(next, who, 'adjust ' + scope + ' ' + inter.options.getString('change') + ' (' + applyTo + ')')
    let list = changes.slice(0, 25).join('\n') + (changes.length > 25 ? '\n…and ' + (changes.length - 25) + ' more' : '')
    return inter.reply({ embeds: [savedEmbed('Updated **' + changes.length + '** prices in **' + scope + '**:\n' + list)], ephemeral: true })
  }

  if (sub === 'remove') {
    if (type) {
      cat.types.splice(cat.types.indexOf(type), 1)
      if (same(cat.defaultType, type.parent)) delete cat.defaultType
    } else {
      next.splice(next.indexOf(cat), 1)
    }
    let removed = cat.name + (type ? ' › ' + type.parent : '')
    await commit(next, who, 'remove ' + removed)
    return inter.reply({ embeds: [savedEmbed('Removed **' + removed + '**.')], ephemeral: true })
  }
}

module.exports = {
  load,
  findOrderType,
  orderKeywords,
  quote,
  displayEntries,
  handleCommand,
  handleAutocomplete,
  handleModal,
  // exposed for tests
  readAmounts,
  parseEntries,
  parseRate,
  parseChange,
  validate,
}
