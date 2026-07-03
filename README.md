A lightweight WhatsApp bot framework built on [baileys](https://github.com/whiskeysockets/baileys) and TypeScript.

## Requirements

- Node.js `>= 24`
- `npm`, `pnpm`, or `yarn`

## Installation

```bash
npm install @jzszdznzzl/wabotjs -E

# or
pnpm install @jzszdznzzl/wabotjs -E

# or
yarn add @jzszdznzzl/wabotjs
```

## Quick Start

```ts
import { join } from 'node:path';
import { inspect } from 'node:util';
import { toString } from 'qrcode';
import { Auth, Bot, Events, toError } from '@jzszdznzzl/wabotjs';

const id = '26x8bmn7';
const auth = new Auth(join(process.cwd(), 'session'));
const bot = new Bot(id, auth);
const owners = new Set<string>();
bot
  .on(Events.ERROR, (err) => {
    console.warn('An error occurred:');
    console.error(err);
  })
  .on(Events.QR, async (qr) => {
    console.log('Scan this QR code:');
    console.log(await toString(qr, { type: 'terminal', small: true }));
  })
  .on(Events.OTP, (code) => {
    console.log(`Pairing code: ${code}`);
  })
  .on(Events.OPEN, (user) => {
    owners.add(user.lid);
    console.log(`Connection established: @${user.name} (${user.pn})`);
  })
  .on(Events.CLOSE, (out, loggedout) => {
    console.warn(
      `Connection closed with status code ${out.statusCode}, can it be reconnected? ${!loggedout}`,
    );
  })
  .on(Events.MESSAGE, (msg) => {
    console.log(
      `New message received from ${msg.sender?.name} (${msg.sender?.pn}) to ${msg.chat.name} (${msg.chat.jid})`,
    );
  })
  .on(Events.COMMAND, async (msg, name, args) => {
    try {
      if (name === 'ping') {
        const start = Date.now();
        const res = await msg.reply({ text: 'Pong: ..ms' });
        const end = Date.now();
        const ping = Math.max(0, Math.floor(end - start));
        if (res) {
          await res.edit({ text: `Pong: ${ping}ms` });
        }
        return;
      }
      if (name === 'echo') {
        await msg.reply({ text: args.join(' ') || 'Hello, World!' });
      }
    } catch (e) {
      console.error(toError(e));
    }
  });
await bot.login();
```

## Documentation

For a deep dive into the API, available events, and advanced configurations, please check out our detailed documentation:
[Read the Full Documentation](/docs/README.md)

> ## Disclaimer
>
> **This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates.** The official WhatsApp website can be found at [whatsapp.com](https://whatsapp.com). "WhatsApp" as well as related names, marks, emblems, and images are registered trademarks of their respective owners.
>
> **Usage Warning:** WhatsApp strictly prohibits the use of automated bots or unofficial clients on its platform. By using this package, you acknowledge and agree that you do so entirely at your own risk and responsibility.

<div align='center'>

## License

MIT License

</div>
