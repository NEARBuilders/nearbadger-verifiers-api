import FarcasterVerifier from '../../verifiers/farcaster.js';

const NEAR_ACCOUNT = 'mattb.near';
const FARCASTER_HANDLE = '0xmattb';
const SIGNATURE = '0x137c99d6c3832cd6a9b742d7526d498fbaf5063b6c434dd28dacd8d7df493da009e2ee0023205f7bb7aa71b89cb93ace4caec8407d787e87fb75882bcd128fe71c';
const CHALLENGE_SIGNATURE = 'nYD6q0+8A0Rc5LDoINP03FPisZU2gqmcn/UCEjU0hHV7xH4SeDJ9IZu2N6SOu5vVgoFY8p/dmJ+EqHkgAtnXDA==';
const verifier = new FarcasterVerifier();

describe('FarcasterVerifier', () => {
  describe('verify', () => {
    it('should return true for a valid handle owner with a valid proof', async () => {
      const result = await verifier.verify(NEAR_ACCOUNT, FARCASTER_HANDLE, SIGNATURE);
      expect(result).toBe(true);
    });
    it('should return false for a valid handle owner with an invalid proof', async () => {
      const result = await verifier.verify(NEAR_ACCOUNT, FARCASTER_HANDLE, "");
      expect(result).toBe(false);
    });
  });

  describe('getChallenge', () => {
    it('should return a valid challenge', async () => {
      const result = verifier.getChallenge(NEAR_ACCOUNT, FARCASTER_HANDLE);
      expect(result).toBe(CHALLENGE_SIGNATURE);
    });
  });
})