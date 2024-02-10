import { ethers } from 'ethers';
import { LensAPI } from '../utils/lens.js';
import AbstractVerifier from './verifier.js';

export default class LensVerifier extends AbstractVerifier {
  async verify(accountId, handle, proof) {
    const api = new LensAPI();
    const fullHandle = this.getFullHandle(handle);
    const challenge = this.getChallenge(accountId, handle);
    const expectedSigner = await api.getHandleOwner(fullHandle);
    
    return expectedSigner?.toLowerCase() === this.getSignerAddress(challenge, proof).toLowerCase();
  }
  getFullHandle(handle) {
    let parts = handle.split(".");
    let namespace = parts.pop();

    return `${namespace}/${parts.shift()}`;
  }
}