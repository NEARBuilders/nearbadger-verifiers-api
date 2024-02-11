import { FarcasterAPI } from '../utils/farcaster.js';
import AbstractVerifier from './verifier.js';

export default class FarcasterVerifier extends AbstractVerifier {
  async verify(accountId, handle, proof) {
    const api = new FarcasterAPI();
    const challenge = this.getChallenge(accountId, handle);
    const expectedSigners = await api.getHandleOwner(handle);
    
    return expectedSigners.filter(
      (expectedSigner) => expectedSigner.toLowerCase() === this.getSignerAddress(challenge, proof).toLowerCase()
    ).length > 0;
  }
  getChallenge(accountId, handle) {
    let challenge = super.getChallenge(accountId, handle);

    return `${challenge} on farcaster`;
  }
}