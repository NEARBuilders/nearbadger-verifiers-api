const { Wallet } = require('@nearbadger/utils/near');
const dotenv = require("dotenv");
dotenv.config();

const NearBadger = {
  issue: ({accountId, platform, handle, proof}) => {
    const nonce = 1;
    const message = `${accountId},${platform},${handle},${proof},${nonce}`;
    const rawSignature = Wallet.sign(message)?.signature || [];

    return {
      nonce,
      signature: rawSignature
    };
  }
}

module.exports = NearBadger;
