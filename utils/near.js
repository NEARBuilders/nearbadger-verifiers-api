import { KeyPair } from 'near-api-js';
import dotenv from 'dotenv';
dotenv.config();

const NEAR_MAINNET_RPC = "https://rpc.mainnet.near.org/";
const NEAR_BLOCKS_API = "https://api.nearblocks.io";
const NEAR_SOCIAL_API = "https://api.near.social"

export class NearRPC {
    id = 0;

    async send(request) {
        return fetch(NEAR_MAINNET_RPC, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        }).then(payload => payload.json())
    }
    createRequest({ method, params }) {
        return {
            "id": ++this.id,
            "jsonrpc": "2.0",
            "method": method || "query",
            "params": params
        };
    }
    async getAccountRawKeys(accountId) {
        return this.send(
            this.createRequest({
                params: [`access_key/${accountId}`, ""]
            })
        );
    }
    async getAccountPubKeys(accountId) {
        return this.getAccountRawKeys(accountId)
            .then(({ result }) => result?.keys.map((key) => key.public_key));
    }
    async getAccountFullAccessPubKeys(accountId) {
        return this.getAccountRawKeys(accountId)
        .then(({ result }) => result?.keys.filter((key) => key.access_key.permission === "FullAccess").map((key) => key.public_key));
    }
    async getCurrentBlockHeight() {
        const request = this.createRequest({
            method: 'block',
            params: {
                finality: 'final'
            }
        });
        
        return this.send(request)
            .then(data => data?.result?.header?.height);
    }

    async getAccessKeyList(accountId) {
        const request = this.createRequest({
            method: 'query',
            params: {
                request_type: 'view_access_key_list',
                finality: 'final',
                account_id: accountId
            }
        });
        return this.send(request)
            .then((data) => data.result);
    }

    async getConnectedContracts(accountId) {
        const result = await this.getAccessKeyList(accountId);
        const contractsObject = result.keys.filter((x) => {
            return x.access_key.permission.FunctionCall;
            })
        return contractsObject.length
    }
}

export class Wallet {
    sign(message) {
        const privateKey = process.env.SIGNER_PRIVATE_KEY || "";
        const keyPair = KeyPair.fromString(privateKey);

        return keyPair.sign(
            new Uint8Array(Buffer.from(message))
        );
    }
}

// write a NearApi class that uses the NEAR_BLOCKS_API as base url and implements a method called get account info that takes an accountId as parameter and returns the account info from the NEAR_BLOCKS_API from the {base_url}/v1/account/{accountId} endpoint
export class NearApi {
    async getAccountInfo(accountId) {
        return fetch(`${NEAR_BLOCKS_API}/v1/account/${accountId}`)
            .then(payload => payload.json());
    }

    async getAccountTxnInfo(accountId) {
        return fetch(`${NEAR_BLOCKS_API}/v1/account/${accountId}/txns/count`)
            .then(payload => payload.json());
    }

    async getAccountAge(accountId) {
        const result = await this.getAccountInfo(accountId);
        return result.account[0]?.created?.block_timestamp
    }
    async getAccountBalance(accountId) {
        const result = await this.getAccountInfo(accountId);
        const amountYocto = result.account[0]?.amount
        return amountYocto // * (10**24)
    }

    async getNearSocialFollowInfo(accountId, payload) {
        return fetch(`${NEAR_SOCIAL_API}/keys`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).then(payload => payload.json())
    }
}

export class NearAccountInfo {
    static async getConnectedContracts(accountId) {
        const rpc = new NearRPC();
        const accountInfo = await rpc.getConnectedContracts(accountId);
        return accountInfo;
    }

    static async getAccountBalance(accountId) {
        const api = new NearApi();
        const accountInfo = await api.getAccountBalance(accountId);
        return accountInfo;
    }

    static async getAccountAge(accountId) {
        const api = new NearApi();
        const accountInfo = await api.getAccountAge(accountId);
        return accountInfo;
    }

    static async getAccountSocialFollowers(accountId) {
        const api = new NearApi();
        const payload = {"keys": [`*/graph/follow/${accountId}`]}
        const accountInfo = await api.getNearSocialFollowInfo(accountId, payload);
        const infoCount = Object.keys(accountInfo).length;
        return infoCount;
    }

    static async getAccountSocialFollowings(accountId) {
        const api = new NearApi();
        const payload = {"keys": [`${accountId}/graph/follow/*`]}
        const accountInfo = await api.getNearSocialFollowInfo(accountId, payload);
        const infoCount = Object.keys(accountInfo[accountId]['graph']['follow']).length;
        return infoCount;
    }

    static async getAccountTxnInfo(accountId) {
        const api = new NearApi();
        const accountInfo = await api.getAccountTxnInfo(accountId);
        return accountInfo['txns'][0]['count'];
    }
}