import express from 'express';
import cors from 'cors';
import * as config from './config.js';
import verifiers from './verifiers/index.js';
import badger from './utils/nearbadger.js';
import { kv } from "@vercel/kv";
import { NearAccountInfo } from './utils/near.js';

const app = express();
app.use(express.json());
app.use(cors(config.cors))
app.use(config.rateLimit);
const WEB2_PLATFORMS = ["twitter", "google", "telegram"];

app.get('/ping', (req, res) => {
  return res.status(200).json({ "ping": "pong" });
});

app.post('/verify/:platform', async (req, res) => {
  const { platform } = req.params;
  let { accountId, handle, proof, challenge } = req.body;

  if (platform in verifiers) {
    const { [platform]: verifier } = verifiers;

    // @TODO: Implement new Challenge signature in order to get accountId and handle
    const verifiedResult = await verifier.verify(accountId, handle, proof, challenge);
    let verified = null;

    if (WEB2_PLATFORMS.includes(platform)) {
      verified = verifiedResult.result;
      handle = verifiedResult?.handle;
    } else {
      verified = verifiedResult;
    }

    if (verified) {
      const badge = await badger.issue({
        accountId,
        platform,
        handle,
        proof
      });

      if (WEB2_PLATFORMS.includes(platform)) {
        return res.status(200).json({
          ...badge,
          handle: handle
        });
      }

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

// make a route /sign/connected-contracts that gets the number of connected contracts for a given accountId and issues a signarue
app.post('/sign/connected-contracts', async (req, res) => {
  try {
    const { accountId } = req.body;
    const connectedContracts = await NearAccountInfo.getConnectedContracts(accountId);

    try {
      const signature = await badger.issueSignedAccountInfoStamp({ accountId, accountInfo: connectedContracts });
      return res.status(200).json({ signature });
    } catch (error) {
      return res.status(500).json({ error: "Unable to sign message. Please try again" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Unable to verify account info" });
  }
});

app.post('/sign/account-age', async (req, res) => {
  try {
    const { accountId } = req.body;
    const accountInfo = await NearAccountInfo.getAccountAge(accountId);

    try {
      const signature = await badger.issueSignedAccountInfoStamp({ accountId, accountInfo });
      return res.status(200).json({ signature });
    }
    catch (error) {
      return res.status(500).json({ error: "Unable to sign message. Please try again" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Unable to verify account info" });
  }

});

app.post('/sign/account-balance', async (req, res) => {
  try {
    const { accountId } = req.body;
    const accountInfo = await NearAccountInfo.getAccountBalance(accountId);

    try {
      const signature = await badger.issueSignedAccountInfoStamp({ accountId, accountInfo });
      return res.status(200).json({ signature });
    }
    catch (error) {
      return res.status(500).json({ error: "Unable to sign message, Please try again" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Unable to verify account info" });
  }

});

app.post('/sign/account/social-followers', async (req, res) => {
  try {
    const { accountId } = req.body;
    const accountInfo = await NearAccountInfo.getAccountSocialFollowers(accountId);

    try {
      const signature = await badger.issueSignedAccountInfoStamp({ accountId, accountInfo });
      return res.status(200).json({ signature });
    }
    catch (error) {
      return res.status(500).json({ error: "Unable to sign message. Please try again" });
    }
  } catch (error) {
    return res.status(500).json({ error: `Unable to verify account near social info` });
  }

});

app.post('/sign/account/social-followings', async (req, res) => {
  try {
    const { accountId } = req.body;
    const accountInfo = await NearAccountInfo.getAccountSocialFollowings(accountId);

    try {
      const signature = await badger.issueSignedAccountInfoStamp({ accountId, accountInfo });
      return res.status(200).json({ signature });
    }
    catch (error) {
      return res.status(500).json({ error: "Unable to sign message. Please try again" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Unable to verify account near social info" });
  }

});

app.post('/sign/account/transaction-count', async (req, res) => {
  try {
    const { accountId } = req.body;
    const accountInfo = await NearAccountInfo.getAccountTxnInfo(accountId);

    try {
      const signature = await badger.issueSignedAccountInfoStamp({ accountId, accountInfo });
      return res.status(200).json({ signature });
    }
    catch (error) {
      return res.status(500).json({ error: "Unable to sign message. Please try again" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Unable to verify account txn info" });
  }

});

app.get('/telegram/qr-code', async (req, res) => {
  const { telegram } = verifiers;
  const result = await telegram.getQRCodeBase64();
  return res.status(200).json({ QRCode_base64: result });
});

app.get('/telegram/get-user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { telegram } = verifiers;
  const result = await telegram.getUser(userId);
  return res.status(200).json({ user: result });
});


app.post('/telegram/send-code/', async (req, res) => {
  const { telegram } = verifiers;
  let { phone } = req.body;
  try {
    const result = await telegram.sendCode(phone);
    return res.status(200).json({ phone_code_hash: result.phone_code_hash });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

app.post('/telegram/sign-in/', async (req, res) => {
  let { code, phone, phone_code_hash } = req.body;
  const { telegram } = verifiers;
  try {
    const signInResult = await telegram.signIn(code, phone, phone_code_hash);
    console.log(signInResult.user.access_hash)
    await kv.set(signInResult.user.access_hash,signInResult.user.username.toLowerCase());
    return res.status(200).json({ user: signInResult });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

app.post('/telegram/sign-up/', async (req, res) => {
  let { phone, phone_code_hash, first_name, last_name } = req.body;
  const { telegram } = verifiers;
  try {
    const signUpResult = await telegram.signUp(phone, phone_code_hash, first_name, last_name);
    return res.status(200).json({ user: signUpResult._ });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

export default app;