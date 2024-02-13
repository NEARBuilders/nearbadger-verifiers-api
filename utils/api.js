import { NearApi, NearRPC } from "./near.js";

export default class NearAccountInfo {
    // write static methods that make use of thne nearApi class from utils/nearapi.js to get the account info from the NEAR_BLOCKS_API
    // use the api =NearApi() to get the account info from the NEAR_BLOCKS_API
    // return the account info from the NEAR_BLOCKS_API
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
}