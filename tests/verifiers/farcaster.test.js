import FarcasterVerifier from '../../verifiers/farcaster.js';

const NEAR_ACCOUNT = "mattb.near";
const FARCASTER_HANDLE = "0xmattb";
const SIGNATURE = "0x35e51df8b4fea8e5acb471b0cfd347d77dbce58563fdcc3bf79301aef3f4586774fbcb78cdeb00f7888ee781d07a7e8def10d8960f32dbb4ce0695dfdb7214ae1c";
const verifier = new FarcasterVerifier();

describe('FarcasterVerifier', () => {
  describe("verify", () => {
    it('should return true for a valid handle owner with a valid proof', async () => {
      const result = await verifier.verify(NEAR_ACCOUNT, FARCASTER_HANDLE, SIGNATURE);
      expect(result).toBe(true);
    });
    it('should return false for a valid handle owner with an invalid proof', async () => {
      const result = await verifier.verify(NEAR_ACCOUNT, FARCASTER_HANDLE, "");
      expect(result).toBe(false);
    });
  });

  describe("getChallenge", () => {
    it('should return a valid challenge', async () => {
      const result = verifier.getChallenge(NEAR_ACCOUNT, FARCASTER_HANDLE);
      expect(result).toBe('mattb.near owns the 0xmattb handle on farcaster');
    });
  });
})