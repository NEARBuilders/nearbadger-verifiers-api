import { TwitterApi } from 'twitter-api-v2';
import badger from './nearbadger.js';

const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const REQUEST_OAUTH_TOKEN_ENDPOINT = 'oauth/request_token';

export class TwitterAPI {
    client = null;

    constructor() {
        this.client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_SECRET_KEY,
        });
    }
}

export class TwitterAuth {
    async generateAuthURL(state, redirectUri) {
        return this.getBaseURL({
            clientId: process.env.TWITTER_OAUTH_CLIENT_ID || '',
            state,
            redirectUri
        });
    }

    async generateChallenge(accountId, handle) {
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
        const decodedChallenge = Buffer.from(encodedChallenge).toString('utf-8');
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

    getBaseURL({ clientId, state, redirectUri }) {
        const searchParams = new URLSearchParams({
            state,
            code_challenge_method: 'plain',
            code_challenge: 'nearbadger',
            client_id: clientId,
            scope: 'users.read',
            response_type: 'code',
            redirect_uri: encodeURIComponent(redirectUri)
        });

        return `${TWITTER_AUTH_URL}?${searchParams.toString()}`;
    }
}