import badger from '../utils/nearbadger.js';
import { GoogleAuth, GoogleAPI } from '../utils/google.js';
import AbstractVerifier from './verifier.js';
import { ethers } from 'ethers';

const DEFAULT_REDIRECT_URI = 'https://near.social/mattb.near/widget/NearBadger.Pages.Authentication';
const GOOGLE_CODE_CHALLENGE = 'nearbadger';

export default class GoogleVerifier extends AbstractVerifier {
  auth = null;

  constructor() {
    super();

    this.auth = new GoogleAuth();
  }
  async verify(accountId, handle, proof, encodedChallenge) {
    const accessToken = await GoogleAPI.getUserAccessToken({
      code: proof,
      redirectUri: this.getRedirectUri(),
      codeVerifier: this.getCodeChallenge()
    });


    if (accessToken) {
      const googleHandle = await GoogleAPI.getUserHandle(accessToken);


      if (typeof googleHandle === "string") {
        return {
          result: true,
          handle: ethers.sha256(
            Buffer.from(googleHandle.toLowerCase())
          )
        };
      }
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
    return GOOGLE_CODE_CHALLENGE;
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