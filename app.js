import express from 'express';
import cors from 'cors';
import verifiers from './verifiers/index.js';
import badger from './utils/nearbadger.js';
import * as config from './config.js';

const app = express();
app.use(express.json());
app.use(cors(config.cors))
app.use(config.rateLimit);

app.get('/ping', (req, res) => {
  return res.status(200).json({"ping": "pong"});
});

app.post('/verify/:platform', async (req, res) => {
  const { platform } = req.params;
  const { accountId, handle, proof, challenge } = req.body;

  if (platform in verifiers) {
    const { [platform]: verifier } = verifiers;

    // @TODO: Implement new Challenge signature in order to get accountId and handle
    const verified = await verifier.verify(accountId, handle, proof, challenge);

    if (verified) {
      const badge = await badger.issue({
        accountId,
        platform,
        handle,
        proof
      });

      return res.status(200).json(badge);
    }

    return res.status(401).send("Unauthorized");
  }

  return res.status(400).json({
      error: "Bad request"
  });
});

app.post('/challenge/:platform', async (req, res) => {
  const { platform } = req.params;
  const { accountId, handle } = req.body;

  if (platform in verifiers) {
    const { [platform]: verifier } = verifiers;
    const challenge = await verifier.getChallenge(accountId, handle);

    return res.status(200).json({
      challenge
    });
  }

  return res.status(400);
});

export default app;