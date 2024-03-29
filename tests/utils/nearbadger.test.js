import badger from '../../utils/nearbadger.js';

describe('NearBadger', () => {
  describe("sign", () => {

    if (process.env.SIGNER_PRIVATE_KEY) {
      it('should sign a message', async () => {
        if (!process.env.SIGNER_PRIVATE_KEY) {
          return ;
        }

        const result = await badger.issue({
          accountId: 'mattb.near',
          platform:  'lens',
          handle: 'mattb.lens',
          proof: 'x'
        });

        expect(result.expirationBlockHeight).toEqual(expect.any(Number));
        expect(result.signature).toEqual(expect.arrayContaining([
          expect.any(Number)
        ]));
      });
    } else {
      it.skip("should sign a message", () => {})
    }
  });
})