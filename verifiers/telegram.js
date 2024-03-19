import badger from '../utils/nearbadger.js';
import { TelegramAuth, TelegramAPI } from '../utils/telegram.js';
import AbstractVerifier from './verifier.js';
const DEFAULT_REDIRECT_URI = 'https://near.social/mattb.near/widget/NearBadger.Pages.Authentication';
const TELEGRAM_CODE_CHALLENGE = 'nearbadger';

export default class TelegramVerifier extends AbstractVerifier {
  auth = null;

  constructor() {
    super();
    this.auth = new TelegramAuth();
  }
  async verify(accountId, handle, proof, encodedChallenge) {
      const telegramHandle = await TelegramAPI.getUserHandle(proof);
      if (typeof telegramHandle === "string") {
        return {
          result: true,
          handle: telegramHandle.toLowerCase()
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