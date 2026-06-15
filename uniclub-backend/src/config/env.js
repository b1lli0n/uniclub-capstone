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
  
  universityEmailDomain: process.env.UNIVERSITY_EMAIL_DOMAIN
};
