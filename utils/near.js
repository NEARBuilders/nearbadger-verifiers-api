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
  getAccountPubKeys: (accountId) => {
    return NearRPC.send(
        NearRPC.createRequest({
            params: [`access_key/${accountId}`, ""]
        })
    ).then((payload) => payload.json())
     .then(({ result }) => result?.keys.filter((key) => key.access_key.permission === "FullAccess"));
  },
};

module.exports = { NearRPC };
