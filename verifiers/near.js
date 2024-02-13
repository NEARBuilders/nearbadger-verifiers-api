import { NearRPC } from '../utils/near.js';
import naj from 'near-api-js';
import js_sha256 from 'js-sha256';

export default class NearVerifier {
    async verify(accountId, message, signatureBase64) {
        const rpc = new NearRPC();
        const pubKeys = await rpc.getAccountFullAccessPubKeys(accountId);
        return this.testPublicKeys(pubKeys, message, signatureBase64);
    }
    async getconnectedContracts(accountId) {
        const rpc = new NearRPC();
        const result = await rpc.getAccessKeyList(accountId);
        const contractsObject = result.keys.filter((x) => {
            return x.access_key.permission.FunctionCall;
          })
        return contractsObject.length
    }
    testPublicKeys(pubKeys, message, signatureBase64) {
        const messageToVerify = Uint8Array.from(Buffer.from(message));
        const signature = new Uint8Array(Buffer.from(signatureBase64, 'base64'));

        return pubKeys.map((pubKey) => {
            const pkTest = naj.utils.PublicKey.fromString(pubKey);
            return pkTest.verify(messageToVerify, signature);
        }).filter((result) => result).length !== 0;
    }
};