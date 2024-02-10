import { Wallet } from './near.js';
import crypto from 'crypto';

export default class NearBadger {
  static issue({accountId, platform, handle, proof}) {
    const wallet = new Wallet();
    const nonce = crypto.randomBytes(16).readUIntBE(0, 6);
    const message = `${accountId},${platform},${handle},${proof},${nonce}`;
    const rawSignature = wallet.sign(message)?.signature || [];

    return {
      nonce,
      signature: Array.from(rawSignature)
    };
  }
}