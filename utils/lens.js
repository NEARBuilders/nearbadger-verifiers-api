const LENS_MAINNET_URL = "https://api-v2.lens.dev";
const PROFILE_QUERY = `
query Profile($profileRequest: ProfileRequest!) {
    profile(request: $profileRequest) {
        ownedBy {
            address
        }
    }
}`;

const LensAPI = {
    getHandleOwner: (handle) => {
        return fetch(LENS_MAINNET_URL, {
           method: "POST",
           headers: {
            "Content-Type": "application/json",
           },
           body: JSON.stringify({
               query: PROFILE_QUERY,
               variables: {
                    profileRequest: {
                        forHandle: handle
                    }
               }
           })
        }).then((payload) => payload.json()).then((payload) => payload?.data?.profile?.ownedBy?.address);
    }
};

module.exports = { LensAPI };
