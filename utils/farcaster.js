const FARCASTER_MAINNET_URL = "https://searchcaster.xyz/api";
const PROFILE_ENDPOINT = "profiles";

export class FarcasterAPI {
    async getHandleOwner(handle) {
        return fetch(this.getQueryURL(PROFILE_ENDPOINT, { username: handle }), {
           method: "GET",
           headers: {
               Accept: "application/json"
           }
        }).then((payload) => {
            return payload.json();
        }).then((result) => {
            console.log(result);
            return result?.connectedAddress;
        });
    }
    getQueryURL(endpoint, params) {
        return `${this.getURL(endpoint)}?${(new URLSearchParams(params)).toString()}`
    }
    getURL(endpoint) {
        return `${FARCASTER_MAINNET_URL}/${endpoint}`;
    }
};