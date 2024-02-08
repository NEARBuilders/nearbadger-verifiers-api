const { NearRPC } = require('@nearbadger/utils/near');

const NEAR_ACCOUNT = "mattb.near";
const FULL_ACCESS_PUBLIC_KEY = "ed25519:8xZk1TURMBZpDEyX6GeBGrsBw6DMKtVV63h4vPznG6wE";

describe('NearRPC', () => {
  describe("getAccountFullAccessPubKeys", () => {
    it('should return full access key', async () => {
      const result = await NearRPC.getAccountFullAccessPubKeys(NEAR_ACCOUNT);
      expect(result).toContain(FULL_ACCESS_PUBLIC_KEY);
    });
  });
  describe("getAccountPubKeys", () => {
    it('should return keys', async () => {
      const result = await NearRPC.getAccountPubKeys(NEAR_ACCOUNT);
      expect(result).toContain(FULL_ACCESS_PUBLIC_KEY);
    });
  });
})