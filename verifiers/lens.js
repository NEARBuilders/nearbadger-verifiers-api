import { ethers } from 'ethers';
import { LensAPI } from '../utils/lens.js';

export default class LensVerifier {
  async verify(accountId, handle, proof) {
    const api = new LensAPI();
    const fullHandle = this.getFullHandle(handle);
    const challenge = this.getChallenge(accountId, handle);
    const expectedSigner = await api.getHandleOwner(fullHandle);
    
    return expectedSigner?.toLowerCase() === this.getSignerAddress(challenge, proof).toLowerCase();
  }
  getChallenge(accountId, handle) {
    return `${accountId.toLowerCase()} owns the ${handle.toLowerCase()} handle`;
  }
  getFullHandle(handle) {
    let parts = handle.split(".");
    let namespace = parts.pop();

    return `${namespace}/${parts.shift()}`;
  }
  getSignerAddress(challenge, proof) {
    try {
      return ethers.verifyMessage(challenge, proof);
    } catch (e) {
      return "";
    }
  }
}