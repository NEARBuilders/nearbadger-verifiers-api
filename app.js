import express from 'express';
import { addSeconds, isAfter } from 'date-fns';
import verifiers from './verifiers/index.js';
import badger from './utils/nearbadger.js';

const app = express();
app.use(express.json());

let requests = {};
const MAX_REQUESTS = 50;
const MAX_TIMESPAN = 3600;

app.use((req, res, next) => {
    let ip = req.ip;

    if (ip in requests) {
        if (requests[ip].count === MAX_REQUESTS && !isAfter(new Date(), requests[ip].expire)) {
            return res.status(429).send();
        } else if (requests[ip].count === MAX_REQUESTS) {
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
  const { platform } = req.params;
  const { accountId, handle, proof, challenge } = req.body;

  if (platform in verifiers) {
    const { [platform]: verifier } = verifiers;

    // @TODO: Implement new Challenge signature in order to get accountId and handle
    const verified = await verifier.verify(accountId, handle, proof, challenge);

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