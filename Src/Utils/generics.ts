import * as baileys from 'baileys';
import Utils from './index.js';

export function resolveLIDAndPN(...args: unknown[]) {
  const lid = resolveLID(...args);
  const pn = resolvePN(...args);
  if (!lid || !pn) {
    return undefined;
  }
  return {
    lid,
    pn,
  };
}
export function resolveLID(...args: unknown[]) {
  const lid = args.filter((v) => typeof v === 'string').find(baileys.isLidUser);
  return lid ? baileys.jidNormalizedUser(lid) : undefined;
}
export function resolvePN(...args: unknown[]) {
  const pn = args.filter((v) => typeof v === 'string').find(baileys.isPnUser);
  return pn ? baileys.jidNormalizedUser(pn) : undefined;
}
export async function delay(ms: number) {
  Utils.assertNumber(ms, 'ms');
  return new Promise((r) => setTimeout(r, ms));
}
