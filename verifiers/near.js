const { NearRPC } = require('./../utils/near');
const naj = require('near-api-js');
const js_sha256 = require("js-sha256");

const NearVerifier = {
    verify: (accountId, message, signatureBase64) => {
        const pubKeys = NearRPC.getAccountFullAccessPubKeys(accountId);
        const messageToVerify = Uint8Array.from(js_sha256.sha256.array(message));
        const signature = Buffer.from(signatureBase64, 'base64');

        return pubKeys.map((pubKey) => {
            const pkTest = naj.utils.PublicKey.from(pubKey);
            return pkTest.verify(messageToVerify, signature);
        }).filter((result) => result).length !== 0;
    }
};

module.exports = NearVerifier;
