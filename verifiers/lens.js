const ethers = require('ethers');
const { LensAPI } = require('./../utils/lens');

const LensVerifier = {
  verify: async (accountId, handle, proof) => {
    const fullHandle = LensVerifier.getFullHandle(handle);
    const challenge = LensVerifier.getChallenge(accountId, handle);
    const expectedSigner = await LensAPI.getHandleOwner(fullHandle);

    return expectedSigner?.toLowerCase() === LensVerifier.getSignerAddress(challenge, proof).toLowerCase();
  },
  getChallenge: (accountId, handle) => `${accountId.toLowerCase()} owns the ${handle.toLowerCase()} handle`,
  getFullHandle: (handle) => {
    let parts = handle.split(".");
    let namespace = handle.split(".").pop();

    return `${namespace}/${parts.shift()}`;
  },
  getSignerAddress: (challenge, proof) => {
    try {
      return ethers.verifyMessage(challenge, proof);
    } catch (e) {
      return "";
    }
  }
};

module.exports = LensVerifier;
