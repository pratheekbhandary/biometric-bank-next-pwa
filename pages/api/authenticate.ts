import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { sessionOptions } from "../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";

import initMiddleware from "../../lib/init-middleware";
import absoluteUrl from "next-absolute-url";
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
  console.log("authenticate");
  const { credential } = req.body;

  credential.rawId = new Uint8Array(
    Buffer.from(credential.rawId, "base64")
  ).buffer;

  const challenge = new Uint8Array(req.session.challenge.data).buffer;
  const { publicKey, prevCounter } = req.session;

  if (publicKey === "undefined" || prevCounter === undefined) {
    res.status(404).json({ status: "not found" });
  } else {
    const { origin } = absoluteUrl(req);

    const assertionExpectations = {
      challenge,
      origin,
      factor: "either",
      publicKey,
      prevCounter,
      userHandle: new Uint8Array(Buffer.from(req.session.userHandle, "base64"))
        .buffer, //new Uint8Array(Buffer.from(req.session.userHandle.data)).buffer
    };

    try {
      await fido.assertionResult(credential, assertionExpectations); // will throw on error

      res.json({ status: "ok" });
    } catch (e) {
      console.log("error", e);
      res.status(500).json({ status: "failed" });
    }
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
