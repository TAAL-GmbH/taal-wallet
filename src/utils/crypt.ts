export const encryptPK = (pk: string) => `___${pk}___`;
export const decryptPK = (pk: string) => pk.split('___')[1];
