import badger from './nearbadger.js';

const GOOGLE_API_URL = 'https://oauth2.googleapis.com';
const GOOGLE_OAUTH_TOKEN_ENDPOINT = 'token';
const GOOGLE_OAUTH_USERS_INFO_ENDPOINT =  'userinfo';

const GOOGLE_AUTH_URL = 'https://www.googleapis.com/oauth2/v3';

export class GoogleAPI {
    static async request(endpoint, options) {
        return fetch(endpoint, options)
        .then(
            (data) => {
                return data.json();
            }
        );
    }
    static async getUserAccessToken(params) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(
                this.getAccessTokenParams(params)
            ),
        };

        const fullUrl = `${GOOGLE_API_URL}/${GOOGLE_OAUTH_TOKEN_ENDPOINT}`;

        return this.request(fullUrl, options)
        .then(
            (info) => {
                return info?.access_token || '';
            }
        );
    }
    static async getUserHandle(accessToken) {
        const options = {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        };

        const fullUrl = `${GOOGLE_AUTH_URL}/${GOOGLE_OAUTH_USERS_INFO_ENDPOINT}`;

        return this.request(fullUrl, options)
        .then(
            (user) => {
                return user?.email || ''
            }
        );
    }
    static getAccessTokenParams({
        code,
        redirectUri,
        codeVerifier
    }) {
        return {
            code: decodeURIComponent(code),
            client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
            client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        };
    }
    static getFullURL(endpoint) {
        return `${GOOGLE_API_URL}/${endpoint}`;
    }
}

export class GoogleAuth {
    generateAuthURL({state, codeChallenge, redirectUri, handle}) {
        return this.getBaseURL({
            clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
            codeChallenge,
            state: `google.${handle}.${state}`,
            redirectUri
        });
    }

    generateChallenge(accountId, handle) {
        const platform = 'google';
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
        const sanitizedEncodedChallenge = decodeURIComponent(encodedChallenge);
        const decodedChallenge = Buffer.from(sanitizedEncodedChallenge, "base64").toString('utf-8');
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

        return `${GOOGLE_AUTH_URL}?${searchParams.toString()}&scope=users.read%20tweet.read`;
    }
}