import { TwitterAPI } from '../utils/twitter.js';
import AbstractVerifier from './verifier.js';

export default class TwitterVerifier extends AbstractVerifier {
  async verify(accountId, handle, proof) {
    const api = new LensAPI();
    const fullHandle = this.getFullHandle(handle);
    const challenge = this.getChallenge(accountId, handle);
    const expectedSigner = await api.getHandleOwner(fullHandle);
    
    return expectedSigner?.toLowerCase() === this.getSignerAddress(challenge, proof).toLowerCase();
  }
  async getChallenge() {
    const api = new TwitterAPI();
    const challenge = await api.generateAuthURL();
    
    return challenge;
  }
}