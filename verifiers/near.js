import { NearRPC } from '../utils/near.js';
import naj from 'near-api-js';
import js_sha256 from 'js-sha256';

export default class NearVerifier {
    verify(accountId, message, signatureBase64) {
        const rpc = new NearRPC();
        const pubKeys = rpc.getAccountFullAccessPubKeys(accountId);
        const messageToVerify = Uint8Array.from(js_sha256.sha256.array(message));
        const signature = Buffer.from(signatureBase64, 'base64');

        return pubKeys.map((pubKey) => {
            const pkTest = naj.utils.PublicKey.from(pubKey);
            return pkTest.verify(messageToVerify, signature);
        }).filter((result) => result).length !== 0;
    }
};