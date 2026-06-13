import path from 'node:path';
import util from 'node:util';
import qrcode from 'qrcode';
import wabotjs from './index.js';

const id = '26x8bmn7';
const datadir = path.join(process.cwd(), 'Data', id);
const bot = new wabotjs.Bot(id, datadir);
const owners = new Set<string>();
bot.onError(async (err) => {
  console.error(`Bot ${id} error:`, err);
});
bot.onOTP(async (code) => {
  console.log(`Bot ${id} otp:`, code);
});
bot.onQR(async (str) => {
  console.log(`Bot ${id} qr:`);
  console.log(await qrcode.toString(str, { type: 'terminal', small: true }));
});
bot.onOpen(async (user) => {
  const lid = wabotjs.Utils.resolveLID(user.lid, user.id);
  if (lid) {
    owners.add(lid);
  }
  console.dir(`Bot ${id} open:`, user);
});
bot.onClose(async (err) => {
  console.error(`Bot ${id} close:`, err);
});
bot.onMessage(async (m) => {
  console.log(`Bot ${id} message:`);
  console.dir(m, { depth: null, hidden: false });
});
bot.onCommand(async (m, prefix, name, args) => {
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
        const err = wabotjs.Utils.toError(v);
        await m.reply({ text: err.toString() });
      }
      return;
    }
    await m.reply({ text: `The *${prefix + name}* command does not exist` });
  } catch (v) {
    console.error(wabotjs.Utils.toError(v));
  }
});
await bot.login();
