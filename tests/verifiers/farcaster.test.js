import FarcasterVerifier from '../../verifiers/farcaster.js';

const NEAR_ACCOUNT = "mattb.near";
const FARCASTER_HANDLE = "0xmattb";
const SIGNATURE = "0x6594ad54a7a0da347093a23ba52df1bb35a9c26f989eb7609862dfc8594a6e8c144efbe32c2da102d4c15ece26e13d85bc393084c673f5f107eebd0ed7a49cab1c";
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
      expect(result).toBe('mattb.near owns the 0xmattb handle');
    });
  });
})