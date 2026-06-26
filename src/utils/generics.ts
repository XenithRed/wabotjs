import { jidNormalizedUser, isLidUser, isPnUser } from 'baileys';
import { assertType } from './asserts.js';

/* resolve both a normalized LID and a normalized PN from a list of arguments, or undefined if none are found */
export function resolveLIDAndPN(...args: unknown[]) {
  const lid = resolveLID(...args);
  const pn = resolvePN(...args);
  if (!lid || !pn) {
    return undefined;
  }
  return { lid, pn };
}
// resolve a normalized LID or PN from a list of arguments
export function resolveLIDOrPN(...args: unknown[]) {
  const lid = resolveLID(...args);
  const pn = resolvePN(...args);
  return { lid, pn };
}
// resolve a normalized LID from a list of arguments
export function resolveLID(...args: unknown[]) {
  const lid = args.find((a) => typeof a === 'string' && isLidUser(a)) as string | undefined;
  return lid ? jidNormalizedUser(lid) : undefined;
}
// resolve a normalized PN from a list of arguments
export function resolvePN(...args: unknown[]) {
  const pn = args.find((a) => typeof a === 'string' && isPnUser(a)) as string | undefined;
  return pn ? jidNormalizedUser(pn) : undefined;
}
// checks if `jid` is present in the argument list
export function isAnyJIDEqual(jid: string, ...args: unknown[]) {
  assertType(jid, 'jid', 'string');
  return args.some((a) => typeof a === 'string' && jidNormalizedUser(a) === jidNormalizedUser(jid));
}
