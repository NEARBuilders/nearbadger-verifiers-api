import LensVerifier from '../../verifiers/lens.js';

const NEAR_ACCOUNT = 'mattb.near';
const LENS_HANDLE = 'mattb.lens';
const FULL_HANDLE = 'lens/mattb';
const SIGNATURE = '0xd4896b34cb00534c443ff42e741ad1accb948c4daf56139f1104066d9972cbd46911021bd081e187bbd2a4c49da432d4828c6894a66c1a8789653023f02eb9361b';
const CHALLENGE_SIGNATURE = 'KmkYBAZ2SbFGSZutp6G/3ESlPZYPswDKwfAroxmqyM/IlTDsmZcZCaGCzpdNZit+T6wK7kfha1/7u2wZyy1TBg==';
const verifier = new LensVerifier();

describe('LensVerifier', () => {
  describe('verify', () => {
    it('should return true for a valid handle owner with a valid proof', async () => {
      const result = await verifier.verify(NEAR_ACCOUNT, LENS_HANDLE, SIGNATURE);
      expect(result).toBe(true);
    });
    it('should return false for a valid handle owner with an invalid proof', async () => {
      const result = await verifier.verify(NEAR_ACCOUNT, LENS_HANDLE, "");
      expect(result).toBe(false);
    });
  });

  describe('getChallenge', () => {
    it('should return a valid challenge', async () => {
      const result = verifier.getChallenge(NEAR_ACCOUNT, LENS_HANDLE);
      expect(result).toBe(CHALLENGE_SIGNATURE);
    });
  });

  describe('getFullHandle', () => {
    it('should return a valid full handle', async () => {
      const result = verifier.getFullHandle(LENS_HANDLE);
      expect(result).toBe(FULL_HANDLE);
    });
  });
})