import { FarcasterAPI } from '../utils/farcaster.js';
import AbstractVerifier from './verifier.js';

export default class FarcasterVerifier extends AbstractVerifier {
  async verify(accountId, handle, proof) {
    const api = new FarcasterAPI();
    const challenge = this.getChallenge(accountId, handle);
    const expectedSigner = await api.getHandleOwner(handle);
    
    return expectedSigner?.toLowerCase() === this.getSignerAddress(challenge, proof).toLowerCase();
  }
}