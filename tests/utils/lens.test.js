const { LensAPI } = require('nearbadger/utils/lens');

const LENS_HANDLE = "lens/mattb";
const OWNER_ADDRESS = "0x631ee9626051558896e5F97450479A9a9b22B652";

describe('LensAPI', () => {
  describe("getHandleOwner", () => {
    it('should successfully return the owner of a handle', async () => {
      const result = await LensAPI.getHandleOwner(LENS_HANDLE);
      expect(result?.toLowerCase()).toBe(OWNER_ADDRESS.toLowerCase());
    });
  })
})