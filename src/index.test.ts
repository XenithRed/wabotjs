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
    console.log('[Bot error]');
    console.error(err);
  })
  .on(Events.QR, async (qr) => {
    console.log('[Bot qr]');
    console.log(await toString(qr, { type: 'terminal', small: true }));
  })
  .on(Events.OTP, (code) => {
    console.log('[Bot otp]');
    console.log(code);
  })
  .on(Events.OPEN, (user) => {
    owners.add(user.lid);
    console.log('[Bot open]');
    console.dir(user);
  })
  .on(Events.CLOSE, (err) => {
    console.log('[Bot close]');
    console.error(err);
  })
  .on(Events.MESSAGE, async (message) => {
    console.log('[Bot message]');
    console.dir(message, { depth: null });
  })
  .on(Events.COMMAND, async (m, name, args) => {
    try {
      if (name === 'ping') {
        const start = Date.now();
        const res = await m.reply({ text: 'Pong: ..ms' });
        const end = Date.now();
        const ping = Math.max(0, Math.floor(end - start));
        if (res) {
          await res.edit({ text: `Pong: ${ping}ms` });
        }
        return;
      }
      // this command is extremely dangerous; make sure only authorized people can execute it.
      if (name === 'eval') {
        if (!m.sender || !owners.has(m.sender.lid)) {
          await m.reply({ text: 'Permission denied!' });
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
          await m.reply({ text: result });
        } catch (e) {
          const err = toError(e);
          await m.reply({ text: err.toString() });
        }
        return;
      }
      await m.reply({ text: `The *${bot.prefix + name}* command does not exist` });
    } catch (e) {
      console.error(toError(e));
    }
  });
// log in with OTP code
await bot.login('595983799436');
