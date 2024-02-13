import { NearApi, NearRPC } from '../utils/near.js';
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
    async getAccountAge(accountId) {
        const api = new NearApi();
        const result = await api.getAccountInfo(accountId);
        return result.account[0]?.created?.block_timestamp
    }
    async getAccountBalance(accountId) {
        const api = new NearApi();
        const result = await api.getAccountInfo(accountId);
        const amountYocto = result.account[0]?.amount
        return amountYocto // * (10**24)
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