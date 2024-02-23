import { ethers } from 'ethers';
import badger from '../utils/nearbadger.js';

export default class AbstractVerifier {
  getChallenge(accountId, handle, platform) {
    const nonce = badger.getSafeNonce();
    const rawChallenge = this.getRawChallenge({
        accountId,
        handle,
        platform,
        nonce
    });
    const signature = Buffer.from(
        badger.sign(rawChallenge)
    ).toString('base64');

    const challenge = Buffer.from(`${rawChallenge},${signature}`).toString("base64");

    return {
      message: this.getVerificationMessage({
        accountId,
        handle,
        platform,
        challenge
      }),
      challenge
    };
  }
  getVerificationMessage({
    accountId,
    handle,
    platform,
    nonce,
    challenge
  }) {
    return `
    Sign this message to prove that ${accountId.toLowerCase()} owns the ${handle.toLowerCase()} handle on ${platform}.\n\n
    Nonce: ${nonce}\n\n
    Generated proof: ${challenge}
    `;
  }
  decodeChallenge(encodedChallenge) {
      const decodedChallenge = Buffer.from(encodedChallenge, "base64").toString('utf-8');
      const [accountId, handle, platform, nonce, encodedSignature] = decodedChallenge.split(',');

      return {
          challenge: this.getRawChallenge({
              accountId,
              handle,
              platform,
              nonce
          }),
          signature: encodedSignature
      };
  }
  getRawChallenge({
    accountId,
    handle,
    platform,
    nonce
  }) {
    return `${accountId?.toLowerCase()},${handle?.toLowerCase()},${platform?.toLowerCase()},${nonce}`;
  }
  getSignerAddress(challenge, proof) {
    try {
      return ethers.verifyMessage(challenge, proof);
    } catch (e) {
      return "";
    }
  }
}