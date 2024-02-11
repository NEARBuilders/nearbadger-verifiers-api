import { TwitterApi } from "twitter-api-v2";

const REQUEST_OAUTH_TOKEN_ENDPOINT = 'oauth/request_token';

export class TwitterAPI {
    client = null;

    constructor() {
        this.client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_SECRET_KEY,
        });
    }

    async generateAuthURL() {
        // Obtener el token de solicitud y la URL de autenticación
        const { url, oauth_token, oauth_token_secret } = await this.client.generateAuthLink('https://near.org/mattb.near/widget/NearBadger.Pages.Main');

        // Guarda oauth_token y oauth_token_secret en tu sesión o almacenamiento seguro
        // Necesitarás estos valores después de que el usuario autorice tu aplicación para obtener el token de acceso

        console.log('URL de autenticación:', url);
        return url;
    }
};