import LensVerifier from "./lens.js";
import FarcasterVerifier from "./farcaster.js";
import NearVerifier from './near.js';

const Verifiers = {
    lens: new LensVerifier(),
    farcaster: new FarcasterVerifier(),
    near: new NearVerifier()
}

export default Verifiers;
