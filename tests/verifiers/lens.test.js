const LensVerifier = require('nearbadger/verifiers/lens');

const NEAR_ACCOUNT = "mattb.near";
const LENS_HANDLE = "mattb.lens";
const SIGNATURE = "0x11e231e6fbd69343389ba9b6179b0108b914ad3e687172ba5d7748212058477d63e4aa09114e9a9b23b3cae4da7300577809b650bdf8842e0d1fae6cb8144f1c1c";

describe('LensVerifier', () => {
  describe("verify", () => {
    it('should return true for a valid handle owner with a valid proof', async () => {
      const result = await LensVerifier.verify(NEAR_ACCOUNT, LENS_HANDLE, SIGNATURE);
      expect(result).toBe(true);
    });
    it('should return false for a valid handle owner with an invalid proof', async () => {
      const result = await LensVerifier.verify(NEAR_ACCOUNT, LENS_HANDLE, "");
      expect(result).toBe(false);
    });
  });

  describe("getChallenge", () => {
    it('should return a valid challenge', async () => {
      const result = await LensVerifier.getChallenge(NEAR_ACCOUNT, LENS_HANDLE);
      expect(result).toBe('mattb.near owns the mattb.lens handle');
    });
  });

  describe("getFullHandle", () => {
    it('should return a valid full handle', async () => {
      const result = await LensVerifier.getFullHandle(LENS_HANDLE);
      expect(result).toBe('lens/mattb');
    });
  });
})