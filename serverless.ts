import type { Serverless, Functions } from "serverless/aws";
import * as funcs from "./src/functions";

// Create our POST functions
const functions: Functions = {};
for (const func in funcs) {
  functions[func] = {
    handler: `index.${func}`,
    timeout: 30,
    events: [
      {
        http: {
          method: "post",
          path: `${func}`,
          //async: true,
        },
      },
    ],
  };
}

const serverlessConfiguration: Serverless = {
  service: "webscraper-apis",
  frameworkVersion: "2",
  custom: {
    dotenv: {
      logging: false,
    },
    // Set offline port for the http server and
    // the lambdaPort to specify the AWS function
    "serverless-offline": {
      lambdaPort: 4000,
      httpPort: 4001,
    },
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
      forceExclude: ["puppeteer"],
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
