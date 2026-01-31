import crypto from "crypto";

export function generateHash(context, events, done) {
  const cert = `CERT-${Math.random().toString(36).substring(2, 10)}`;
  const hash = crypto.createHash("sha256").update(cert).digest("hex");

  context.vars.certificateId = cert;
  context.vars.ipfsHash = hash;

  return done();
}
