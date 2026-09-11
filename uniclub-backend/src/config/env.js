const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT,
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,

  frontendURL: process.env.FRONTEND_URL,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleCallbackURL: process.env.GOOGLE_CALLBACK_URL,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  
  feidIssuer: process.env.FEID_ISSUER,
  feidAuthorizationEndpoint: process.env.FEID_AUTHORIZATION_ENDPOINT,
  feidClientId: process.env.FEID_CLIENT_ID,
  feidCallbackURL: process.env.FEID_CALLBACK_URL,
  feidScope: process.env.FEID_SCOPE,

  feidTokenEndpoint: process.env.FEID_TOKEN_ENDPOINT,
  feidUserInfoEndpoint: process.env.FEID_USERINFO_ENDPOINT,
  
  universityEmailDomain: process.env.UNIVERSITY_EMAIL_DOMAIN,

  vnpTmnCode: process.env.vnp_TmnCode,
  vnpHashSecret: process.env.vnp_HashSecret,
  vnpUrl: process.env.vnp_Url,
  vnpReturnUrl: process.env.vnp_ReturnUrl,
  vnpIpnUrl: process.env.vnp_IpnUrl,
  frontendVnpReturnUrl: process.env.FRONTEND_VNP_RETURN_URL
};

