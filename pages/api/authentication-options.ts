import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { Fido2Lib } from "@dannymoerkerke/fido2-lib";
import crypto from "crypto";
import base64url from "base64url";
import { sessionOptions } from "../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";

import initMiddleware from "../../lib/init-middleware";

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
  console.log("authentication-options");
  const authnOptions = await fido.assertionOptions();

  req.session.challenge = Buffer.from(authnOptions.challenge);
  await req.session.save();
  authnOptions.challenge = Buffer.from(authnOptions.challenge);

  res.json(authnOptions);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default withIronSessionApiRoute(handler, sessionOptions);
