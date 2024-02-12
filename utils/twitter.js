import badger from './nearbadger.js';

const TWITTER_API_URL = 'https://api.twitter.com/2';
const TWITTER_OAUTH_TOKEN_ENDPOINT = 'oauth2/token';
const TWITTER_OAUTH_USERS_ME_ENDPOINT =  'users/me';

const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';

export class TwitterAPI {
    static async request(endpoint, options) {
        return fetch(this.getFullURL(endpoint), options)
        .then(
            (data) => data.json()
        );
    }
    static async getUserAccessToken(params) {
        const credentials = `${process.env.TWITTER_OAUTH_CLIENT_ID}:${process.env.TWITTER_OAUTH_CLIENT_SECRET}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');
        const url = this.getFullURL(TWITTER_OAUTH_TOKEN_ENDPOINT);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${encodedCredentials}`,
            },
            body: new URLSearchParams(
                this.getAccessTokenParams(params)
            ),
        };

        return this.request(TWITTER_OAUTH_TOKEN_ENDPOINT)
        .then(
            (info) => info?.access_token || ''
        );
    }
    static async getUserHandle(accessToken) {
        const options = {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        };

        return this.request(TWITTER_OAUTH_USERS_ME_ENDPOINT, options)
        .then(
            (user) => user?.data?.username || ''
        );
    }
    getAccessTokenParams({
        code,
        redirectUri,
        codeVerifier
    }) {
        return {
            code,
            grant_type: 'authorization_code',
            client_id: process.env.TWITTER_OAUTH_CLIENT_ID,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        };
    }
    getFullURL(endpoint) {
        return `${TWITTER_API_URL}/${endpoint}`;
    }
}

export class TwitterAuth {
    generateAuthURL({state, codeChallenge, redirectUri}) {
        return this.getBaseURL({
            clientId: process.env.TWITTER_OAUTH_CLIENT_ID || '',
            codeChallenge,
            state,
            redirectUri
        });
    }

    generateChallenge(accountId, handle) {
        const platform = 'twitter';
        const nonce = badger.getSafeNonce();
        const rawChallenge = this.getRawChallenge({
            accountId,
            handle,
            platform,
            nonce
        });
        const signature = Buffer.from(
            badger.sign(rawChallenge)
        ).toString('base64');

        return Buffer.from(`${rawChallenge},${signature}`).toString("base64");
    }

    decodeChallenge(encodedChallenge) {
        const decodedChallenge = Buffer.from(encodedChallenge, "base64").toString('utf-8');
        const [accountId, handle, platform, nonce, encodedSignature] = decodedChallenge.split(',');

        return {
            challenge: this.getRawChallenge({
                accountId,
                handle,
                platform,
                nonce
            }),
            signature: encodedSignature
        };
    }

    getRawChallenge({ accountId, handle, platform, nonce }) {
        return `${accountId},${handle},${platform},${nonce}`;
    }

    getBaseURL({ clientId, codeChallenge, state, redirectUri }) {
        const searchParams = new URLSearchParams({
            state,
            code_challenge_method: 'plain',
            code_challenge: codeChallenge,
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectUri
        });

        return `${TWITTER_AUTH_URL}?${searchParams.toString()}&scope=users.read%20tweet.read`;
    }
}