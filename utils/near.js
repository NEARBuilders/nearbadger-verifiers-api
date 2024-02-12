import { KeyPair } from 'near-api-js';
import dotenv from 'dotenv';
dotenv.config();

const NEAR_MAINNET_RPC = "https://rpc.mainnet.near.org/";

export class NearRPC {
    id = 0;

    async send(request) {
        return fetch(NEAR_MAINNET_RPC, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        })
    }
    createRequest({ params }) {
    return {
        "id": ++this.id,
        "jsonrpc": "2.0",
        "method": "query",
        "params": params
    };
  }
  async getAccountRawKeys(accountId) {
      return this.send(
          this.createRequest({
              params: [`access_key/${accountId}`, ""]
          })
      ).then((payload) => payload.json());
  }
  async getAccountPubKeys(accountId) {
      return this.getAccountRawKeys(accountId)
          .then(({ result }) => result?.keys.map((key) => key.public_key));
  }
  async getAccountFullAccessPubKeys(accountId) {
    return this.getAccountRawKeys(accountId)
     .then(({ result }) => result?.keys.filter((key) => key.access_key.permission === "FullAccess").map((key) => key.public_key));
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