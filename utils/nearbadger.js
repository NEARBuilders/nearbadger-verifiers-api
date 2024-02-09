const { Wallet } = require('./../utils/near');
const crypto = require('crypto');

const NearBadger = {
  issue: ({accountId, platform, handle, proof}) => {
    const nonce = crypto.randomBytes(16).readUIntBE(0, 6);
    const message = `${accountId},${platform},${handle},${proof},${nonce}`;
    const rawSignature = Wallet.sign(message)?.signature || [];

    return {
      nonce,
      signature: Array.from(rawSignature)
    };
  }
}

module.exports = NearBadger;
