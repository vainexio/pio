const express = require('express');
const https = require('https');
const app = express();
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const moment = require('moment')
const { HttpsProxyAgent } = require('https-proxy-agent');
const url = require('url');
const fsSync = require('fs');
const discordTranscripts = require('discord-html-transcripts');
const { joinVoiceChannel } = require('@discordjs/voice');
const cheerio = require('cheerio');
const cors = require('cors');
const body_parser = require('body-parser');
const { exec } = require('node:child_process');

const { exiftool } = require('exiftool-vendored');


const axios = require('axios');
//Discord
const Discord = require('discord.js');
const { MessageAttachment, ActivityType, WebhookClient, Permissions, Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = Discord;
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES);
const client = new Client({ intents: myIntents, partials: ["CHANNEL"] });
//Env
const token = process.env.SECRET;
const open_ai = process.env.OPEN_AI
const mongooseToken = process.env.MONGOOSE;

async function startApp() {
  let promise = client.login(token)
  console.log("Starting...");
  promise.catch(function (error) {
    console.error("Discord bot login | " + error);
    process.exit(1);
  });
}
startApp();
let cmd = false


let ticketSchema
let ticketModel

let tixSchema
let tixModel

let stickySchema
let stickyModel

let embedSchema
let embedModel

let phoneSchema
let phoneModel

let taskSchema
let Task

let userSchema
let User

let closureSchema
let pendingClosure

let AuctionSchema
let auctionModel

let stockSchema
let stockModel

let ticketId = 10

client.on("debug", function (info) {
  console.log(info)
});
//When bot is ready
client.on("ready", async () => {
  let guildsID = [];
  let channel = await getChannel('1109020434810294345')
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  });
  client.guilds.cache.forEach(guild => {
    guildsID.push(guild.id)
  });
  //Database
  await mongoose.connect(mongooseToken);
  AuctionSchema = new mongoose.Schema({
    item: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    highestBid: { type: Number, required: true },
    highestBidderId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    ended: { type: Boolean, default: false }
  });

  closureSchema = new mongoose.Schema({
    userId: String,
    ticketId: String,
    remainingTime: Number,
  })
  taskSchema = new mongoose.Schema({
    description: String,
    createdBy: String,
    id: String,
    createdAt: { type: Date, default: Date.now }
  });
  stickySchema = new mongoose.Schema({
    channelId: String,
    message: String,
  })

  phoneSchema = new mongoose.Schema({
    userId: String,
    number: String,
  })

  embedSchema = new mongoose.Schema({
    id: String,
    title: String,
    description: String,
    color: String,
    thumbnail: String,
    image: String,
    footer: String,
    fields: [{
      name: String,
      value: String
    }]
  });

  ticketSchema = new mongoose.Schema({
    id: String,
    count: Number,
  })

  tixSchema = new mongoose.Schema({
    id: String,
    number: Number,
    tickets: [
      {
        id: String,
        name: String,
        panel: String,
        transcript: String,
        status: String,
        count: Number,
        category: String,
      }
    ],
  })

  userSchema = new mongoose.Schema({
    deviceId: {
      type: String,
      required: true,
      unique: true
    },
    nickname: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  stockSchema = new mongoose.Schema({
    category: String,
    amount: Number,
  })

  stockModel = mongoose.model("SloopieStocks", stockSchema);
  phoneModel = mongoose.model("SloopiePhone", phoneSchema);
  tixModel = mongoose.model("SloopieTix", tixSchema);
  ticketModel = mongoose.model("SloopieTickets", ticketSchema);
  embedModel = mongoose.model('SloopiesEmbed', embedSchema);
  stickyModel = mongoose.model("Sloopies Sticky", stickySchema);
  Task = mongoose.model('Task2', taskSchema);
  pendingClosure = mongoose.model("SloopiesPendingClosure", closureSchema);
  auctionModel = mongoose.model('Auction', AuctionSchema);
  ///
  let doc = await ticketModel.findOne({ id: ticketId })
  if (!doc) {
    let newDoc = new ticketModel(ticketSchema)
    newDoc.id = ticketId
    newDoc.count = 0
    await newDoc.save()
  }
  //Register
  if (slashCmd.register) {
    let discordUrl = "https://discord.com/api/v10/applications/" + client.user.id + "/commands"
    let headers = {
      "Authorization": "Bot " + token,
      "Content-Type": 'application/json'
    }
    for (let i in slashes) {
      let json = slashes[i]
      await sleep(2000)
      let response = await fetch(discordUrl, {
        method: 'post',
        body: JSON.stringify(json),
        headers: headers
      });
      console.log(json.name + ' - ' + response.status)
    }
    for (let i in slashCmd.deleteSlashes) {
      let deleteUrl = "https://discord.com/api/v10/applications/" + client.user.id + "/commands/" + slashCmd.deleteSlashes[i]
      let deleteRes = await fetch(deleteUrl, {
        method: 'delete',
        headers: headers
      })
      console.log('Delete - ' + deleteRes.status)
    }
  }
  console.log('Successfully logged in to discord bot.')
  getPendingClosures()
  let statusInterval = 0
  setInterval(async function () {
    client.user.setPresence(shop.bot.status[statusInterval]);
    statusInterval++
    statusInterval === shop.bot.status.length ? statusInterval = 0 : null
  }, 10000)
})
module.exports = {
  client: client,
  getPerms,
  noPerms,
};

let listener = app.listen(process.env.PORT, function () {
  console.log('Not that it matters but your app is listening on port ' + listener.address().port);
});
/*
░██████╗███████╗████████╗████████╗██╗███╗░░██╗░██████╗░░██████╗
██╔════╝██╔════╝╚══██╔══╝╚══██╔══╝██║████╗░██║██╔════╝░██╔════╝
╚█████╗░█████╗░░░░░██║░░░░░░██║░░░██║██╔██╗██║██║░░██╗░╚█████╗░
░╚═══██╗██╔══╝░░░░░██║░░░░░░██║░░░██║██║╚████║██║░░╚██╗░╚═══██╗
██████╔╝███████╗░░░██║░░░░░░██║░░░██║██║░╚███║╚██████╔╝██████╔╝
╚═════╝░╚══════╝░░░╚═╝░░░░░░╚═╝░░░╚═╝╚═╝░░╚══╝░╚═════╝░╚═════╝░*/
//LOG VARIABLES
var output = "901759430457167872";
const settings = require('./storage/settings_.js')
const { config, filteredWords, AI, shop, notices, auth, prefix, colors, status, theme, commands, permissions, emojis } = settings
//Slash Commands
const slashCmd = require("./storage/slashCommands.js");
const { slashes } = slashCmd;
// Roblox
const robloxJs = require("./functions/roblox.js");
const { handler } = robloxJs;
// QR
const qrGen = require("./functions/qrGen.js");
const { generateQr } = qrGen;
/*
██████╗░███████╗██████╗░███╗░░░███╗░██████╗
██╔══██╗██╔════╝██╔══██╗████╗░████║██╔════╝
██████╔╝█████╗░░██████╔╝██╔████╔██║╚█████╗░
██╔═══╝░██╔══╝░░██╔══██╗██║╚██╔╝██║░╚═══██╗
██║░░░░░███████╗██║░░██║██║░╚═╝░██║██████╔╝
╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═════╝░*/
async function getPerms(member, level) {
  let highestPerms = null
  let highestLevel = 0
  let sortedPerms = await permissions.sort((a, b) => b.level - a.level)
  for (let i in sortedPerms) {
    if (permissions[i].id === member.id && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? (highestPerms = permissions[i], highestLevel = permissions[i].level) : null
    } else if (member.user && member.roles.cache.some(role => role.id === permissions[i].id) && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? (highestPerms = permissions[i], highestLevel = permissions[i].level) : null
    }
  }

  if (highestPerms) return highestPerms;
}
async function guildPerms(message, perms) {
  if (message.member.permissions.has(perms)) {
    return true;
  } else {
    let embed = new MessageEmbed()
      .addFields({ name: 'Insufficient Permissions', value: emojis.x + " You don't have the required server permissions to use this command.\n\n`" + perms.toString().toUpperCase() + "`" })
      .setColor(colors.red)
    message.channel.send({ embeds: [embed] })
  }
}
function noPerms(message) {
  let Embed = new MessageEmbed()
    .setColor(colors.red)
    .setDescription("You lack special permissions to use this command.")
  return Embed;
}
/*
███████╗██╗░░░██╗███╗░░██╗░█████╗░████████╗██╗░█████╗░███╗░░██╗░██████╗
██╔════╝██║░░░██║████╗░██║██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║██╔════╝
█████╗░░██║░░░██║██╔██╗██║██║░░╚═╝░░░██║░░░██║██║░░██║██╔██╗██║╚█████╗░
██╔══╝░░██║░░░██║██║╚████║██║░░██╗░░░██║░░░██║██║░░██║██║╚████║░╚═══██╗
██║░░░░░╚██████╔╝██║░╚███║╚█████╔╝░░░██║░░░██║╚█████╔╝██║░╚███║██████╔╝
╚═╝░░░░░░╚═════╝░╚═╝░░╚══╝░╚════╝░░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝╚═════╝░*/
//Send Messages
const sendMsg = require('./functions/sendMessage.js')
const { safeSend, sendChannel, sendUser } = sendMsg
//Functions
const get = require('./functions/get.js')
const { getTime, chatAI2, getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor } = get
//Command Handler
const cmdHandler = require('./functions/commands.js')
const { checkCommand, isCommand, isMessage, getTemplate } = cmdHandler
//Others
const others = require('./functions/others.js')
const { parseAmounts, makeCode, stringJSON, fetchKey, ghostPing, moderate, getPercentage, sleep, getPercentageEmoji, randomTable, scanString, requireArgs, getArgs, makeButton, makeRow } = others
//Roles Handler
const roles = require('./functions/roles.js')
const { getRole, addRole, removeRole, hasRole } = roles
//Tickets Handler
const tickets = require('./functions/tickets.js')
const { makeTicket } = tickets
//Links Handler
const linksHandler = require('./functions/linksHandler.js')
const { generateLinks, revokeLinks, fetchLinks } = linksHandler
const { ai } = require('./functions/ai.js')
/*
░█████╗░██╗░░░░░██╗███████╗███╗░░██╗████████╗  ███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗
██╔══██╗██║░░░░░██║██╔════╝████╗░██║╚══██╔══╝  ████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝
██║░░╚═╝██║░░░░░██║█████╗░░██╔██╗██║░░░██║░░░  ██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░
██║░░██╗██║░░░░░██║██╔══╝░░██║╚████║░░░██║░░░  ██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░
╚█████╔╝███████╗██║███████╗██║░╚███║░░░██║░░░  ██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗
░╚════╝░╚══════╝╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝*/

//ON CLIENT MESSAGE
let errors = 0
let expCodes = []
let nitroCodes = []

async function bulkDelete(channel, targetContent) {
  const messages = await channel.messages.fetch({ limit: 50 });

  const toDelete = messages.filter(msg =>
    msg.author.id === channel.client.user.id &&  // sent by bot
    msg.content.includes(targetContent)          // content match
  );

  if (toDelete.size > 0) {
    await channel.bulkDelete(toDelete, true);  // `true` skips old messages
    console.log(`Deleted ${toDelete.size} messages.`);
  } else {
    console.log('No matching messages found.');
  }
}
async function updateStocks() {
  let stocks = await stockModel.find()
  let content = "<:w_dash:1322624830553723012> **active stocks** <:w_dash:1322624830553723012>\n"
  for (let i in stocks) {
    let stock = stocks[i]
    let amount = stock.amount
    amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    content += "` "+stock.category+" ` **"+amount+"** stocks left\n"
  }
  content += "-# This updates automatically when an order has been placed"
  let channel = await getChannel("1109020436026634265")

  let row = new MessageActionRow()
  .addComponents(
    new MessageButton().setLabel('create order').setCustomId('createTicket-order').setStyle('SECONDARY').setEmoji('<a:y_b2buntrain1:1138705768808464514>')
  )
  bulkDelete(channel,"active stocks")
  await channel.send({content: content, components: [row]})
}

client.on("messageCreate", async (message) => {
  //Ping
  if (message.channel.parent?.name.toLowerCase().includes('ordrs')) {
    //
    let embed = new MessageEmbed()
      .addFields({ name: 'terms and conditions', value: '<:S_letter:1138714993425125556> before proceeding, you must read and accept our terms and conditions.\n\n<:hb_rule_book:1138712613769990254> by clicking the button, you indicate that you have read, understood and accepted the terms stated in <#1109020435754000421> and the rules implied in <#1109020435754000422> for the product you want to avail *!*\n\n<:hb_rule_book:1138712613769990254> you will be held liable for any violation of our rules, for you have accepted the terms and agreed to comply *!*', inline: true })
      .setColor(colors.yellow)

    let row = new MessageActionRow()
      .addComponents(
        new MessageButton().setLabel('accept terms').setCustomId('terms').setStyle('SECONDARY').setEmoji('<:hb_rule_book:1138712613769990254>'),
      )
    //
    if (message.author.id === client.user.id && message.content?.toLowerCase().includes('ticket opened')) {

      let member = message.mentions.members.first()
      if (member) {
        let phone = await phoneModel.findOne({ userId: member.id })
        if (phone) {
          shop.expected.push({ channel: message.channel.id, amount: "auto", num: phone.number })
        }
        let shopStatus = await getChannel(shop.channels.status);
        if (shopStatus.name === 'shop : CLOSED') {
          message.channel.send("<@" + member.id + "> the shop is currently **closed**, please come back at <t:1677542400:t> to proceed with your order *!*")
        }
        if (!await hasRole(member, ['1109020434520887321'], message.channel.guild)) {

          message.channel.send({ content: "<@" + member.id + ">", embeds: [embed], components: [row] })
        } else if (await hasRole(member, ['1109020434520887321'], message.guild)) {
          let row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('orderFormat').setStyle('SECONDARY').setLabel('order form').setEmoji('<:S_letter:1138714993425125556>'),
          );
          message.channel.send({ components: [row] })
        }
      }
    }
  }
  else if (message.channel.parent?.name.toLowerCase() === 'reports') {
    if (message.author.id === client.user.id && message.content?.toLowerCase().includes('ticket opened')) {
      let vc = await getChannel(shop.channels.reportsVc)
      let member = message.mentions.members.first()
      let state = await hasRole(member, ["Accepted TOS"]) ? "You have accepted our terms.\n— Therefore, we shall not be liable for any mistakes or excuses made once you've violated our rules." : "We shall not be liable for any mistakes or excuses made once you've violated our rules."
      if (vc.name === 'reports : CLOSED') {
        message.channel.send(emojis.warning + " **Void Warranty**\nReport was submitted outside reporting hours.\n\n⚠️ Remarks\n— Void warranty means no replacement nor refund.\n— " + state)
        await addRole(member, ['void'], message.guild)
      } else if (await hasRole(member, ['void'], message.guild)) {
        message.channel.send(emojis.warning + ' **Void Warranty**\nA recent remark was detected that you violated our terms.\n\n— ' + state)
        await removeRole(member, ['void'])
      }
    }
  }
  //
  if (message.author.bot) return;
  if (message.channel.id === "1385126005659799552") {
    let attachments = Array.from(message.attachments.values())
    let files = []
    for (let i in attachments) { files.push(attachments[i].url) }
    if (files.length == 0) return;
    await message.react(emojis.loading)
    axios.get('https://api.sightengine.com/1.0/check.json', {
      params: {
        'url': files[0],
        'models': 'genai',
        'api_user': '46892566',
        'api_secret': 'NgsykrMB25Wj5vqn5PkXsqp8MrD6hAdW',
      }
    })
      .then(async function (response) {
        console.log(response.data);
        let data = response.data
        let ai = data.type.ai_generated * 100
        let deepfake = data.type.deepfake * 100
        if (data.status == "success") {
          let templates = await getChannel(shop.channels.templates)
          let msg = await templates.messages.fetch('1385893430319779850')
          let content = msg.content.replace('{id}', data.request.id).replace('{ai}', getPercentageEmoji(ai, 100) + " " + ai + "%")//.replace('{deepfake}',getPercentageEmoji(deepfake,100)+" "+deepfake+"%")
          message.reply(content)
        }
      })
      .catch(function (error) {
        // handle error
        if (error.response) console.log(error.response.data);
        else console.log(error.message);
      });
  }
  if (message.content.startsWith('.regen')) { await message.reply('Use </regen:1280758037203779594> to regen your links *!*') }
  let checkerVersion = 'Checker version 2.9'
  if (message.channel.name?.includes('nitro-checker') || (message.channel.type === 'DM' && shop.checkerWhitelist.find(u => u === message.author.id))) {
    let args = getArgs(message.content)
    if (args.length === 0) return;
    let addStocks = args[0].toLowerCase() === 'stocks' && message.channel.type !== 'DM' ? true : false
    let sortLinks = args[1]?.toLowerCase() === 'sort' && addStocks && message.channel.type !== 'DM' ? true : args[0]?.toLowerCase() === 'sort' ? true : false

    let codes = []
    let text = ''
    let msg = null
    for (let i in args) {
      if (args[i].toLowerCase().includes('discord.gift') || args[i].toLowerCase().includes('discord.com/gifts')) {
        let code = args[i].replace(/https:|discord.com\/gifts|discord.gift|\/|/g, '').replace(/ /g, '').replace(/[^\w\s]/gi, '').replace(/\\n|\|'|"/g, '')
        let found = codes.find(c => c.code === code)
        !found ? codes.push({ code: code, expire: null, emoji: null, user: null, state: null }) : null
      }
    }
    if (codes.length === 0) return;

    let scanData = shop.checkers.find(c => c.id === message.author.id)
    if (!scanData) {
      let data = {
        id: message.author.id,
        valid: 0,
        claimed: 0,
        invalid: 0,
        total: 0,
      }
      shop.checkers.push(data)
      scanData = shop.checkers.find(c => c.id === message.author.id)
    }
    let row = new MessageActionRow().addComponents(
      new MessageButton().setEmoji("🛑").setLabel("Stop").setCustomId("breakChecker-").setStyle("SECONDARY"),
      new MessageButton().setEmoji("⌛").setLabel("Status").setCustomId("checkerStatus-" + scanData.id).setStyle("SECONDARY")
    );
    await message.channel.send({ content: 'Fetching nitro codes (' + codes.length + ') ' + emojis.loading, components: [row] }).then(botMsg => msg = botMsg)

    for (let i in codes) {
      if (shop.breakChecker) break;
      let fetched = false
      let waitingTime = 0
      while (!fetched) {
        waitingTime > 0 ? await sleep(waitingTime) : null
        waitingTime = 0
        let eCode = expCodes.find(e => e.code === codes[i].code)
        let auth = {
          method: 'GET',
          headers: { 'Authorization': 'Bot ' + token }
        }
        let res = eCode ? eCode : await fetch('https://discord.com/api/v10/entitlements/gift-codes/' + codes[i].code, auth)
        res = eCode ? eCode : await res.json()
        if (res.message && res.retry_after) {
          console.log('retry for ' + codes[i].code)
          let ret = Math.ceil(res.retry_after)
          ret = ret.toString() + "000"
          waitingTime = Number(ret) < 300000 ? Number(ret) : 600000
          if (res.retry_after >= 600000) {
            fetched = true
            shop.breakChecker = true
            await message.channel.send('⚠️ The resource is currently being rate limited. Please try again in ' + res.retry_after + ' seconds')
            break;
          }
        }
        if (!res.retry_after) {
          fetched = true
          scanData.total++
          let e = res.expires_at ? moment(res.expires_at).diff(moment(new Date())) : null
          let diffDuration = e ? moment.duration(e) : null;
          let e2 = res.expires_at ? moment(res.expires_at).unix() : null;
          codes[i].expireUnix = e2 ? "\n<t:" + e2 + ":f>" : '';
          codes[i].rawExpire = e2
          codes[i].expire = diffDuration ? diffDuration.asHours().toFixed(1) : null
          codes[i].emoji = res.uses === 0 ? emojis.check : res.expires_at ? emojis.x : emojis.warning
          codes[i].state = res.expires_at && res.uses === 0 ? 'Claimable' : res.expires_at ? 'Claimed' : 'Invalid'
          codes[i].user = res.user ? '`' + res.user.username + '#' + res.user.discriminator + '`' : "`Unknown User`"
          codes[i].state === 'Claimable' ? scanData.valid++ : codes[i].state === 'Claimed' ? scanData.claimed++ : scanData.invalid++
          let type = res.store_listing?.sku?.name
          let foundCode = nitroCodes.find(c => c.code === res.code)
          if (!foundCode) nitroCodes.push({ code: res.code, type: type })
          foundCode ? type = foundCode.type : null
          codes[i].typeEmoji = type === 'Nitro' ? emojis.nboost : type === 'Nitro Basic' ? emojis.nbasic : type === 'Nitro Classic' ? emojis.nclassic : '❓'
          codes[i].type = type
          if ((!res.expires_at || res.uses >= 1) && !eCode) {
            let data = {
              code: codes[i].code,
              expires_at: res.expires_at,
              uses: res.uses,
              user: res.user,
            }
            expCodes.push(data)
          }
          break;
        }
      }
      await sleep(500);
    }
    if (shop.breakChecker) {
      shop.breakChecker = false
      shop.checkers = []
      msg.edit({ content: emojis.warning + " Interaction was interrupted\n**" + scanData.total + "** link(s) was scanned" })
      return;
    }
    sortLinks ? codes.sort((a, b) => (b.rawExpire - a.rawExpire)) : null
    let embeds = []
    let embed = new MessageEmbed()
      .setColor(colors.yellow)

    let num = 0
    let stat = {
      put: { boost: 0, basic: 0, boostString: '', basicString: '' },
      notput: { count: 0, string: '' }
    }
    for (let i in codes) {
      num++
      let data = codes[i]
      let emoji = data.emoji ? data.emoji : emojis.warning
      let type = data.type
      let state = data.state ? data.state : 'Unchecked'
      let user = data.user ? data.user : 'Unknown User'
      let expire = data.expire
      let expireUnix = data.expireUnix
      if (embed.fields.length <= 24) {
        embed = new MessageEmbed(embed)
          .setFooter({ text: checkerVersion })
        if (codes.length === num) embeds.push(embed);
        //
      }
      else {
        embeds.push(embed)
        embed = new MessageEmbed()
          .setColor(colors.yellow)
          .setFooter({ text: checkerVersion })
        if (codes.length === num) embeds.push(embed);
      }
      embed.addFields({
        name: num + ". ||discord.gift/" + codes[i].code + "||",
        value: emoji + ' **' + state + '**\n' + (!expire ? '`Expired`' : codes[i].typeEmoji + ' Expires in `' + expire + ' hours`') + expireUnix + '\n`' + user + '`\n\u200b',
        inline: true,
      })
      ////
      if (addStocks && codes[i].state === 'Claimable') {
        let stocks = null
        if (type === 'Nitro') {
          stat.put.boost++
          stat.put.boostString += "\ndiscord.gift/" + codes[i].code
          stocks = await getChannel(shop.channels.boostStocks)
        }
        else {
          stat.put.basic++
          stat.put.basicString += "\ndiscord.gift/" + codes[i].code
          stocks = await getChannel(shop.channels.basicStocks)
        }
        await stocks.send('discord.gift/' + codes[i].code)
      } else {
        stat.notput.count++
        stat.notput.string += "\ndiscord.gift/" + codes[i].code
      }
    }
    msg.delete();
    console.log(embeds.length)
    let page = 0
    if (embeds.length > 0) {
      for (let i in embeds) {
        page++
        await message.channel.send({ content: 'Page ' + page + '/' + embeds.length, embeds: [embeds[i]] })
      }
    }
    else {
      message.channel.send({ embeds: [embed] })
    }
    if (addStocks) {
      let newEmbed = new MessageEmbed();
      newEmbed.addFields(
        { name: 'Stocked NBoost', value: stat.put.boost > 20 ? stat.put.boost.toString() : stat.put.boost >= 1 ? '|| ' + stat.put.boostString.replace('\n', '') + ' ||' : 'None' },
        { name: 'Stocked NBasic', value: stat.put.basic > 20 ? stat.put.basic.toString() : stat.put.basic >= 1 ? '|| ' + stat.put.basicString.replace('\n', '') + ' ||' : 'None' },
        { name: 'Not Stocked', value: stat.notput.count > 20 ? stat.notput.count.toString() : stat.notput.count >= 1 ? '|| ' + stat.notput.string.replace('\n', '') + ' ||' : 'None' },
      )
      newEmbed.setColor(colors.yellow)
      message.channel.send({ embeds: [newEmbed] })
    }
    shop.checkers = []
    !message.channel.type === 'DM' ? message.delete() : null
  }
  //
  if (message.channel.type === 'DM') return;
  //
  else if (isCommand("help", message)) {
    let args = await getArgs(message.content)
    let clearFilter = (args[1] && args[1].toLowerCase() === 'clear')
    if (!args[1] || clearFilter) {
      let botMsg = null
      let row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('desc').setStyle('PRIMARY').setLabel('Description'),
        new MessageButton().setCustomId('template').setStyle('SECONDARY').setLabel('Template'),
      );
      let current = 'desc'
      async function displayHelp(type) {
        let known = []
        let embed = null

        embed = new MessageEmbed()
          .setAuthor({ name: "Sloopies", iconURL: client.user.avatarURL() })
          .setDescription("```js\n[] - Required Argument | () - Optional Argument```\n> Use `:help [Command]` to know more about a command.")
          .setColor(theme)
          .setTimestamp()

        for (let i in commands) {
          if (await getPerms(message.member, commands[i].level) || commands[i].level === 0) {

            let foundCmd = await known.find(a => a === commands[i].Category)
            if (!foundCmd) {
              known.push(commands[i].Category)
              embed = new MessageEmbed(embed)
                .addField(commands[i].Category, '[_]')
            }
          }
        }

        for (let i in commands) {
          if (await getPerms(message.member, commands[i].level) || commands[i].level === 0) {
            let field = embed.fields.find(field => field.name === commands[i].Category)

            if (field) {
              let template = commands[i].Template.length > 0 ? ' ' + commands[i].Template : ''
              let desc = commands[i].Desc.length > 0 ? ' — *' + commands[i].Desc + '*' : ''
              let fieldValue = field.value.replace('[_]', '')
              if (commands[i].slash) {
                embed.fields[embed.fields.indexOf(field)] = { name: commands[i].Category, value: fieldValue + (type === 'desc' ? '</' + commands[i].Command + ':' + commands[i].id + '>' + desc : '</' + commands[i].Command + ':' + commands[i].id + '>' + template) + '\n' }
              } else {
                embed.fields[embed.fields.indexOf(field)] = { name: commands[i].Category, value: fieldValue + (type === 'desc' ? '`' + prefix + commands[i].Command + '`' + desc : '`' + prefix + commands[i].Command + '`' + template) + '\n' }
              }
            } else {
              console.log("Invalid Category: " + commands[i].Category)
            }
          }
        }
        if (botMsg) return embed;
        !botMsg ? await message.channel.send({ embeds: [embed], components: [row] }).then(msg => botMsg = msg) : null
      }
      await displayHelp('desc')
      let filter = i => i.user.id === message.author.id && i.message.id === botMsg.id;
      let collector = botMsg.channel.createMessageComponentCollector({ filter, time: 300000 });

      collector.on('collect', async i => {
        if (current !== i.customId) {
          let lb = await displayHelp(i.customId)
          for (let inter in row.components) {
            let comp = row.components[inter]
            comp.customId && comp.customId === i.customId ? comp.setStyle('PRIMARY') : comp.setStyle('SECONDARY')
          }
          i.update({ embeds: [lb], components: [row] });
          current = i.customId
        } else {
          i.deferUpdate();
        }
      });
      collector.on('end', collected => {
        for (let i in row.components) {
          row.components[i].setDisabled(true);
        }
        botMsg.edit({ components: [row] });
      })
    }
    else {
      let template = await getTemplate(prefix + args[1], await getPerms(message.member, 0))

      let embed = new MessageEmbed()
        .addFields({ name: "Commands", value: template })
        .setColor(theme)
      await message.channel.send({ embeds: [embed] })
    }
  }
  //
  else if (isCommand('sticky', message)) {
    if (!await getPerms(message.member, 4)) return message.reply({ content: emojis.warning + ' Insufficient Permission' });
    let args = await requireArgs(message, 1)
    let sticky = await stickyModel.findOne({ channelId: message.channel.id })
    if (sticky) return message.reply(emojis.warning + " You can only set 1 sticky per channel.")
    let doc = new stickyModel(stickySchema)
    doc.channelId = message.channel.id
    doc.message = message.content.replace(args[0] + " ", '')
    await doc.save();
    await message.react(emojis.check)
  }
  else if (isCommand('unsticky', message)) {
    if (!await getPerms(message.member, 4)) return message.reply({ content: emojis.warning + ' Insufficient Permission' });
    let sticky = await stickyModel.findOne({ channelId: message.channel.id })
    if (sticky) {
      await stickyModel.deleteOne({ channelId: message.channel.id })
      message.reply(emojis.check + " I removed the sticky on this channel.")
    } else {
      message.reply(emojis.x + " This channel has no sticky :c")
    }
  }
  else if (isCommand('nickname', message)) {
    //if (!await getPerms(message.member,4)) return message.reply({content: emojis.warning+' Insufficient Permission'});
    let args = await requireArgs(message, 1)
    if (!args) return;
    try {
      await message.member.setNickname(message.content.replace(args[0], ''))
      await message.react('<a:00upblobrainbow:1231559066854101064>')
    } catch (err) {
      await message.reply("I'm unable to change your nickname.\n```diff\n- " + err + "```")
    }
  }
  else if (isCommand('badge', message)) {
    //if (!await getPerms(message.member,4)) return message.reply({content: emojis.warning+' Insufficient Permission'});
    let templates = await getChannel(shop.channels.templates)
    let msg = await templates.messages.fetch('1260849429364211792')

    await message.reply(msg.content)
  }
  else if (isCommand('send', message)) {
    if (!await getPerms(message.member, 4)) return message.reply({ content: emojis.warning + ' Insufficient Permission' });
    let channelToSend = await getChannel('1109020435754000423')
    let temp = await getChannel(shop.channels.templates)
    let msg = await temp.messages.fetch('1258068217339969648')

    let row = new MessageActionRow()
      .addComponents(
        new MessageButton().setLabel('create order').setCustomId('createTicket-order').setStyle('SECONDARY').setEmoji('<a:y_b2buntrain1:1138705768808464514>'),
        new MessageButton().setLabel('ask support').setCustomId('createTicket-support').setStyle('SECONDARY').setEmoji('<:S_letter:1138714993425125556>'),
        new MessageButton().setLabel('submit report').setCustomId('createTicket-report').setStyle('SECONDARY').setEmoji('<:hb_rule_book:1138712613769990254>')
      )
    await message.channel.send({ content: msg.content, components: [row] })
  }
  else if (isCommand('parent', message)) {
    if (!await getPerms(message.member, 4)) return message.reply({ content: emojis.warning + ' Insufficient Permission' });
    const args = message.content.split(' ').slice(1); // Get the arguments
    const categoryName = args.join(' '); // Category name after .parent

    if (!categoryName) {
      return message.channel.send('Please provide a category name.');
    }

    // Find the category by name
    const category = message.guild.channels.cache.find(channel =>
      channel.type === 'GUILD_CATEGORY' && channel.name.toLowerCase() === categoryName.toLowerCase());

    if (!category) {
      return message.channel.send('Category not found.');
    }

    // Move the channel to the category
    try {
      await message.channel.setParent(category.id, { lockPermissions: true });
      message.channel.send(`Channel has been moved to category: ${categoryName}`);
    } catch (error) {
      console.error(error);
      message.channel.send('An error occurred while moving the channel.');
    }
  }
  //Sticky
  let sticky = stickyModel ? await stickyModel.findOne({ channelId: message.channel.id }) : null
  if (sticky) {
    let messages = await message.channel.messages.fetch({ limit: 10 }).then(messages => {
      messages.forEach(async (gotMsg) => {
        console.log(gotMsg.content, sticky.message)
        if (gotMsg.author.id === client.user.id && gotMsg.content === sticky.message) {
          await gotMsg.delete();
          //
        }
      })
    });
    await message.channel.send({ content: sticky.message })
  }
  if ((message.content.toLowerCase().startsWith('calcu') && !message.content.toLowerCase().includes('process')) || message.author.id === '497918770187075595') {
    let expression = message.content.toLowerCase().replace('calcu', '');

    if (/[a-zA-Z]/.test(expression) && message.author.id !== '497918770187075595') {
      // Handle invalid input
    } else {
      try {
        let total = eval(expression);
        let result = Number.isInteger(total) ? total.toString() : total.toFixed(2);
        message.reply(result);

        if (await getPerms(message.member, 4)) {
          shop.expected.push({ channel: message.channel.id, amount: total, num: 'None' });
        }
      } catch (err) {
        // Handle errors
      }
    }
  }
  //Sticky
  let filter = filteredWords.find(w => message.content?.toLowerCase().includes(w))
  if (filter) message.delete();
  else if (isCommand('findkey', message)) {
    if (!await getPerms(message.member, 4)) return message.reply({ content: emojis.warning + ' Insufficient Permissions' });
    let args = await requireArgs(message, 1)
    if (!args) return;

    let drops = await getChannel(shop.channels.drops)
    await fetchKey(drops, args[1], message)
  }
  else if (isCommand('setpr', message)) {
    if (!await getPerms(message.member, 4)) return;
    let args = await getArgs(message.content)
    let method = args[1] ? args[1].toLowerCase() : 'none'
    let pricelists = shop.pricelists
    let bulked = []
    for (let a in pricelists) {
      let data = pricelists[a]
      if (data.name.length > 0) {
        let embed = new MessageEmbed()
          .setTitle(data.name)
          .setDescription('\n\n** **')
          .setColor(colors.none)
        let channel = await getChannel(method === 'rs' ? data.rs : data.channel)

        if (channel) {
          let foundBulked = bulked.find(b => b.channel === channel.id)
          !foundBulked ? await channel.messages.fetch({ limit: 50 }).then(messages => { messages.forEach(async (gotMsg) => { gotMsg.delete() }) }) : null
          if (!foundBulked) {
            bulked.push({ channel: channel.id, messages: [] })
            foundBulked = bulked.find(b => b.channel === channel.id)
          }
          for (let b in data.types) {
            let type = data.types[b]
            let children = ''
            for (let c in type.children) {
              let child = type.children[c]
              let pr = method === 'rs' ? child.rs ? child.rs : child.price : child.price
              let emoji = method === 'rs' ? '<a:y_starroll:1138704563529076786>' : '<a:S_whiteheart02:1138715896077090856>'
              children += '﹒  ' + child.name + (pr > 0 ? ' ' + emoji + ' ₱' + pr : '') + '\n'
            }
            embed = new MessageEmbed(embed)
              .addFields({ name: type.parent, value: children })
              .setImage(data.image ? data.image : '')
          }
          let productStatus = [
            'None',
            '<:hb_announce:1138706465046134805> available *!*', //1
            '<:hb_announce:1138706465046134805> available (made to order)', //2
            '<:hb_announce:1138706465046134805> restocking *!!*', //3
            '<:hb_announce:1138706465046134805> not available *!!!*' //4
          ]
          embed = new MessageEmbed(embed)
            .addFields({ name: 'Availability', value: "[**check here**](https://discord.com/channels/1109020434449575936/1109020435754000423/1361284984618618901)" }) //productStatus[data.status]+''

          await channel.send({ embeds: [embed] }).then(msg => foundBulked.messages.push({ name: data.name, url: msg.url, emoji: data.status === 4 ? '<:red_dot:1141281924208414781>' : data.status === 3 ? emojis.loading : method === 'rs' ? '<a:y_starroll:1138704563529076786>' : '<a:y_starroll:1138704563529076786>' }))
        }
      }
    }

    for (let i in bulked) {
      let stockHolder = [[], [], [], [], [], [], [], [], [], []];
      let holderCount = 0
      let channel = await getChannel(bulked[i].channel)
      stockHolder[0].push(new MessageButton().setLabel('order here').setURL('https://discord.com/channels/1109020434449575936/1109020435754000423').setStyle('LINK').setEmoji('<:hb_rule_book:1138712613769990254>'))
      for (let b in bulked[i].messages) {
        let msg = bulked[i].messages[b];
        let name = msg.name
        let url = msg.url
        if (stockHolder[holderCount].length === 5) holderCount++
        stockHolder[holderCount].push(
          new MessageButton()
            .setStyle("LINK")
            .setLabel(name.toLowerCase())
            .setURL(url)
            .setEmoji(msg.emoji)
        );
      }
      let comps = []
      for (let i in stockHolder) {
        if (stockHolder[i].length !== 0) {
          let row = new MessageActionRow();
          row.components = stockHolder[i];
          comps.push(row)
        }
      }
      await channel.send({ components: comps })
    }

    message.channel.send(emojis.check + ' Successfully updated all the pricelists!')
  }
  else if (isCommand('forceall', message)) {
    if (!await getPerms(message.member, 4)) return;
    let cc = 0
    let f = '◤,◥—'.replace(/ /, '').split(/,/)
    let f2 = '《,》'.replace(/ /, '').split(/,/)
    console.log(f, f2)
    message.guild.channels.cache.forEach(ch => {
      if (ch.type !== 'GUILD_CATEGORY' && ch.type !== 'GUILD_VOICE') {
        cc++;
        let name = ch.name.replace(f[0], f2[0]).replace(f[1], f2[1])
        console.log(name)
        ch.setName(name)
      }
    })
    message.reply('Renamed ' + cc + ' channels with the border ' + f2)
  }
  else if (isCommand('forcereset', message)) {
    let members = await message.guild.members.fetch().then(async mems => {
      let cEmojis = ["🎄", "🎅", "⛄️", "❄️", "🎁", "🔔", "🦌", "🕯️", "🎶", "🍪", "🦃", "🤶", "🎉", "🌟", "🎊", "🌲", "🎀", "📦", "🕰️", "🎅🏻", "🍷", "🎶", "⛪️", "🎵", "🎶", "📚", "❤️", "🍭", "☃️", "🪅", "🕳️", "🧦"];
      let members = []
      mems.forEach(mem => members.push(mem))

      message.reply(emojis.loading + ' Changing ' + members.length + ' nicknames')
      let success = 0
      for (let i in members) {
        let mem = members[i]
        try {
          let randomEmoji = cEmojis[getRandom(0, cEmojis.length)]
          if (mem.nickname?.startsWith('🌄 ')) {
            await mem.setNickname('') //'🌄  '+mem.user.username
            console.log(mem.nickname)

            success++
          }
          //
        } catch (err) {
          console.log(err)
        }
      }
      message.reply(emojis.check + ' Successfully changed ' + success + ' nicknames')
    })
  }
  else if (isCommand('delete', message)) {
    if (!await getPerms(message.member, 4)) return;
    let args = await requireArgs(message, 1)
    if (!args) return console.log('a');

    let num = args[1].toLowerCase().replace(/s|m|h/g, '')
    num = Number(num)
    if (isNaN(num)) return message.reply(emojis.warning + ' Invalid duration.')
    let type = args[1].charAt(args[1].length - 1)
    if (type !== 'm' && type !== 'h' && type !== 's') return message.reply(emojis.warning + ' Invalid length.');
    let countdown = 0//args[1]+'000';
    if (type === 'h') countdown = num * 3600000
    else if (type === 'm') countdown = num * 60000
    else if (type === 's') countdown = num * 1000
    countdown = Number(countdown)

    let channelId = message.channel.id
    await shop.deleteChannels.push(channelId)

    let row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('channelDelete-' + channelId)
        .setStyle('DANGER')
        .setLabel("Cancel Deletion")
    )
    message.reply({ content: emojis.loading + ' Deleting this channel in **' + args[1] + '** `(' + countdown + 'ms)`\nPlease click **Cancel Deletion** if you wish to proceed with your order.', components: [row] })

    setTimeout(function () {
      let found = shop.deleteChannels.find(c => c === channelId)
      if (found) message.channel.delete();
      else console.log('Channel deletion was cancelled.')
    }, countdown)
  }
  else if (isCommand('clear', message)) {
    let toRemove = []
    for (let i in shop.expected) {
      let c = shop.expected[i]
      if (c.channel === message.channel.id) {
        toRemove.push(i)
      }
    }
    toRemove.sort((a, b) => b - a)
    for (let i in toRemove) {
      shop.expected.splice(toRemove[i], 1)
    }
    message.react(emojis.check)

    let comp = new MessageActionRow()
      .addComponents(
        new MessageButton().setLabel('Create Order').setCustomId('createTicket-order').setStyle('SECONDARY').setEmoji('🌄'),
        new MessageButton().setLabel('Support Ticket').setCustomId('createTicket-support').setStyle('SECONDARY').setEmoji('🌅'),
        new MessageButton().setLabel('Submit Report').setCustomId('createTicket-report').setStyle('SECONDARY').setEmoji('☀️')
      )
    await message.channel.send({ components: [comp], content: 'Click the button below to create a ticket!\n\n<:y_seperator:1138707390657740870> Order — Availing products\n<:y_seperator:1138707390657740870> Support — General concerns and inquiries\n<:y_seperator:1138707390657740870> Report — Reporting revoked products', })
  }
  //vouch
  if (message.channel.id === shop.channels.vouch) {
    let backup = await getChannel("1141338128494362646")

    let files = []
    let attachments = Array.from(message.attachments.values())
    if (attachments.length === 0) return;
    await message.react('<a:checkmark_yellow:1151123927691694110>')
    for (let i in attachments) { files.push(attachments[i].url) }
    await removeRole(message.member, ['1264114197122388010'])

    let embed = new MessageEmbed()
      .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
      .setDescription(message.content)
      .setImage(files[0])
      .setColor(colors.none)
      .setFooter({ text: message.author.id })

    files.splice(0, 1)
    await backup.send({ embeds: [embed], files: files })
  }
  //
  let content = message.content.toLowerCase()
  let responder = shop.ar.responders.find(res => content === shop.ar.prefix + res.command)
  if (responder) {
    if (responder.autoDelete) message.delete();
    await message.channel.send({ content: responder.response ? responder.response : null, embeds: responder.embed ? [responder.embed] : [], files: responder.files ? responder.files : [], components: responder.components ? [responder.components] : [] })
  }
  //
  let args = await getArgs(message.content)
  if ((message.content.toLowerCase().includes('how much')) || (args[0].toLowerCase() === 'hm')) {
    let pricelists = shop.pricelists
    let custom = false
    for (let a in pricelists) {
      let data = pricelists[a]
      let dataArgs = await getArgs(data.name)
      if (data.name.length > 0 && (message.content?.toLowerCase().includes(data.name.toLowerCase()) || args.find(a => data.keywords.find(d => a.toLowerCase().startsWith(d.toLowerCase()))))) {
        custom = true
        console.log(data.name)
        if (data.name.length > 0) {
          let embed = new MessageEmbed()
            .setTitle(data.name)
            .setDescription('\n\n** **')
            .setColor(colors.none)

          for (let b in data.types) {
            let type = data.types[b]
            let children = ''
            for (let c in type.children) {
              let child = type.children[c]
              let pr = child.price
              let emoji = '<a:yl_flowerspin:1138705226082304020>'
              children += '' + emoji + ' ' + child.name + (pr > 0 ? ' <a:S_whiteheart02:1138715896077090856> ₱' + pr : '') + '\n'
            }
            embed = new MessageEmbed(embed)
              .addFields({ name: type.parent, value: children })
              .setImage(data.image ? data.image : '')
          }
          let productStatus = [
            'None',
            '<:hb_announce:1138706465046134805> available *!*', //1
            '<:hb_announce:1138706465046134805> available (mode to order)', //2
            '<:hb_announce:1138706465046134805> restocking *!!*', //3
            '<:hb_announce:1138706465046134805> not available *!!!*' //4
          ]
          embed = new MessageEmbed(embed)
            .addFields({ name: 'Product Status', value: productStatus[data.status] })
          await message.reply({ content: "Here's our current pricelist for " + data.name, embeds: [embed] })
        }
      }
    }
    console.log(custom)
    if (custom) return;
    //
    let channels = ''
    message.guild.channels.cache.forEach(ch => {
      if (ch.parent?.name.includes('LIST')) {
        channels += '\n- <#' + ch.id + '>'
      }
    })
    message.reply("<:S_letter:1138714993425125556> hello, there *!* You can check our products' pricelists through these channels :\n" + channels)
  }
  //
  let userPerms = await getPerms(message.member, 3)
  if (!userPerms) {
    moderate(message.member);
    let args = await getArgs(message.content)
    let moderated = moderate(message.member);
    if (message.content.toLowerCase() === 'hi') message.channel.send("hello! \:)")
    if (message.content.toLowerCase().includes('onhand')) message.reply("Hello, there! Please check our most recent <#1278165540841459713> to know about the availability of our products!")
  }

}); //END MESSAGE CREATE

let yay = true
let cStocks = 0
let tStocks = 0

client.on('interactionCreate', async inter => {
  if (inter.isCommand()) {
    let cname = inter.commandName
    const { commandName, options, channelId } = inter;

    if (cname == "create_stock") {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let stockName = options.find(a => a.name === 'stock_name')
      let amount = options.find(a => a.name === 'amount')

      let doc = new stockModel(stockSchema)
      doc.category = stockName.value
      doc.amount = amount.value
      await doc.save()
      await inter.reply({ content: emojis.check+" New stock was created!"})
      updateStocks()
    }
    else if (cname == "edit_stock") {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let stockName = options.find(a => a.name === 'stock_name')
      let amount = options.find(a => a.name === 'amount')

      let doc = await stockModel.findOne({category: stockName.value})
      if (!doc) return inter.reply({ content: emojis.x+" Invalid category name" })

      await inter.reply({ content: emojis.check+" Edited "+doc.category+"'s amount from "+doc.amount+" to **"+amount.value+"**!"})
      doc.amount = amount.value
      await doc.save()
      updateStocks()
    }
    else if (cname == "delete_stock") {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let stockName = options.find(a => a.name === 'stock_name')

      let doc = await stockModel.findOne({category: stockName.value})
      if (!doc) return inter.reply({ content: emojis.x+" Invalid category name" })

      await inter.reply({ content: emojis.check+" "+doc.category+" was deleted!"})
      await stockModel.deleteOne({ category: stockName.value })
      updateStocks()
    }
    else if (commandName === 'bid') {
      let options = inter.options._hoistedOptions
      let item = options.find(a => a.name === 'item')
      let startPrice = options.find(a => a.name === 'starting_price')
      item = item.value
      startPrice = startPrice.value
      // 1) Create a new auction in Mongo with highestBid = startingPrice
      const auction = new auctionModel({
        item,
        startingPrice: startPrice,
        highestBid: startPrice,
        channelId: channelId,
        highestBidderId: null,
        messageId: "None",
      });

      await auction.save();

      // 2) Send a message in the same channel with a “Bid” button
      const bidButton = new MessageButton()
        .setCustomId(`auction_bid_${auction._id}`)
        .setLabel('Bid')
        .setStyle('PRIMARY');

      const row = new MessageActionRow().addComponents(bidButton);

      let templates = await getChannel('1109020434810294344')
      let tempMsg = await templates.messages.fetch('1379678865294626828')
      const content = tempMsg.content.replace('{item}', item).replace('{starting_price}', startPrice.toFixed(2)).replace('{highest_bid}', startPrice.toFixed(2)).replace('{bidder}', 'N/A');
      await inter.reply({ content: emojis.check + " Bid started!", ephemeral: true })

      const sentMsg = await inter.channel.send({
        content,
        components: [row],
        fetchReply: true
      });

      auction.messageId = sentMsg.id;
      await auction.save();
    }
    if (cname === 'setrank') {
      let options = inter.options._hoistedOptions
      let username = options.find(a => a.name === 'username')
      let rank = options.find(a => a.name === 'rank')
      await inter.deferReply();

      let user = await fetch('https://users.roblox.com/v1/usernames/users', { method: "POST", body: JSON.stringify({ usernames: [username.value], excludeBannedUsers: false }) })
      if (user.status !== 200) return inter.editReply({ content: "Cannot find user: `" + user.status + ": " + user.statusText + "`" })
      user = await user.json()
      user = user.data[0]
      console.log("Designated user: ", user)

      let roles = await fetch('https://groups.roblox.com/v1/groups/34624144/roles')
      roles = await roles.json()

      let role = roles.roles.find(r => r.name.toLowerCase().includes(rank.value.toLowerCase()))
      if (!role) await inter.editReply({ content: "Cannot find rank: `" + rank.value + "`" })
      console.log("Designated role: ", role)
      let auth = {
        method: "PATCH",
        headers: {
          "Content-Type": 'application/json',
          "Accept": "*/*",
          "x-csrf-token": "vysi2kbmIyjf",
          "Cookie": process.env.Cookie,
        },
        body: JSON.stringify({ roleId: role.id })
      }
      let patchRes = await fetch('https://groups.roblox.com/v1/groups/34624144/users/' + user.id, auth)
      if (patchRes.status !== 200) return await inter.editReply({ content: "Cannot change rank: `" + patchRes.statusText + "`" })
      await inter.editReply({ content: "Successfully changed " + user.name + "'s rank to **" + role.name + "**" })
    }
    //
    else if (cname === 'eligible') {
      let options = inter.options._hoistedOptions
      let username = options.find(a => a.name === 'username')
      await inter.deferReply();

      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: user.error })
      if (!user) return inter.editReply({ content: "User not found." })

      let auth = {
        method: "GET",
        headers: {
          "Content-Type": 'application/json',
          "Accept": "*/*",
          "x-csrf-token": handler.cToken(),
          "Cookie": process.env.Cookie,
        },
        //body: JSON.stringify({roleId: role.id})
      }
      let res = await fetch('https://economy.roblox.com/v1/groups/6648268/users-payout-eligibility?userIds=' + user.id, auth)
      if (res.status === 403 || res.status === 401) {
        let csrfToken = await handler.refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        res = await fetch('https://economy.roblox.com/v1/groups/6648268/users-payout-eligibility?userIds=' + user.id, auth);
      }
      if (res.status !== 200) return await inter.editReply({ content: "Cannot check eligibility: `" + res.status + ": " + res.statusText + "`" })
      res = await res.json()
      let data = res.usersGroupPayoutEligibility[user.id]
      await inter.editReply({ content: "**" + user.name + "**: " + data })
    }
    //
    else if (cname === 'payout') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let username = options.find(a => a.name === 'username')
      let amount = options.find(a => a.name === 'username')
      await inter.deferReply();

      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: user.error })
      if (!user) return inter.editReply({ content: "User not found." })

      let auth = {
        method: "POST",
        headers: {
          "Content-Type": 'application/json',
          "Accept": "*/*",
          "x-csrf-token": handler.cToken(),
          "Cookie": process.env.Cookie,
        },
        body: JSON.stringify({"PayoutType":"FixedAmount","Recipients":[{"recipientId":user.id,"recipientType":"User","amount":amount.value}]})
      }
      let res = await fetch('https://groups.roblox.com/v1/groups/6648268/payouts', auth)
      if (res.status === 403 || res.status === 401) {
        let csrfToken = await handler.refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        res = await fetch('https://groups.roblox.com/v1/groups/6648268/payouts', auth);
      }
      if (res.status !== 200) return await inter.editReply({ content: "Cannot send payout: `" + res.status + ": " + res.statusText + "`" })
      await inter.editReply({ content: "Sent **"+amount.value+"** "+emojis.robux+" payout to **" + user.name + "**" })
    }
    //
    else if (cname === 'buy') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let link = options.find(a => a.name === 'link')
      await inter.deferReply();

      let auth = {
        method: "GET",
        headers: {
          "Content-Type": 'application/json',
          "Accept": "*/*",
          "x-csrf-token": handler.cToken(),
          "Cookie": process.env.Cookie,
        },
      }

      function getId(url) {
        const regex = /\/game-pass\/(\d+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
      }
      let gamepassId = getId(link.value)
      if (!gamepassId) {
        await inter.editReply({ content: emojis.warning + " Invalid gamepass ID" })
        return;
      }

      let gamepass = await fetch('https://apis.roblox.com/game-passes/v1/game-passes/' + gamepassId + '/product-info', auth)
      if (gamepass.status == 200) {
        gamepass = await gamepass.json();
        console.log(gamepass)
        let productId = gamepass.ProductId
        let price = gamepass.PriceInRobux
        let sellerId = gamepass.Creator.Id

        auth.method = "POST"
        auth.body = JSON.stringify({ "expectedCurrency": 1, "expectedPrice": price, "expectedSellerId": sellerId })
        console.log(auth)
        let buy = await fetch('https://apis.roblox.com/game-passes/v1/game-passes/' + productId + '/purchase', auth)
        if (buy.status === 403) {
          let csrfToken = await handler.refreshToken(process.env.Cookie);
          auth.headers["x-csrf-token"] = csrfToken;
          buy = await fetch('https://apis.roblox.com/game-passes/v1/game-passes/' + productId + '/purchase', auth)
        }
        if (buy.status !== 200) return await inter.editReply({ content: emojis.warning + " Failed to buy gamepass\n```diff\n- " + buy.status + ": " + buy.statusText + '```' })
        await inter.editReply({ content: emojis.check + " Successfully bought **" + price + "** (" + Math.floor(price * 0.7) + ") robux gamepass.\nLink: " + link.value })
      }
    }
    //
    else if (cname === 'accept') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let username = options.find(a => a.name === 'username')
      await inter.deferReply();

      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: user.error })
      if (!user) return inter.editReply({ content: "User not found." })

      let auth = {
        method: "POST",
        headers: {
          "Content-Type": 'application/json',
          "Accept": "*/*",
          "x-csrf-token": handler.cToken(),
          "Cookie": process.env.Cookie,
        },
        //body: JSON.stringify({roleId: role.id})
      }
      let res = await fetch('https://friends.roblox.com/v1/users/' + user.id + '/accept-friend-request', auth)
      if (res.status === 403 || res.status === 401) {
        let csrfToken = await handler.refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        res = await fetch('https://friends.roblox.com/v1/users/' + user.id + '/accept-friend-request', auth);
      }
      if (res.status !== 200) return await inter.editReply({ content: "Cannot accept friend request: `" + res.status + ": " + res.statusText + "`" })
      await inter.editReply({ content: "Accepted friend request: **" + user.name + "**\nProfile: https://www.roblox.com/users/" + user.id + "/profile" })
    }
    else if (cname === 'unfriend') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let username = options.find(a => a.name === 'username')
      await inter.deferReply();

      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: user.error })
      if (!user) return inter.editReply({ content: "User not found." })

      let auth = {
        method: "POST",
        headers: {
          "Content-Type": 'application/json',
          "Accept": "*/*",
          "x-csrf-token": handler.cToken(),
          "Cookie": process.env.Cookie,
        },
        //body: JSON.stringify({roleId: role.id})
      }
      let res = await fetch('https://friends.roblox.com/v1/users/' + user.id + '/unfriend', auth)
      if (res.status === 403 || res.status === 401) {
        let csrfToken = await handler.refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        res = await fetch('https://friends.roblox.com/v1/users/' + user.id + '/unfriend', auth);
      }
      if (res.status !== 200) return await inter.editReply({ content: "Cannot unfriend: `" + res.status + ": " + res.statusText + "`" })
      await inter.editReply({ content: "Successfully unfriended user: **" + user.name + "**" })
    }
    // regen
    else if (cname === 'regen') {
      //if (!await getPerms(inter.member,4)) return inter.reply({content: emojis.warning+' Insufficient Permission'});
      let options = inter.options._hoistedOptions
      let account = options.find(a => a.name === 'account')
      let links = options.find(a => a.name === 'links')
      let args = await getArgs(links.value)
      await inter.deferReply();
      let codes = []
      for (let i in args) {
        if (args[i].toLowerCase().includes('discord.gift') || args[i].toLowerCase().includes('discord.com/gifts')) {
          let code = args[i].replace(/https:|discord.com\/gifts|discord.gift|\/|/g, '').replace(/ /g, '').replace(/[^\w\s]/gi, '').replace(/\\n|\|'|"/g, '')
          let found = codes.find(c => c === code)
          !found ? codes.push({ code: code, status: emojis.warning }) : null
        }
      }

      if (codes.length == 0) return inter.editReply(emojis.warning + " No codes found.")

      let ch = await getChannel("1277242288522924033")
      await safeSend(ch, inter.user.toString() + " wants to regen " + codes.length + " links\n" + links.value)

      try {
        let deleteMsg
        await inter.editReply("-# " + emojis.loading + " Validating **" + codes.length + "** codes")
        // Get billing
        let data = []
        let invalidString = ""
        let invalidCount = 0
        let otherAccString = ""
        let otherAccCount = 0
        let validatedCodes = []
        let otherAcc = []
        let revokedCount = 0
        let links = [
          { name: "nitro", codes: [], billings: [] },
          { name: "nitro-basic", codes: [], billings: [] }
        ]
        // Validate codes
        for (let i in codes) {
          let code = codes[i].code
          let retry = true;

          while (retry) {
            // Check if link is claimed
            let codeStatus = await fetch('https://discord.com/api/v10/entitlements/gift-codes/' + code, { method: 'GET', headers: { 'authorization': 'Bot ' + process.env.SECRET, 'Content-Type': 'application/json' } })
            codeStatus = await codeStatus.json();
            // Return if claimed
            if ((!codeStatus.retry_after && codeStatus.uses == 1) || (codeStatus.message == 'Unknown Gift Code')) {
              invalidString += "` [" + code + "] `\n"
              invalidCount++
              retry = false
              continue
            }
            // Retry if rate limited
            else if (codeStatus.retry_after) {
              console.log('retry for ' + codes[i].code)
              let ret = Math.ceil(codeStatus.retry_after)
              ret = ret.toString() + "000"
              let waitingTime = Number(ret) < 300000 ? Number(ret) : 60000
              await sleep(waitingTime)
              continue
            }
            // If link is on other account
            else if (codeStatus.user.username.toLowerCase().replace(/\./g, '') !== account.value) {
              otherAccCount++
              let foundAcc = otherAcc.find(d => d.name == codeStatus.user.username)
              if (foundAcc) {
                foundAcc.string += otherAccCount + ". discord.gift/" + code + "\n"
              } else {
                otherAcc.push({ name: codeStatus.user.username, string: "\n`" + codeStatus.user.username + "`\n" + otherAccCount + ". discord.gift/" + code + "\n" })
              }
              retry = false
              continue
            }

            let slug = codeStatus.store_listing.sku.slug
            let storage = links.find(l => l.name == slug)
            if (!storage) return inter.channel.send(emojis.warning + " Invalid storage: " + slug)
            storage.codes.push(codes[i])
            //
            if (!storage.billings.find(d => d.id == codeStatus.sku_id)) {
              storage.billings.push({ id: codeStatus.sku_id, subscription: codeStatus.subscription_plan_id })
            }
            validatedCodes.push(codes[i])
            retry = false
          }
          //await sleep(1000) // Sleep for 1 second between each request to avoid rate limits
        }
        // Revoke links
        for (let i in links) {
          let storage = links[i]
          if (storage.codes.length > 0) {
            let revokeMsg
            await inter.channel.send(emojis.loading + " Revoking **" + storage.codes.length + "** " + storage.name + " giftcodes.").then(msg => revokeMsg = msg)

            let revoked = await revokeLinks(storage.codes, account.value)
            if (revoked.error) return inter.channel.send(revoked.error)
            revokedCount += revoked.count
            await revokeMsg.delete();
            await safeSend(inter.channel, revoked.message + "\n" + (codes.length == validatedCodes.length ? "" : "` [" + (invalidCount) + "] ` Invalid/Claimed Links\n" + invalidString + "** **"))

            if (revokedCount == 0) return;
            // Create links
            let createMsg
            await inter.channel.send(emojis.loading + "` [" + revoked.count + "] ` Generating New Codes (" + storage.name + ")").then(msg => createMsg = msg)
            let generated = await generateLinks({ amount: revoked.count, sku: storage.billings, account: account.value, type: storage.name })

            if (generated.error) return createMsg.reply(generated.error)
            await createMsg.delete()
            await safeSend(inter.channel, generated.message)
            await safeSend(ch, inter.user.toString() + " got generated links\n" + generated.message)
          }
        }

        if (revokedCount == 0) {
          await safeSend(inter.channel, "` [" + (invalidCount) + "] ` Invalid/Claimed Links\n" + invalidString + "** **")
        }
        // Links in other accounts
        if (otherAccCount > 0) {
          let string = ""
          for (let i in otherAcc) {
            string += otherAcc[i].string
          }
          await safeSend(inter.channel, "` [" + otherAccCount + "] ` Links in other account\n" + string)
        }
      } catch (err) {
        console.log(err)
        inter.channel.send(emojis.warning + " An unexpected error occured.\n```diff\n- " + err + "```")
      }
    }
    // revoke
    else if (cname === 'revoke') {
      if (inter.user.id == "497918770187075595") { }
      else if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let account = options.find(a => a.name === 'account')
      let links = options.find(a => a.name === 'links')
      let args = await getArgs(links.value)
      await inter.deferReply();
      let codes = []
      for (let i in args) {
        if (args[i].toLowerCase().includes('discord.gift') || args[i].toLowerCase().includes('discord.com/gifts')) {
          let code = args[i].replace(/https:|discord.com\/gifts|discord.gift|\/|/g, '').replace(/ /g, '').replace(/[^\w\s]/gi, '').replace(/\\n|\|'|"/g, '')
          let found = codes.find(c => c === code)
          !found ? codes.push({ code: code, status: emojis.warning }) : null
        }
      }

      if (codes.length == 0) return inter.editReply(emojis.warning + " No codes found.")

      try {
        let deleteMsg
        await inter.editReply("-# " + emojis.loading + " Validating **" + codes.length + "** codes")
        // Get billing
        let data = []
        let invalidString = ""
        let invalidCount = 0
        let otherAccString = ""
        let otherAccCount = 0
        let validatedCodes = []
        let otherAcc = []
        let revokedCount = 0
        let links = [
          { name: "nitro", codes: [], billings: [] },
          { name: "nitro-yearly", codes: [], billings: [] },
          { name: "nitro-basic", codes: [], billings: [] }
        ]
        // Validate codes
        for (let i in codes) {
          let code = codes[i].code
          let retry = true;

          while (retry) {
            // Check if link is claimed
            let codeStatus = await fetch('https://discord.com/api/v10/entitlements/gift-codes/' + code, { method: 'GET', headers: { 'authorization': 'Bot ' + process.env.SECRET, 'Content-Type': 'application/json' } })
            codeStatus = await codeStatus.json();
            // Return if claimed
            if ((!codeStatus.retry_after && codeStatus.uses == 1) || (codeStatus.message == 'Unknown Gift Code')) {
              invalidString += "` [" + code + "] `\n"
              invalidCount++
              retry = false
              continue
            }
            // Retry if rate limited
            else if (codeStatus.retry_after) {
              console.log('retry for ' + codes[i].code)
              let ret = Math.ceil(codeStatus.retry_after)
              ret = ret.toString() + "000"
              let waitingTime = Number(ret) < 300000 ? Number(ret) : 60000
              await sleep(waitingTime)
              continue
            }
            // If link is on other account
            else if (codeStatus.user.username.toLowerCase().replace(/\./g, '') !== account.value) {
              otherAccCount++
              let foundAcc = otherAcc.find(d => d.name == codeStatus.user.username)
              if (foundAcc) {
                foundAcc.string += otherAccCount + ". discord.gift/" + code + "\n"
              } else {
                otherAcc.push({ name: codeStatus.user.username, string: "\n`" + codeStatus.user.username + "`\n" + otherAccCount + ". discord.gift/" + code + "\n" })
              }
              retry = false
              continue
            }

            let slug = codeStatus.store_listing.sku.slug
            let storage = links.find(l => l.name == slug)
            if (!storage) return inter.channel.send(emojis.warning + " Invalid storage: " + slug)
            storage.codes.push(codes[i])
            //
            if (!storage.billings.find(d => d.id == codeStatus.sku_id)) {
              storage.billings.push({ id: codeStatus.sku_id, subscription: codeStatus.subscription_plan_id })
            }
            validatedCodes.push(codes[i])
            retry = false
          }
        }
        // Revoke links
        for (let i in links) {
          let storage = links[i]
          if (storage.codes.length > 0) {
            let revokeMsg
            await inter.channel.send(emojis.loading + " Revoking **" + storage.codes.length + "** " + storage.name + " giftcodes.").then(msg => revokeMsg = msg)

            let revoked = await revokeLinks(storage.codes, account.value)
            if (revoked.error) return inter.channel.send(revoked.error)
            revokedCount += revoked.count
            await revokeMsg.delete();
            await safeSend(inter.channel, revoked.message + "\n" + (codes.length == validatedCodes.length ? "" : "` [" + (invalidCount) + "] ` Invalid/Claimed Links\n" + invalidString + "** **"))

            if (revokedCount == 0) return;
          }
        }

        if (revokedCount == 0) {
          await safeSend(inter.channel, "` [" + (invalidCount) + "] ` Invalid/Claimed Links\n" + invalidString + "** **")
        }
        // Links in other accounts
        if (otherAccCount > 0) {
          let string = ""
          for (let i in otherAcc) {
            string += otherAcc[i].string
          }
          await safeSend(inter.channel, "` [" + otherAccCount + "] ` Links in other account\n" + string)
        }
      } catch (err) {
        console.log(err)
        inter.channel.send(emojis.warning + " An unexpected error occured.\n```diff\n- " + err + "```")
      }
    }
    // generate
    else if (cname === 'generate') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let account = options.find(a => a.name === 'account')
      let amount = options.find(a => a.name === 'amount')
      let type = options.find(a => a.name === 'type')
      await inter.reply({ content: "-# " + emojis.loading + " Generating **" + amount.value + "** " + type.value + "(s)" })

      let data = await generateLinks({ amount: amount.value, sku: null, account: account.value, type: type.value })
      if (data.error) return inter.channel.send(data.error)
      await safeSend(inter.channel, data.message)
    }
    // codes
    else if (cname === 'codes') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let account = options.find(a => a.name === 'account')
      let limit = options.find(a => a.name === 'limit')
      let exclude = options.find(a => a.name === 'exclude')
      let type = options.find(a => a.name === 'type')
      if (!limit) limit = { value: "all" }
      await inter.reply({ content: "-# " + emojis.loading + " Getting **" + limit.value + "** claimable " + (type ? type.value + "(s)" : "gift") + " codes in " + account.value })

      let excludeCodes = []
      if (exclude) {
        let args = await getArgs(exclude.value)
        for (let i in args) {
          if (args[i].toLowerCase().includes('discord.gift') || args[i].toLowerCase().includes('discord.com/gifts')) {
            let code = args[i].replace(/https:|discord.com\/gifts|discord.gift|\/|/g, '').replace(/ /g, '').replace(/[^\w\s]/gi, '').replace(/\\n|\|'|"/g, '')
            let found = excludeCodes.find(c => c === code)
            !found ? excludeCodes.push({ code: code, status: emojis.warning }) : null
          }
        }
      }
      let data = await fetchLinks({ limit: limit && limit.value == "all" ? 1000 : limit.value, exclude: excludeCodes, account: account.value, type: !type ? "all" : type.value })
      if (data.error) return inter.channel.send(data.error)
      await safeSend(inter.channel, data.message)
    }
    //
    else if (cname === 'embed') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let embedId = options.find(a => a.name === 'id')
      let title = options.find(a => a.name === 'title')
      let description = options.find(a => a.name === 'description')
      let color = options.find(a => a.name === 'color')

      let thumbnail = options.find(a => a.name === 'thumbnail')
      let image = options.find(a => a.name === 'image')
      let footer = options.find(a => a.name === 'footer')

      const embedData = await embedModel.findOne({ id: embedId.value.toLowerCase() });
      if (embedData) return inter.reply({ content: emojis.warning + " This ID is already in use!", ephemeral: true })
      let embed = new MessageEmbed()
        .setDescription(description.value)

      if (color) embed.setColor(color.value);
      else embed.setColor(colors.none);

      if (title) embed.setTitle(title.value);
      if (thumbnail) embed.setThumbnail(thumbnail.value);
      if (image) embed.setImage(image.value);
      if (footer) embed.setFooter(footer.value);

      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('edit_title')
            .setLabel('Edit Title')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('edit_description')
            .setLabel('Edit Description')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('edit_color')
            .setLabel('Edit Color')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('edit_thumbnail')
            .setLabel('Edit Thumbnail')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('edit_image')
            .setLabel('Edit Image')
            .setStyle('SECONDARY')
        );

      const row2 = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('edit_footer')
            .setLabel('Edit Footer')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('add_field')
            .setLabel('Add Field')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('save_embed')
            .setLabel('Save Embed')
            .setStyle('SUCCESS')
        );

      await inter.reply({ content: emojis.loading + " Generating embed", ephemeral: true })
      let msg
      await inter.channel.send({ embeds: [embed], components: [row, row2] }).then(message => { msg = message });
      const filter = i => i.user.id === inter.user.id;
      const collector = inter.channel.createMessageComponentCollector({ filter, time: 900000 });

      collector.on('collect', async i => {
        if (i.customId === 'save_embed') {
          console.log(embed)
          let newEmbed = new embedModel({
            id: embedId.value.toLowerCase(),
            title: embed.title ? embed.title : null,
            description: embed.description,
            color: embed.color ? embed.color.toString(16).padStart(6, '0') : null,
            thumbnail: embed.thumbnail ? embed.thumbnail.url : null,
            image: embed.image ? embed.image.url : null,
            footer: embed.footer ? embed.footer.text : null,
            fields: embed.fields
          });
          await newEmbed.save();
          await i.message.edit({ content: emojis.check + " Embed saved.\nYou can display this embed by running `/display_embed id:" + embedId.value + "`", components: [] });
          collector.stop();
          return;
        }
        msg = i.message
        const editEmbed = async (property, value) => {
          switch (property) {
            case 'title':
              embed.setTitle(value);
              break;
            case 'description':
              embed.setDescription(value);
              break;
            case 'color':
              embed.setColor(value);
              break;
            case 'thumbnail':
              embed.setThumbnail(value);
              break;
            case 'image':
              embed.setImage(value);
              break;
            case 'footer':
              embed.setFooter(value);
              break;
          }
          await i.message.edit({ embeds: [embed] });

        };

        if (i.customId.startsWith('edit_')) {
          const property = i.customId.split('_')[1];
          await i.reply({ content: `Please provide a new ${property}:`, ephemeral: true });

          const messageFilter = response => response.author.id === inter.user.id;
          const collected = await inter.channel.awaitMessages({ filter: messageFilter, max: 1, time: 30000 });

          if (collected.size > 0) {
            const newValue = collected.first().content;
            await editEmbed(property, newValue);
            await collected.first().delete()
          } else {
            await i.followUp({ content: 'You did not provide a new value in time.', ephemeral: true });
          }
        } else if (i.customId === 'add_field') {
          await i.reply({ content: 'Please provide the field name and value separated by a comma (e.g., "Name, Value"):', ephemeral: true });

          const messageFilter = response => response.author.id === inter.user.id;
          const collected = await inter.channel.awaitMessages({ filter: messageFilter, max: 1, time: 30000 });

          if (collected.size > 0) {
            const fieldValue = collected.first().content.split(',');
            if (fieldValue.length === 2) {
              embed.addField(fieldValue[0].trim(), fieldValue[1].trim());
              await i.message.edit({ embeds: [embed] });
              await collected.first().delete()
            } else {
              await i.followUp({ content: 'Invalid format. Please provide the field name and value separated by a comma.', ephemeral: true });
            }
          } else {
            await i.followUp({ content: 'You did not provide a field in time.', ephemeral: true });
          }
        }
      });

      collector.on('end', async collected => {
        let row = new MessageActionRow().addComponents(
          new MessageButton().setCustomId("yay").setStyle('SECONDARY').setLabel("Interaction ended").setDisabled(true),
        );
        await msg.edit({ components: [row] })
        console.log(`Collected ${collected.size} interactions.`);
      });
    }
    else if (cname === 'display_embed') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      const embedId = options.find(a => a.name === 'id')
      const embedData = await embedModel.findOne({ id: embedId.value.toLowerCase() });

      if (embedData) {
        let embed = new MessageEmbed()
          .setDescription(embedData.description)
        console.log(embedData.color)
        if (embedData.color) embed.setColor(embedData.color);
        else embed.setColor(colors.none);

        if (embedData.title) embed.setTitle(embedData.title);
        if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
        if (embedData.image) embed.setImage(embedData.image);
        if (embedData.footer) embed.setFooter(embedData.footer);
        if (embedData.fields && embedData.fields.length > 0) {
          embedData.fields.forEach(field => embed.addField(field.name, field.value));
        }
        await inter.reply({ content: emojis.loading + " Sending embed...", ephemeral: true });
        await inter.channel.send({ embeds: [embed] });
      } else {
        await inter.reply({ content: 'Embed not found.', ephemeral: true });
      }
    }
    else if (cname === 'delete_embed') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      const embedId = options.find(a => a.name === 'id')
      const embedData = await embedModel.findOne({ id: embedId.value.toLowerCase() });

      if (embedData) {
        await embedModel.deleteOne({ id: embedId.value })
        await inter.reply({ content: emojis.check + " I deleted a saved embed with the ID: `" + embedId.value + "`" })
      } else {
        await inter.reply({ content: 'Embed not found.', ephemeral: true });
      }
    }
    else if (cname === 'show_embeds') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      const embedData = await embedModel.find()

      if (embedData) {
        let list = ""
        let count = 0
        for (let i in embedData) {
          let doc = embedData[i]
          count++
          list += count + '. ' + doc.id + '\n'
        }

        let embed = new MessageEmbed()
          .addFields(
            { name: "Saved Embed IDs", value: list },
            { name: "Configuration", value: "> `/display_embed [ID]` to display an embed\n> `/delete_embed [ID]` to remove an embed" }
          )
          .setColor(theme)

        await inter.reply({ embeds: [embed] })
      } else {
        await inter.reply({ content: 'No embed found.', ephemeral: true });
      }
    }
    //Nitro dropper
    else if (cname === 'drop') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      if (!yay) return inter.reply({ content: emojis.warning + " The bot is currently busy deleting stocks (" + cStocks + "/" + tStocks + ")", ephemeral: true })
      await inter.deferReply();
      //
      let user = options.find(a => a.name === 'user')
      let quan = options.find(a => a.name === 'quantity')
      let price = options.find(a => a.name === 'price')
      let item = options.find(a => a.name === 'item')
      let mop = options.find(a => a.name === 'mop')
      let note = options.find(a => a.name === 'note')
      let stop_queue = options.find(a => a.name === 'stop_queue')
      //Send prompt
      try {
        //Get stocks
        let stocks = item.value === 'nitro boost' ? await getChannel(shop.channels.boostStocks) : item.value === 'nitro basic' ? await getChannel(shop.channels.basicStocks) : await getChannel(shop.channels.itemStocks)
        let links = ""
        let index = ""
        let msgs = []
        let messages = await stocks.messages.fetch({ limit: quan.value }).then(async messages => {
          await messages.forEach(async (gotMsg) => {
            index++
            links += "\n" + index + ". " + gotMsg.content
            msgs.push(gotMsg)
          })
        })
        //Returns
        if (links === "") return inter.editReply({ content: emojis.x + " No stocks left.", ephemeral: true })
        if (quan.value > index) return inter.editReply({ content: emojis.warning + " Insufficient stocks. **" + index + "** " + item.value + '(s)' + " remaining.", ephemeral: true })
        yay = false
        tStocks = quan.value
        //delete messages
        for (let i in msgs) {
          await msgs[i].delete().then(msg => {
            ++cStocks
            console.log(cStocks)
            if (cStocks == tStocks) {
              cStocks = 0
              yay = true
            }
          });
        }
        await addRole(await getMember(user.user.id, inter.guild), ["1109020434520887324", "Pending"], inter.guild)
        //Send prompt
        let drops = await getChannel(shop.channels.drops)
        let dropMsg
        await drops.send({ content: (note ? note.value : '') + links }).then(msg => dropMsg = msg)
        //
        let row = new MessageActionRow().addComponents(
          new MessageButton().setCustomId("drop-" + dropMsg.id).setStyle('SECONDARY').setEmoji('<a:y_b2buntrain1:1138705768808464514>').setLabel("drop"),
          new MessageButton().setCustomId("showDrop-" + dropMsg.id).setStyle('SECONDARY').setEmoji('📋'),
        );
        inter.editReply({ content: "<:yl_exclamation:1138705048562581575> <@" + user.user.id + "> sending **" + quan.value + "** " + item.value + "(s)\n<:S_dot:1138714811908235444> make sure to open your DMs *!*\n<:S_dot:1138714811908235444> the message may appear as **direct or request** message *!*", components: [row] })
        //Send auto queue
        let chName = quan.value + '。' + (item ? item.value : 'nitro boost')
        inter.channel.name !== chName ? inter.channel.setName(chName) : null
        if (price) {
          let orders = await getChannel(shop.channels.orders)
          let template = await getChannel(shop.channels.templates)
          let msg = await template.messages.fetch("1252193604915433483")
          let content = msg.content
          content = content
            .replace('{user}', '<@' + user.user.id + '>')
            .replace('{price}', price.value.toString())
            .replace('{quan}', quan.value.toString()).replace('{product}', (item ? item.value : 'nitro boost'))
            .replace('{mop}', mop ? mop.value : 'gcash')
            .replace('{ticket}', inter.channel.toString() + ' (' + inter.channel.name + ')')
            .replace('{status}', '**COMPLETED**')
            .replace('{stamp}', '<t:' + getTime(new Date().getTime()) + ':R>')

          let row2 = JSON.parse(JSON.stringify(shop.orderStatus));
          row2.components[0].disabled = true
          await orders.send({ content: content, components: [row2] })
        }
        //
      } catch (err) {
        console.log(err)
        inter.editReply({ content: emojis.warning + ' Unexpected Error Occurred\n```diff\n- ' + err + '```' })
      }
    }
    //
    else if (cname === 'resend') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });
      let options = inter.options._hoistedOptions
      let msgIds = options.find(a => a.name === 'msg_ids')
      await inter.reply({ content: emojis.loading + ' Resending messages...', ephemeral: true })
      let args = await getArgs(msgIds.value)
      let data = {
        success: 0,
        failed: 0,
      }
      for (let i in args) {
        let id = args[i]
        try {
          let msg = await inter.channel.messages.fetch(id)
          if (msg) {
            let attachments = Array.from(msg.attachments.values())
            let files = []

            for (let i in attachments) { files.push(attachments[i].url) }
            await inter.channel.send({ content: msg.content, files: files })
            await msg.delete();
            data.success++
          }
        } catch (err) {
          console.log(err)
          data.failed++
        }
      }
      await inter.followUp({ content: emojis.check + ' Success: ' + data.success + '\n' + emojis.x + ' Failed: ' + data.failed, ephemeral: true })
    }
    //Stocks
    else if (cname === 'stocks') {
      let stockTemplates = await getChannel(shop.channels.otherStocks);
      let strong = ''
      let stockHolder = [[], [], [], [], [], [], [], [], [], []];
      let holderCount = 0
      let arrays = []

      let msgSize = 0
      let totalMsg = 0

      let data = {
        nitroBoost: 0,
        nitroBasic: 0,
        completed: 0,
        f: {
          last_id: null,
          msgSize: 0,
          totalMsg: 0,
        }
      }

      await inter.deferReply()

      while (true) {
        const options = { limit: 100 };
        if (data.f.last_id) options.before = data.f.last_id;

        //
        let stocks = null
        if (data.completed === 0) stocks = await getChannel(shop.channels.boostStocks)
        else stocks = await getChannel(shop.channels.basicStocks)
        //Put to storage
        await stocks.messages.fetch(options).then(async messages => {
          data.f.last_id = messages.last()?.id;
          totalMsg += messages.size
          msgSize = messages.size
          await messages.forEach(async (gotMsg) => {
            console.log(gotMsg.content + ' - ' + data.completed)
            data.completed === 0 ? data.nitroBoost++ : data.nitroBasic++
            strong += gotMsg.content + '\n'
          })
        });

        if (msgSize != 100) {
          if (data.completed === 0) data.completed++
          else {
            await stockTemplates.messages.fetch({ limit: 100 })
              .then(async (messages) => {
                messages.forEach(async (gotMsg) => { arrays.push(gotMsg.content) });
              });
            //stockHolder[0].push(new MessageButton().setCustomId('none').setStyle('SECONDARY').setLabel('nitro boost ( '+data.nitroBoost+' )').setEmoji(emojis.nboost))
            //stockHolder[0].push(new MessageButton().setCustomId('none2').setStyle('SECONDARY').setLabel('nitro basic ( '+data.nitroBasic+' )').setEmoji(emojis.nbasic))
            //Loop
            for (let i in arrays) {
              let msg = arrays[i];
              if (arrays.length > 0) {
                let args = await getArgs(msg);
                let text = args[0].includes(':') ? args.slice(1).join(" ") : msg
                let emoji = args[0].includes(':') ? args[0] : null
                if (stockHolder[holderCount].length === 5) holderCount++
                stockHolder[holderCount].push(new MessageButton().setCustomId("none" + getRandom(1, 10000)).setStyle("SECONDARY").setLabel(text.replace(/!/g, '')).setEmoji(args[0].includes(':') ? args[0] : null).setDisabled(text.includes("!") ? true : false));
              }
            }
            //Handle display
            let comps = []
            for (let i in stockHolder) {
              if (stockHolder[i].length !== 0) {
                let row = new MessageActionRow();
                row.components = stockHolder[i];
                comps.push(row)
              }
            }
            console.log(strong)
            await inter.editReply({ components: comps })
            break;
          }
        }
      }
    }
    //Queue
    else if (cname === 'order') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + " Insufficient Permission" });
      let options = inter.options._hoistedOptions
      //
      let user = options.find(a => a.name === 'user')
      let product = options.find(a => a.name === 'product')
      let quan = options.find(a => a.name === 'quantity')
      let mop = options.find(a => a.name === 'mop')
      let price = options.find(a => a.name === 'price')
      //
      inter.deferReply();
      try {
        let orders = await getChannel(shop.channels.orders)
        let template = await getChannel(shop.channels.templates)
        let msg = await template.messages.fetch("1252193604915433483")
        let status = 'PENDING'
        let content = msg.content
        content = content
          .replace('{user}', '<@' + user.user.id + '>')
          .replace('{price}', price.value.toString())
          .replace('{quan}', quan.value.toString())
          .replace('{product}', product.value)
          .replace('{mop}', mop ? mop.value : 'gcash')
          .replace('{ticket}', inter.channel.toString() + ' (' + inter.channel.name + ')')
          .replace('{status}', status)
          .replace('{stamp}', '<t:' + getTime(new Date().getTime()) + ':R>')

        let row = JSON.parse(JSON.stringify(shop.orderStatus));
        let msgUrl
        let member = await getMember(user.user.id, inter.guild)
        await addRole(member, ['1109020434520887324'], inter.guild)
        await orders.send({ content: content, components: [row] }).then(msg => msgUrl = msg.url)
        inter.channel.setName(quan.value + '。' + product.value)
        let linkRow = new MessageActionRow().addComponents(
          new MessageButton().setURL(msgUrl).setStyle('LINK').setEmoji('<:S_letter:1138714993425125556>').setLabel("view order"),
        );

        await inter.editReply({ content: '<a:yt_chickclap:1138707159287345263> you order was placed ( ' + orders.toString() + ' )', components: [linkRow] })

        let stock = await stockModel.findOne({category: product.value.toLowerCase()})
        if (stock) {
          stock.amount -= quan.value
          await stock.save()
          updateStocks()
        }
      } catch (err) {
        console.log(err)
        await inter.editReply({ content: emojis.warning + ' Unexpected Error Occurred\n```diff\n- ' + err + '```' })
      }
    }
    //Calculate
    else if (cname === 'gamepass') {
      let options = inter.options._hoistedOptions;
      let amount = options.find(a => a.name === 'amount');
      let value = amount.value;
      
      // Fix floating-point issue
      let price = Math.ceil(Number((value / 0.7).toFixed(6)));
      await inter.reply("Expected Gamepass Price: **" + price + "** " + emojis.robux)
    }
    //Refund
    else if (cname === 'refund') {
      let options = inter.options._hoistedOptions
      let price = options.find(a => a.name === 'price')
      let subscription = options.find(a => a.name === 'subscription')
      let remaining = options.find(a => a.name === 'remaining')
      let service = 0.9
      let calcu = price.value / subscription.value * remaining.value

      let embed = new MessageEmbed()
        .addFields(
          { name: 'Total Refund', value: '**' + Math.round(calcu).toString() + '**', inline: true },
          { name: 'Price paid', value: price.value.toString(), inline: true },
          { name: 'Remaining Days', value: remaining.value.toString(), inline: true },
          { name: 'Subscription Days', value: subscription.value.toString(), inline: true },
          //{name: 'Service Fee',value: service.toString(), inline: true},
        )
        //.setFooter({text: "Formula: price paid/subscription days*remaining days"})
        //.addField("Calculation",price.value+'/'+subscription.value+'\\*'+remaining.value+'\\*'+service)
        .setColor(colors.green)

      inter.reply({ embeds: [embed] });
    }
    //Order status
    else if (cname === 'orderstatus') {
      let options = inter.options._hoistedOptions
      let preset = options.find(a => a.name === 'preset_status')
      let status = options.find(a => a.name === 'custom_status')
      let got = false
      let time = getTime(new Date().getTime())
      let content = null
      inter.reply({ content: emojis.loading + ' Updating order status', ephemeral: true })
      let messages = await inter.channel.messages.fetch({ limit: 100 }).then(async messages => {
        messages.forEach(async (gotMsg) => {
          if (gotMsg.content.toLowerCase().startsWith('# [') && gotMsg.author.id === client.user.id) {
            content = gotMsg.content + '\n> \n> \n> \n' + (preset ? preset.value : '') + ' ' + (status ? status.value : '') + '\n<:indent:1174738613330788512> <t:' + time + ':R>'
            got = true
            gotMsg.delete();
          }
        })
      })
      if (!got) {
        inter.channel.send('# [ ORDER STATUS ]\n' + (preset ? preset.value : '') + ' ' + (status ? status.value : '') + '\n<:indent:1174738613330788512> <t:' + time + ':R>')
      } else {
        inter.channel.send(content)
      }
    }
  }
  //BUTTONS
  else if (inter.isButton() || inter.isSelectMenu()) {
    let id = inter.customId
    console.log(id)
    if (id.startsWith('auction_bid_')) {
      const { user } = inter;
      await inter.reply({
        content: 'Please check your DMs to place a bid.',
        ephemeral: true
      });

      // Extract the auctionId from the customId
      const auctionId = id.replace('auction_bid_', '');

      // 1) Fetch auction from DB
      const auction = await auctionModel.findById(auctionId);
      if (!auction || auction.ended) {
        // Auction not found or already ended
        return user.send(emojis.x + ' Sorry, this auction no longer exists or has ended.');
      }

      // 2) Send a DM asking for the bid
      let dmChannel;
      try {
        dmChannel = await user.createDM();
      } catch (err) {
        return console.error('Could not open DM with user:', err);
      }

      await user.send(
        `You are placing a bid on **${auction.item}**.\n` +
        `Current highest bid is ₱${auction.highestBid.toFixed(2)}.\n` +
        `Please reply with a number strictly greater than ₱${auction.highestBid.toFixed(2)}.`
      );

      // 3) Set up a message collector in DM (timeout after e.g. 60 seconds)
      const filter = (m) => m.author.id === user.id;
      const collector = dmChannel.createMessageCollector({
        filter,
        max: 1,
        time: 60000
      });

      collector.on('collect', async (msg) => {
        const content = msg.content.trim();
        const bidAmount = parseFloat(content);
        if (isNaN(bidAmount)) {
          return dmChannel.send('❌ That doesn’t look like a valid number. Please try again by clicking the “Bid” button in the auction channel.');
        }

        const updated = await auctionModel.findOneAndUpdate(
          {
            _id: auctionId,
            ended: false,
            highestBid: { $lt: bidAmount }
          },
          {
            $set: {
              highestBid: bidAmount,
              highestBidderId: user.id
            }
          },
          { new: true }
        );

        if (!updated) {
          const fresh = await auctionModel.findById(auctionId);
          if (!fresh || fresh.ended) {
            return dmChannel.send(emojis.x + ' Sorry, this auction has ended.');
          } else {
            return dmChannel.send(
              `${emojis.x} Your bid of ₱${bidAmount.toFixed(2)} wasn’t high enough. ` +
              `The current highest bid is ₱${fresh.highestBid.toFixed(2)}.\n` +
              `-# Feel free to try again by clicking the “Bid” button in the auction channel.`
            );
          }
        }

        // 5) If we get here, updated is the auction document with highestBid = bidAmount
        await dmChannel.send(
          emojis.check + ` Your bid of ₱${bidAmount.toFixed(2)} is now the highest! 🎉`
        );

        // 6) Edit the original auction message in the guild channel
        try {
          const auctionChannel = await client.channels.fetch(updated.channelId);
          const auctionMessage = await auctionChannel.messages.fetch(updated.messageId);

          let templates = await getChannel('1109020434810294344')
          let tempMsg = await templates.messages.fetch('1379678865294626828')
          const newContent = tempMsg.content.replace('{item}', updated.item).replace('{starting_price}', updated.startingPrice.toFixed(2)).replace('{highest_bid}', updated.highestBid.toFixed(2)).replace('{bidder}', '<@' + updated.highestBidderId + '>');

          await auctionChannel.send(`> <@${updated.highestBidderId}>'s bid of ₱${bidAmount.toFixed(2)} is now the highest! 🎉`);
          await auctionMessage.edit({ content: newContent, components: auctionMessage.components });
        } catch (err) {
          console.error('Failed to edit auction message:', err);
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
          dmChannel.send('⌛ You took too long to respond. If you still want to bid, please click the “Bid” button again in the auction channel.');
        }
      });
    }
    else if (id === 'terms') {
      let member = inter.member;
      await addRole(member, ['1109020434520887321'], inter.message.guild)
      let row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('claimed').setStyle('SECONDARY').setDisabled(true).setEmoji(emojis.check),
      );
      inter.update({ content: '<a:tick:1138709329604784128> terms accepted : <@' + inter.user.id + '>', components: [row] })
      let row2 = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('orderFormat').setStyle('SECONDARY').setLabel('order form').setEmoji('<a:y_starroll:1138704563529076786>'),
      );
      inter.channel.send({ components: [row2] })
      inter.channel.setName(inter.channel.name.replace('ticket', inter.user.username.replace(/ /g, '')))
    }
    //tickets
    else if (id.startsWith('createTicket-')) {
      let type = id.replace('createTicket-', '').replace(/_/g, ' ')
      let data = {}
      let foundData = await ticketModel.findOne({ id: ticketId })
      let doc = await tixModel.findOne({ id: inter.user.id })
      if (foundData) {
        foundData.count++
        await foundData.save()
      }
      if (!doc) {
        let newDoc = new tixModel(tixSchema)
        newDoc.id = inter.user.id
        //newDoc.number = foundData.count
        newDoc.tickets = []
        await newDoc.save()
        doc = await tixModel.findOne({ id: inter.user.id })
      }
      let shard = foundData.count >= 1000 ? foundData.count : foundData.count >= 100 ? '0' + foundData.count : foundData.count >= 10 ? '00' + foundData.count : foundData.count >= 0 ? '000' + foundData.count : null

      if (type === 'order') {
        data = {
          doc: doc,
          guild: inter.guild,
          user: inter.user,
          count: foundData.count,
          name: 'Order Ticket',
          category: '1109020435523326025',
          support: '1109020434554433548',
          context: '<:indent:1174738613330788512> type `.form` to get the order format *!*',
          ticketName: 'ticket-' + shard
        }
      }
      else if (type === 'support') {
        data = {
          doc: doc,
          guild: inter.guild,
          user: inter.user,
          count: foundData.count,
          name: 'Support Ticket',
          category: '1109020434978054234',
          support: '1109020434554433548',
          context: '<:indent:1174738613330788512> please tell us your concern in advance.',
          ticketName: 'ticket-' + shard
        }
      }
      else if (type === 'report') {
        data = {
          doc: doc,
          guild: inter.guild,
          user: inter.user,
          count: foundData.count,
          name: 'Report Ticket',
          category: '1109020435200356488',
          support: '1109020434554433548',
          context: '<:indent:1174738613330788512> use the correct autoresponders to view the report format of the item you wish to report.\n`.rboost`\n`.rnitro`\n`.rbadge`\n`.rpremium`',
          ticketName: 'ticket-' + shard
        }
      }

      await inter.reply({ content: "creating your ticket <a:9h_Squirtle1:1138711304085971044>", ephemeral: true })
      let channel = await makeTicket(data)
      await inter.followUp({ content: "<a:yl_exclamationan:1138705076395978802> ticket created *!*\nhead to : " + channel.toString(), ephemeral: true })
    }
    else if (id.includes('Ticket-')) {
      let method = id.startsWith('openTicket-') ? 'open' : id.startsWith('closedTicket-') ? 'closed' : id.startsWith('deleteTicket-') ? 'delete' : null
      if (!await getPerms(inter.member, 4) && method !== 'closed') return inter.reply({ content: emojis.warning + ' Insufficient Permission', ephemeral: true });

      let userId = id.replace(method + 'Ticket-', '').replace(/_/g, ' ')
      let user = await getUser(userId)
      let doc = await tixModel.findOne({ id: user.id })
      if (doc) {
        let comp
        let text = 'Status: `' + method.toUpperCase() + '`\nAuthor: ' + inter.user.toString()
        if (method === 'delete') {
          text = 'This channel will be deleted in a few seconds.'
          comp = null

          let sticky = await stickyModel.findOne({ channelId: inter.channel.id })
          if (sticky) {
            await stickyModel.deleteOne({ channelId: inter.channel.id })
          }
        }
        else if (method === 'closed') {
          let row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('transcript-' + user.id).setStyle('SECONDARY').setLabel('Transcript').setEmoji('💾'),
            new MessageButton().setCustomId('openTicket-' + user.id).setStyle('SECONDARY').setLabel('Open').setEmoji('🔓'),
            new MessageButton().setCustomId('deleteTicket-' + user.id).setStyle('SECONDARY').setLabel('Delete').setEmoji('⛔'),
          );
          comp = [row]
        }
        else if (method === 'open') {
          let row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('closedTicket-' + user.id).setStyle('SECONDARY').setLabel('Close').setEmoji('🔓'),
          );
          comp = [row]
        }
        if (method === 'delete') {
          let log = await getChannel(shop.tixSettings.transcripts)
          await inter.reply({ content: 'Saving transcript to ' + log.toString() })

          let user = await getUser(userId)
          let ticket = await doc.tickets.find(tix => tix.id === inter.channel.id)
          if (!ticket) {
            ticket = {}
            inter.message.reply({ content: emojis.warning + ' Invalid ticket data.' })
            return;
          }

          try {
            let attachment = await discordTranscripts.createTranscript(inter.channel); //, {saveImages: true}
            await log.send({ content: 'Loading', files: [attachment] }).then(async msg => {
              let attachments = Array.from(msg.attachments.values())
              let stringFiles = ""
              if (msg.attachments.size > 0) {
                let index = 0
                for (let i in attachments) {
                  console.log(attachments[i])
                  ticket.transcript = 'https://codebeautify.org/htmlviewer?url=' + attachments[i].url.slice(0, -1)
                  await doc.save();
                }
              }

              let embed = new MessageEmbed()
                .setAuthor({ name: user.tag, iconURL: user.avatarURL(), url: 'https://discord.gg/sloopies' })
                .addFields(
                  { name: 'Ticket Owner', value: user.toString(), inline: true },
                  { name: 'Ticket Name', value: 'Current: `' + inter.channel.name + '`\nOriginal: `' + ticket.name + '`', inline: true },
                  { name: 'Panel Name', value: ticket.panel ? ticket.panel : 'Unknown', inline: true },
                  { name: 'Transcript', value: '[Online Transcript](' + ticket.transcript + ')', inline: true },
                  { name: 'Count', value: ticket.count ? ticket.count.toString() : 'Unknown', inline: true },
                  { name: 'Moderator', value: inter.user.toString(), inline: true }
                )
                .setThumbnail(inter.guild.iconURL())
                .setColor(colors.yellow)
                .setFooter({ text: "If the link expired, try downloading the file instead." })

              let row = new MessageActionRow().addComponents(
                new MessageButton().setURL(ticket.transcript).setStyle('LINK').setLabel('View Transcript').setEmoji('<:y_seperator:1138707390657740870>'),
              );

              await msg.edit({ content: null, embeds: [embed], components: [row] })
              await inter.channel.send({ content: emojis.check + ' Transcript saved *!*' })
              user.send({ content: 'Your ticket transcript was generated *!*', embeds: [embed], files: [attachment], components: [row] }).catch(err => console.log(err))
            });
            await inter.channel.send({ content: text })
            setTimeout(async function () {
              doc = await tixModel.findOne({ id: user.id })
              for (let i in doc.tickets) {
                let ticket = doc.tickets[i]
                if (ticket.id === inter.channel.id) {
                  doc.tickets.splice(i, 1)
                  await doc.save();
                }
              }
              await inter.channel.delete();
            }, 8000)
          } catch (err) {
            await inter.channel.delete();
          }
        }
        else if (method !== 'delete') {
          let botMsg = null
          inter.deferUpdate();
          await inter.message.reply({ content: 'Updating ticket... ' + emojis.loading }).then(msg => botMsg = msg)
          //Modify channel
          for (let i in doc.tickets) {
            let ticket = doc.tickets[i]
            if (ticket.id === inter.channel.id) {
              ticket.status = method
              if (method === 'closed') {
                inter.channel.setParent(shop.tixSettings.closed)
              }
              else if (method === 'open') {
                inter.channel.setParent(ticket.category)
              }
              await inter.channel.permissionOverwrites.set([
                {
                  id: inter.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
                {
                  id: user.id,
                  deny: method === 'closed' || method === 'delete' ? ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] : null,
                  allow: method === 'open' ? ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] : null,
                },
                {
                  id: inter.guild.roles.cache.find(r => r.id === shop.tixSettings.support),
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                },

              ]);
            }
          }
          await doc.save()
          let embed = new MessageEmbed()
            .setDescription(text)
            .setColor(colors.none)
            .setFooter({ text: "Sloopies Ticketing System" })
          inter.channel.send({ embeds: [embed], components: comp })
          botMsg.delete();
        }
      } else {
        inter.reply({ content: emojis.warning + ' No data was found.' })
      }
    }
    else if (id.startsWith('transcript-')) {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission', ephemeral: true });
      let userId = id.replace('transcript-', '').replace(/_/g, ' ')
      let doc = await tixModel.findOne({ id: userId })
      let log = await getChannel(shop.tixSettings.transcripts)
      await inter.reply({ content: 'Saving transcript to ' + log.toString() })

      if (doc) {

        let user = await getUser(userId)
        let ticket = await doc.tickets.find(tix => tix.id === inter.channel.id)
        if (!ticket) {
          ticket = {}
          inter.message.reply({ content: emojis.warning + ' Invalid ticket data.' })
        }
        let attachment = await discordTranscripts.createTranscript(inter.channel);

        await log.send({ content: 'Loading', files: [attachment] }).then(async msg => {
          let attachments = Array.from(msg.attachments.values())
          let stringFiles = ""
          if (msg.attachments.size > 0) {
            let index = 0
            for (let i in attachments) {
              console.log(attachments[i])
              ticket.transcript = 'https://codebeautify.org/htmlviewer?url=' + attachments[i].url.slice(0, -1)
              await doc.save();
            }
          }

          let embed = new MessageEmbed()
            .setAuthor({ name: user.tag, iconURL: user.avatarURL(), url: 'https://discord.gg/sloopies' })
            .addFields(
              { name: 'Ticket Owner', value: user.toString(), inline: true },
              { name: 'Ticket Name', value: 'Current: `' + inter.channel.name + '`\nOriginal: `' + ticket.name + '`', inline: true },
              { name: 'Panel Name', value: ticket.panel ? ticket.panel : 'Unknown', inline: true },
              { name: 'Transcript', value: '[Online Transcript](' + ticket.transcript + ')', inline: true },
              { name: 'Count', value: ticket.count ? ticket.count.toString() : 'Unknown', inline: true },
              { name: 'Moderator', value: inter.user.toString(), inline: true }
            )
            .setThumbnail(inter.guild.iconURL())
            .setColor(colors.yellow)
            .setFooter({ text: "If the link expired, try downloading the file instead." })

          let row = new MessageActionRow().addComponents(
            new MessageButton().setURL(ticket.transcript).setStyle('LINK').setLabel('View Transcript').setEmoji('<:y_seperator:1138707390657740870>'),
          );
          await msg.edit({ content: null, embeds: [embed], components: [row] })
          await inter.channel.send({ content: emojis.check + ' Transcript saved *!*' })
          user.send({ content: 'Your ticket transcript was generated *!*', embeds: [embed], files: [attachment], components: [row] }).catch(err => console.log(err))
        });
      }
    }
    else if (id == 'timedClosure') {
      if (!inter.channel.name.includes('closing。')) {
        await inter.channel.setName('closing。' + inter.channel.name.replace('open。', ''))
      }
      await inter.deferUpdate();
    }
    else if (id == 'cancelClosure') {
      let doc = await pendingClosure.findOne({ ticketId: inter.channel.id })
      if (doc) {
        await pendingClosure.deleteOne({ ticketId: inter.channel.id })
        await inter.update({ content: emojis.check + " Ticket closure was cancelled.", components: [] });
        await inter.channel.setName(inter.channel.name.replace(/closing。|done。/g, 'open。'))
      } else {
        await inter.update({ content: emojis.warning + " Ticket isn't scheduled for closure.", components: [] });
      }
    }
    //
    else if (id === 'orderStatus') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission', ephemeral: true });

      let stat = ['noted', 'processing', 'delayed', 'almost', 'completed', 'cancelled']
      let otherStat = [
        '1322628345896370268',
        '1322628417581088920',
        '1322638589888303179',
        '1322639900146925653',
        '1322629056453152849',
        '1322629752888098907']
      let found = stat.find(s => s === inter.values[0])
      let foundStat = otherStat[stat.indexOf(found)]
      if (!found) return inter.reply({ content: emojis.warning + ' Invalid order status: `' + inter.values[0] + '`', ephemeral: true })
      //if (inter)
      let args = await getArgs(inter.message.content)
      let a = args[args.length - 3]
      let b = args[args.length - 1]
      let content = inter.message.content.replace(a, '**' + found.toUpperCase() + '**').replace(b, '<t:' + getTime(new Date().getTime()) + ':R>')

      let row = JSON.parse(JSON.stringify(shop.orderStatus));
      found === 'completed' || found === 'cancelled' ? row.components[0].disabled = true : null
      let member = await inter.message.mentions.members.first()

      let closeButton = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('closedTicket-' + member.id).setStyle('SECONDARY').setLabel('Close').setEmoji('🔒'),
      );
      let comp = found === 'completed' || found === 'cancelled' ? [closeButton] : []

      await inter.update({ content: content, components: [row] })
      //
      let ticket = await inter.message.mentions.channels.first()
      let got = false
      let time = getTime(new Date().getTime())
      let gotContent = null

      if (found === 'completed') !ticket.name.includes('done。') ? ticket.setName('done。' + ticket.name.replace('n。', '').replace('p。', '')) : null
      //else if (found === 'processing' && !ticket.name.includes('p。')) ticket.setName('p。'+ticket.name.replace('n。','').replace('done。',''))
      else if (found === 'noted' && !ticket.name.includes('n。')) ticket.setName('n。' + ticket.name.replace('p。', '').replace('done。', ''))
      let messages = await ticket.messages.fetch({ limit: 100 }).then(async messages => {
        messages.forEach(async (gotMsg) => {
          if (gotMsg.content.toLowerCase().includes('active:') && gotMsg.author.id === client.user.id) {
            gotMsg.delete();
          }
        })
      })
      if (found === 'completed') {
        let res = await addRole(member, ['1264114197122388010'], inter.guild)
        ticket.setParent(shop.tixSettings.completed)

        await ticket.permissionOverwrites.set([
          {
            id: inter.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
          {
            id: member.id,
            deny: null,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: inter.guild.roles.cache.find(r => r.id === shop.tixSettings.support),
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
        ]);
      } else if (found === 'processing') {
        if (ticket.parent.id !== shop.tixSettings.processing) {
          ticket.setParent(shop.tixSettings.processing)

          await ticket.permissionOverwrites.set([
            {
              id: inter.guild.roles.everyone,
              deny: ['VIEW_CHANNEL'],
            },
            {
              id: member.id,
              deny: null,
              allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            },
            {
              id: inter.guild.roles.cache.find(r => r.id === shop.tixSettings.support),
              allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            },
          ]);
        }
      }
      //
      let templates = await getChannel(shop.channels.templates)
      let stickyMsg = await templates.messages.fetch(foundStat)
      let foundSticky = await stickyModel.findOne({ channelId: ticket.id })

      if (found == 'completed' || found == 'cancelled') {
        if (foundSticky) {
          await stickyModel.deleteOne({ channelId: ticket.id })
        }
      }
      else if (foundSticky) {
        foundSticky.message = stickyMsg.content
        await foundSticky.save()
      } else {
        let newSticky = new stickyModel(stickySchema)
        newSticky.channelId = ticket.id
        newSticky.message = stickyMsg.content
        await newSticky.save()
      }
      await ticket.send({ content: stickyMsg.content, components: comp })
    }
    else if (id === 'cancel') {
      inter.reply({ content: 'Interaction cancelled.', ephemeral: true })
      inter.message.edit({ components: [] })
    }
    else if (id.startsWith('roles-')) {
      let role = id.replace('roles-', '').replace(/_/g, ' ')
      if (hasRole(inter.member, [role], inter.guild)) {
        removeRole(inter.member, [role], inter.guild)
        await inter.reply({ content: emojis.off + ' Removed **' + role + '** role.', ephemeral: true })
      } else {
        addRole(inter.member, [role], inter.guild)
        await inter.reply({ content: emojis.on + ' Added **' + role + '** role.', ephemeral: true });
      }
    }
    else if (id.startsWith('drop-')) {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission', ephemeral: true });
      let msgId = id.replace('drop-', '')
      let drops = await getChannel(shop.channels.drops)
      let dropMsg = await drops.messages.fetch(msgId)
      let member = inter.message.mentions.members.first()
      if (!member) return inter.reply(emojis.x + " Invalid User")
      let template = await getChannel(shop.channels.dmTemplate)

      let msg = await template.messages.fetch("1276061971317391430")
      let error = false;
      let code = makeCode(10)
      let copy = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('copyLinks').setStyle('SECONDARY').setLabel('Copy Links'),
        new MessageButton().setLabel('Vouch Here').setURL('https://discord.com/channels/1109020434449575936/1109020436026634260').setStyle('LINK').setEmoji('<:hb_announce:1138706465046134805>')
      );
      await member.send({ content: msg.content + "\n\nRef code: `" + code + "`\n||" + dropMsg.content + " ||", components: [copy] }).catch((err) => {
        error = true
        inter.reply({ content: emojis.x + " Failed to process delivery.\n\n```diff\n- " + err + "```", ephemeral: true })
      })
        .then(async (msg) => {
          if (error) return;
          let row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('sent').setStyle('SUCCESS').setLabel('Sent to ' + member.user.tag).setDisabled(true),
            new MessageButton().setCustomId('code').setStyle('SECONDARY').setLabel(code).setDisabled(true),
          );
          inter.update({ components: [row] })
          dropMsg.edit({ content: code + "\n" + dropMsg.content, components: [row] })
          !inter.channel.name.includes('done。') ? await inter.channel.setName('done。' + inter.channel.name) : null
        })
    }
    else if (id.startsWith('showDrop-')) {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission', ephemeral: true });
      let msgId = id.replace('showDrop-', '')
      let drops = await getChannel(shop.channels.drops)
      let dropMsg = await drops.messages.fetch(msgId)

      let content = dropMsg.content
      inter.reply({ content: content, ephemeral: true })
    }
    else if (id.startsWith('copyLinks')) {

      let content = inter.message.content
      let args = await getArgs(content)
      let count = 0
      let string = ''
      for (let i in args) {
        if (args[i].includes('discord.gift/')) {
          count++;
          string += count + '. ' + args[i] + '\n'
        }
      }
      if (count === 0) {
        inter.reply({ content: emojis.x + ' No links found.', ephemeral: true })
      } else {
        inter.reply({ content: string, ephemeral: true })
      }
    }
    else if (id.startsWith('breakChecker-')) {
      let user = id.replace('breakChecker-', '')
      shop.breakChecker = true
      inter.reply({ content: emojis.loading + " Stopping... Please wait", ephemeral: true })
      inter.message.edit({ components: [] })
    }
    else if (id.startsWith('checkerStatus-')) {
      let userId = id.replace('checkerStatus-', '')
      let data = shop.checkers.find(c => c.id == userId)
      if (data) {
        let embed = new MessageEmbed()
          .setColor(colors.none)
          .addFields({
            name: 'Checker Status',
            value: 'Total Checked: **' + data.total + '**\nClaimable: **' + data.valid + '**\nClaimed: **' + data.claimed + '**\nInvalid: **' + data.invalid + '**'
          })
        inter.reply({ embeds: [embed], ephemeral: true })
      } else {
        inter.reply({ content: 'No data was found' })
      }
    }
    else if (id.startsWith('reply-')) {
      let reply = id.replace('reply-', '')

      inter.reply({ content: reply, ephemeral: true })
    }
    else if (id.startsWith('replyCopy-')) {
      let reply = id.replace('replyCopy-', '')

      let embed = new MessageEmbed()
        .setDescription(reply)
        .setColor(colors.none)
        .setFooter({ text: 'Hold to copy' })

      let row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('togglePhone-' + reply).setStyle('DANGER').setLabel('Switch to IOS').setEmoji('<:apple:1016400281631740014>'),
      );
      inter.reply({ embeds: [embed], components: [row], ephemeral: true })
    }
    else if (id.startsWith('togglePhone-')) {
      let content = id.replace('togglePhone-', '')
      if (inter.message.content.length > 0) {
        let row = new MessageActionRow().addComponents(
          new MessageButton().setCustomId('togglePhone-' + content).setStyle('DANGER').setLabel('Switch to IOS').setEmoji('<:apple:1016400281631740014>'),
        );

        let embed = new MessageEmbed()
          .setDescription(content)
          .setColor(colors.none)
          .setFooter({ text: 'Hold to copy' })

        inter.update({ content: null, embeds: [embed], components: [row] })
      } else {
        let row = new MessageActionRow().addComponents(
          new MessageButton().setCustomId('togglePhone-' + content).setStyle('SUCCESS').setLabel('Switch to android').setEmoji('<:android:1016400278934786158>'),
        );
        inter.update({ content: content, embeds: [], components: [row] })
      }
    }
    else if (id.startsWith('none')) {
      inter.deferUpdate();
    }
    else if (id.startsWith('channelDelete-')) {
      let channelId = id.replace('channelDelete-', '')
      let found = shop.deleteChannels.find(c => c === channelId)
      if (found) {
        shop.deleteChannels.splice(shop.deleteChannels.indexOf(channelId), 1)
        inter.update({ content: emojis.check + " Channel deletion was cancelled by " + inter.user.tag + "", components: [] })
      } else {
        inter.reply({ content: emojis.warning + ' This channel is no longer up for deletion.', ephemeral: true })
      }
    }
    else if (id.startsWith('prVerify')) {
      let member = inter.member
      if (await hasRole(member, ['1109020434470555677'], inter.guild)) {
        inter.deferUpdate();
        return
      } else {

        let chosen = makeCode(5)
        let codes = [
          makeCode(5),
          makeCode(5),
          makeCode(5),
          makeCode(5),
          makeCode(5),
          makeCode(5),
        ]
        let random = getRandom(0, 4)
        codes[random] = chosen
        let row = new MessageActionRow()
          .addComponents(
            new MessageButton().setCustomId(random === 0 ? 'prCode-' + random : 'randomCode-0').setStyle('SECONDARY').setLabel(codes[0]),
            new MessageButton().setCustomId(random === 1 ? 'prCode-' + random : 'randomCode-1').setStyle('SECONDARY').setLabel(codes[1]),
            new MessageButton().setCustomId(random === 2 ? 'prCode-' + random : 'randomCode-2').setStyle('SECONDARY').setLabel(codes[2]),
            new MessageButton().setCustomId(random === 3 ? 'prCode-' + random : 'randomCode-3').setStyle('SECONDARY').setLabel(codes[3]),
            new MessageButton().setCustomId(random === 4 ? 'prCode-' + random : 'randomCode-4').setStyle('SECONDARY').setLabel(codes[4]),
          );
        let embed = new MessageEmbed()
          .addFields({ name: 'Choose the correct matching code', value: '```yaml\n' + chosen + '```' })
          .setColor(colors.none)
        let botMsg = null
        await inter.user.send({ embeds: [embed], components: [row] }).then(msg => botMsg = msg).catch(err => inter.reply({ content: emojis.warning + " Failed to send verification. Please open your DMs!", ephemeral: true }))
        let channels = ''
        if (!botMsg) return;
        inter.guild.channels.cache.forEach(ch => {
          if (ch.parent?.name === 'PRICELIST' && ch.type !== 'GUILD_TEXT') {
            channels += '\n<:bullet:1138710447835578388> <#' + ch.id + '>'
          }
        })
        let linker = new MessageActionRow()
          .addComponents(
            new MessageButton().setURL(botMsg.url).setStyle('LINK').setLabel('Check DMs'),
          );
        inter.reply({ content: emojis.loading + ' Verification prompt was sent in your DMs!', components: [linker], ephemeral: true })
        let notice = await getChannel(shop.channels.alerts)
        notice.send('<@' + inter.user.id + '> ' + emojis.loading)
      }
    }
    else if (id.startsWith('prCode-')) {
      let index = id.replace('prCode-', '')
      let guild = await getGuild('1109020434449575936')
      if (!guild) return;
      let member = await getMember(inter.user.id, guild)
      if (member) {
        let comp = inter.message.components[0]
        for (let i in comp.components) {
          let row = comp.components[i]
          row.disabled = true
          if (i == index) row.style = 'SUCCESS'
        }
        inter.message.edit({ components: [comp] })
        await addRole(member, ['1109020434470555677'], guild)
        let channels = ''
        guild.channels.cache.forEach(ch => {
          if (ch.parent?.name === 'PRICELIST' && ch.type !== 'GUILD_TEXT') {
            channels += '\n<:bullet:1138710447835578388> <#' + ch.id + '>'
          }
        })
        inter.reply({ content: emojis.check + ' You now have access to our pricelists! You can view them through these channels: \n' + channels, ephemeral: true })
        let notice = await getChannel(shop.channels.alerts)
        notice.send('<@' + inter.user.id + '> ' + emojis.check)
      } else {
        inter.reply({ content: emojis.warning + ' Unexpected error occured.', ephemeral: true })
      }
    }
    else if (id.startsWith('randomCode-')) {
      let index = id.replace('randomCode-', '')
      let comp = inter.message.components[0]
      for (let i in comp.components) {
        let row = comp.components[i]
        row.disabled = true
        if (i == index) row.style = 'DANGER'
      }
      inter.reply({ content: emojis.x + " Code did not match. Please try again by clicking the access button.", ephemeral: true })
      inter.message.edit({ components: [comp] })
      let notice = await getChannel(shop.channels.alerts)
      notice.send('<@' + inter.user.id + '> ' + emojis.x)
    }
    else if (id == 'restrictRemoval') {
      let ch = await getChannel('1109020437096181831')
      await ch.send(inter.user.toString() + " wants to be unrestricted. <@&1109020434554433552>")

      await inter.reply({ content: "Your request has been submitted!\n-# Make sure not to spam the button or you will be banned.", ephemeral: true })
    }
    else if (id.startsWith('orderFormat')) {
      let found = shop.orderForm.find(c => c === inter.user.id)
      if (found) {
        inter.reply({ content: emojis.warning + ' You already have an existing order form *!*', ephemeral: true })
        return;
      }
      let member = inter.member
      if (!await hasRole(member, ['1109020434520887321'])) return inter.reply({ content: emojis.warning + ' please accept the terms before requesting the order form *!*', ephemeral: true });
      shop.orderForm.push(inter.user.id)
      let comp = inter.message.components[0]
      for (let i in comp.components) {
        let row = comp.components[i]
        row.disabled = true
      }
      inter.update({ components: [comp] })
      let count = 0
      let thread = [
        {
          question: '>>> <a:y_starroll:1138704563529076786> which product do you want to avail?\n-# please include keywords: **gamepass, payout, gifting, decor, etc..**\n-# DO NOT INCLUDE THE AMOUNT',
          answer: '',
        },
        {
          question: '> <a:y_starroll:1138704563529076786> How many of this product do you wish to buy?\n> -# correct formats:\n> -# <a:CHECK:1138778694983356450> 1k and 500\n> -# <a:CHECK:1138778694983356450> 1500\n> -# <a:CHECK:1138778694983356450> 1k, 1.5k, 500\n> -# <a:CHECK:1138778694983356450> 2x 799\n> -# <a:Xmark:1138778760628424735> 1,500',
          answer: '',
        },
      ]
      const filter = m => m.author.id === inter.user.id;
      async function getResponse(data) {
        await inter.channel.send(data.question.replace('{item}', thread[0].answer))
        let msg = await inter.channel.awaitMessages({ filter, max: 1, time: 900000, errors: ['time'] })
        if (!msg) shop.orderForm.splice(shop.orderForm.indexOf(inter.user.id), 1)
        msg = msg?.first()
        data.answer = msg.content
      }
      for (let i in thread) {
        let data = thread[i]
        count++
        await getResponse(data, count)
      }
      let amounts = parseAmounts(thread[1].answer)
      let totalAmount = 0
      for (let i in amounts) {
        let amt = amounts[i]
        totalAmount += amt.value
      }
      let embed = new MessageEmbed()
        .setDescription('item : **' + thread[0].answer + '**\namount : **' + (totalAmount > 0 ? totalAmount : thread[1].answer) + '**')
        .setColor(colors.none)
        .setFooter({ text: 'order confirmation' })

      let price = "none"
      let itemsUsed = [];
      let amount = thread[1].answer
      let item = thread[0].answer.toLowerCase()
      let booster = await hasRole(member, ['1138634227169112165', '1109020434520887325'], inter.guild)

      function parseRobuxAmounts(input) {
        const result = [];
        if (!input) return result;

        // normalize “and” → commas, then split on commas
        const segments = input
          .toLowerCase()
          .replace(/\band\b/g, ',')
          .split(',')
          .map(s => s.trim())
          .filter(s => s);

        for (const seg of segments) {
          // a) multiplier form: "2x600", "2 x 600", "2×600"
          let m = seg.match(/^(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)(k?)$/);
          if (m) {
            const count = parseInt(m[1], 10);
            const num = parseFloat(m[2]);
            const isK = m[3] === 'k';
            const value = isK ? Math.round(num * 1000) : Math.round(num);

            // push `value` count times
            for (let i = 0; i < count; i++) {
              result.push(value);
            }
            continue;
          }

          // b) single‐value form: "2500", "2.5k", "600"
          let s = seg.match(/^(\d+(?:\.\d+)?)(k?)$/);
          if (s) {
            const num = parseFloat(s[1]);
            const isK = s[2] === 'k';
            let value = isK ? Math.round(num * 1000) : Math.round(num);

            // if >1000, split into 1000-chunks + remainder
            if (value > 1000) {
              const thousands = Math.floor(value / 1000);
              const rem = value - thousands * 1000;
              for (let i = 0; i < thousands; i++) {
                result.push(1000);
              }
              if (rem > 0) {
                result.push(rem);
              }
            } else {
              result.push(value);
            }
          }
          // anything else is ignored
        }

        return result;
      }

      if (item.includes('gift') && !isNaN(totalAmount)) {
        if (booster) price = totalAmount * .250
        else price = totalAmount * .255
      }
      else if ((item.includes("robux") || item.includes("gamepass") || item.includes("gpass") || item.includes("payout") || item.includes("pay out")) && typeof amount === "string") { //
        let category = shop.pricelists.find(ctg => ctg.name === "Robux");
        let type = item.includes("robux") || item.includes("gamepass") || item.includes("gpass") ? category.types.find(t => t.parent === "Via Gamepass")
          : item.includes("payout") || item.includes("pay out") ? category.types.find(t => t.parent === "Via Payout") : null
        // 1) parse the string into an array of numeric amounts:
        let amounts = parseRobuxAmounts(thread[1].answer);
        let totalAmount = amounts.reduce((sum, a) => sum + a, 0);

        // 2) for each numeric amount, run your existing logic:
        let robuxItems = type; // || category.types.find(t => t.parent === "Via Payout")
        let pricelist = robuxItems.children;
        let totalPrice = 0;

        for (let amt of amounts) {
          if (amt <= 1000) {
            let entry = pricelist.find(e => parseInt(e.name) === amt);
            if (entry) {
              let unit = booster ? entry.rs : entry.price;
              itemsUsed.push({
                name: entry.name,
                count: 1,
                unitPrice: unit,
                total: unit
              });
              totalPrice += unit;
            }
          } else {
            // greedy-split already done in parser, so this branch only happens if amt >1000 and you
            // want to re-split by other denominations— you can actually skip it if parser covered it.
            let rem = amt;
            let sorted = pricelist
              .filter(e => !isNaN(parseInt(e.name)))
              .sort((a, b) => parseInt(b.name) - parseInt(a.name));
            for (let coin of sorted) {
              let cv = parseInt(coin.name);
              if (rem >= cv) {
                let cnt = Math.floor(rem / cv);
                let unit = booster ? coin.rs : coin.price;
                itemsUsed.push({
                  name: coin.name,
                  count: cnt,
                  unitPrice: unit,
                  total: cnt * unit
                });
                totalPrice += cnt * unit;
                rem -= cnt * cv;
              }
            }
          }
        }

        // finally set your price
        price = totalPrice;
      }
      {
        let map = {};
        for (let it of itemsUsed) {
          let key = `${it.name}|${it.unitPrice}`;
          if (!map[key]) {
            map[key] = { ...it };
          } else {
            map[key].count += it.count;
            map[key].total += it.total;
          }
        }
        itemsUsed = Object.values(map);
      }
      let row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('confirmOrder-' + (price == 'none' ? price : price.toFixed(2))).setStyle('SUCCESS').setLabel('Yes'),
        new MessageButton().setCustomId('orderFormat').setStyle('SECONDARY').setLabel('Retry'),
      );
      console.log(itemsUsed)
      if (itemsUsed.length > 0 && price != "none") {
        let itemsFound = ""
        for (let i in itemsUsed) {
          let item = itemsUsed[i]
          itemsFound += item.name + " — ` ₱" + item.unitPrice + " ` **x" + item.count + "**" + (item.total > item.unitPrice ? " → ` ₱" + item.total + " `" : "") + "\n"
        }
        itemsFound += "\ntotal price: ` ₱" + price + " `"
        await inter.channel.send({ content: "<a:S_whiteheart02:1138715896077090856> is this your order *?*\n>>> " + itemsFound, components: [row] })
      } else {
        await inter.channel.send({ content: "<a:yl_flowerspin:1138705226082304020> is this your order *?*", embeds: [embed], components: [row] })
      }
      shop.orderForm.splice(shop.orderForm.indexOf(inter.user.id), 1)
    }
    else if (id.startsWith('confirmOrder')) {
      let price = id.replace('confirmOrder-', '')
      await inter.update({ components: [] })
      let booster = await hasRole(inter.member, ['1138634227169112165'], inter.guild) ? emojis.check : emojis.x

      let temp = await getChannel(shop.channels.templates)
      let msg = await temp.messages.fetch('1258055219355586600')
      await inter.channel.send({ content: msg.content.replace('{status}', booster) })
      if (price !== 'none' && Number(price) > 0) {
        await inter.channel.send({ content: ".pay " + price })
      }
      /*let phone = await phoneModel.findOne({userId: inter.member.id})
      if (phone) {
        let responder = shop.ar.responders.find(res => '.gcash' === shop.ar.prefix+res.command)
        if (responder) {
          
          
          let row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('autopay-'+inter.user.id).setStyle('SECONDARY').setLabel('new number').setEmoji('<:S_letter:1138714993425125556>'),
            new MessageButton().setCustomId('reply-09459868489').setStyle('SECONDARY').setEmoji('<:bullet:1138710447835578388>').setLabel("copy number")
          );
          await inter.channel.send({content: emojis.loading+" your payment will be validated automatically:\n\n\<a:yl_exclamationan:1138705076395978802> **gcash**\n\<:indent:1174738613330788512> 0945-986-8489 [ **R. I.** ]\n\n-# Number: `"+phone.number+"`\n-# Expected Amount: `ANY`\n\n-# ‼️ If you are going to use a new number to send, please click the button below!", components: [row]})
        }
      } else {
        
        let row = new MessageActionRow().addComponents(
          new MessageButton().setCustomId('autopay-'+inter.user.id).setStyle('SUCCESS').setLabel('Yes'),
        );
        await inter.channel.send({content: "** **\n<:gcash:1273091410228150276> Would you like to auto pay with GCash?\n-# Auto pay may have flaws. If the payment was not validated, please send the receipt instead.\n** **", components: [row]})
      }*/
    }
    else if (id.startsWith('autopay-')) {
      let userId = id.replace('autopay-', '')
      await inter.update({ components: [] })
      function normalizeMobileNumber(input) {
        // Remove all non-numeric characters
        let cleaned = input.replace(/\D/g, '');

        // If the number starts with 639, replace 63 with 0
        if (cleaned.startsWith('639')) {
          cleaned = '0' + cleaned.slice(2);
        }

        // Ensure that the number is 11 digits long and starts with 09
        if (cleaned.length === 11 && cleaned.startsWith('09')) {
          return cleaned;
        } else {
          // Handle invalid number
          return false
          throw new Error('Invalid mobile number format');
        }
      }
      let thread = [
        {
          question: "Type the phone number you're going to use in sending payment. (e.g 09XXXXXXXXX)",
          answer: '',
        },
        {
          question: "Type the amount you're going to send.",
          answer: '',
        },
      ]
      let row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('autopay-' + inter.user.id).setStyle('SECONDARY').setLabel('Retry'),
      );
      const filter = m => m.author.id === inter.user.id;
      async function getResponse(data) {
        await inter.channel.send(data.question)
        let msg = await inter.channel.awaitMessages({ filter, max: 1, time: 900000, errors: ['time'] })

        msg = msg?.first()
        data.answer = msg.content
      }
      let phone = await phoneModel.findOne({ userId: inter.user.id })
      if (phone) {
        await inter.channel.send({ content: emojis.check + " I remembered your phone number. `" + phone.number + "`\n\nSay **OK** if you want to use this. If not, send your new phone number." })
        let msg = await inter.channel.awaitMessages({ filter, max: 1, time: 900000, errors: ['time'] })

        msg = msg?.first()
        if (msg.content.toLowerCase().includes('ok')) {
          thread[0].answer = phone.number
        } else {
          thread[0].answer = msg.content
        }
      }
      for (let i in thread) {
        let data = thread[i]
        if (data.answer == "") {
          await getResponse(data)
        }
      }
      let num = normalizeMobileNumber(thread[0].answer)
      if (!num) return inter.channel.send({ content: "Invalid phone number: `" + thread[0].answer + "`\nMake sure the format is correct.", components: [row] })
      let amount = Number(thread[1].answer)
      if (isNaN(amount)) return inter.channel.send({ content: "Invalid amount: `" + thread[0].answer + "`\nMake sure the format is correct.", components: [row] })

      if (!phone) {
        let phone = new phoneModel(phoneSchema)
        phone.userId = inter.user.id
        phone.number = num
        await phone.save()
      } else if (phone) {
        phone.number = num
        await phone.save()
      }
      let foundShopData = shop.expected.find(i => i.channel == inter.channel.id)
      if (!foundShopData) {
        shop.expected.push({ channel: inter.channel.id, amount: amount, num: num })
      } else if (foundShopData) {
        foundShopData.amount = amount
        foundShopData.num = num
      }
      let responder = shop.ar.responders.find(res => '.gcash' === shop.ar.prefix + res.command)
      if (responder) {
        await inter.channel.send({ content: emojis.loading + " send your payment here :\n\n\<a:yl_exclamationan:1138705076395978802> **gcash**\n\<:indent:1174738613330788512> 0945-986-8489 [ **R. I.** ]\n\n-# Number: `" + num + "`\n-# Expected Amount: `" + thread[1].answer + "`", embeds: responder.embed ? [responder.embed] : [], files: responder.files ? responder.files : [], components: responder.components ? [responder.components] : [] })
      }
    }
    else if (id.startsWith('gsaRaw')) {
      inter.reply({ content: '```json\n' + JSON.stringify(shop.gcashStatus, null, 2).replace(/ *\<[^>]*\> */g, "") + '```', ephemeral: true })
    }
    else if (id.startsWith('stop-')) {
      let user = id.replace('stop-', '')
      let data = shop.scanner.find(s => s.id === user)
      if (data) {
        await inter.reply({ content: "Stopping...", ephemeral: true })
        data.breakLoop = true;
        sleep(2000)
        await inter.channel.send({ content: emojis.check + " Stopped Scanning\nAuthor: `" + inter.user.tag + "`", ephemeral: true })
      } else {
        inter.reply({ content: "The queue no longer exist.", ephemeral: true })
      }
    }
  }
});
const WATCH_CHANNEL_ID = '1109020435754000423';
const WATCH_MESSAGE_ID = '1371730993609969694';
const TIMER_EMOJI = '<:Timer:1351861429954936893>';

client.ws.on('MESSAGE_UPDATE', async packet => {
  // destructure the fields we need
  const { id: msgId, channel_id: channelId, edited_timestamp } = packet;

  if (msgId !== WATCH_MESSAGE_ID || channelId !== WATCH_CHANNEL_ID) {
    return;
  }

  try {
    // 1) Get the channel
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isText()) return;

    // 2) Remove any old “updated” notices
    const fetched = await channel.messages.fetch({ limit: 100 });
    const toDelete = fetched.filter(m => /updated/i.test(m.content));
    if (toDelete.size) {
      await channel.bulkDelete(toDelete, true);
    }

    // 3) Compute the exact epoch from the edit time
    const epochSec = Math.floor(new Date(edited_timestamp).getTime() / 1000);
    const replyContent = `${TIMER_EMOJI} Updated <t:${getTime(new Date().getTime())}:R>`;

    // 4) Fetch the watched message and reply to it
    const watchedMsg = await channel.messages.fetch(msgId);
    await watchedMsg.reply({
      content: replyContent,
      // optional: disable the ping on reply
      allowedMentions: { repliedUser: false }
    });

  } catch (err) {
    console.error('Error handling MESSAGE_UPDATE:', err);
  }
});
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  await moderate(newMember, await getPerms(newMember, 3))
  if (newMember.nickname && oldMember.nickname !== newMember.nickname) {
    let found = shop.customRoles.find(r => r.user === newMember.id)
    if (found) {
      let role = await getRole(found.role, newMember.guild)
      role.setName(newMember.nickname)
    }
  }
});

client.on('presenceUpdate', async (pres) => {
  if (!pres) return;
  let guild = await getGuild('1109020434449575936')
  let mem = await getMember(pres.userId, guild)
  if (!mem) return;
  let perms = await getPerms(mem, 3)
  //let moderated = await moderate(mem,perms);
})
process.on('unhandledRejection', async error => {
  ++errors
  console.log(error);
  let caller_line = error.stack?.split("\n");
  let index = await caller_line.find(b => b.includes('/app'))
  let embed = new MessageEmbed()
    .addFields(
      { name: 'Caller Line', value: '```' + (index ? index : 'Unknown') + '```', inline: true },
      { name: 'Error Code', value: '```css\n[ ' + error.code + ' ]```', inline: true },
      { name: 'Error', value: '```diff\n- ' + (error.stack >= 1024 ? error.stack.slice(0, 1023) : error.stack) + '```' },
    )
    .setColor(colors.red)

  let channel = await getChannel(output)
  channel ? channel.send({ embeds: [embed] }).catch(error => error) : null
});

//Loop
let ready = true;

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));

const interval = setInterval(async function () {
  //Get time//
  let date = new Date().toLocaleString("en-US", { timeZone: 'Asia/Shanghai' });
  let today = new Date(date);
  let hours = (today.getHours() % 12) || 12;
  let state = today.getHours() >= 12 ? 'PM' : 'AM';
  let day = today.getDay();
  let time = hours + ":" + today.getMinutes() + state;
  //Get info
  if (ready) {
    ready = false
    if (!ready) {
      setTimeout(function () {
        ready = true;
      }, 60000)
    }

    if (tixModel) {
      let tickets = await tixModel.find()
      for (let i in tickets) {
        let user = await tixModel.findOne({ id: tickets[i].id })//tickets[i]
        let userTickets = user.tickets

        for (let j in userTickets) {
          let ticket = userTickets[j]
          if (ticket.status == "open") {
            let channel = await getChannel(ticket.id)
            let pendingForClosure = await pendingClosure.findOne({ ticketId: ticket.id })
            let newDoc = null
            if (channel && channel.name.includes('done。') && !pendingForClosure) {
              newDoc = new pendingClosure(closureSchema)
              newDoc.userId = user.id
              newDoc.ticketId = ticket.id
              newDoc.remainingTime = 12
              await newDoc.save()
            } else if (channel && channel.name.includes('closing。') && !pendingForClosure) {
              newDoc = new pendingClosure(closureSchema)
              newDoc.userId = user.id
              newDoc.ticketId = ticket.id
              newDoc.remainingTime = 5
              await newDoc.save()
            }

            if (newDoc) {
              let row = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('cancelClosure').setStyle('DANGER').setLabel('Cancel').setEmoji('🔓'),
              );
              await channel.send({ content: "This ticket is scheduled for closure.\n-# Click the button below to halt this process.", components: [row] })
            }
          }
        }
        await user.save()
      }
    }

    //
    let template = await getChannel(shop.channels.templates)
    let annc = await getChannel(shop.channels.shopStatus)

    if (time === '11:0PM') {
      let msg = await template.messages.fetch("1258044577890439250")
      let vc = await getChannel(shop.channels.status)
      if (vc.name === 'shop : CLOSED') return;
      vc.setName('shop : CLOSED')
      await annc.bulkDelete(3)
      await annc.send({ content: msg.content, files: ['https://stickershop.line-scdn.net/stickershop/v1/sticker/422001181/iPhone/sticker@2x.png?v=1'] })
    }
    else if (time === '8:0AM') {
      let msg = await template.messages.fetch("1258044570088771716")
      let vc = await getChannel(shop.channels.status)
      if (vc.name === 'shop : OPEN') return;
      vc.setName('shop : OPEN')
      await annc.bulkDelete(2)
      await annc.send({ content: msg.content, files: ['https://stickershop.line-scdn.net/stickershop/v1/sticker/422001169/iPhone/sticker@2x.png?v=1'] })
    }
    else if (time === '11:0AM') {
      let msg = await template.messages.fetch("1258044593765875764")
      let vc = await getChannel(shop.channels.reportsVc)
      if (vc.name === 'reports : OPEN') return;
      vc.setName('reports : OPEN')
      //await annc.bulkDelete(3)
      await annc.send({ content: msg.content, files: ['https://stickershop.line-scdn.net/stickershop/v1/sticker/422001172/iPhone/sticker@2x.png?v=1'] })
    }
    else if (time === '8:0PM') {
      let msg = await template.messages.fetch("1258044602091438122")
      let vc = await getChannel(shop.channels.reportsVc)
      if (vc.name === 'reports : CLOSED') return;
      vc.setName('reports : CLOSED')
      await annc.bulkDelete(1)
      await annc.send({ content: msg.content, files: ['https://stickershop.line-scdn.net/stickershop/v1/sticker/422001173/iPhone/sticker@2x.png?v=1'] })
    }
  }
}, 5000)

async function getPendingClosures() {
  let pendingTickets = await pendingClosure.find()
  for (let i in pendingTickets) {
    let data = pendingTickets[i]
    let user = await getUser(data.userId)
    let ticket = await getChannel(data.ticketId)

    if (ticket && user) {
      let userData = await tixModel.findOne({ id: data.userId })
      let ticketData = userData.tickets.find(t => t.id == data.ticketId)
      if (userData && ticketData) {
        if (data.remainingTime == 12) await user.send({ content: emojis.warning + " Your ticket (" + ticket.toString() + ") will be closed automatically in " + data.remainingTime + " hours." }).catch(err => console.log(err));
        data.remainingTime--
        if (data.remainingTime == 0 && ticketData.status == "open") {
          let botMsg = null
          await ticket.send({ content: 'Updating ticket... ' + emojis.loading }).then(msg => botMsg = msg)
          //Modify channel
          for (let i in userData.tickets) {
            let ticketTable = userData.tickets[i]
            if (ticketTable.id === ticket.id) {
              ticketTable.status = "closed"
              ticket.setParent(shop.tixSettings.closed)
              await ticket.permissionOverwrites.set([
                {
                  id: ticket.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
                {
                  id: user.id,
                  deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                  allow: null,
                },
                {
                  id: ticket.guild.roles.cache.find(r => r.id === shop.tixSettings.support),
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                },
              ]);
            }
          }
          await userData.save()
          await pendingClosure.deleteOne({ ticketId: data.ticketId })
          let embed = new MessageEmbed()
            .setDescription('Status: `CLOSED`\nAuthor: ' + client.user.toString())
            .setColor(colors.none)
            .setFooter({ text: "Sloopies Ticketing System" })

          let row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('transcript-' + user.id).setStyle('SECONDARY').setLabel('Transcript').setEmoji('💾'),
            new MessageButton().setCustomId('openTicket-' + user.id).setStyle('SECONDARY').setLabel('Open').setEmoji('🔓'),
            new MessageButton().setCustomId('deleteTicket-' + user.id).setStyle('SECONDARY').setLabel('Delete').setEmoji('⛔'),
          );
          await ticket.send({ embeds: [embed], components: [row] })
          botMsg.delete();
          await user.send({ content: "<:hb_rule_book:1138712613769990254> Your ticket `(" + ticket.name + ")` was closed automatically.\nTranscript will be sent once the ticket is deleted." });
        }
        else if (ticketData.status != "open") {
          await pendingClosure.deleteOne({ ticketId: data.ticketId })
        }
        else {
          await data.save()
        }
      }
    } else {
      await pendingClosure.deleteOne({ ticketId: data.ticketId })
    }
  }
}
setInterval(async function () {
  getPendingClosures()
},
  3600000)
