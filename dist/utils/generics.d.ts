/**
 * Resolves a LID and PN from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved LID and PN, or undefined if either is missing.
 */
export declare function resolveLIDAndPN(...args: unknown[]): {
    lid: string;
    pn: string;
} | undefined;
/**
 * Resolves a LID or PN from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved LID or PN, or undefined if neither is found.
 */
export declare function resolveLIDOrPN(...args: unknown[]): {
    lid: string | undefined;
    pn: string | undefined;
};
/**
 * Resolves a LID from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved LID, or undefined if not found.
 */
export declare function resolveLID(...args: unknown[]): string | undefined;
/**
 * Resolves a PN from the given arguments.
 * @param args The arguments to resolve.
 * @returns The resolved PN, or undefined if not found.
 */
export declare function resolvePN(...args: unknown[]): string | undefined;
/**
 * Checks if the given JID matches any of the provided arguments.
 * @param jid The JID to check.
 * @param args The arguments to compare against.
 * @returns True if the JID matches any of the arguments, otherwise false.
 */
export declare function isAnyJIDEqual(jid: string, ...args: unknown[]): boolean;
/**
 * Parses a string and extracts all valid JIDs.
 * @param str The string to parse.
 * @returns An array of extracted JIDs.
 */
export declare function parseJIDs(str: string): string[];
