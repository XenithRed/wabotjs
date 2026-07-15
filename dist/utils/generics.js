import { jidNormalizedUser, isLidUser, isPnUser, jidEncode } from 'baileys';
import { assertType } from './asserts.js';
import libpn from 'libphonenumber-js';
/**
 * Resolves a LID and PN from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved LID and PN, or undefined if either is missing.
 */
export function resolveLIDAndPN(...args) {
    const { lid, pn } = resolveLIDOrPN(...args);
    if (!lid || !pn) {
        return undefined;
    }
    return { lid, pn };
}
/**
 * Resolves a LID or PN from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved LID or PN, or undefined if neither is found.
 */
export function resolveLIDOrPN(...args) {
    const lid = resolveLID(...args);
    const pn = resolvePN(...args);
    return { lid, pn };
}
/**
 * Resolves a LID from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved LID, or undefined if not found.
 */
export function resolveLID(...args) {
    const lid = args.find((a) => typeof a === 'string' && isLidUser(a));
    return lid ? jidNormalizedUser(lid) : undefined;
}
/**
 * Resolves a PN from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved PN, or undefined if not found.
 */
export function resolvePN(...args) {
    const pn = args.find((a) => typeof a === 'string' && isPnUser(a));
    return pn ? jidNormalizedUser(pn) : undefined;
}
/**
 * Checks if the given JID matches any of the provided arguments.
 * @param jid The JID to check.
 * @param args The arguments to compare against.
 * @returns True if the JID matches any of the arguments, otherwise false.
 */
export function isAnyJIDEqual(jid, ...args) {
    assertType(jid, 'jid', 'string');
    return args.some((a) => typeof a === 'string' && jidNormalizedUser(a) === jidNormalizedUser(jid));
}
/**
 * Parses a string and extracts all valid JIDs.
 * @param str The string to parse.
 * @returns An array of extracted JIDs.
 */
export function parseJIDs(str) {
    assertType(str, 'str', 'string');
    const jids = new Set();
    const matched = str.match(/@(\d+)/g);
    if (matched) {
        matched.forEach((m) => {
            if (m === '@0') {
                jids.add(jidEncode('0', 's.whatsapp.net'));
                return;
            }
            const jid = m.replace('@', '');
            const pn = libpn('+' + jid);
            if (pn?.isValid()) {
                const formatted = pn.format('E.164').replace('+', '');
                jids.add(jidEncode(formatted, 's.whatsapp.net'));
                return;
            }
            jids.add(jidEncode(jid, 'lid'));
        });
    }
    return jids.values().toArray();
}
