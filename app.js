require('module-alias/register');
const express = require('express');
const { addSeconds, isAfter } = require('date-fns');
const verifiers = require('./verifiers');
const badger = require('./utils/nearbadger');

const app = express();
app.use(express.json());

let requests = {};
const MAX_REQUESTS = 50;
const MAX_TIMESPAN = 3600;

app.use((req, res, next) => {
    let ip = req.ip;

    if (ip in requests) {
        if (requests[ip].count == MAX_REQUESTS && !isAfter(new Date(), requests[ip].expire)) {
            return res.status(429).send();
        } else if (requests[ip].count == MAX_REQUESTS) {
            requests[ip].count = 1;
            requests[ip].expire = addSeconds(new Date(), MAX_TIMESPAN);
        } else {
            ++requests[ip].count;            
        }
    } else {
        requests[ip] = {
            count: 1,
            expire: addSeconds(new Date(), MAX_TIMESPAN)
        };
    }

    return next();
});

app.get('/ping', (req, res) => {
  return res.status(200).json({"ping": "pong"});
});

app.post('/verify/:platform', async (req, res) => {
    console.log(requests);
  const { platform } = req.params;
  const { accountId, handle, proof } = req.body;

  if (platform in verifiers) {
    const { [platform]: verifier } = verifiers;
    const verified = await verifier.verify(accountId, handle, proof);

    if (verified) {
      return res.status(200).json(
          badger.issue({
            accountId,
            platform,
            handle,
            proof
          })
      );
    }

    return res.status(401).send("Unauthorized");
  }

  return res.status(400).json({
      error: "Bad request"
  });
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