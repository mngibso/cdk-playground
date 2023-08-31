import { createHash as hash } from "crypto";
export const createHash = (s: string) => {
    const h = hash('sha256').update(s).digest('hex');
    return h.substring(0, 8);
}