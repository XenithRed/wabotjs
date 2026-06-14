import path from 'node:path';
import util from 'node:util';
import qrcode from 'qrcode';
// In production it wouldn't be './index.js' but '@jzszdznzzl/wabotjs'
import { Bot, Utils } from './index.js';

const id = '26x8bmn7'; // A unique identifier for the Bot.
const datadir = path.join(process.cwd(), 'Data', id); // Directory where credentials and JID and Message cache will be stored
const bot = new Bot(id, datadir);
const owners = new Set<string>();
bot
  .onError(async (err) => {
    console.log('[Bot error]');
    console.error(err);
  })
  .onQR(async (qr) => {
    console.log('[Bot qr]');
    console.log(await qrcode.toString(qr, { type: 'terminal', small: true }));
  })
  .onOTP(async (code) => {
    console.log('[Bot otp]');
    console.log(code);
  })
  .onOpen(async (user) => {
    const lid = Utils.resolveLID(user.lid, user.id, user.phoneNumber);
    if (lid) {
      owners.add(lid);
    }
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
  .onCommand(async (m, prefix, name, args) => {
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
      if (name === 'echo') {
        await m.reply({ text: args.length > 0 ? args.join(' ') : 'Hello, World!' });
        return;
      }
      // This command is extremely dangerous; make sure only authorized people can execute it.
      if (name === 'eval') {
        if (!m.sender || !owners.has(m.sender)) {
          await m.reply({ text: 'Permission denied!' });
          return;
        }
        try {
          let out = eval(args.join(' '));
          if (out instanceof Promise) {
            out = await out;
          }
          const result = util.inspect(out, {
            colors: false,
            depth: null,
          });
          await m.reply({ text: result });
        } catch (v) {
          const err = Utils.toError(v);
          await m.reply({ text: err.toString() });
        }
        return;
      }
      await m.reply({ text: `The *${prefix + name}* command does not exist` });
    } catch (v) {
      console.error(Utils.toError(v));
    }
  });
// Log in with QR code
await bot.login();
