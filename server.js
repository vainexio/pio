// Project
require('dotenv').config();
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cc = 'KJ0UUFNHWBJSE-WE4GFT-W4VG'
const fs = require('fs-extra')

// Discord
const Discord = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const {WebhookClient, Permissions, Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu} = Discord; 
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES);
const client = new Client({ intents: myIntents , partials: ["CHANNEL"] });

// Env
const token = process.env.SECRET;
const mongooseToken = process.env.MONGOOSE;

async function startApp() {
    let promise = client.login(token)
    if (cc !== process.env.CC) {
      console.error("Discord bot login | Invalid Token 2");
      process.exit(1);
    }
    promise.catch(function(error) {
      console.error("Discord bot login | " + error);
      process.exit(1);
    });
}
startApp();

let guildSchema
let guildModel

let tokenSchema
let tokenModel

client.on("ready", async () => {
  console.log('Successfully logged in to discord bot.')
  await mongoose.connect(mongooseToken,{keepAlive: true});
  guildSchema = new mongoose.Schema({
    id: String,
    key: String,
    author: String,
    maxTokens: Number,
    verifiedRole: String,
    unverifyOnLeave: Boolean,
    users: [],
  })
  tokenSchema = new mongoose.Schema({
    id: String,
    access_token: String,
    refresh_token: String,
    createdAt: String,
    expiresAt: String,
  })
  guildModel = mongoose.model("ValcoreBackup_Model", guildSchema);
  tokenModel = mongoose.model("ValcoreBackup_Token", tokenSchema);
  
  if (slashCmd.register) {
  let discordUrl = "https://discord.com/api/v10/applications/"+client.user.id+"/commands"
  let headers = {
    "Authorization": "Bot "+token,
    "Content-Type": 'application/json'
  }
  
  for (let i in slashes) {
    await sleep(4000)
    let json = slashes[i]
    let response = await fetch(discordUrl, {
      method: 'post',
      body: JSON.stringify(json),
      headers: headers
    });
    console.log(response.status+' '+json.name)
    response = await response.json();
  }
    for (let i in slashCmd.deleteSlashes) {
      await sleep(4000)
      let deleteUrl = "https://discord.com/api/v10/applications/"+client.user.id+"/commands/"+slashCmd.deleteSlashes[i]
      let deleteRes = await fetch(deleteUrl, {
        method: 'delete',
        headers: headers
      })
      deleteRes = await deleteRes.json();
      console.log(deleteRes.status)
    }
  }
  client.user.setPresence({ status: 'online', activities: [{ name: 'Users', type: "LISTENING" }] });
  
  if (!process.env.CC || cc !== process.env.CC) process.exit(1);
})
module.exports = {
  client: client,
  getPerms,
  noPerms,
};

let listener = app.listen(process.env.PORT, function() {
   console.log('Not that it matters but your app is listening on port ' + listener.address().port);
});
/*
░██████╗███████╗████████╗████████╗██╗███╗░░██╗░██████╗░░██████╗
██╔════╝██╔════╝╚══██╔══╝╚══██╔══╝██║████╗░██║██╔════╝░██╔════╝
╚█████╗░█████╗░░░░░██║░░░░░░██║░░░██║██╔██╗██║██║░░██╗░╚█████╗░
░╚═══██╗██╔══╝░░░░░██║░░░░░░██║░░░██║██║╚████║██║░░╚██╗░╚═══██╗
██████╔╝███████╗░░░██║░░░░░░██║░░░██║██║░╚███║╚██████╔╝██████╔╝
╚═════╝░╚══════╝░░░╚═╝░░░░░░╚═╝░░░╚═╝╚═╝░░╚══╝░╚═════╝░╚═════╝░*/
var output = "901759430457167872";
const settings = require('./storage/settings_.js')
const {config, auth, prefix, colors, status, theme, commands, permissions, emojis} = settings
// Slash Commands
const slashCmd = require("./storage/slashCommands.js");
const { slashes } = slashCmd;
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
  let sortedPerms = await permissions.sort((a,b) => b.level-a.level)
  for (let i in sortedPerms) {
    if (permissions[i].id === member.id && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? (highestPerms = permissions[i], highestLevel = permissions[i].level) : null
    } else if (member.user && member.roles.cache.some(role => role.id === permissions[i].id) && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? (highestPerms = permissions[i], highestLevel = permissions[i].level) : null
    }
  }
  
  if (highestPerms) return highestPerms;
}
async function guildPerms(member, perms) {
  if (member.permissions.has(perms)) {
    return true;
  } else {
    return false;
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
const {safeSend, sendChannel, sendUser} = sendMsg
//Functions
const get = require('./functions/get.js')
const {getTime, chatAI, getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor} = get
//Command Handler
const cmdHandler = require('./functions/commands.js')
const {checkCommand, isCommand, isMessage, getTemplate} = cmdHandler
//Others
const others = require('./functions/others.js')
const {makeCode, stringJSON, fetchKey, ghostPing, sleep, moderate, getPercentage, getPercentageEmoji, randomTable, scanString, requireArgs, getArgs, makeButton, makeRow} = others
//Roles Handler
const roles = require('./functions/roles.js')
const {getRole, addRole, removeRole, hasRole} = roles
/*
░█████╗░██╗░░░░░██╗███████╗███╗░░██╗████████╗  ███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗
██╔══██╗██║░░░░░██║██╔════╝████╗░██║╚══██╔══╝  ████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝
██║░░╚═╝██║░░░░░██║█████╗░░██╔██╗██║░░░██║░░░  ██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░
██║░░██╗██║░░░░░██║██╔══╝░░██║╚████║░░░██║░░░  ██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░
╚█████╔╝███████╗██║███████╗██║░╚███║░░░██║░░░  ██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗
░╚════╝░╚══════╝╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝*/
//ON CLIENT MESSAGE

const messageCount = new Map();
const lastMessages = new Map();

async function refreshOneToken(user) {
  const now = getTime(new Date());
  if (now < user.expiresAt) return { success: true, refreshed: false, access_token: user.access_token };

  const params = new URLSearchParams();
  params.append('client_id', client.user.id);
  params.append('client_secret', process.env.clientSecret);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', user.refresh_token);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    let response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params,
      headers: headers
    });

    if (response.status === 200) {
      const result = await response.json();

      user.access_token = result.access_token;
      user.refresh_token = result.refresh_token;
      user.createdAt = now;
      user.expiresAt = getTime(new Date().getTime() + (result.expires_in * 1000));

      await user.save();

      return {
        success: true,
        refreshed: true,
        access_token: result.access_token
      };
    } else if (response.status === 400) {
      await tokenModel.deleteOne({ id: user.id });
      return { success: false, error: "Invalid refresh token", deleted: true };
    } else {
      return { success: false, error: `${response.status} - ${response.statusText}` };
    }
  } catch (err) {
    console.error("Single token refresh error:", err);
    return { success: false, error: err.toString() };
  }
}

client.on("messageCreate", async (message) => {
  if (message.content.toLowerCase() === '!invite') {
    let row = new MessageActionRow().addComponents(
        new MessageButton().setURL('https://discord.com/api/oauth2/authorize?client_id='+client.user.id+'&permissions=8&scope=bot').setStyle('LINK').setLabel("Invite Bot"),
      );
    
    message.reply({components: [row]})
  }
  if (message.channel.type === 'DM' || message.author.bot) return;
  //
  if (!await guildPerms(message.member,["MANAGE_GUILD"]) && !/^\W/.test(message.content) && !message.content.toLowerCase().startsWith('owo')) {
    const userId = message.author.id;
    const userMessage = message.content;

    const lastMessage = lastMessages.get(userId);

    if (lastMessage === userMessage) {
      messageCount.set(userId, (messageCount.get(userId) || 0) + 1);
    } else {
      lastMessages.set(userId, userMessage);
      messageCount.set(userId, 1);
    }
  }
  if (isCommand('protocol',message)) {
    if (!await getPerms(message.member,4)) return message.reply({content: emojis.warning+" You can't do that sir"});
    let members = await message.guild.members.fetch().then(async mems => {
      let members = []
      mems.forEach(mem => members.push(mem))
      
      console.log('changing')
      let success = 0
      let failed = 0
      let doc = await guildModel.findOne({id: message.guild.id}) 
      for (let i in members) {
        let mem = members[i]
          try {
            let found = doc.users.find(u => u === mem.user.id)
            if (!found && !mem.user.bot) {
              doc.users.push(mem.user.id)
              success++
            } else {
              failed++
            }
          } 
        catch (err) {
          failed++
          console.log(err)
        }
      }
      let toDelete = []
      for (let i in doc.users) {
        let user = doc.users[i]
        if (user === null) toDelete.push(i)
      }
      toDelete.sort((a, b) => b-a);
      for (let i in toDelete) {
        let index = toDelete[i]
        doc.users.splice(index,1)
      }
      await doc.save();
      console.log('S: '+success,'F: '+failed)
    })
  }
  else if (isCommand('calibrate',message)) {
    if (!await getPerms(message.member,4)) return message.reply({content: emojis.warning+" You can't do that sir"});
    await message.delete();
    let guilds = await guildModel.find()
    
    for (let i in guilds) {
      let guild = guilds[i]
      let toDelete = []
      let safe = 0
      let server = await getGuild(guild.id)
      let error = 0 
      
      for (let i in guild.users) {
        let user = guild.users[i]
        let userData = await tokenModel.findOne({id: user})
        if (!userData) {
          toDelete.push(i)
          if (server) {
            try {
              let member = await getMember(user,message.guild)
              if (member) await removeRole(member,['backup',guild.verifiedRole])
            } catch (err) {
              error++
            }
          }
        }
        else safe++
      }
      
      let embed = new MessageEmbed()
      .addFields(
        {name: server ? server.name : 'Unknown', value: 'Changes\n'+guild.users.length+' >> '+(guild.users.length-toDelete.length)}
      )
      
      toDelete.sort((a, b) => b-a);
      for (let i in toDelete) {
        let index = toDelete[i]
        guild.users.splice(index,1)
      }
      embed = new MessageEmbed(embed)
      .addFields(
        { name: 'Total Registered Users', value: guild.users.length.toString() },
        { name: 'Error', value: error.toString() }
      )
      .setFooter({text: guild.id})
      .setColor(colors.none)
      
      message.channel.send({content: '<@'+guild.author+'>', embeds: [embed]})
      //guild.verifiedRole = "Backup"
      await guild.save();
    }
  }
  else if (isCommand('fixrole',message)) {
    let members = await message.guild.members.fetch().then(async mems => {
      let members = []
      mems.forEach(mem => members.push(mem))
      await message.react('🔃')
      
      let doc = await guildModel.findOne({id: message.guild.id})
      let data = {
        total: 0,
        calibrated: 0,
        failed: 0,
      }
      for (let i in members) {
        let mem = members[i]
        if (await hasRole(mem,[doc.verifiedRole])) {
          data.total++
          try {
            if (!doc.users.find(u => u == mem.id)) {
              await removeRole(mem,[doc.verifiedRole])
              data.calibrated++
            }
            //
          } catch (err) {
            data.failed++
            console.log(err)
          }
        }
      }
      
      await message.reply("Total users checked: "+data.total+"\nCalibrated: "+data.calibrated+"\nFailed: "+data.failed)
    })
  }
  else if (isCommand('check',message)) {
    if (!await getPerms(message.member,4)) return message.reply({content: emojis.warning+" You can't do that sir"});
    let guilds = await guildModel.find()
      let list = []
      let topTen = ""
      let count = 0
      for (let i in guilds) {
        count++
        let guild = guilds[i]
        list.push({id: guild.id, users: guild.users.length, author: guild.author})
      }
    let content = ''
    for (let i in list) {
      let data = list[i]
      let guild = await getGuild(data.id)
      let counter = 0
      if (guild) {
        counter++
        let author = await getMember(data.author,message.guild)
        let emoji = ''
        if (author) {
          emoji = '📄'
          await addRole(author,['1259460543157112832'],message.guild)
        }
        else emoji = '❌'
        
        content += counter+'. '+emoji+' <@'+data.author+'>\n'
      }
    }
    await safeSend(message.channel,content+'\n\n📄 = in server\n✅ = has @comms role\n❌ = neither')
  }
});/*END MESSAGE CREATE*/
let joinDebounce = false
client.on('interactionCreate', async inter => {
  if (inter.isCommand()) {
    let cname = inter.commandName
      // Setup
    if (cname === 'register') {
      if (!await getPerms(inter.member,2)) return inter.reply({content: emojis.warning+" You are not on the whitelist"});
      let options = inter.options._hoistedOptions
      //
      let guildId = options.find(a => a.name === 'guild_id')
      let guild = await getGuild(guildId.value)
      if (!guild) return inter.reply({content: emojis.warning+' Cannot find guild. Make sure that the bot is on the server that you wish to register'})
      if (!await guildPerms(await getMember(inter.user.id,guild),["MANAGE_GUILD"])) return inter.reply({content: emojis.warning+' You must have the **MANAGE SERVER** permission in the server that you want to register'});
      
      let doc = await guildModel.findOne({id: guild.id})
      if (doc) return inter.reply({content: emojis.warning+' This guild was already registered.'})
      let docAuthor = await guildModel.findOne({author: inter.user.id})
      if (docAuthor && inter.user.id !== '497918770187075595') return inter.reply({content: emojis.warning+' You are limited to register 1 only.'})
      
      let newDoc = new guildModel(guildSchema)
      newDoc.id = guild.id
      newDoc.key = makeCode(30)
      newDoc.author = inter.user.id
      newDoc.maxTokens = config.guildMaxtokens
      newDoc.verifiedRole = "Backup"
      await newDoc.save()
        
      await inter.reply({content: emojis.on+" Your guild was registered!"})

      let embed = new MessageEmbed()
      .addFields(
        {name: "Generated Key", value: "This key was generated for the first time. Make sure you save it externally!"},
        {name: "Data", value: "Guild ID `"+guild.id+"`\nGuild Name `"+guild.name+"`"}
      )
      .setColor(theme)
        await inter.user.send({content: newDoc.key, embeds: [embed], ephemeral: true})
          .then(msg => inter.followUp({content: emojis.check+' Your access key has been sent via direct message'}))
          .catch(async err => {
          console.log(err)
          inter.followUp({content: emojis.warning+' Unable to send access key via direct message\n```diff\n-'+err+'```'})
          await guildModel.deleteOne({key: newDoc.key})
        })
      }
    else if (cname === 'unregister') {
        let options = inter.options._hoistedOptions
        //
        let key = options.find(a => a.name === 'key')
        await inter.deferReply();

        let doc = await guildModel.findOne({key: key.value})
        let guild = await getGuild(doc.id)
        if (doc) {
          let embed = new MessageEmbed()
          .setDescription(emojis.off+' Your guild is flagged for termination')
          .setColor(colors.red)
          .addFields(
            {name: "Guild", value: "Guild ID `"+guild?.id+"`\nGuild Name `"+guild?.name+"`"},
            {name: "Registered Users", value: doc.users.length.toString(), inline: true},
            {name: "Author", value: '<@'+doc.author+'>', inline: true},
            {name: "Access Key", value: '```diff\n- '+doc.key.substr(0, doc.key.length-20)+'```'},
          )

          let row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('unregisPrompt-'+inter.user.id).setStyle('DANGER').setLabel("Unregister").setEmoji(emojis.warning),
          );
          await inter.editReply({content: doc.id, embeds: [embed], components: [row], ephemeral: true})
        } else {
          await inter.editReply({content: emojis.warning+' Invalid access key'})
        }
      }

      // Config
    else if (cname === 'unverify_on_leave') {
      let options = inter.options._hoistedOptions
      //
      let key = options.find(a => a.name === 'key')
      let enabled = options.find(a => a.name === 'enabled')
      await inter.deferReply();

      let doc = await guildModel.findOne({key: key.value})
      if (doc) {
        doc.unverifyOnLeave = enabled.value
        let reply = ""
        if (doc.unverifyOnLeave) reply = emojis.on+" Unverify on leave is now **enabled**"
        else reply = emojis.off+" Unverify on leave is now **disabled**"
        
        await inter.editReply({content: reply})
        await doc.save()
      } else {
        await inter.editReply({content: emojis.warning+' Invalid access key'})
      }
    }
    else if (cname === 'status') {
        let options = inter.options._hoistedOptions
        //
        let key = options.find(a => a.name === 'key')
        await inter.deferReply({ephemeral: true})

        let doc = await guildModel.findOne({key: key?.value})
        if (!doc) doc = await guildModel.findOne({author: inter.user.id})
        if (!doc) return inter.reply({content: emojis.warning+' Invalid access key'})
        let guild = await getGuild(doc.id)
      
        let embed = new MessageEmbed()
        .setColor(colors.none)
        .setTitle(`${guild?.name}`)
        .setThumbnail(guild?.iconURL())
        .setDescription("Run /restore_members to see instructions how to restore members on new server")
        .addFields(
          { name: "Server Information", 
           value: 
             emojis.on+" Verified Users: "+doc.users.length+"\n"+
             emojis.on+" Author: <@"+doc.author+">\n"+
             (doc.verifiedRole !== "Backup" ? emojis.on+" Verified Role: <@&"+doc.verifiedRole+">\n" : emojis.off+" Verified Role: </setrole:1248659549066367069>\n")+
             (doc.unverifyOnLeave ? emojis.on+" UnverifyOnLeave: Enabled" : emojis.off+" </unverify_on_leave:1391426611446026361>: Disabled")
           , inline: true },
          { name: "Access Key", value: `\`\`\`yaml\n${doc.key}\`\`\`` },
        )
      .setFooter({text: "Do not share your access key with anyone!"})
        await inter.editReply({embeds: [embed], ephemeral: true})
      }
    else if (cname === 'setrole') {
       let options = inter.options._hoistedOptions
       let role = options.find(a => a.name === 'role')
       let key = options.find(a => a.name === 'key')
       let doc = await guildModel.findOne({key: key.value})
       await inter.reply({content: emojis.loading+" Changing role", ephemeral: true})
       if (!doc) return inter.editReply({content: emojis.warning+' Invalid Key', ephemeral: true})

        let oldLimit = doc.verifiedRole
        doc.verifiedRole = role.role.id
        await doc.save()

        let embed = new MessageEmbed()
        .setDescription(emojis.on+" Successfully changed verified role from "+(oldLimit !== "Backup" ? "<@&"+oldLimit+">" : oldLimit)+" to **"+role.role.toString()+"**")
        .setColor(theme)

        await inter.followUp({embeds: [embed]})
    }

      // Backup
    else if (cname === 'restore_members') {
      let ch = await getChannel(config.channels.templates)
      let foundMsg = await ch.messages.fetch('1391422472942911488')
      await inter.reply(foundMsg.content)
    }
    else if (cname === 'transfer') {
        let options = inter.options._hoistedOptions
        //
        let newServer = options.find(a => a.name === 'new_server_id')
        let key = options.find(a => a.name === 'key')
        let doc = await guildModel.findOne({key: key.value})

        await inter.reply({content: emojis.loading+' Transferring data. Please wait!', ephemeral: true})

        let guild = newServer ? await getGuild(newServer.value) : inter.guild
        if (!doc || !guild) return inter.channel.send({content: emojis.warning+' Invalid guild/key'})
        let existingGuild = await guildModel.findOne({id: guild.id})
        if (existingGuild && existingGuild.id !== doc.id) return inter.channel.send({content: emojis.warning+' Cannot transfer to an already registered guild.'})
        let embed = new MessageEmbed()
        .addFields(
          { name: 'Guild Transfer', value: emojis.off+' OLD\nID `'+doc.id+'`\n\n'+emojis.on+' NEW\nID `'+newServer.value+'`\nName **'+guild.name+'**'},
          { name: 'Author Transfer', value: emojis.off+' OLD\nID `'+doc.author+'`\n\n'+emojis.on+' NEW\nID `'+inter.user.id+'`\nPing '+inter.user.toString()},
        )
        .setColor(colors.blue)

        doc.id = guild.id
        doc.author = inter.user.id
        doc.key = makeCode(30)
        await doc.save()
        await inter.channel.send({content: emojis.check+' Data Transferred', embeds: [embed]})

        let embed2 = new MessageEmbed()
        .addFields(
          {name: "Generated Key", value: "Your old key was deleted and a new key was generated. Make sure you save it externally!"},
          {name: "Data", value: "Guild ID `"+guild.id+"`\nGuild Name `"+guild.name+"`"}
        )
        .setColor(theme)

        await inter.user.send({content: doc.key, embeds: [embed2]})
          .then(msg => inter.followUp({content: emojis.check+' Your new access key has been sent via direct message'}))
          .catch(async err => {
          console.log(err)
          inter.followUp({content: emojis.warning+' Unable to send access key via direct message. Sending here...\n'+doc.key, embeds: [embed2], ephemeral: true})
        })
      }
    else if (cname === 'joinall') {
      let options = inter.options._hoistedOptions;
      let key = options.find(a => a.name === 'key');
      let reason = options.find(a => a.name === 'message');
      let guildId = options.find(a => a.name === 'target_server_id');
      let guild = await getGuild(guildId.value);

      if (!guild) return inter.reply({ content: emojis.warning + ' Invalid guild ID was provided', ephemeral: true });

      let doc = await guildModel.findOne({ key: key.value });
      if (!doc) return inter.reply({ content: emojis.warning + ' Invalid access key', ephemeral: true });
      if (doc.users.length === 0) return inter.reply({ content: emojis.warning + ' No users have yet verified to your server', ephemeral: true });

      if (joinDebounce) return inter.reply(emojis.warning + " Bot is currently busy with other `joinall` commands. Please try again later.");
      joinDebounce = true;

      let failed = 0;
      let success = 0;
      let already = 0;
      let errors = "";
      let toDelete = [];

      await inter.reply({ content: emojis.loading + " Joining " + doc.users.length + " users to your new guild **(" + guild.name + ")**", ephemeral: true });
      const usersDataContent = `['${doc.users.join("', '")}'];`;
      await safeSend(inter.channel, "**Initial Report Data**\n\n" + usersDataContent);

      let ch = await getChannel(config.channels.templates);
      let foundMsg = await ch.messages.fetch('1261206750422503434');
      let msgContent = '' + foundMsg.content;

      for (let i in doc.users) {
        let userId = doc.users[i];
        try {
          let user = await getUser(userId);
          if (user) {
            let member = await getMember(user.id, guild);
            if (member) {
              already++;
            } else {
              let data = await tokenModel.findOne({ id: userId });
              if (data) {
                let result = await refreshOneToken(data);
                if (!result.success) {
                  toDelete.push(i);
                  failed++;
                  errors += `Token refresh failed for ${userId}: ${result.error || 'unknown reason'}\n\n`;
                  continue;
                }

                const tokenToUse = result.access_token;
                await guild.members.add(user, { accessToken: tokenToUse })
                  .then(suc => {
                    success++;

                    let unverify = new MessageActionRow().addComponents(
                      new MessageButton().setCustomId('unverifPrompt-' + doc.id).setStyle('SECONDARY').setLabel('Unverify'),
                    );

                    let finalMsg = msgContent.replace('{server}', guild.name).replace('{user}', '<@' + doc.author + '>').replace('{msg}', reason.value);

                    user.send({
                      content: finalMsg,
                      components: [unverify]
                    });
                  })
                  .catch(err => {
                    if (err.toString().includes('Invalid OAuth2') || err.toString().includes('Unknown User')) {
                      toDelete.push(i);
                      failed++;
                    } else {
                      errors += `Fetch failed: ${userId}\n${err}\n\n`;
                    }
                  });
              } else {
                toDelete.push(i);
                errors += 'No token data found for ' + userId + "\n\n";
                failed++;
              }
            }
          } else {
            toDelete.push(i);
            await tokenModel.deleteOne({ id: userId });
            errors += 'User not found ' + userId + "\n\n";
            failed++;
          }
        } catch (err) {
          errors += 'Code error on ' + userId + ': ' + err + "\n\n";
        }
      }

      const errorsData = fs.writeFileSync('errors-data.txt', errors, 'utf8');
      toDelete.sort((a, b) => b - a);
      for (let i in toDelete) {
        let index = toDelete[i];
        doc.users.splice(index, 1);
      }
      joinDebounce = false;
      await inter.channel.send({ content: emojis.check + ' Success: ' + success + '\n' + emojis.x + ' Deauthorized: ' + failed + '\n' + emojis.on + ' Already in Server: ' + already + '\n🔑 Total Tokens: ' + doc.users.length });
      await safeSend(inter.channel, "**Errors Report**\n\n" + errorsData);
      await doc.save();
    }
    else if (cname === 'join') {
        let options = inter.options._hoistedOptions;
        let key = options.find(a => a.name === 'key');
        let reason = options.find(a => a.name === 'message');
        let user = options.find(a => a.name === 'target_user');
        let userId = options.find(a => a.name === 'target_user_id');
        let guildId = options.find(a => a.name === 'target_server_id');

        !user ? userId ? user = await getUser(userId.value) : user = null : user = user.user;
        if (!user) return inter.reply({ content: emojis.warning + ' Invalid user ID', ephemeral: true });

        try {
          let guild = await getGuild(guildId.value);
          let doc = await guildModel.findOne({ key: key.value });

          if (!doc) return inter.reply({ content: emojis.warning + ' Invalid access key' });
          if (!guild) return inter.reply({ content: emojis.warning + ' Invalid guild ID', ephemeral: true });

          let existingUser = doc.users.find(u => u === user.id);
          if (!existingUser) return await inter.reply({ content: emojis.x + ' **' + user.tag + '** is not verified on ' + guild.name, ephemeral: true });

          await inter.reply({ content: emojis.loading + ' Joining **' + user.tag + '** to ' + guild.name, ephemeral: true });
          let data = await tokenModel.findOne({ id: user.id });
          let error = false;

          let ch = await getChannel(config.channels.templates);
          let foundMsg = await ch.messages.fetch('1261206750422503434');
          let msgContent = '' + foundMsg.content;

          // Refresh token if needed
          let result = await refreshOneToken(data);
          if (!result.success) {
            return inter.followUp({ content: emojis.warning + " Failed to refresh token for **"+user.tag+"**\n\n\```diff\n- result.error```" });
          }

          let tokenToUse = result.access_token;

          await guild.members.add(user, { accessToken: tokenToUse }).catch(err => {
            console.log(err);
            error = true;
            inter.followUp({ content: emojis.warning + " Failed to join **" + user.tag + "** to " + guild.name + '\n```diff\n-' + err + '```' });
          }).then(msg => {
            if (!error) {
              inter.followUp({ content: emojis.on + " Successfully joined **" + user.tag + "** to " + guild.name });

              let unverify = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('unverifPrompt-' + doc.id).setStyle('SECONDARY').setLabel('Unverify'),
              );

              msgContent = msgContent.replace('{server}', guild.name);
              msgContent = msgContent.replace('{user}', '<@' + doc.author + '>');
              msgContent = msgContent.replace('{msg}', reason.value);

              user.send({
                content: msgContent,
                components: [unverify]
              });
            }
          });
        } catch (err) {
          console.log(err);
          inter.channel.send({ content: emojis.warning + " Unexpected error occurred\n```diff\n- " + err + "```" });
        }
      }
      
      // Misc
    else if (cname === 'addroles') {
        let options = inter.options._hoistedOptions
        //
        let key = options.find(a => a.name === 'key')

        let doc = await guildModel.findOne({key: key.value})
        if (!doc) return inter.reply({content: emojis.warning+' Invalid Key', ephemeral: true})
        if (doc.users.length === 0) return inter.reply({content: emojis.warning+' No users have yet verified to your server', ephemeral: true})
        let failed = 0
        let success = 0
        let already = 0
        let role = await getRole(doc.verifiedRole,inter.guild)
        if (!role) await inter.reply({content: `Please set a role called "Backup" or use the /setrole command to use an existig role!`})
        await inter.reply({content: emojis.loading+" Adding **backup** role to "+doc.users.length+" users", ephemeral: true})
        for (let i in doc.users) {
          let userId = doc.users[i]
          try {
            let user = await getUser(userId);
            if (user) {
            let member = await getMember(user.id,inter.guild)
            if (member) {
              if (await hasRole(member,[role.id])) already++ 
              else {
                let notAdded = await addRole(member,[role.id],inter.guild)
                if (notAdded) failed++
                else success++
              }
            } else {
              failed++
            }
          }
          } catch(err) {
            await tokenModel.deleteOne({id: userId})
            console.log('Code error: '+err)
            failed++
          }
          console.log(success+', '+already+', '+failed)
        }

        await inter.channel.send({content: emojis.check+' Added: '+success+'\n'+emojis.x+' Failed: '+failed+'\n'+emojis.on+' Already Added: '+already})
      }
    else if (cname === 'verify_link') {
      //
      let doc = await guildModel.findOne({id: inter.guild.id})
      if (!doc) return inter.reply({content: emojis.warning+' Unergistered guild ID'})
      let guild = await getGuild(doc.id)
      
      let embed = new MessageEmbed()
        .setColor(colors.none)
        .setTitle(`${guild?.name}`)
        .setThumbnail(guild?.iconURL())
        .addFields(
          { name: "Server Information", 
           value: 
             emojis.on+" Verified Users: "+doc.users.length+"\n"+
             (doc.verifiedRole !== "Backup" ? emojis.on+" Verified Role: <@&"+doc.verifiedRole+">\n" : emojis.off+" Verified Role: None\n")+
             (doc.unverifyOnLeave ? emojis.on+" UnverifyOnLeave: Enabled" : emojis.off+" UnverifyOnLeave: Disabled")
           , inline: true },
        )
      .setFooter({text: "Click the button below to verify"})
      
        let row = null
        let url = encodeURI('https://discord.com/oauth2/authorize?client_id='+client.user.id+'&response_type=code&redirect_uri='+process.env.live+'&scope=guilds.join+identify&state='+doc.id+'-version'+config.version)
      row = new MessageActionRow().addComponents(
        new MessageButton().setURL(url).setStyle('LINK').setLabel("Verify"),
      );

        await inter.reply({embeds: [embed], components: [row]})
      }
    else if (cname === 'merge') {
      if (!await getPerms(inter.member,5)) return inter.reply({content: emojis.warning+" Insufficient Permission"});
      let options = inter.options._hoistedOptions
      //
      let newServer = options.find(a => a.name === 'new_server_id')
      let key = options.find(a => a.name === 'key')
      let doc = await guildModel.findOne({key: key.value})
      
      await inter.reply({content: emojis.loading+' Merging data. Please wait.', ephemeral: true})
      
      let guild = newServer ? await getGuild(newServer.value) : inter.guild
      if (!doc || !guild) return inter.channel.send({content: emojis.warning+' Invalid guild/key'})
      let existingGuild = await guildModel.findOne({id: guild.id})
      for (let i in doc.users) {
        let user = doc.users[i]
        if (!existingGuild.users.find(u => u == user)) {
          existingGuild.users.push(user)
        }
      }
      await existingGuild.save()
      console.log('yipi')
    }
    else if (cname === 'data') {
      if (!await getPerms(inter.member,5)) return inter.reply({content: emojis.warning+" Insufficient Permission"});
      let options = inter.options._hoistedOptions
      //
      let id = options.find(a => a.name === 'id')
      let doc = await guildModel.findOne({id: id.value})
            
      if (!doc) doc = await guildModel.findOne({author: id.value})
      if (!doc) return inter.reply({content: emojis.warning+' Invalid guild/author data'})
      inter.reply({content: doc.key, ephemeral: true})
    }
    else if (cname === 'setlimit') {
      if (!await getPerms(inter.member,5)) return inter.reply({content: emojis.warning+" Insufficient Permission"});
      let options = inter.options._hoistedOptions
      //
      let id = options.find(a => a.name === 'id')
      let limit = options.find(a => a.name === 'limit')
      let doc = await guildModel.findOne({id: id.value})
            
      if (!doc) doc = await guildModel.findOne({author: id.value})
      if (!doc) return inter.reply({content: emojis.warning+' Invalid guild/author data'})
      
      let oldLimit = doc.maxTokens
      doc.maxTokens = limit.value
      await doc.save()
      inter.reply({content: emojis.on+" Successfully changed max tokens from **"+oldLimit+"** to **"+limit.value+"**"})
    }
  }
  //BUTTONS
  else if (inter.isButton() || inter.isSelectMenu()) {
    let id = inter.customId
    if (id.startsWith("unverifPrompt-")) {
      let guildId = id.replace('unverifPrompt-','')
      let row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('unverify-'+guildId).setStyle('SUCCESS').setLabel("Yes"),
        new MessageButton().setCustomId('cancel').setStyle('DANGER').setLabel("No"),
      );
      await inter.reply({content: 'Are you sure you want to unverify yourself from this server?', ephemeral: true, components: [row]})
    }
    else if (id.startsWith("unregisPrompt-")) {
      let userId = id.replace('unregisPrompt-','')
      let row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('unregister-'+inter.message.content).setStyle('SUCCESS').setLabel("Yes"),
        new MessageButton().setCustomId('cancel').setStyle('DANGER').setLabel("No"),
      );
      await inter.reply({content: 'Are you sure you want to unregister this server?\n> This action is irreversible!', ephemeral: true, components: [row]})
    }
    //
    else if (id.startsWith('unregister-')) {
      let guildId = id.replace('unregister-','')
      let userId = inter.user.id
      let doc = await guildModel.findOne({id: guildId})
      let guild = await getGuild(doc.id)
      if (!doc) return inter.update({content: emojis.warning+' Unergistered guild ID', components: []})
      
      let embed = new MessageEmbed()
        .setDescription(emojis.off+' This guild data was terminated by '+inter.user.toString())
        .setColor(colors.red)
        .addFields(
          {name: "Guild", value: "Guild ID `"+guild?.id+"`\nGuild Name `"+guild?.name+"`"},
          {name: "Registered Users", value: doc.users.length.toString(), inline: true},
          {name: "Author", value: '<@'+doc.author+'>', inline: true},
          {name: "Access Key", value: '```diff\n- '+doc.key.substr(0, doc.key.length-20)+'```'},
        )
      await guildModel.deleteOne({id: guildId})
      await inter.reply({embeds: [embed]})
    }
    else if (id.startsWith('unverify-')) {
      let guildId = id.replace('unverify-','')
      let userId = inter.user.id
      let guild = await getGuild(guildId)
      let doc = await guildModel.findOne({id: guildId})
      if (!doc) return inter.update({content: emojis.warning+' Unergistered guild ID', components: []})
      let user = doc.users.find(u => u === userId)
      if (!user) return inter.update({content: emojis.warning+' You are not verified on this server', components: []})
        await inter.update({content: emojis.check+' You have been **unverified** from this server!\nClick the button again if you wish to reverify', components: []})
      doc.users.splice(doc.users.indexOf(userId),1)
      await doc.save();
      await sleep(1000)
      let member = await getMember(inter.user.id,guild)
      await removeRole(member,[doc.verifiedRole,"sloopie"],guildId)
    }
    else if (id.startsWith('cancel')) {
      await inter.update({content: 'Interaction was cancelled.', components: []})
    }
  }
});
client.on('guildMemberRemove', async member => {
  let doc = await guildModel.findOne({id: member.guild.id})
  if (doc && doc.unverifyOnLeave) {
    console.log(`👋 ${member.user.username} left the server ${member.guild.name}`);
    let user = doc.users.find(u => u === member.user.id)
    if (user) {
      doc.users.splice(doc.users.indexOf(member.user.id),1);
      await doc.save();
    }
  }
});
process.on('unhandledRejection', async error => {
  console.log(error);
  let caller_line = error.stack.split("\n");
  let index = await caller_line.find(b => b.includes('/app'))
  let embed = new MessageEmbed()
  .addField('Caller Line','```'+(index ? index : 'Unknown')+'```',true)
  .addField('Error Code','```css\n[ '+error.code+' ]```',true)
  .addField('Error','```diff\n- '+(error.stack >= 1024 ? error.stack.slice(0, 1023) : error.stack)+'```')
  .setColor(colors.red)
  
  let channel = await getChannel(output)
  channel ? channel.send({embeds: [embed]}).catch(error => error) : null
});

function respond(res, data) {
  const htmlTemplate = fs.readFileSync('public/new-output.html', 'utf8');

  const modifiedHtml = htmlTemplate
  .replace(/\$\{pageTitle\}/g,(data.guild?.name ? data.guild.name.toUpperCase() : 'ERROR').replace(/^(.{10}).+/, "$1..."))
  .replace(/\$\{imageUrl\}/g, data.guild && data.guild.iconURL() ? data.guild.iconURL() : "https://upload.wikimedia.org/wikipedia/commons/3/37/Sad-face.png")
  .replace(/\$\{bannerUrl\}/g, data.guild && data.guild.bannerURL() ? data.guild.bannerURL({size: 1024, forceStatic: false}) : "")
  .replace(/\$\{subtext\}/g, data.text.toUpperCase())
  .replace(/\$\{subtextColor\}/g, data.color)
  .replace(/\$\{subtext2\}/g, data.text2 ? data.text2.toUpperCase() : '');
  
  res.send(modifiedHtml);
}
app.get('/backup', async function (req, res) {
  if (!req.query.state) return respond(res, {text: "Unknown server ID", color: '#ff4b4b'})
  if (!req.query.state.includes('-version'+config.version)) return respond(res, {text: "Version Mismatch", color: '#ff4b4b'})
  let foundGuildId = req.query.state.replace('-version'+config.version,'')
  try {
    let guild = await getGuild(foundGuildId)
    
    let data_1 = new URLSearchParams();
    data_1.append('client_id', client.user.id);
    data_1.append('client_secret', process.env.clientSecret);
    data_1.append('grant_type', 'authorization_code');
    data_1.append('redirect_uri', process.env.live);
    data_1.append('scope', 'identify');
    data_1.append('code', req.query.code);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const clientIp = ip.split(',')[0].trim();
    console.log(`Client IP Address: ${clientIp}`);
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    // Fetch token
    let response = await fetch('https://discord.com/api/oauth2/token', { method: "POST", body: data_1, headers: headers })

    response = await response.json();
    // Fetch user
    let user = await fetch('https://discord.com/api/users/@me',{ headers: {'authorization': `Bearer ${response.access_token}`}})
    user.status !== 200 ? console.log(user.status+' - '+user.statusText) : null
    user = await user.json();
    console.log(user?.username+' - '+user?.id)
    if (!user || user?.message?.includes('401')) return respond(res, {text: 'Link expired', color: '#ff4b4b', guild: guild})
    if (!user.id) {
      respond(res, {text: 'Critial Error - Please Report to Dev', color: '#ff4b4b', guild: guild})
      print(user)
      return
    }
    // Fetch model
    if (!guildModel) return respond(res, {text: "VALCORE is waking up.", text2: "Please try again later", color: '#ff8800', guild: guild})
    let doc = await guildModel.findOne({id: foundGuildId})
    if (!doc) return respond(res, {text: "Unregistered guild", color: '#ff4b4b'})
    let userData = await tokenModel.findOne({id: user.id})
    let member = await getMember(user.id,guild)
    if (!member) return respond(res, {text: "Not in the server", color: '#ff8800', guild: guild})
    // MSG
    let channel = await getChannel('1109020436026634265')
    let template = await getChannel('1109020434810294344')
    let msg = await template.messages.fetch('1258073676792856597')
    let content = msg.content.replace('{user}','<@'+member.id+'>')
    //
    if (userData) {
      userData.access_token = response.access_token
      userData.refresh_token = response.refresh_token
      userData.createdAt = getTime(new Date())
      userData.expiresAt = getTime(new Date().getTime()+(response.expires_in*1000))
      await userData.save()
    }
    //
    else {
      //
      let newUser = new tokenModel(tokenSchema)
      newUser.id = user.id
      newUser.access_token = response.access_token
      newUser.refresh_token = response.refresh_token
      newUser.createdAt = getTime(new Date())
      newUser.expiresAt = getTime(new Date().getTime()+(response.expires_in*1000))
      await newUser.save()
    }
    if (await hasRole(member,['restricted'],guild)) return respond(res, {text: 'Cannot verify due to restriction', color: '#ff4b4b', guild: guild})
    if (doc.users.length >= doc.maxTokens) return respond(res, {text: 'Reached maximum tokens<br />('+doc.users.length+'/'+doc.maxTokens+')', color: '#ff4b4b', guild: guild})
    let foundUser = doc.users.find(u => u === user.id)
    let customMsg = config.customMessages.find(c => c.id === user.id)
    if (!foundUser) {
      doc.users.push(user.id)
    }
    else {
      let notAdded = member ? await addRole(member,[doc.verifiedRole,"sloopie"],guild) : null
      if (notAdded) console.log('Not added',notAdded)
      return respond(res, {text: customMsg ? customMsg.msg : 'Already verified', text2: doc.users.length+'/'+doc.maxTokens+" MEMBERS", color: '#ff8800', guild: guild})
    }
    //
    await doc.save();
    await addRole(member,[doc.verifiedRole,"sloopie"],guild)
    if (guild.id == '1109020434449575936') channel.send({content: content})
    let userIndex = doc.users.indexOf(user.id) + 1
    respond(res, {text: customMsg ? customMsg.msg : 'You have been verified', text2: '<b>'+getNth(userIndex)+'</b> member', color: '#b6ff84', guild: guild})
    
    let unverify = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('unverifPrompt-'+doc.id).setStyle('SECONDARY').setLabel('Unverify'),
    );
    
    let ch = await getChannel(config.channels.templates)
    let foundMsg = await ch.messages.fetch('1261206731313385494')
    foundMsg = foundMsg.content
    foundMsg = foundMsg.replace('{server}',guild.name)
    foundMsg = foundMsg.replace('{user}','<@'+doc.author+'>')
    console.log(doc.author)
    await member.user.send({
      content: foundMsg,
      components: [unverify]
    });
  }
  catch (err) {
    console.log(err)
    res.status(400).send({'error': err.message})
  }
  //
});

app.get('/', async function (req, res) {
  res.status(200).send({ status: "VALCORE is up and running!!" })
});
