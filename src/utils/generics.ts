import { jidNormalizedUser, isLidUser, isPnUser } from 'baileys';
import { assertType } from './index.js';

export function resolveLIDAndPN(...args: unknown[]) {
  const lid = resolveLID(...args);
  const pn = resolvePN(...args);
  if (!lid || !pn) {
    return undefined;
  }
  return { lid, pn };
}
export function resolveLID(...args: unknown[]) {
  const lid = args.find((a) => typeof a === 'string' && isLidUser(a)) as string | undefined;
  return lid ? jidNormalizedUser(lid) : undefined;
}
export function resolvePN(...args: unknown[]) {
  const pn = args.find((a) => typeof a === 'string' && isPnUser(a)) as string | undefined;
  return pn ? jidNormalizedUser(pn) : undefined;
}
export function isAnyJIDEqual(jid: string, ...args: unknown[]) {
  assertType(jid, 'jid', 'string');
  return args.some((a) => typeof a === 'string' && jidNormalizedUser(a) === jidNormalizedUser(jid));
}
