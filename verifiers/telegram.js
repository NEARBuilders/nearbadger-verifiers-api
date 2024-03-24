import badger from '../utils/nearbadger.js';
import { TelegramAuth, TelegramAPI } from '../utils/telegram.js';
import * as path from 'path';
import MTProto from '@mtproto/core/envs/node/index.js';
import { sleep } from '@mtproto/core/src/utils/common/index.js';
import AbstractVerifier from './verifier.js';
import * as buf from 'base64-arraybuffer';
import * as QRCode from 'qrcode';

const DEFAULT_REDIRECT_URI = 'https://near.social/mattb.near/widget/NearBadger.Pages.Authentication';
const TELEGRAM_CODE_CHALLENGE = 'nearbadger';
//const __dirname = path.resolve();

export default class TelegramVerifier extends AbstractVerifier {
  auth = null;
  app_id = 1417389;
  api_hash = '30039fb7264f36f01f8c0a9f40837646';

  constructor() {
    super();
    this.auth = new TelegramAuth();
    this.mtproto = new MTProto({
      api_id: this.app_id,
      api_hash: this.api_hash,
      //test: true,
      storageOptions: {
        path: process.env.DEV && process.env.DEV ? path.join(process.cwd(), `../../tmp/data/1.json`) : '/tmp/data/1.json',
      },
    });

    this.mtproto.updates.on('updatesTooLong', (updateInfo) => {
      console.log('updatesTooLong:', updateInfo);
    });

    this.mtproto.updates.on('updateShortMessage', (updateInfo) => {
      console.log('updateShortMessage:', updateInfo);
    });

    this.mtproto.updates.on('updateShortChatMessage', (updateInfo) => {
      console.log('updateShortChatMessage:', updateInfo);
    });

    this.mtproto.updates.on('updateShort', (updateInfo) => {
      console.log('updateShort:', updateInfo);
    });

    this.mtproto.updates.on('updatesCombined', (updateInfo) => {
      console.log('updatesCombined:', updateInfo);
    });

    this.mtproto.updates.on('updates', (updateInfo) => {
      console.log('updates:', updateInfo);
    });

    this.mtproto.updates.on('updateShortSentMessage', (updateInfo) => {
      console.log('updateShortSentMessage:', updateInfo);
    });
  }

  async getLoginToken() {
    return await this.mtproto.call('auth.exportLoginToken', {
      app_id: this.app_id,
      api_hash: this.api_hash,
      except_ids: [],
    });
  }

  async getUser() {
    try {
      const user = await this.call('users.getFullUser', {
        id: {
          _: 'inputUserSelf',
        },
      });

      return user;
    } catch (error) {
      return null;
    }
  }
  async signIn(code, phone, phone_code_hash) {
    return await this.call('auth.signIn', {
      phone_code: code,
      phone_number: phone,
      phone_code_hash: phone_code_hash,
    });
  }
  async sendCode(phone) {
    return this.call('auth.sendCode', {
      phone_number: phone,
      settings: {
        _: 'codeSettings',
      },
    });
  }
  async getPassword() {
    return this.call('account.getPassword');
  }
  async authCallback(token) {
    token = buf.decode("AQJ3oABmjiwvHHpecM5q0PuOhzFHBnEwB88sA7qCcO2vDg==")
    console.log(token)
    try {
      //const res = await this.call('auth.importLoginToken', { token: token });
      const res = await this.call('auth.acceptLoginToken', { token: "AQJ3oABmjiwvHHpecM5q0PuOhzFHBnEwB88sA7qCcO2vDg==" });
      return res
    } catch (error) {
      return error
    }

  }
  async checkPassword({ srp_id, A, M1 }) {
    return this.call('auth.checkPassword', {
      password: {
        _: 'inputCheckPasswordSRP',
        srp_id,
        A,
        M1,
      },
    });
  }
  async signUp(phone, phone_code_hash, first_name, last_name) {
    return this.call('auth.signUp', {
      phone_number: phone,
      phone_code_hash: phone_code_hash,
      first_name: first_name,
      last_name: last_name,
    });
  }
  async call(method, params, options = {}) {
    try {
      return await this.mtproto.call(method, params, options);
    } catch (error) {
      console.log(`${method} error:`, error);

      const { error_code, error_message } = error;

      if (error_code === 420) {
        const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
        const ms = seconds * 1000;

        await sleep(ms);

        return this.call(method, params, options);
      }

      if (error_code === 303) {
        const [type, dcIdAsString] = error_message.split('_MIGRATE_');

        const dcId = Number(dcIdAsString);

        // If auth.sendCode call on incorrect DC need change default DC, because
        // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await this.mtproto.setDefaultDc(dcId);
        } else {
          Object.assign(options, { dcId });
        }

        return this.call(method, params, options);
      }

      return Promise.reject(error);
    }
  }
  async getQRCodeBase64() {
    const LoginToken = await this.getLoginToken();

    const encodedToken = buf.encode(LoginToken.token);

    const url = 'tg://login?token=' + encodedToken;

    const src = await QRCode.toDataURL(url);

    return { src, encodedToken };
  }

  async verify(accountId, handle, proof, encodedChallenge) {
    const { user } = await this.getUser();
    console.log(user)
    if (user.users[0].access_hash == proof) {
      return {
        result: true,
        handle: proof
      };
    }
    return {
      result: false
    };
  }
  getChallenge(accountId, handle) {
    const state = this.auth.generateChallenge(accountId, handle);
    const redirectUri = this.getRedirectUri();
    const codeChallenge = this.getCodeChallenge();

    return this.auth.generateAuthURL({
      handle,
      state,
      codeChallenge,
      redirectUri
    });
  }
  getCodeChallenge() {
    return TELEGRAM_CODE_CHALLENGE;
  }
  getRedirectUri() {
    return DEFAULT_REDIRECT_URI;
  }
  verifyChallenge(challenge) {
    const rawChallenge = challenge.challenge;
    const encodedSignature = challenge.signature;

    return badger.verifyIsMe(rawChallenge, encodedSignature);
  }
}