import badger from '../utils/nearbadger.js';
import { TwitterAuth, TwitterAPI } from '../utils/twitter.js';
import AbstractVerifier from './verifier.js';

const DEFAULT_REDIRECT_URI = 'https://near.org/mattb.near/widget/NearBadger.Pages.Main';
const TWITTER_CODE_CHALLENGE = 'nearbadger';

export default class TwitterVerifier extends AbstractVerifier {
  auth = null;

  constructor() {
    super();

    this.auth = new TwitterAuth();
  }
  async verify(accountId, handle, proof, encodedChallenge) {
    const challenge = this.auth.decodeChallenge(encodedChallenge);
    const isValidChallenge = this.verifyChallenge(challenge);
    
    if (isValidChallenge) {
      // We can trust these values now
      const [ initialAccountId, initialHandle ] = challenge.challenge.toLowerCase().split(",");
      accountId = accountId.toLowerCase();

      const isValidRequest = initialAccountId === accountId;

      if (isValidRequest) {
        const accessToken = await TwitterAPI.getUserAccessToken({
          code: proof,
          redirectUri: this.getRedirectUri(),
          codeVerifier: this.getCodeChallenge()
        });

        if (accessToken) {
          const twitterHandle = await TwitterAPI.getUserHandle(accessToken);

          if (initialHandle === twitterHandle.toLowerCase()) {
            return true;
          }
        }
      }
    }

    return false;
  }
  getChallenge(accountId, handle) {
    const state = this.auth.generateChallenge(accountId, handle);
    const redirectUri = this.getRedirectUri();
    const codeChallenge = this.getCodeChallenge();

    return this.auth.generateAuthURL({
      state,
      codeChallenge, 
      redirectUri
    });
  }
  getCodeChallenge() {
    return TWITTER_CODE_CHALLENGE;
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