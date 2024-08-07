import express from "express";
import cors from "cors";
import * as config from "./config.js";

import verifiers from "./verifiers/index.js";
import badger from "./utils/nearbadger.js";
import { NearAccountInfo } from "./utils/near.js";

const app = express();
app.use(express.json());
app.use(cors(config.cors));
app.use(config.rateLimit);

const WEB2_PLATFORMS = ["twitter", "google"];

app.get("/ping", (req, res) => {
        return res.status(200).json({ ping: "pong" });
});

app.get("/account/:account", async (req, res) => {
        let { account } = req.params;
        const accountAge = await NearAccountInfo.getAccountAge(account);
        const connectedContracts =
                await NearAccountInfo.getConnectedContracts(account);
        return res
                .status(200)
                .json({ accountInfo: { accountAge, connectedContracts } });
});

app.post("/verify/:platform", async (req, res) => {
        const { platform } = req.params;
        let { accountId, handle, proof, challenge } = req.body;

        if (platform in verifiers) {
                const { [platform]: verifier } = verifiers;

                // @TODO: Implement new Challenge signature in order to get accountId and handle
                const verifiedResult = await verifier.verify(
                        accountId,
                        handle,
                        proof,
                        challenge,
                );
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
                                proof,
                        });

                        if (WEB2_PLATFORMS.includes(platform)) {
                                return res.status(200).json({
                                        ...badge,
                                        handle: handle,
                                });
                        }

                        return res.status(200).json(badge);
                }

                return res.status(401).send("Unauthorized");
        }

        return res.status(400).json({
                error: "Bad request",
        });
});

app.post("/challenge/:platform", async (req, res) => {
        const { platform } = req.params;
        const { accountId, handle } = req.body;

        if (platform in verifiers) {
                const { [platform]: verifier } = verifiers;
                const challenge = await verifier.getChallenge(
                        accountId,
                        handle,
                );

                return res.status(200).json({
                        challenge,
                });
        }

        return res.status(400);
});

// make a route /sign/connected-contracts that gets the number of connected contracts for a given accountId and issues a signarue
app.post("/sign/connected-contracts", async (req, res) => {
        try {
                const { accountId } = req.body;
                const connectedContracts =
                        await NearAccountInfo.getConnectedContracts(accountId);

                try {
                        const signature =
                                await badger.issueSignedAccountInfoStamp({
                                        accountId,
                                        accountInfo: connectedContracts,
                                });
                        return res.status(200).json({ signature });
                } catch (error) {
                        return res.status(500).json({
                                error: "Unable to sign message. Please try again",
                        });
                }
        } catch (error) {
                return res
                        .status(500)
                        .json({ error: "Unable to verify account info" });
        }
});

app.post("/sign/account-age", async (req, res) => {
        try {
                const { accountId } = req.body;
                const accountInfo =
                        await NearAccountInfo.getAccountAge(accountId);

                try {
                        const signature =
                                await badger.issueSignedAccountInfoStamp({
                                        accountId,
                                        accountInfo,
                                });
                        return res.status(200).json({ signature });
                } catch (error) {
                        return res.status(500).json({
                                error: "Unable to sign message. Please try again",
                        });
                }
        } catch (error) {
                return res
                        .status(500)
                        .json({ error: "Unable to verify account info" });
        }
});

app.post("/sign/account-balance", async (req, res) => {
        try {
                const { accountId } = req.body;
                const accountInfo =
                        await NearAccountInfo.getAccountBalance(accountId);

                try {
                        const signature =
                                await badger.issueSignedAccountInfoStamp({
                                        accountId,
                                        accountInfo,
                                });
                        return res.status(200).json({ signature });
                } catch (error) {
                        return res.status(500).json({
                                error: "Unable to sign message, Please try again",
                        });
                }
        } catch (error) {
                return res
                        .status(500)
                        .json({ error: "Unable to verify account info" });
        }
});

app.post("/sign/account/social-followers", async (req, res) => {
        try {
                const { accountId } = req.body;
                const accountInfo =
                        await NearAccountInfo.getAccountSocialFollowers(
                                accountId,
                        );

                try {
                        const signature =
                                await badger.issueSignedAccountInfoStamp({
                                        accountId,
                                        accountInfo,
                                });
                        return res.status(200).json({ signature });
                } catch (error) {
                        return res.status(500).json({
                                error: "Unable to sign message. Please try again",
                        });
                }
        } catch (error) {
                return res.status(500).json({
                        error: `Unable to verify account near social info`,
                });
        }
});

app.post("/sign/account/social-followings", async (req, res) => {
        try {
                const { accountId } = req.body;
                const accountInfo =
                        await NearAccountInfo.getAccountSocialFollowings(
                                accountId,
                        );

                try {
                        const signature =
                                await badger.issueSignedAccountInfoStamp({
                                        accountId,
                                        accountInfo,
                                });
                        return res.status(200).json({ signature });
                } catch (error) {
                        return res.status(500).json({
                                error: "Unable to sign message. Please try again",
                        });
                }
        } catch (error) {
                return res.status(500).json({
                        error: "Unable to verify account near social info",
                });
        }
});

app.post("/sign/account/transaction-count", async (req, res) => {
        try {
                const { accountId } = req.body;
                const accountInfo =
                        await NearAccountInfo.getAccountTxnInfo(accountId);

                try {
                        const signature =
                                await badger.issueSignedAccountInfoStamp({
                                        accountId,
                                        accountInfo,
                                });
                        return res.status(200).json({ signature });
                } catch (error) {
                        return res.status(500).json({
                                error: "Unable to sign message. Please try again",
                        });
                }
        } catch (error) {
                return res
                        .status(500)
                        .json({ error: "Unable to verify account txn info" });
        }
});

export default app;
