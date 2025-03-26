const fetch = require('node-fetch');
//Functions
const get = require('../functions/get.js')
const {getTime, chatAI2, getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor} = get

const Discord = require('discord.js');
const {MessageAttachment, ActivityType, WebhookClient, Permissions, Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu} = Discord;

function crc16Ccitt(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc;
}
function generateQrCRC(qrData) {
  const idx = qrData.lastIndexOf("6304");
  if (idx === -1) {
    throw new Error("CRC tag '6304' not found in the QR data.");
  }

  const payload = qrData.substring(0, idx + 4);

  const crc = crc16Ccitt(payload);

  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

  return payload + crcHex;
}

module.exports = {
  generateQr: async function(amount) {
    let qrData = "00020101021227830012com.p2pqrpay0111GXCHPHM2XXX02089996440303152170200000006560417DWQM4TK3JDO5YAWDV5204601653036085406"+amount+".005802PH5912I** PA**O I.6011San Antonio610412346304"
    let generatedQr = generateQrCRC(qrData)
    
    let data = {
      method: 'POST',
      body: JSON.stringify({"data":qrData,"config":{"body":"square","eye":"frame3","eyeBall":"ball0","erf1":["fv"],"erf2":["fv","fh"],"erf3":[],"brf1":[],"brf2":[],"brf3":[],"bodyColor":"#FFFFFF","bgColor":"#2A353C","eye1Color":"#FFC800","eye2Color":"#FFC800","eye3Color":"#FFC800","eyeBall1Color":"#FFFFFF","eyeBall2Color":"#FFFFFF","eyeBall3Color":"#FFFFFF","gradientColor1":null,"gradientColor2":null,"gradientType":"linear","gradientOnEyes":false,"logo":"172a893222def080bd5235c0e5029f1433a5269b.png","logoMode":"default"},"size":800,"download":"imageUrl","file":"png"}),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    let qrCode = await fetch("https://api.qrcode-monkey.com//qr/custom", data);
    qrCode = await qrCode.json();
    let imageUrl = "https:" + qrCode.imageUrl;
    
    return imageUrl;
  }
};