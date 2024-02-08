const { KeyPair } = require('near-api-js');
const NEAR_MAINNET_RPC = "https://rpc.mainnet.near.org/";

const NearRPC = {
  id: 0,
  send: (request) => fetch(NEAR_MAINNET_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
  }),
  createRequest: ({ params }) => {
    return {
        "id": ++this.id,
        "jsonrpc": "2.0",
        "method": "query",
        "params": params
    };
  },
  getAccountRawKeys: (accountId) => {
      return NearRPC.send(
          NearRPC.createRequest({
              params: [`access_key/${accountId}`, ""]
          })
      ).then((payload) => payload.json());
  },
  getAccountPubKeys: (accountId) => {
      return NearRPC.getAccountRawKeys(accountId)
          .then(({ result }) => result?.keys.map((key) => key.public_key));
  },
  getAccountFullAccessPubKeys: (accountId) => {
    return NearRPC.getAccountRawKeys(accountId)
     .then(({ result }) => result?.keys.filter((key) => key.access_key.permission === "FullAccess").map((key) => key.public_key));
  },
};

const Wallet = {
    sign: (message) => {
        const privateKey = process.env.SIGNER_PRIVATE_KEY;
        const keyPair = KeyPair.fromString(privateKey);

        return keyPair.sign(
            new Uint8Array(Buffer.from(message))
        );
    }
}

module.exports = { NearRPC, Wallet };
