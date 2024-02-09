const badger = require('./../../utils/nearbadger');

describe('NearBadger', () => {
  describe("sign", () => {

    if (process.env.SIGNER_PRIVATE_KEY) {
      it('should sign a message', async () => {
        if (!process.env.SIGNER_PRIVATE_KEY) {
          return ;
        }

        const result = await badger.issue('mattb.near', 'lens', 'mattb.lens', 'x');

        expect(result.nonce).toEqual(expect.any(Number));
        expect(result.signature).toEqual(expect.arrayContaining([
          expect.any(Number)
        ]));
      });
    } else {
      it.skip("should sign a message", () => {})
    }
  });
})