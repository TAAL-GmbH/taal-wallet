const iv = Buffer.from('f98c2b14c2d893e7ae9bdf1da4170fc3', 'hex');

export const sha256 = async (str: string) => {
  const buffer = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-256', buffer);
};

export const encrypt = async (str: string, password: string) => {
  const hash = await sha256(password);
  const key = new Uint8Array(hash.slice(0, 32)); // Truncate to 256 bits (32 bytes)
  const encodedStr = new TextEncoder().encode(str);
  const keyBuffer = await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt']);
  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, keyBuffer, encodedStr);
  return Array.from(new Uint8Array(encryptedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const decrypt = async (encryptedHex: string, password: string) => {
  const hash = await sha256(password);
  const key = new Uint8Array(hash.slice(0, 32)); // Truncate to 256 bits (32 bytes)
  const encryptedBytes = Uint8Array.from(Buffer.from(encryptedHex, 'hex'));
  const keyBuffer = await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['decrypt']);
  const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, keyBuffer, encryptedBytes);
  return new TextDecoder().decode(decryptedBuffer);
};
