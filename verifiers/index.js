import LensVerifier from "./lens.js";
import FarcasterVerifier from "./farcaster.js";
import TwitterVerifier from "./twitter.js";
import NearVerifier from './near.js';
import GoogleVerifier from './google.js';
import TelegramVerifier from './telegram.js';
const Verifiers = {
    lens: new LensVerifier(),
    farcaster: new FarcasterVerifier(),
    twitter: new TwitterVerifier(),
    near: new NearVerifier(),
    google: new GoogleVerifier(),
    telegram:new TelegramVerifier()
}

export default Verifiers;
