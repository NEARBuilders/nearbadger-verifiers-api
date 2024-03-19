import badger from './nearbadger.js';
const TELEGRAM_AUTH_URL = 'https://oauth.telegram.org/auth';

export class TelegramAPI {
    static async getUserHandle(tgAuth) {
       // try { window.opener.postMessage(JSON.stringify({event: 'auth_result', result: {"id":5499517108,"first_name":"Kuro","username":"Kurodenjiro","photo_url":"https:\/\/t.me\/i\/userpic\/320\/uvEK_oCm26nw_WSUfrRdsGE1_-1-sN2z6MJemNB4ArH8YHUw7O-UhjQYD5yhoQPy.jpg","auth_date":1710883303,"hash":"0b02235163f052b10c6efae68ec0c8f97f5f3f04d25514151447e44787e14d09"}, origin: "https:\/\/nearbadger-verifiers-api.vercel.app"}), "https:\/\/oauth.telegram.org"); } catch(e) { location.href="https:\/\/nearbadger-verifiers-api.vercel.app\/telegram-auth?state=telegram.kurodenjiro.near.4941632#tgAuthResult=eyJpZCI6NTQ5OTUxNzEwOCwiZmlyc3RfbmFtZSI6Ikt1cm8iLCJ1c2VybmFtZSI6Ikt1cm9kZW5qaXJvIiwicGhvdG9fdXJsIjoiaHR0cHM6XC9cL3QubWVcL2lcL3VzZXJwaWNcLzMyMFwvdXZFS19vQ20yNm53X1dTVWZyUmRzR0UxXy0xLXNOMno2TUplbU5CNEFySDhZSFV3N08tVWhqUVlENXlob1FQeS5qcGciLCJhdXRoX2RhdGUiOjE3MTA4ODMzMDMsImhhc2giOiIwYjAyMjM1MTYzZjA1MmIxMGM2ZWZhZTY4ZWMwYzhmOTdmNWYzZjA0ZDI1NTE0MTUxNDQ3ZTQ0Nzg3ZTE0ZDA5In0" };window.close()
        return JSON.parse(atob(tgAuth)).username || ""
    }

}

export class TelegramAuth {
    generateAuthURL({bot_id,origin, redirectUri}) {
        return this.getBaseURL({
            bot_id: bot_id,
            origin:origin,
            state: `telegram.${handle}.${state}`,
            redirectUri
        });
    }

    generateChallenge(accountId, handle) {
        const platform = 'telegram';
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

    getBaseURL({ bot_id,origin, redirectUri }) {
        const searchParams = new URLSearchParams({
            bot_id:bot_id,
            origin:origin,
            return_to: redirectUri
        });

        return `${TELEGRAM_AUTH_URL}?${searchParams.toString()}&embed=1&request_access=write`;
    }
}