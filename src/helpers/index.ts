import "source-map-support/register";
import { APIGatewayProxyResult, APIGatewayProxyEvent } from "aws-lambda";
import { isString } from "../util";

export const parseInput = (event: APIGatewayProxyEvent) => {
  let inputString = isString(event.body)
    ? event.body
    : JSON.stringify(event.body);
  let input = JSON.parse(inputString);
  return input;
};

export const createError = (e: Error): APIGatewayProxyResult => {
  // Log error and return to user.
  console.error("❌", e);
  return {
    statusCode: 502,
    body: JSON.stringify({ error: e.message }),
  };
};

export const createSuccess = (body: string): APIGatewayProxyResult => {
  return {
    statusCode: 200,
    body,
  };
};
