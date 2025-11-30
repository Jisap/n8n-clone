import Cryptr from "cryptr";

const crytr = new Cryptr(process.env.ENCRYPTION_KEY!);

export const encrypt = (text: string) => crytr.encrypt(text);
export const decrypt = (text: string) => crytr.decrypt(text);

