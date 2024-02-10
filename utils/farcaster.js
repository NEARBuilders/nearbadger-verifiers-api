const WARPCAST_API_URL = "https://client.warpcast.com/v2";
const FARCASTER_FNAMES_API_URL = "https://fnames.farcaster.xyz";

const PROFILE_ENDPOINT = "verifications";
const FARCASTER_FNAMES_ENDPOINT = "transfers/current";

export class FarcasterAPI {
    async getHandleOwner(handle) {
        return this.getFidByHandle(handle).then(async (fid) => {
            if (!fid) {
                return [];
            }

            return fetch(
                this.getWarpcastQueryURL(PROFILE_ENDPOINT, { fid }),
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    }
                }
             ).then((payload) => {
                return payload.json();
             }).then((result) => {
                const verifications = result?.result?.verifications || [];
                return verifications.map((verification) => verification.address);
             })
        });
    }
    async getFidByHandle(handle) {
        return fetch(this.getFarcasterQueryURL(FARCASTER_FNAMES_ENDPOINT, { name: handle }), {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
         }).then((payload) => {
            return payload.json();
         }).then((result) => {
            return result?.transfer?.to || "";
         });
    }
    getQueryURL(endpoint, params) {
        return `${endpoint}?${(new URLSearchParams(params)).toString()}`
    }
    getFarcasterQueryURL(endpoint, params) {
        return this.getFarcasterURL(
            this.getQueryURL(endpoint, params)
        );
    }
    getWarpcastQueryURL(endpoint, params) {
        return this.getWarpcastURL(
            this.getQueryURL(endpoint, params)
        );
    }
    getFarcasterURL(endpoint) {
        return `${FARCASTER_FNAMES_API_URL}/${endpoint}`;
    }
    getWarpcastURL(endpoint) {
        return `${WARPCAST_API_URL}/${endpoint}`;
    }
};