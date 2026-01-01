const Discord = require('discord.js');
const {Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu} = Discord;
let colors = {
  red: "#ea3737",
  blue: "#1200ff",
  green: "#00c554",
  yellow: "#fff4a1",
  orange: "#ff6300",
  purple: "#b200ff",
  pink: "#ff00d6",
  cyan: "#00feff",
  black: "#000000",
  white: "#ffffff",
  lime: "#7ebb82",
  none: "#2B2D31",
}
let emojis = {
  gude_cheer: '<:gude_cheer:1056588910794387466>',
  gude_smile: '<:gude_smile:1056580031536697424>',
  //
  check: '<a:CHECK:1138778694983356450>',
  x: '<a:Xmark:1138778760628424735>',
  loading: '<a:Loading:1138778730785943614>',
  warning: '<:S_warning:1108743925012902049>',
  online: '<:online_:1004014930959286342>',
  idle: '<:Idle_:1004014897417424938>',
  dnd: '<:dnd_:1004017480613773422>',
  offline: '<:offline_:1004015005282340916>',
  on: '<:on:1107664866484953178>',
  off: '<:off:1107664839372964010>',
  robux: '<:Robux:1174546499087122464>',
  nboost: '<:nitroboost:1138778798792384616>',
  nbasic: '<:nitrobasic:1138778772540235786>',
  nclassic: '<:nitrobasic:1138778772540235786>',
  trash: '🗑️',
  
  empty1: '<:first_empty:997879999174549514>',
  empty2: '<:middle_empty:997879976093294622>',
  empty3: '<:last_empty:997880276363526294> ',
  half1: '<:first_half:997879008517705738>',
  half2: '<:middle_half:997879179603365971>',
  half3: '<:last_half:997879147856662548>',
  full1: '<:first_full:997879046560034906>',
  full2 : '<:middle_full:997879113522090064>',
  full3: '<:last_full:997879088553414736>',
}
let keys = [ 'basic', 'netflix', 'nf', 'spoti', 'nitro', 'nb', 'swc', 'robux', 'pending', 'prem', 'comm', 'noted', 'sb', 'badge', 'db', 'vp', 'valorant', 'canva' ]
module.exports = {
  config: {
    pendingPayments: [],
    backupVouches: [
      {
        original: '1154845315673886801', //ethan
        backup: 'https://discord.com/api/webhooks/1212761577283911721/zBoUMoaCNOu_-tY4Ef6RuneJq_kc7OqfCcnAQ7-rQuE2r2153CCqDz4K0GpDqtfkr3tn',
      }
    ],
    AI: {
      maxTokens: 4000,//,
      maintenance: {
        enabled: false,
        day: 'Thursday',
        until: 12,
        state: 'AM',
        desc: 'aaaaa',
      },
      modelCount: 0,
      users: [],
      filter: function(string,acc) {
        string = string.replace(/As an AI language model, /g,'')
          .replace(/ As an AI language model, /g,'')
          .replace(/As the language model AI, /g,'')
          .replace(/an AI language model/g,acc.name)
          .replace('/laguna/campus-life/','/nu-laguna/')
          .replace('/laguna/','/nu-laguna/')
        
        string = string.replace(/ChatGPT/g,acc.name)
        return string;
      },
    chatAPI: 'https://api.openai.com/v1/chat/completions',
    imageAPI: 'https://api.openai.com/v1/images/generations',
    models: [
      'gpt-4o-2024-08-06',
      //'gpt-3.5-turbo',
    ]//  
  },
  },
  shop: {
    bot: {
      status: [
        {
          status: "idle", //online, idle, dnd
          activities: [
            { name: ".gg/sloopies", type: "Watching".toUpperCase(), //playing, watching, listening only
            }, ], 
        },
        {
          status: "idle", //online, idle, dnd
          activities: [
            { name: "#tickets to order", type: "Watching".toUpperCase(), //playing, watching, listening only
            }, ], 
        },
        {
          status: "idle", //online, idle, dnd
          activities: [
            { name: "ping @slurpies for inqueries", type: "Watching".toUpperCase(), //playing, watching, listening only
            }, ], 
        },
      ]
    },
    scannerWhitelist: [
      "1382681311080087572",
      "1139165021398642788", //baratie
      "1154694567166222336", //ethan shop
      "1109020434449575936", //sloopies
      "1125106413681787050", //unika
      "1132616889047187467", //xoxos4e
      "1101335700655321100",
      "1211259967009718302",
      "1138851239833108714", //misha
      "1233474066950656123", //saeko
      "1080873188512239737", //kaorei
      "1139154917446136000", //yumi alt
      "1057338848247554111", //krstnmrll
      "1138805895527149641", //angieie
      "1172102666239885372", //xx
      "972866920560865371", //https.saki
      "1126710270123847720", //nini
      "1231185865217278112", //
      "995937596163248169", //
      "1136827388458713139", //
      "1117225138656641024",
      "1227954892430114877",
      "1250782779646410854",
      "1253669931174854676",
      "1260876404090736701",
      "1253353418333093909",
      "978345853242716170",
      "1254794686388895774",
      "1255501665721782272",
      "1073482413382041702",
      "1002174941657055273",
      "1220672123576520785",
      "1231592610720907346",
      "1138120293525770300",
      "1257629529577492520",
      "1089224280736284812",
      "1229623937994854481",
      "1194318197629923439",
      "1247454156810358817",
      "1223217410044203118",
      "1061855302703656990",
      "1276787151710847007",
      "1220315048359104572",
      "1272106992793817139",
      "1280754891425447946",
      "1219294406092390551",
      "1277334380255121500",
      "1226818674636230657",
      "1105865979642269817",
      "1268827107136372838",
      "950252521375551538",
      "916601738499342346",
      "1275168461966020638",
      "1293475852859871275",
      "1152219189948465275",
      "1316752451566702635",
      "1251438312309133354",
      "1145984775664967680",
      "1021072905259450479",
      "810198597080973332",
      "1249151971768930304",
      
    ],
    checkerWhitelist: [
      "1316608765319053363",
      "1297135823770091560", 
      "1250648354011217923", //April 29, 2025
      "1226767373717995561", //May 2, 2025
    ],
    scanner: [],
    expected: [],
    refIds: [],
    apiCheckers: [],
    orderForm: [],
    
    //TICKET SYSTEM
    tixSettings: {
      support: '1109020434554433548',
      transcripts: '1109020437096181832',
      closed: '1109020437524008981',
      processing: '1256238648484167700',
      completed: '1256230400938999808'
    },
    
    gcashStatus: null,
    breakChecker: false,
    orderStatus: new MessageActionRow().addComponents(
          new MessageSelectMenu().setCustomId('orderStatus').setPlaceholder('Update Order Status').addOptions([
            {label: 'Noted',description: 'Change Order Status',value: 'noted', emoji: '<:S_yellowheart:1141708792141189200>'},
            {label: 'Processing',description: 'Change Order Status',value: 'processing', emoji: '<a:yt_chickclap:1138707159287345263>'},
            {label: 'Delayed',description: 'Change Order Status',value: 'delayed',emoji:'<a:warningping:1320359447134212147>'},
            {label: 'Almost there',description: 'Change Order Status',value: 'almost',emoji: '<a:y_starroll:1138704563529076786>'},
            {label: 'Completed',description: 'Change Order Status',value: 'completed', emoji: '<a:checkmark_yellow:1151123927691694110>'},
            {label: 'Cancelled',description: 'Change Order Status',value: 'cancelled', emoji: '<:yl_exclamation:1138705048562581575>'},
          ]),
        ),
    channels: {
      smsReader: '1138638222902165565',
      checker: '1138638208633159773',
      announcements: '1278165540841459713',
      status: '1109020434810294345', //vc
      reportsVc: '1109020434810294346', //vc
      vouch: '1109020436026634260',
      boostStocks: '1138638092580962465',
      basicStocks: '1181886826022187068',
      itemStocks: '1181888499532713994',
      otherStocks: '1138638111585357976',
      orders: '1109020436026634261',
      templates: '1109020434810294344',
      shopStatus: '1109020434978054231',
      vouchers: '1109020434810294343',
      logs: '1109020437096181831',
      dmTemplate: '1138638121576177714',
      alerts: '1109020437096181830',
      drops: '1138638129054633984',
    },
    pricelists: [
      {
        //Category
        name: 'Developer Badge',
        keywords: ['dev','badge','db'],
        channel: '1109020436764827698',
        rs: '1258243493973856326',
        status: 1,
        id: '1109020436764827698',
        image: 'https://media.discordapp.net/attachments/1093391705753002064/1094077237004865556/Logopit_1680918616490.png?width=1440&height=360',
        types: [
          //Types
          {
            parent: 'Permanent',
            children: [
              //
              { name: 'Permanent', price: 50, rs: 40 },
              { name: 'Lifetime warranty until patched', price: 0 },
              { name: 'Required 2FA', price: 0 },
              //
            ],
          },
          //
        ],
      },
      {
        //Category
        name: 'Nitro Links Checker',
        keywords: ['nitro checker','checker'],
        channel: '1392107651495628810',
        status: 2,
        id: '1096319574284193842',
        rs: '1258243478744334469',
        image: 'https://media.discordapp.net/attachments/1093391705753002064/1094077237592076389/Logopit_1680918672598.png?width=1440&height=360',
        types: [
          //Types
          {
            parent: '1m nitro checker',
            children: [
              //
              { name: 'monthly (bot dms)', price: 30, rs: 25 },
              { name: 'Features:\n+ Provided Bot (assistant)\n+ Can scan 50 links per second\n+ Shows difference between valid, calimed and invalid links\n+ Shows accurate expiration (date & time) of links\n+ Foolproof (avoids scanning duplicated links)\n\u200b'}
              //
            ],
          },
        ],
      },
      {
        //Category
        name: 'Gamepass Scanner',
        keywords: ['scanner','gp scanner'],
        channel: '1392107651495628810',
        status: 2,
        id: '1096319574284193842',
        rs: '1258243478744334469',
        image: 'https://media.discordapp.net/attachments/1093391705753002064/1094077237592076389/Logopit_1680918672598.png?width=1440&height=360',
        types: [
          //Types
          {
            parent: 'gamepass links scanner',
            children: [
              //
              { name: 'monthly', price: 30, rs: 0 },
              { name: 'Features:\n+ Provided Bot (assistant)\n+ ` /getlink ` command\n+ ` scan, nct, ct, max: ` commands\n\u200b'}
              //
            ],
          },
        ],
      },
      {
        //Category
        name: 'Server Backup Bot',
        keywords: ['backup','server backup'],
        channel: '1392107651495628810',
        status: 2,
        rs: '1258243478744334469',
        id: '1096319574284193842',
        image: 'https://media.discordapp.net/attachments/1093391705753002064/1094077237592076389/Logopit_1680918672598.png?width=1440&height=360',
        types: [
          //Types
          {
            parent: 'Server Backup Bot',
            children: [
              //
              { name: 'Slot', price: 150, rs: 140 },
              { name: 'Features:\n+ Provided Bot\n+ Via Discord OAuth2\n+ Can join all verified users in other serverss\n\u200b'}
              //
            ],
          },
        ],
      },
      {
        //Category
        name: 'Server Boosting',
        keywords: ['sb','boosting','boost'],
        channel: '1298219151701315614',
        rs: '1298219265484128307',
        status: 2,
        id: '1096319576331014155',
        image: 'https://media.discordapp.net/attachments/1093391705753002064/1094077185905676309/Logopit_1680918458337.png?width=1440&height=360',
        types: [
          //Types
          {
            parent: '3 months',
            children: [
              //
              { name: '2x server boosts', price: 90, rs: 80 },
              { name: '4x server boosts', price: 145, rs: 135 },
              { name: '6x server boosts', price: 195, rs: 195 },
              { name: '8x server boosts', price: 255, rs: 245 },
              { name: '14x server boosts', price: 420, rs: 410 },
              { name: 'mins-hours process', price: 0, rs: 0 },
              //
            ],
          },
          
          //
        ],
      },
      /*{
        //Category
        name: 'Discord Nitro',
        lowest: 100,
        keywords: ['nitro','nitor','nb','basic','classic'],
        channel: '1298219151701315614',
        rs: '1298219265484128307',
        status: 2,
        id: '1096319579787116544',
        image: 'https://media.discordapp.net/attachments/1093391705753002064/1094077186127970414/Logopit_1680918484757.png?width=1440&height=360',
        types: [
          //Types
          {
            parent: 'Monthly Subscription',
            children: [
              //
              { name: 'Nitro Basic (Not avail)', price: 0, rs: 0 },
              { name: 'Nitro Boost (No warr)', price: 200, rs: 195 },
              //
            ],
          },
          {
            parent: 'Yearly Subscription',
            children: [
              //
              { name: 'Nitro Basic (Not avail)', price: 0 },
              { name: 'Nitro Boost (Not avail)', price: 0, rs: 0},
              //
            ],
          },
          //
        ],
      },*/
      {
        //Category
        name: 'Robux',
        keywords: ['roblox','robux','rbx','bobux'],
        channel: '1109020436764827700',
        rs: '1258243460209578096',
        status: 2,
        id: '1096319583121584208',
        image: "https://media.discordapp.net/attachments/1093391705753002064/1094077237839532123/Logopit_1680918693719.png?width=1440&height=360",
        types: [
          {
            parent: 'Via Payout',
            children: [
              //
              { name: '100 robux (payout)', price: 35, rs: 30 },
              { name: '200 robux (payout)', price: 75, rs: 70 },
              { name: '300 robux (payout)', price: 110, rs: 100 },
              { name: '400 robux (payout)', price: 145, rs: 140 },
              { name: '500 robux (payout)', price: 175, rs: 170 },
              { name: '600 robux (payout)', price: 210, rs: 195 },
              { name: '700 robux (payout)', price: 245, rs: 235 },
              { name: '800 robux (payout)', price: 275, rs: 270 },
              { name: '900 robux (payout)', price: 290, rs: 285 },
              { name: '1000 robux (payout)', price: 310, rs: 295 },
              { name: '*covered tax*', price: 0, rs: 0 },
              //
            ],
          },
          //Types
          /*{
            parent: 'Via Gamepass',
            children: [
              //
              { name: '100 robux', price: 48, rs: 45 },
              { name: '200 robux', price: 85, rs: 75 },
              { name: '300 robux', price: 120, rs: 115 },
              { name: '400 robux', price: 160, rs: 155 },
              { name: '500 robux', price: 183, rs: 177 },
              { name: '600 robux', price: 222, rs: 219 },
              { name: '700 robux', price: 260, rs: 255 },
              { name: '800 robux', price: 286, rs: 270 },
              { name: '900 robux', price: 320, rs: 312 },
              { name: '1000 robux', price: 345, rs: 340 },
              { name: '*covered tax (days process)*', price: 0, rs: 0 },
              //
            ],
          },*/
          {
            parent: 'Via Gamepass',
            children: [
              //
              { name: '100 robux (fast process)', price: 48, rs: 45 },
              { name: '200 robux (fast process)', price: 85, rs: 85 },
              { name: '300 robux (fast process)', price: 120, rs: 120 },
              { name: '400 robux (fast process)', price: 160, rs: 160 },
              { name: '500 robux (fast process)', price: 183, rs: 183 },
              { name: '600 robux (fast process)', price: 222, rs: 222 },
              { name: '700 robux (fast process)', price: 260, rs: 255 },
              { name: '800 robux (fast process)', price: 298, rs: 292 },
              { name: '900 robux (fast process)', price: 334, rs: 328 },
              { name: '1000 robux (fast process)', price: 360, rs: 355 },
              { name: '*covered tax (fast process)*', price: 0, rs: 0 },
              //
            ],
          },
        ],
      },
    ],
    ar: {
      prefix: '.',
      responders: [
        {
          command: 'form',
          response: null,
          components: new MessageActionRow().addComponents(
            new MessageButton().setCustomId('orderFormat').setStyle('SECONDARY').setLabel('order form').setEmoji('<:S_letter:1138714993425125556>'),//.setEmoji('<a:S_arrowright:1095503803761033276>'),
          ),
          autoDelete: true,
        },
        {
          command: 'restrict',
          response: "Click the button below to request for removal of your @restricted role.\n-# Make sure to remove any advertisement statuses on your profile.",
          components: new MessageActionRow().addComponents(
            new MessageButton().setCustomId('restrictRemoval').setStyle('SECONDARY').setLabel('request removal').setEmoji('<a:yl_exclamationan:1138705076395978802>'),//.setEmoji('<a:S_arrowright:1095503803761033276>'),
          ),
          autoDelete: true,
        },
        {
          command: 'rpremium',
          response: '• premium purchased:\n• subscription:\n• original email:\n• replacement email:\n• working pass:\n• shared/solo/fh:\n• date availed :\n• date reported:\n• days used:\n• remaining days:\n• price paid:\n• issue & screenshot of issue:\n• screenshot of vouch with proof of login:',
          autoDelete: false,
        },
        {
          command: 'rboost',
          response: '• Permanent invite link (The one you sent in your order):\n• How many boosts:\n• Date bought:\n• Days used:\n• Vouch link/screenshot:\n• Issue & proof of issue:',
          autoDelete: false,
        },
        {
          command: 'rbadge',
          response: '• User who claimed the badge:\n• Duration:\n• Vouch link/screenshot;',
          autoDelete: false,
        },
        {
          command: 'rnitro',
          response: '• nitro link:\n• user who claimed the nitro:\n• revoked email from discord (click "to me" in the email to confirm that the email is connected with your acc):\n• screenshot of the email connected to your discord account:\n• date availed:\n• remaining days:\n• screenshot/link of vouch:\n• Ref code:\n\nMake sure that the screenshot you send is exactly similar (not cropped) to the example below:',
          files: [{attachment: 'https://media.discordapp.net/attachments/1093391705753002064/1096677816168353962/Untitled_design_8.png?width=662&height=662',name: 'file.png'}],
          autoDelete: false,
        },
        {
          command: 'rate',
          response: '**Paypal Rate** <:07:1069200743959109712>\n\n₱499 below = 10%\n₱500 above = 7%\n₱1,000 above = 3%',
          autoDelete: true,
        },
        {
          command: 'boost',
          response: emojis.nboost+' **Server Boosting**\n— Send **permanent** invite link of the server (not vanity).\n— The server must have a boost announcement channel (see attachments below)\n— This will be required once you vouch and report.\n—Do not forget your invite link.\n\n**Void warranty if:**\n— Invite link is not permanent or was removed.\n— Did not have a **system messages channel** for boosters.\n— The channel **is not** PUBLICLY visible.',
          files: [{attachment: 'https://media.discordapp.net/attachments/1093391705753002064/1093391789223850044/image.png?width=1135&height=527',name: 'file.png'},{attachment: 'https://media.discordapp.net/attachments/1093391705753002064/1093391724249878560/image.png?width=791&height=117',name: 'file.png'}],
          autoDelete: true,
        },
        {
          command: 'valorant',
          response: '<:mark:1056579773989650543>Riot ID:',
          autoDelete: true,
        },
        {
          command: 'gcashhold',
          response: '<a:yl_exclamationan:1138705076395978802> **gcash**\n<:indent:1174738613330788512> 0994 064 5043 [ **I. P. I.** ]\n\n<a:S_whiteheart02:1138715896077090856>  send a screenshot of your receipt *!*',
          components: new MessageActionRow().addComponents(new MessageButton().setCustomId('reply-09940645043').setStyle('SECONDARY').setEmoji('<:bullet:1138710447835578388>').setLabel("copy number")),
          autoDelete: true,
        },
        {
          command: 'gcash',
          response: '<a:yl_exclamationan:1138705076395978802> **gcash**\n<:indent:1174738613330788512> 0952 441 4983 [ **I. P. I.** ]\n\n<a:S_whiteheart02:1138715896077090856>  send a screenshot of your receipt *!*',
          components: new MessageActionRow().addComponents(new MessageButton().setCustomId('reply-09524414983').setStyle('SECONDARY').setEmoji('<:bullet:1138710447835578388>').setLabel("copy number")),
          autoDelete: true,
        },
        {
          command: 'paypal',
          response: '<a:yl_flowerspin:1138705226082304020> Paypal (w/ fee)\n— Link: https://paypal.me/marcoplaton\n— Email: narcshin3@gmail.com\n— Please make sure to set the payment type to **friends and family**!\n\n— Send screenshot of receipt here',
          autoDelete: true,
        },
        {
          command: '1s213213123',
          response: '',
          autoDelete: true,
        },
        {
          command: 'robux',
          response: '**robux report form**\n- gamepass link:\n- vouch link:\n- price paid:\n- date availed:\n\n<:S_letter:1138714993425125556> Ensure that no rules were violated, in accordance with the terms and conditions accepted during the ordering process.',
          autoDelete: true,
        },
      ]
    },
    customRoles: [
      {
        user: '482603796371865603', //mimi
        role: '1109020434554433549',
      },
    ],
    randomVouchers: {
      amount: [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,6,7,8,9,10],
      type: [
        "dev badge",
        "game creds",
        "premium",
        "global",
        "nitro",
      ]
    },
    stickyChannels: [
      {
        id: '1169573502022602752',
        message: 'Type </search:1169591423566368840> to determine whether or not a user has a history of blacklist!',
      },
      {
        id: '1094975726127685726',
        message: "<a:S_bearheart:1094190497179910225> Type `;feedback` on <@1057167023492300881>'s DMs to submit a feedback."
      },
      {
        id: '1109020436026634265',
        message: '<a:yl_exclamationan:1138705076395978802>Read <#1109020434978054229> for important notices *!*\n<:S_dot:1138714811908235444>Read <#1278165540841459713> for stock updates *!*',
      },
      {
        id: '1168377722712621108',
        message: '<a:yl_exclamationan:1138705076395978802>Read <#1109020434978054229> for important notices *!*\n<:S_dot:1138714811908235444>Read <#1278165540841459713> for stock updates *!*',
      },
      {
        id: '0',
        message: '<:S_letter:1092606891240198154> **Stocks dropper showcase** (outdated showcase)',
        files: ['https://cdn.discordapp.com/attachments/1101501538293252136/1102772107424833536/2023-05-02_09-39-15.mp4']
      },
      {
        id: '1109020434978054233', //1109020434978054233
        message: emojis.nboost+' **Server Booster Perks**\n- ₱5 discount on certain products\n- **Sloopier** role\n- **Sloopiest** role (2x boost)\n- 2x giveaway entries',
      },
      {
        id: '1109020436026634260', //1109020436026634260
        message: '__**Vouch here!**__\n\n• Send any message of acknowledgement\n• Send screenshot of your purchase\n\n**Void warranty if:**\n• no vouch/improper vouch\n• no screenshot/proof of login\n• did not vouch within 12 hours\n• reference code is not visible',
      },
      {
        id: '1109020436278300810',
        message: 'Click the button below to access our pricelists.',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('Access').setCustomId('prVerify').setStyle('SECONDARY').setEmoji('<a:yl_exclamationan:1138705076395978802>')
        ),
      },
      {
        id: '1109020435754000423',
        message: 'Click the button below to create a ticket!\n\n<:y_seperator:1138707390657740870> Order — Availing products\n<:y_seperator:1138707390657740870> Support — General concerns and inquiries\n<:y_seperator:1138707390657740870> Report — Reporting revoked products',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('Create Order').setCustomId('createTicket-order').setStyle('SECONDARY').setEmoji('🌄'),
          new MessageButton().setLabel('Support Ticket').setCustomId('createTicket-support').setStyle('SECONDARY').setEmoji('🌅'),
          new MessageButton().setLabel('Submit Report').setCustomId('createTicket-report').setStyle('SECONDARY').setEmoji('☀️')
        ),
      },
      {
        id: '0',
        message: "You will no longer need to accept the consent form in your ticket once you click this button.",
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('New TOS').setCustomId('terms101').setStyle('SECONDARY').setEmoji('<:S_exclamation:1093734009005158450>')
        ),
      },
      {
        id: '1278165540841459713',
        message: '** **\nBoost the server to get the Sloopier role *!*',
        order: true,
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('order here').setURL('https://discord.com/channels/1109020434449575936/1109020435754000423').setStyle('LINK').setEmoji('<a:y_catheart:1138704838360830044>')
        )
      },
      {
        id: '0',
        message: '**Notification Roles** <:07:1069200743959109712>',
        roles: true,
        comp: null,
      },
      {
        id: '0',
        message: '**Notification Roles** <:07:1069200743959109712>',
        roles: true,
        comp: null,
      },
      {
        id: '', //1109020435523326025
        message: '',
        condition: message => message.channel.name.includes('。') && !message.channel.name.includes('done'),//keys.find(k => message.channel.name.includes(k) && !message.channel.name.includes('done')),
        comp: new MessageActionRow()
        .addComponents(
          //new MessageButton().setLabel('Follow Up').setStyle('SECONDARY').setEmoji('<a:S_arrowright:1095503803761033276>').setCustomId('followup'),
          new MessageButton().setLabel('Mark as Done').setStyle('SECONDARY').setCustomId('done')//.setEmoji('<a:S_lapot:1088655136785711184>'),
        ),
      },
      {
        id: '1109020434978054226',
        message: '*Pick your age*',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('13-15').setStyle('DANGER').setEmoji('🐣').setCustomId('roles-13-15'),
          new MessageButton().setLabel('16-18').setStyle('DANGER').setEmoji('🐥').setCustomId('roles-16-18'),
          new MessageButton().setLabel('19-21').setStyle('DANGER').setEmoji('🐔').setCustomId('roles-19-21'),
          new MessageButton().setLabel('22+').setStyle('DANGER').setEmoji('🍗').setCustomId('roles-22+')
        ),
      },
      {
        id: '1109020434978054226',
        message: '*Pick which games you play*',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('Minecraft').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-Minecraft'),
          new MessageButton().setLabel('Valorant').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-Valorant'),
          new MessageButton().setLabel('Roblox').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-Roblox'),
          new MessageButton().setLabel('Genshin').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-Genshin'),
          new MessageButton().setLabel('COD').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-COD')
        ),
      },
      {
        id: '1109020434978054226',
        message: '*Pick which games you play (2)*',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('CSGO').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-CSGO'),
          new MessageButton().setLabel('DOTA').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-DOTA'),
          new MessageButton().setLabel('Overwatch').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-Overwatch'),
          new MessageButton().setLabel('LOL').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-LOL'),
          new MessageButton().setLabel('Mobile Legends').setStyle('SECONDARY').setEmoji('🎮').setCustomId('roles-Mobile_Legends')
        ),
      },
      {
        id: '1109020434978054226',
        message: '*Pick your pronouns*',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('He/Him').setStyle('SECONDARY').setEmoji('♂️').setCustomId('roles-He/Him'),
          new MessageButton().setLabel('She/Her').setStyle('SECONDARY').setEmoji('♀️').setCustomId('roles-She/Her'),
          new MessageButton().setLabel('They/Them').setStyle('SECONDARY').setEmoji('👥').setCustomId('roles-They/Them'),
        ),
      },
      {
        id: '1109020434978054226',
        message: '*Pick which notifications you want to get*',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('Announcements').setStyle('SECONDARY').setEmoji('🔔').setCustomId('roles-Announcement'),
          new MessageButton().setLabel('Stocks').setStyle('SECONDARY').setEmoji('🔔').setCustomId('roles-Stocks'),
          new MessageButton().setLabel('Shop Status').setStyle('SECONDARY').setEmoji('🔔').setCustomId('roles-Shop_Status')
        ),
      },
      {
        id: '1109020434978054231',
        message: 'Click the button to gain the **Shop Status** role and get notified when the shop opens or closes!',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('Shop Status').setStyle('SECONDARY').setEmoji('🔔').setCustomId('roles-Shop_Status')
        ),
      },
      {
        id: '1109020434978054226',
        message: '*Pick your language*',
        comp: new MessageActionRow()
        .addComponents(
          new MessageButton().setLabel('Filipino').setStyle('SECONDARY').setEmoji('🇵🇭').setCustomId('roles-Pipino'),
          new MessageButton().setLabel('English').setStyle('SECONDARY').setEmoji('🌐').setCustomId('roles-English'),
        ),
      },
    ],
    deleteChannels: [],
    checkers: [],
    vouchers: [],
    followUps: [],
  },
  interExpire: 300000,
  auth: {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer '+process.env.COC,
      'Content-Type': 'application/json'
    }
  },
  commands: [
    {
      Command: "stocks",
      Template: "",
      Alias: ['stock','stoc','sto'],
      Category: "Misc",
      Desc: 'Shows the list of available stocks',
      ex: [''],
      level: 0,
    },
    {
      Command: "nitro",
      Template: "<user> <amount> [payment] [item]",
      Alias: [],
      Category: "Handler",
      Desc: 'Drops nitro boost to a user',
      ex: ['nitro @user 10','nitro @user 10 paypal','nitro @user 10 gcash 1yr nitro boost'],
      level: 4,
    },
    {
      Command: "drop",
      Template: "<channel> <voucher>",
      Alias: [],
      Category: "Handler",
      Desc: 'Drops a voucher in a specific channel',
      ex: ['nitro @channel ₱5 voucher','nitro @channel ₱10 premium voucher'],
      level: 4,
    },
    {
      Command: "rate",
      Template: "<amount>",
      Alias: [],
      Category: "Handler",
      Desc: 'Calculates the fee for paypal buyers',
      ex: ['rate 509','rate 69.23'],
      level: 4,
    },
    {
      Command: "exchange",
      Template: "<amount>",
      Alias: ['ex'],
      Category: "Handler",
      Desc: 'Calculates the amount to receive in e-wallet exchange',
      ex: ['ex 509','exchange 69.23'],
      level: 4,
    },
    {
      Command: "use",
      Template: "<voucher>",
      Alias: [],
      Category: "Misc",
      Desc: 'Use a voucher',
      ex: ['use KJnHhJb'],
      level: 0,
    },
    {
      Command: "cmds",
      Template: "[command]",
      Alias: ['cmd','help'],
      Category: "Misc",
      Desc: 'Shows the list of available commands',
      ex: ['cmds stocks','cmds use'],
      level: 0,
    },
    {
      Command: "stat",
      Template: "<category> <stat>",
      Alias: [],
      Category: "Misc",
      Desc: 'Changes the product status',
      ex: ['stat nitro 1','stat spotify 2'],
      level: 0,
    },
    {
      Command: "setpr",
      Template: "<type>",
      Alias: [],
      Category: "Misc",
      Desc: 'Updates the pricelist',
      ex: ['setpr rs','setpr all'],
      level: 0,
    },
  ],
  permissions: [
    {
      id: "497918770187075595", //my user
      level: 5,
    },
    {
      id: "1109020434554433548", //collateral
      level: 4,
    },
    {
      id: "1109020434554433552", //owner role
      level: 5,
    },
    {
      id: '1109338607170367548', //backup server admin
      level: 5,
    }
  ],
  botlog: '901759430457167872',
  prefix: '.',
  filteredWords: [],
  colors: colors,
  theme: colors.yellow,
  emojis: emojis,
};
