import { ethers } from 'ethers';
import { Wallet } from '../utils/near';
import badger from '../utils/nearbadger';

export default class AbstractVerifier {
  getChallenge(accountId, handle) {
      return Buffer.from(badger.sign(
          this.getRawChallenge(accountId, handle)
      )).toString('base64');
  }
  getRawChallenge(accountId, handle) {
    return `${accountId.toLowerCase()} owns the ${handle.toLowerCase()} handle`;
  }
  getSignerAddress(challenge, proof) {
    try {
      return ethers.verifyMessage(challenge, proof);
    } catch (e) {
      return "";
    }
  }
}