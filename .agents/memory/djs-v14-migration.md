---
name: discord.js v14 migration
description: Records the completed v13→v14 upgrade and the key API changes applied across the codebase.
---

## Rule
This project runs discord.js **v14.26.4** on **Node.js 20**. Do NOT use any v13 APIs.

**Why:** User requested upgrade from v13.16.0 to v14.26.4. Node.js 16 was also upgraded to 20 because discord.js v14 depends on undici which requires the global `ReadableStream` (Node 18+).

## How to apply
When adding new Discord features, always use v14 class names and enums:

| v13 | v14 |
|-----|-----|
| `MessageEmbed` | `EmbedBuilder` |
| `MessageActionRow` | `ActionRowBuilder` |
| `MessageButton` | `ButtonBuilder` |
| `MessageSelectMenu` | `StringSelectMenuBuilder` |
| `MessageAttachment` | `AttachmentBuilder` |
| `Intents.FLAGS.X` | `GatewayIntentBits.X` |
| `Partials` array of strings | `[Partials.Channel]` enum |
| `'PRIMARY'` style string | `ButtonStyle.Primary` enum |
| `embed.fields` | `embed.data.fields` |
| `embed.title` (read) | `embed.data.title` |
| `inter.isCommand()` | `inter.isChatInputCommand()` |
| `inter.isSelectMenu()` | `inter.isStringSelectMenu()` |
| `user.tag` | `user.username` |
| `channel.isText()` | `channel.isTextBased()` |
| `guild.channels.create(name, opts)` | `guild.channels.create({ name, type: ChannelType.X, ...opts })` |
| Permission strings like `'VIEW_CHANNEL'` | `PermissionFlagsBits.ViewChannel` |
| `client.on('ready', ...)` | `client.on('clientReady', ...)` |
| `ButtonBuilder.customId` (reading) | `button.data.custom_id` |
| `new MessageEmbed(embed)` copy | `EmbedBuilder.from(embed)` |
| `row.components = array` | `row.setComponents(array)` |
| `embed.addField(n, v)` | `embed.addFields({ name: n, value: v })` |

## Files updated
- `server.js` (main — 3725 lines)
- `functions/others.js`
- `functions/tickets.js`
- `storage/settings_.js`
