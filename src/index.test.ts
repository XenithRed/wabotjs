import { join } from 'node:path';
import { inspect } from 'node:util';
import { toString } from 'qrcode';
import { Auth, Bot, Events, toError } from './index.js';

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
  .on(Events.MESSAGE, async (message) => {
    console.log('[Bot message]');
    console.dir(message, { depth: null });
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
      if (name === 'eval') {
        if (!msg.sender || !owners.has(msg.sender.lid)) {
          await msg.reply({ text: 'Permission denied!' });
          return;
        }
        try {
          let out = eval(args.join(' '));
          if (out instanceof Promise) {
            out = await out;
          }
          const result = inspect(out, {
            colors: false,
            depth: null,
          });
          await msg.reply({ text: result });
        } catch (e) {
          const err = toError(e);
          await msg.reply({ text: err.toString() });
        }
        return;
      }
      await msg.reply({ text: `The *${bot.prefix + name}* command does not exist` });
    } catch (e) {
      console.error(toError(e));
    }
  });
await bot.login();
