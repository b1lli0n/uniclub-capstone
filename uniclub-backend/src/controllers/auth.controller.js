const crypto = require("crypto");
const config = require("../config/env");
const axios = require("axios");
const User = require("../models/user.model");
const { createToken } = require("../middlewares/auth.middleware");

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

const loginWithFeid = async (req, res) => {
  const codeVerifier = randomString(64);
  const codeChallenge = createCodeChallenge(codeVerifier);
  const state = randomString(32);
  const nonce = randomString(32);

  // Tạm thời log ra để test trước
  console.log("FEID codeVerifier:", codeVerifier);
  //lưu codeVerifier và state vào cookie để sử dụng trong callback

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

  res.cookie("feid_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax"
    })

    res.cookie("feid_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax"
    })

  return res.redirect(loginUrl);
};

const feidCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.status(400).json({
        message: "FEID login failed",
        error,
        error_description,
      });
    }

    const savedState = req.cookies.feid_state;
    const codeVerifier = req.cookies.feid_code_verifier;

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    if (!codeVerifier) {
      return res.status(400).json({ message: "Missing code verifier" });
    }

    if (state !== savedState) {
      return res.status(400).json({
        message: "Invalid state",
        receivedState: state,
        savedState,
      });
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

    console.log("FEID profile:", feidProfile);

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
    
    res.clearCookie("feid_code_verifier");
    res.clearCookie("feid_state");

    return res.redirect(`${config.frontendURL}/auth/callback?token=${token}`);

    // return res.json({
    //   message: "FEID token exchange success",
    //   tokenData: tokenResponse.data,
    // });
  } catch (error) {
    console.error("FEID callback error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "FEID callback failed",
      error: error.response?.data || error.message,
    });
  }
};

const devLogin = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found` });
    }

    const token = createToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return res.redirect(`${config.frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Dev login error:", error);
    return res.status(500).json({ message: "Dev login failed", error: error.message });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({
    message: 'Logout successfully',
  })
}

module.exports = {
  loginWithFeid,
  feidCallback,
  devLogin,
  logout
};