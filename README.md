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
import { Auth, Bot, Events, toError, ErrorCode, BotError } from '@jzszdznzzl/wabotjs';

const id = '26x8bmn7';
const auth = new Auth(join(process.cwd(), 'session'));
const bot = new Bot(id, auth);
const owners = new Set<string>();

bot
  .on(Events.ERROR, (err) => {
    if (err instanceof BotError) {
      console.warn(`[${err.code}] ${err.message}`);
    } else {
      console.warn('An error occurred:');
      console.error(err);
    }
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
    // Quick access to sender JID as a plain string
    console.log('Sender JID:', msg.senderJid);
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
          await res.reactConfirm(); // React with ✅
        }
        return;
      }

      if (name === 'echo') {
        await msg.reply({ text: args.join(' ') || 'Hello, World!' });
      }

      if (name === 'adreply') {
        await msg.adReply(
          { text: 'This is an ad reply!' },
          {
            title: 'My Bot',
            body: 'Check out our website!',
            thumbnailUrl: 'https://example.com/image.jpg',
            sourceUrl: 'https://example.com',
            showAdAttribution: true,
            banner: true, // Automatically sets mediaType to 1 and renderLargerThumbnail to true
          },
        );
      }

      if (name === 'sendimg') {
        const buffer = Buffer.from('image data');
        await bot.sendImage(msg.chat.jid, buffer, 'Caption here');
      }

      if (name === 'profile') {
        const url = await bot.getProfilePicture(msg.senderJid);
        console.log('Profile pic:', url);
      }

      if (name === 'forward') {
        const groupJid = '120363045666@g.us';
        await msg.forward(groupJid);
      }
    } catch (e) {
      console.error(toError(e));
    }
  });

await bot.login();
```

## Message Class

The `Message` class provides the following properties and methods:

### Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `id` | `string` | The ID of the message |
| `chat` | `Chat` | The chat the message belongs to |
| `sender?` | `Sender` | The sender information |
| `senderJid` | `string` | The sender JID as a plain string for quick comparisons |
| `text?` | `string` | The text content |
| `type?` | `keyof IMessage` | The message type |
| `mentions` | `User[]` | Mentioned users |
| `quoted?` | `Message` | The quoted message |
| `timestamp` | `Long` | UNIX timestamp |
| `hash?` | `Uint8Array` | Message hash |
| `key?` | `Uint8Array` | Message key |
| `mimetype?` | `string` | MIME type |
| `path?` | `string` | File path |
| `size?` | `Long` | File size in bytes |
| `url?` | `string` | Media URL |

### Methods

| Method | Description |
| ------ | ----------- |
| `reply(content, options?)` | Reply to this message by quoting it |
| `edit(content, options?)` | Edit this message (bot's own messages only) |
| `react(emoji)` | React to this message with an emoji |
| `reactConfirm()` | React with a confirmation emoji (✅) |
| `forward(jid)` | Forward this message to another chat |
| `pin(pin?)` | Pin or unpin this message |
| `star(star?)` | Star or unstar this message |
| `read()` | Mark as read |
| `delete()` | Delete for all participants |
| `download()` | Download media as Buffer |
| `toRaw()` | Get the raw WAMessage object |
| `adReply(content, adReply, options?)` | Send with external ad reply |

### External Ad Reply

```ts
await msg.adReply(
  { text: 'Check this out!' },
  {
    title: 'Ad Title',
    body: 'Ad body text',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    sourceUrl: 'https://example.com',
    mediaType: 1, // 1 = image, 2 = video
    renderLargerThumbnail: true,
    showAdAttribution: true,
    banner: true, // Shortcut: auto-sets mediaType=1 and renderLargerThumbnail=true
  },
);
```

## Bot Class

The `Bot` class provides convenience methods and manages the connection.

### Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `auth` | `Auth` | Authentication state manager |
| `me` | `User` | The bot's account |
| `sock` | `Socket` | The baileys socket |
| `prefix` | `string` | Command prefix (default: `/`) |
| `cache` | `object` | Caches for users, groups, messages |

### Send Methods

| Method | Description |
| ------ | ----------- |
| `send(jid, content, options?)` | Send any message content |
| `sendImage(jid, media, caption?, options?)` | Send an image |
| `sendVideo(jid, media, caption?, options?)` | Send a video |
| `sendAudio(jid, media, ptt?, options?)` | Send an audio/voice note |
| `sendDocument(jid, media, mimetype, fileName, options?)` | Send a document |
| `sendSticker(jid, media, options?)` | Send a sticker |
| `sendAdReply(jid, content, adReply, options?)` | Send with external ad reply |

### Utility Methods

| Method | Description |
| ------ | ----------- |
| `getProfilePicture(jid, type?)` | Get profile picture URL (cached) |
| `login(pn?)` | Login via QR or pairing code |
| `logout(err?)` | Logout and drop auth state |
| `close(err?)` | Close connection without dropping auth |
| `setPrefix(prefix)` | Set command prefix |

### Media Types

All send methods accept media as `WAMediaUpload`:
- `Buffer` / `Uint8Array`
- `ReadableStream`
- URL string
- `{ url: string }` object

## Error Handling

Errors are emitted via `Events.ERROR` and wrapped in `BotError` with typed error codes:

```ts
import { Events, BotError, ErrorCode } from '@jzszdznzzl/wabotjs';

bot.on(Events.ERROR, (err) => {
  if (err instanceof BotError) {
    switch (err.code) {
      case ErrorCode.AUTH:
        console.error('Auth state error:', err.message);
        break;
      case ErrorCode.SOCKET:
        console.error('Connection error:', err.message);
        break;
      case ErrorCode.MESSAGE:
        console.error('Message error:', err.message);
        break;
      case ErrorCode.GROUP:
        console.error('Group error:', err.message);
        break;
      default:
        console.error(`[${err.code}]`, err.message);
    }
    // Original error is in err.cause
    if (err.cause) {
      console.error('Caused by:', err.cause);
    }
  } else {
    console.error(err);
  }
});
```

### ErrorCode

| Code | Description |
| ---- | ----------- |
| `UNKNOWN` | An unknown error occurred |
| `SOCKET` | Socket connection failed |
| `AUTH` | Auth state failed to load/save |
| `PAIRING` | Pairing code request failed |
| `QR` | QR code generation failed |
| `MESSAGE` | Message operation failed |
| `GROUP` | Group operation failed |
| `LOGIN` | Login process failed |
| `LOGOUT` | Logout process failed |

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
