import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import crypto from "crypto";
import base64url from "base64url";
import { sessionOptions } from "../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";

import initMiddleware from "../../lib/init-middleware";
import { l, ll } from "../../lib/log";
import { fido } from "../../lib/fido";

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ["GET", "POST", "OPTIONS"],
  })
);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  ll("registration-options");
  const registrationOptions = await fido.attestationOptions();

  req.session.challenge = Buffer.from(registrationOptions.challenge);
  req.session.userHandle = crypto.randomBytes(32);

  await req.session.save();
  registrationOptions.user.id = req.session.userHandle;
  registrationOptions.challenge = Buffer.from(registrationOptions.challenge);
  // iOS
  registrationOptions.authenticatorSelection = {
    authenticatorAttachment: "platform",
  };
  res.json(registrationOptions);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default withIronSessionApiRoute(handler, sessionOptions);
