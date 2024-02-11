import { Wallet } from './near.js';
import crypto from 'crypto';

export default class NearBadger {
  static sign(message) {
    const wallet = new Wallet();
    return wallet.sign(message)?.signature;
  }
  static issue({accountId, platform, handle, proof}) {
    const nonce = crypto.randomBytes(16).readUIntBE(0, 6);
    const message = `${accountId},${platform},${handle},${proof},${nonce}`;
    const rawSignature = NearBadger.sign(message) || [];

    return {
      nonce,
      signature: Array.from(rawSignature)
    };
  }
}