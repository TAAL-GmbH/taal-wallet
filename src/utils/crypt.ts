import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const iv = Buffer.from('f98c2b14c2d893e7ae9bdf1da4170fc3', 'hex');

export const sha256 = (str: string) =>
  crypto.createHash('sha256').update(str).digest();

export const encrypt = (str: string, password: string) => {
  const key = sha256(password);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  const encrypted = cipher.update(str);
  const encryptedWithCipher = Buffer.concat([encrypted, cipher.final()]);
  return encryptedWithCipher.toString('hex');
};

export const decrypt = (str: string, password: string) => {
  const key = sha256(password);
  const encryptedBuf = Buffer.from(str, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  const decrypted = decipher.update(encryptedBuf);
  return Buffer.concat([decrypted, decipher.final()]).toString();
};
