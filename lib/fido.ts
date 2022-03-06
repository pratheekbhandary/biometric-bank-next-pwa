import { Fido2Lib } from "@dannymoerkerke/fido2-lib";

export const fido = new Fido2Lib({
  timeout: 60000,
  rpId: "biometric-bank-next-pwa.vercel.app",
  rpName: "What PWA Can Do Today",
  rpIcon: "https://whatpwacando.today/src/img/icons/icon-512x512.png",
  challengeSize: 128,
  attestation: "none",
  cryptoParams: [-7, -257],
  authenticatorAttachment: "platform",
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: "required",
});
