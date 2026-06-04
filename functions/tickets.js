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
      .setTitle(data.name)
      .setDescription("welcome **"+data.user.username+"** *!*\n<:hb_rule_book:1138712613769990254> any available <@&"+data.support+"> will assist you soon.\n\n"+data.context)
      .setColor(colors.yellow)
      .setFooter({text: 'Sloopie Tickets'})
      .setThumbnail(data.guild.iconURL())
      
      let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('closedTicket-'+data.user.id).setStyle(ButtonStyle.Secondary).setLabel('Close').setEmoji('🔒'),
        new ButtonBuilder().setCustomId('timedClosure').setStyle(ButtonStyle.Secondary).setLabel('Timed Closure').setEmoji('<:Timer:1351861429954936893>'),
      );
      let BotMsg = channel.send({ content: "<a:S_whiteheart02:1138715896077090856> <@"+data.user.id+">\n<a:S_whiteheart02:1138715896077090856> <@&"+data.support+">\n\n<:S_letter:1138714993425125556> ticket opened ("+data.name.toLowerCase()+") *!*", embeds: [embed] , components: [row]})
      
      })
      .catch(async err => {
      let log = await getChannel('1109020437096181831')
      log.send('Error creating tix for <@'+data.user.id+'>\n```diff\n- '+err+'```')
    });
    
    return ch;
}
};
