import { Wallet } from './near.js';
import NearVerifier from '../verifiers/near.js';
import crypto from 'crypto';

export default class NearBadger {
  static issue({accountId, platform, handle, proof}) {
    const wallet = new Wallet();
    const nonce = this.getSafeNonce();
    const message = `${accountId},${platform},${handle},${proof},${nonce}`;
    const rawSignature = wallet.sign(message)?.signature || [];

    return {
      nonce,
      signature: Array.from(rawSignature)
    };
  }
  static getSafeNonce() {
    return crypto.randomBytes(16).readUIntBE(0, 6);
  }
  static verifyIsMe(message, signatureBase64) {
    const verifier = new NearVerifier();

    return verifier.testPublicKeys([process.env.SIGNER_PUBLIC_KEY || ""], message, signatureBase64);
  }
}