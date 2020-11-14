import type { Serverless, Functions } from "serverless/aws";
import * as funcs from "./src/functions";

// Create our POST functions
const functions: Functions = {};
for (const func in funcs) {
  functions[func] = {
    handler: `index.${func}`,
    events: [
      {
        http: {
          method: "post",
          path: `${func}`,
        },
      },
    ],
  };
}

const serverlessConfiguration: Serverless = {
  service: "serverless-typescript-template",
  frameworkVersion: "2",
  custom: {
    dotenv: {
      logging: false,
    },
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: [
    "serverless-webpack",
    "serverless-offline",
    "serverless-dotenv-plugin",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      secret: "${env:SECRET}",
    },
  },
  // Add our functions...
  functions,
};

module.exports = serverlessConfiguration;
