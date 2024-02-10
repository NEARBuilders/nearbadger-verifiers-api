import LensVerifier from "./lens.js";
import NearVerifier from './near.js';

const Verifiers = {
    lens: new LensVerifier(),
    near: new NearVerifier()
}

export default Verifiers;
