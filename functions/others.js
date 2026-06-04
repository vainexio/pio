const {getPerms, noPerms, client} = require('../server.js');
const Discord = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = Discord;

const sendMsg = require('../functions/sendMessage.js')
const sendChannel = sendMsg.sendChannel
const sendUser = sendMsg.sendUser

const settings = require('../storage/settings_.js')
const {shop, emojis, colors, theme, status} = settings

const cmdHandler = require('../functions/commands.js')
const {getTemplate} = cmdHandler

const get = require('../functions/get.js')
const {getRandom, getChannel} = get

const toButtonStyle = (s) => {
  s = (s || '').toUpperCase();
  if (s === 'PRIMARY') return ButtonStyle.Primary;
  if (s === 'SUCCESS') return ButtonStyle.Success;
  if (s === 'DANGER') return ButtonStyle.Danger;
  if (s === 'LINK') return ButtonStyle.Link;
  return ButtonStyle.Secondary;
};

const makeButton = async function (id, label, style, emoji) {
  let button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(toButtonStyle(style));

  if ((style || '').toUpperCase() === 'LINK') {
    button.setURL(id);
  } else {
    button.setCustomId(id);
  }
  if (emoji) {
    button.setEmoji(emoji);
  }
  return button;
};

const makeRow = async function (id, label, style, emoji) {
  let button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(toButtonStyle(style));

  if ((style || '').toUpperCase() === 'LINK') {
    button.setURL(id);
  } else {
    button.setCustomId(id);
  }
  if (emoji) {
    button.setEmoji(emoji);
  }

  const row = new ActionRowBuilder().addComponents(button);
  return row;
};

module.exports = {
  parseAmounts: function (input) {
  const regex = /(?:(\d+(?:\.\d+)?)[xX]\s*(?:of\s*)?)?\b(\d+(?:\.\d+)?)([kK])?\b/gi;
  const results = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    const multiplier = match[1] ? parseFloat(match[1]) : 1;
    const number = parseFloat(match[2]);
    const isK = !!match[3];
    const value = multiplier * number * (isK ? 1000 : 1);
    results.push({ multiplier, number, isK, value });
  }

  return results;
},
  makeCode: function (length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  stringJSON: function (jsobj) {
    var msg = '\```json\n{'
    for (var key in jsobj) {
      if (jsobj.hasOwnProperty(key)) {
        msg = msg + "\n \"" + key + "\": \"" + jsobj[key] + "\","
      }                       
    }
    msg = msg.substring(0, msg.length - 1)
    msg = msg + "\n}\`\`\`"
    return msg;
  },
  fetchKey: async function (channel, key, message) {
  
  let last_id;
  let foundKey = false
  let mentionsCount = 0
  let limit = 500
  let msgSize = 0
  let totalMsg = 0
  
  let embedMention = new EmbedBuilder()
  .setDescription("No recent pings was found.")
  .setColor(colors.red)
  
  let msgBot
  await message.channel.send("Searching for reference code... "+emojis.loading).then((botMsg) => { msgBot = botMsg })
    
    while (true) {
      const options = { limit: 100 };
      if (last_id) {
        options.before = last_id;
      }
      
      let messages = await channel.messages.fetch(options).then(messages => {
      
      last_id = messages.last().id;
      totalMsg += messages.size
      msgSize = messages.size
        
        messages.forEach(async (gotMsg) => {
          if (gotMsg.content.toLowerCase().includes(key.toLowerCase()) && gotMsg.author.id === client.user.id) {
            mentionsCount += 1
            let row = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setLabel('Jump to Message').setURL(gotMsg.url).setStyle(ButtonStyle.Link)
            );
            message.reply({content: emojis.check+' Reference code was found.', components: [row]})
            foundKey = true
          }
        })
      });
      if (foundKey || await msgSize != 100) {
        msgBot.delete();
        if (!foundKey) message.channel.send(emojis.x+" No key was found `"+key+"`.")
        break;
      }
    }
  },
  sleep: function (miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime() && !shop.breakChecker) {
    }
  },
  moderate: async function(member, perms) {
  if (perms) return;

  try {
    const currentDisplay = member.displayName || member.globalName || member.user.username;
    if (currentDisplay.includes('!')) {
      let newNick = currentDisplay.replace(/!/g, 'ω');
      if (newNick.length > 32) newNick = newNick.slice(0, 32);
      const currentNick = member.nickname;
      if (currentNick !== newNick) {
        await member.setNickname(newNick).catch(() => null);
      }
    }
  } catch (err) {
  }

  let customPres = member.presence?.activities.find(a => a.id === 'custom');
  if (customPres) {
    const state = (customPres.state || '').toLowerCase();
    const sellingKeywords = ['sale', 'php', '₱', 'p', 'fs', 'sell'];
    const currencyKeywords = ['robux', 'rs'];

    const hasSellingKeyword = sellingKeywords.some(k => state.includes(k));
    const hasCurrencyKeyword = currencyKeywords.some(k => state.includes(k));

    if (hasSellingKeyword && hasCurrencyKeyword) {
      if (!member.nickname?.startsWith('ω.')) {
        await member.setNickname('ω. ' + member.user.username.replace(/ /g, '')).catch(() => null);
      }
      return true;
    }
  }

  return;
},
  getPercentage: function(value, totalValue) {
    value = Number(value)
    totalValue = Number(totalValue)
    let percentage = Math.round((value/totalValue)*100)
    return percentage;
  },
  getPercentageEmoji: function (value, totalValue) {
    value = Number(value)
    totalValue = Number(totalValue)
    let percentage = Math.round((value/totalValue)*100)
    console.log(percentage,value,totalValue)
    let emojiFormat = percentage >= 100 ? emojis.full1+emojis.full2+emojis.full2+emojis.full2+emojis.full3 : 
    percentage >= 90 ? emojis.full1+emojis.full2+emojis.full2+emojis.full2+emojis.half3 :  
    percentage >= 80 ? emojis.full1+emojis.full2+emojis.full2+emojis.full2+emojis.empty3 : 
    percentage >= 70 ? emojis.full1+emojis.full2+emojis.full2+emojis.half2+emojis.empty3 :
    percentage >= 60 ? emojis.full1+emojis.full2+emojis.full2+emojis.empty2+emojis.empty3 : 
    percentage >= 50 ? emojis.full1+emojis.full2+emojis.half2+emojis.empty2+emojis.empty3 : 
    percentage >= 40 ? emojis.full1+emojis.full2+emojis.empty2+emojis.empty2+emojis.empty3 : 
    percentage >= 30 ? emojis.full1+emojis.half2+emojis.empty2+emojis.empty2+emojis.empty3 : 
    percentage >= 20 ? emojis.full1+emojis.empty2+emojis.empty2+emojis.empty2+emojis.empty3 : 
    percentage >= 10 ? emojis.half1+emojis.empty2+emojis.empty2+emojis.empty2+emojis.empty3 : 
    percentage <= 9 ? emojis.empty1+emojis.empty2+emojis.empty2+emojis.empty2+emojis.empty3 : 
    emojis.empty1+emojis.empty2+emojis.empty2+emojis.empty2+emojis.empty3
    return emojiFormat;
  },
  randomTable: function (array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
},
  scanString: function (string,key) {
  string = string.toLowerCase()
  key = key.toLowerCase()
if (string.includes(key)) {
  return true;
}
},
  requireArgs: async function (message,count) {
  var args = message.content.trim().split(/\n| /);
if (!args[count]) {
  let template = await getTemplate(args[0], await getPerms(message.member,0))
  sendChannel(template,message.channel.id,theme)
  return null;
} else {
  return args;
}
},
  getArgs: function (content) {
  var args = content.trim().split(/\n| /);
  return args;
},
  makeButton: makeButton,
  makeRow: makeRow,
  ghostPing: async function(id,ch) {
    let channel = await getChannel(ch)
    
    await channel.send('<@'+id+'>').then(msg => msg.delete())
  }
};
