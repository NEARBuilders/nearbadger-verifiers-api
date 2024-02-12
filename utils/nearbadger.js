import { Wallet, NearRPC } from './near.js';
import NearVerifier from '../verifiers/near.js';
import crypto from 'crypto';

const MAX_BLOCK_HEIGHT_LIMIT = 600;

export default class NearBadger {
  static sign(message) {
    const wallet = new Wallet();
    return wallet.sign(message)?.signature;
  }
  static async issue({accountId, platform, handle, proof}) {
    const expirationBlockHeight = await this.getExpirationBlockHeight();
    const message = `${accountId},${platform},${handle},${proof},${expirationBlockHeight}`;
    const rawSignature = NearBadger.sign(message) || [];

    return {
      expirationBlockHeight,
      signature: Array.from(rawSignature)
    };
  }
  static getSafeNonce() {
    return crypto.randomBytes(16).readUIntBE(0, 6);
  }
  static async getExpirationBlockHeight() {
    const rpc = new NearRPC();
    const currentBlockHeight = await rpc.getCurrentBlockHeight();

    return currentBlockHeight + MAX_BLOCK_HEIGHT_LIMIT;
  }
  static verifyIsMe(message, signatureBase64) {
    const verifier = new NearVerifier();

    return verifier.testPublicKeys([ process.env.SIGNER_PUBLIC_KEY || '' ], message, signatureBase64);
  }
}