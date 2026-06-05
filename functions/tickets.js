const Discord = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = Discord;

const sendMsg = require('../functions/sendMessage.js')
const sendChannel = sendMsg.sendChannel
const sendUser = sendMsg.sendUser

const settings = require('../storage/settings_.js')
const {shop, emojis, colors, theme, status} = settings

const cmdHandler = require('../functions/commands.js')
const {getTemplate} = cmdHandler

const get = require('../functions/get.js')
const {getRandom, getChannel, getMember, getGuild} = get

const roles = require('../functions/roles.js')
const {getRole, addRole, removeRole, hasRole} = roles

module.exports = {
  makeTicket: async function (data) {
    let guild = await getGuild(data.guild.id)
    let member = await getMember(data.user.id,guild)
    if (await hasRole(member,['1109020434520887321'])) data.ticketName = data.ticketName.replace('ticket',data.user.username.replace(/ /g,''))
    let ch = null
    await data.guild.channels.create({
      name: data.ticketName,
      type: ChannelType.GuildText,
      parent: data.category,
      permissionOverwrites: [
        {
          id:  data.guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: data.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles],
        },
        {
          id: data.guild.roles.cache.find(r => r.id === data.support),
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
      ],
    })
      .then(async channel => {
      ch = channel
      let ticketChannel = {
        id: channel.id,
        name: channel.name,
        panel: data.name,
        count: data.count,
        category: data.category,
        transcript: 'none',
        status: 'open',
      }
      data.doc.tickets.push(ticketChannel)
      await data.doc.save()
      
      let embed = new EmbedBuilder()
      .setTitle('🎟️ ' + data.name)
      .setDescription(
        'Welcome, <@' + data.user.id + '> *!*\n' +
        '<:hb_rule_book:1138712613769990254> A member of <@&' + data.support + '> will assist you shortly.\n\n' +
        data.context
      )
      .addFields(
        { name: 'Ticket Type', value: data.name, inline: true },
        { name: 'Opened', value: '<t:' + Math.floor(Date.now() / 1000) + ':R>', inline: true },
      )
      .setColor(colors.yellow)
      .setFooter({ text: 'Sloopie Tickets • #' + data.count })
      .setThumbnail(data.guild.iconURL())

      let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('closedTicket-'+data.user.id).setStyle(ButtonStyle.Secondary).setLabel('Close').setEmoji('🔒'),
        new ButtonBuilder().setCustomId('timedClosure').setStyle(ButtonStyle.Secondary).setLabel('Timed Closure').setEmoji('<:Timer:1351861429954936893>'),
      );
      let BotMsg = channel.send({ content: 'ticket opened <@' + data.user.id + '> <@&' + data.support + '>', embeds: [embed], components: [row] })
      
      })
      .catch(async err => {
      let log = await getChannel('1109020437096181831')
      log.send('Error creating tix for <@'+data.user.id+'>\n```diff\n- '+err+'```')
    });
    
    return ch;
}
};
