# 🚀 Serverless Webscraping Functions

Endpoints that do webscraping for you! Just send over the options provided for each endpoint and the Lambda function will scrape the page, and then return the results of your query.

The functions are written in Typescript, and deployed with Serverless.

## Installation

`yarn install`

## Development

To spin up the development server locally, run `yarn dev`

This is an alias for the `serverless offline` command which uses the serverless-offline plugin to spin up a development server with our lambdas at various endpoints.

The functions can then be hit with Postman, Curl, or another service.

## Deployment

`yarn deploy:prod`

This command set the `NODE_ENV` to production, loading the correct environment variables, and then deploys the function to the cloud (configuration inside the `serverless.ts` file) on the prod stage.

You can also deploy to the dev stage with the `yarn deploy:dev` command, which is an alias for the development stage with serverless.
