import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { Fido2Lib } from "@dannymoerkerke/fido2-lib";
import crypto from "crypto";
import base64url from "base64url";
import { sessionOptions } from "../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import absoluteUrl from "next-absolute-url";

import initMiddleware from "../../lib/init-middleware";
import { l, ll } from "../../lib/log";

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ["GET", "POST", "OPTIONS"],
  })
);

const fido = new Fido2Lib({
  timeout: 60000,
  rpId: "localhost",
  rpName: "What PWA Can Do Today",
  rpIcon: "https://whatpwacando.today/src/img/icons/icon-512x512.png",
  challengeSize: 128,
  attestation: "none",
  cryptoParams: [-7, -257],
  authenticatorAttachment: "platform",
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: "required",
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  ll("register service");
  const { credential } = req.body;
  const challenge = new Uint8Array(req.session.challenge.data).buffer;
  credential.rawId = new Uint8Array(
    Buffer.from(credential.rawId, "base64")
  ).buffer;
  credential.response.attestationObject = base64url.decode(
    credential.response.attestationObject,
    "base64"
  );
  credential.response.clientDataJSON = base64url.decode(
    credential.response.clientDataJSON,
    "base64"
  );
  const { origin } = absoluteUrl(req);
  ll("origin", origin);
  const attestationExpectations = {
    challenge,
    origin: "https://localhost:3000",
    factor: "either",
  };

  try {
    const regResult = await fido.attestationResult(
      credential,
      attestationExpectations
    );

    req.session.publicKey = regResult.authnrData.get("credentialPublicKeyPem");
    req.session.prevCounter = regResult.authnrData.get("counter");
    await req.session.save();
    res.json({ status: "ok" });
  } catch (e) {
    console.log("error", e);
    res.status(500).json({ status: "failed" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default withIronSessionApiRoute(handler, sessionOptions);
