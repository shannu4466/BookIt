/**
 * Hashes a string (like a password) using SHA-256 via the native Web Crypto API.
 * This ensures passwords are not stored or checked in plaintext.
 * 
 * @param {string} text - The plaintext password to hash.
 * @returns {Promise<string>} - The resulting SHA-256 hash as a hex string.
 */
export async function hashPassword(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
