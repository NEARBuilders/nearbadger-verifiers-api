const request = require('supertest');
const app = require("./../app"); // Asegúrate de que la ruta sea correcta

describe('App', () => {
  describe("POST /challenge/:platform", () => {
    it('should return a challenge for Lens', async () => {
      const response = await request(app)
        .post("/challenge/lens")
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(
          {
            accountId: "mattb.near",
            handle: "mattb.lens"
          }
        ))
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        challenge: "mattb.near owns the mattb.lens handle"
      }));
    });
  });
});