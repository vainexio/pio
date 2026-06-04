# vainexio-template-1 — Discord Bot Template

A Discord bot template for managing a digital marketplace/shop on Discord. Handles orders for services like Nitro boosts, Robux, and game-related items.

## Tech Stack

- **Runtime:** Node.js 16.x
- **Discord:** discord.js v13
- **Database:** MongoDB (mongoose)
- **Web server:** Express (keep-alive server on port 5000)
- **AI:** OpenAI API
- **Other:** Firebase Admin, Google Cloud Speech/TTS, sharp, tesseract.js

## Project Structure

- `server.js` — Main entry point; Discord client, Express server, event handlers
- `functions/` — Modular feature logic (AI, commands, tickets, roblox, etc.)
- `storage/settings_.js` — Central config: emojis, colors, prices, channel IDs, roles
- `storage/slashCommands.js` — Slash command definitions

## Environment Variables Required

- `SECRET` — Discord bot token
- `MONGOOSE` — MongoDB connection string
- `OPEN_AI` — OpenAI API key

## Running the App

The workflow runs `npm start` which executes `node server.js`. The Express keep-alive server listens on port 5000.

## User Preferences

(None recorded yet)
