const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/db");

const startServer = async () => {
  await connectDatabase();

  const keyPath = path.join(__dirname, "../localhost+2-key.pem");
  const certPath = path.join(__dirname, "../localhost+2.pem");

  // Use HTTPS only in local development when cert files exist
  if (env.nodeEnv !== "production" && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const server = https.createServer(
      {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
      app
    );

    server.listen(env.port, () => {
      console.log(`Server running on https://localhost:${env.port}`);
    });
  } else {
    // Production (Render terminates SSL automatically) or fallback
    const server = http.createServer(app);

    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  }
};

startServer();