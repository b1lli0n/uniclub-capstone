const config = require("../config/env");
const authService = require("../services/auth.service");

const loginWithFeid = async (req, res, next) => {
  try {
    const { codeVerifier, state, loginUrl } = authService.generateFeidAuthData();

    res.cookie("feid_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    res.cookie("feid_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return res.redirect(loginUrl);
  } catch (error) {
    next(error);
  }
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

    const { token } = await authService.handleFeidCallback({
      code,
      codeVerifier,
      state,
      savedState,
    });

    res.clearCookie("feid_code_verifier");
    res.clearCookie("feid_state");

    return res.redirect(`${config.frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("FEID callback error:", error.response?.data || error.message);

    return res.status(error.statusCode || 500).json({
      message: "FEID callback failed",
      error: error.response?.data || error.message,
    });
  }
};

const devLogin = async (req, res) => {
  try {
    const { email } = req.query;
    const { token } = await authService.devLogin(email);

    return res.redirect(`${config.frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Dev login error:", error);
    return res.status(error.statusCode || 500).json({
      message: "Dev login failed",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({
    message: "Logout successfully",
  });
};

const passport = require("../config/passport");

const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect(
        `${config.frontendURL}/login?error=${encodeURIComponent(
          err.message || "Authentication failed"
        )}`
      );
    }
    if (!user) {
      const msg = info?.message || "Only FPT email is allowed";
      return res.redirect(
        `${config.frontendURL}/login?error=${encodeURIComponent(msg)}`
      );
    }

    const token = authService.generateUserToken(user);
    return res.redirect(`${config.frontendURL}/auth/callback?token=${token}`);
  })(req, res, next);
};

module.exports = {
  loginWithFeid,
  feidCallback,
  devLogin,
  logout,
  googleCallback,
};