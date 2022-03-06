import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { sessionOptions } from "../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";

import initMiddleware from "../../lib/init-middleware";
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
