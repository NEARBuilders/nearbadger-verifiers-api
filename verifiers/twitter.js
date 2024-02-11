import { TwitterApi } from 'twitter-api-v2';
import badger from '../utils/nearbadger.js';
import { TwitterAuth, TwitterAPI } from '../utils/twitter.js';
import AbstractVerifier from './verifier.js';

const DEFAULT_REDIRECT_URI = 'https://near.org/mattb.near/widget/NearBadger.Pages.Main';

export default class TwitterVerifier extends AbstractVerifier {
  auth = null;

  constructor() {
    super();

    this.auth = new TwitterAuth();
  }
  async verify(accountId, handle, proof, encodedChallenge) {
    const challenge = this.auth.decodeChallenge(encodedChallenge);
    
    if (this.verifyChallenge(challenge)) {
      const initialAccountId = challenge.challenge.accountId; // We can trust this value now

      if (initialAccountId === accountId) {
        const api = new TwitterApi();

        // @TODO: Initialize the Twitter API with user's token and verify if the Twitter handle
        // matches the handle the user is trying to claim. If it matches - return true
      }
    }

    return false;
  }
  getChallenge(accountId, handle) {
    const state = this.auth.generateChallenge(accountId, handle);
    const redirectUri = this.getRedirectUri();
    const challenge = this.auth.generateAuthURL(state, redirectUri);

    return challenge;
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