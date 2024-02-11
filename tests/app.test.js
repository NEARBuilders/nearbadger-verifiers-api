import request from 'supertest';
import App from "../app.js";

const LENS_CHALLENGE_SIGNATURE = 'KmkYBAZ2SbFGSZutp6G/3ESlPZYPswDKwfAroxmqyM/IlTDsmZcZCaGCzpdNZit+T6wK7kfha1/7u2wZyy1TBg==';
const FARCASTER_CHALLENGE_SIGNATURE = 'nYD6q0+8A0Rc5LDoINP03FPisZU2gqmcn/UCEjU0hHV7xH4SeDJ9IZu2N6SOu5vVgoFY8p/dmJ+EqHkgAtnXDA==';
const ACCOUNT_ID = 'mattb.near';
const LENS_HANDLE = 'mattb.lens';
const FARCASTER_HANDLE = '0xmattb';

describe('App', () => {
  describe('POST /challenge/:platform', () => {
    it('should return a challenge for Lens', async () => {
      checkChallenge('lens', ACCOUNT_ID, LENS_HANDLE, LENS_CHALLENGE_SIGNATURE)
    });
    it('should return a challenge for Farcaster', async () => {
      checkChallenge('farcaster', ACCOUNT_ID, FARCASTER_HANDLE, FARCASTER_CHALLENGE_SIGNATURE)
    });
  });
});

const checkChallenge = async (platform, accountId, handle, expectedChallenge) => {
  await request(App)
  .post(`/challenge/${platform}`)
  .set('Content-Type', 'application/json')
  .send(JSON.stringify(
    {
      accountId,
      handle
    }
  ))
  .expect(200);

  expect(response.body).toEqual(expect.objectContaining({
    challenge: expectedChallenge
  }));
}