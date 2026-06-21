const https = require("https");
const fs = require("fs");
const path = require("path");

const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/db");

const startServer = async () => {
  await connectDatabase();

  const server = https.createServer(
    {
      key: fs.readFileSync(
        path.join(__dirname, "../localhost+2-key.pem")
      ),
      cert: fs.readFileSync(
        path.join(__dirname, "../localhost+2.pem")
      ),
    },
    app
  );

  server.listen(env.port, () => {
    console.log(
      `Server running on https://localhost:${env.port}`
    );
  });
};

startServer();