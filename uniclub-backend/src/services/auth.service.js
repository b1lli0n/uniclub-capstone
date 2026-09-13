const crypto = require("crypto");
const axios = require("axios");
const config = require("../config/env");
const User = require("../models/user.model");
const { createToken } = require("../middlewares/auth.middleware");
const { getStatusError } = require("../utils/error");

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(length = 64) {
  return base64UrlEncode(crypto.randomBytes(length));
}

function createCodeChallenge(codeVerifier) {
  return base64UrlEncode(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
}

const generateFeidAuthData = () => {
  const codeVerifier = randomString(64);
  const codeChallenge = createCodeChallenge(codeVerifier);
  const state = randomString(32);
  const nonce = randomString(32);

  const params = new URLSearchParams({
    client_id: config.feidClientId,
    redirect_uri: config.feidCallbackURL,
    response_type: "code",
    scope: config.feidScope,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce,
    response_mode: "query",
  });

  const loginUrl = `${config.feidAuthorizationEndpoint}?${params.toString()}`;

  return {
    codeVerifier,
    state,
    loginUrl,
  };
};

const handleFeidCallback = async ({ code, codeVerifier, state, savedState }) => {
  if (!code) {
    throw getStatusError("Missing authorization code", 400);
  }

  if (!codeVerifier) {
    throw getStatusError("Missing code verifier", 400);
  }

  if (state !== savedState) {
    throw getStatusError("Invalid state", 400);
  }

  const tokenResponse = await axios.post(
    config.feidTokenEndpoint,
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.feidClientId,
      code,
      redirect_uri: config.feidCallbackURL,
      code_verifier: codeVerifier,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const accessToken = tokenResponse.data.access_token;
  const payloadBase64 = accessToken.split(".")[1];
  const feidProfile = JSON.parse(
    Buffer.from(payloadBase64, "base64url").toString("utf8")
  );

  const email = feidProfile.email;
  const fullName =
    feidProfile.name ||
    feidProfile.fullName ||
    feidProfile.username ||
    feidProfile.email;
  const providerId = feidProfile.sub;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      full_name: fullName,
      provider: "feid",
      provider_id: providerId,
      role: "student",
    });
  }

  const token = createToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

const devLogin = async (email) => {
  if (!email) {
    throw getStatusError("Email parameter is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw getStatusError(`User with email ${email} not found`, 404);
  }

  const token = createToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

const findOrCreateGoogleUser = async (profile) => {
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw getStatusError("No email found", 400);
  }

  if (!email.endsWith("@fpt.edu.vn")) {
    throw getStatusError("Only FPT email is allowed", 400);
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      provider: "google",
      provider_id: profile.id,
      full_name: profile.displayName,
      email: email,
      avatar_url: profile.photos?.[0]?.value,
      role: "student",
    });
  }

  return user;
};

const generateUserToken = (user) => {
  return createToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });
};

module.exports = {
  generateFeidAuthData,
  handleFeidCallback,
  devLogin,
  findOrCreateGoogleUser,
  generateUserToken,
};

