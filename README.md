# WABotJS

A WhatsApp bot library built on `baileys` and TypeScript, with local cache support, automatic reconnection, and credential storage using SQLite.

## Requirements

- Node.js >= 24
- `npm`, `pnpm`, or `yarn`

> [!IMPORTANT]
> You must have Node.js version v24 or higher; otherwise, you will not be able to use this library. This library requires the native module `node:sqlite` to function.

## Installation

```bash
npm install wabotjs
# or
pnpm install wabotjs
# or
yarn install wabotjs
```

## Basic Usage

You can see a better example in the [Src/index.test.ts](Src/index.test.ts) file.

```ts
import path from 'node:path';
import { Bot } from 'wabotjs';
// Optional
// import qrcode from 'qrcode';

const id = '26x8bmn7';
const datadir = path.join(process.cwd(), 'Data', id);
const bot = new Bot(id, datadir);
bot
  .onError(async (err) => {
    console.log('[Bot error]');
    console.error(err);
  })
  .onQR(async (qr) => {
    console.log('[Bot qr]');
    // console.log(await qrcode.toString(qr,{ type: 'terminal', small: true }));
    console.log(qr);
  })
  .onOTP(async (code) => {
    console.log('[Bot otp]');
    console.log(code);
  })
  .onOpen(async (user) => {
    console.log('[Bot open]');
    console.dir(user);
  })
  .onClose(async (err) => {
    console.log('[Bot close]');
    console.error(err);
  })
  .onMessage(async (message) => {
    console.log('[Bot message]');
    console.dir(message, { depth: null });
  })
  .onCommand(async (message, prefix, name, args) => {
    if (name === 'ping') {
      await message.reply({ text: 'Pong!' });
    }
  });
// To log in using a QR code, call the .login() function without parameters.
await bot.login();
// To log in using an 8-digit pairing code, call .login() passing a phone number as parameter.
// await bot.login('+5959xxxxxxxx');
```

## Architecture

It's advisable to take a look at the internal code to better understand how it works.

```text
Src/
├── Cache/
│    ├── index.ts
│    ├── JID.ts
│    └── Message.ts
├── Utils/
│    ├── asserts.ts
│    ├── converters.ts
│    ├── generics.ts
│    ├── index.ts
│    ├── LRUCache.ts
│    ├── SQLiteCache.ts
│    └── TTLCache.ts
├── Auth.ts
├── Bot.ts
├── index.test.ts
├── Message.ts
└── Socket.ts
```

> [!CAUTION]
> DISCLAIMER
>
> This software is provided "as is" without warranty of any kind. WABotJS is an independent tool and holds no affiliation with WhatsApp. Meta Platforms, Inc. reserves the right to ban accounts utilizing unauthorized third-party clients. The creator [jzszdznzzl](https://github.com/jzszdznzzl) shall not be held liable for any account restrictions, bans, or repercussions stemming from the use of this library. Use at your own risk.

## License

[MIT License](LICENSE)
