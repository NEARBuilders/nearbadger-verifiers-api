const express = require('express');
const verifiers = require('./verifiers');
const badger = require('./utils/nearbadger');

const app = express();

app.use(express.json());

app.get('/ping', (req, res) => {
  res.send(
    JSON.stringify({"ping": "pong"})
  );
});

app.post('/verify/:platform', (req, res) => {
  const { platform } = req.params;
  const { accountId, handle, proof, signature } = req.body;

  if (platform in verifiers) {
    const { near, [platform]: verifier } = verifiers;

    if (near.verify(accountId, proof, signature)) {
      if (verifier.verify(accountId, handle, proof)) {
        return res.status(200).json({
            token: badger.issue(accountId, proof)
        });
      }
    }
  }

  return res.status(400);
});

app.post('/challenge/:platform', (req, res) => {
  const { platform } = req.params;
  const { accountId, handle } = req.body;

  if (platform in verifiers) {
    const { [platform]: verifier } = verifiers;
    return res.status(200).json({
      challenge: verifier.getChallenge(accountId, handle)
    });
  }

  return res.status(400);
});

module.exports = app;