import "source-map-support/register";
import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
  Context,
  Callback,
} from "aws-lambda";
import { isString } from "./util";
import { Parser } from "./Parser";
import { Navigator } from "./Navigator";

interface InputType {
  url: string;
  puppeteer: boolean;
}

interface InputWithSelector extends InputType {
  selector?: string;
  unique?: boolean;
  limit?: number;
}

type handler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>
) => Promise<APIGatewayProxyResult>;

const parseInput = (event: APIGatewayProxyEvent) => {
  let inputString = isString(event.body)
    ? event.body
    : JSON.stringify(event.body);
  let input = JSON.parse(inputString);
  return input;
};

const createError = (e: Error): APIGatewayProxyResult => {
  // Log error and return to user.
  console.error("❌", e);
  return {
    statusCode: 502,
    body: JSON.stringify({ error: e.message }),
  };
};

const createSuccess = (body: string): APIGatewayProxyResult => {
  // Log success and return it.
  //console.log(body);
  return {
    statusCode: 200,
    body,
  };
};

export const getLinks: handler = async (event, context) => {
  let input: InputWithSelector = parseInput(event);
  const navigator = new Navigator(input.puppeteer);
  await navigator.init();
  await navigator.getHtml(input.url);
  if (navigator.err) {
    return createError(navigator.err);
  }
  const parser = new Parser(navigator.html, input.selector);
  const links = parser.getLinks({
    onlyUnique: input.unique,
    limit: input.limit,
  });

  return createSuccess(JSON.stringify({ links }));
};

export const getHtml: handler = async (event, context) => {
  try {
    let input: InputType = parseInput(event);
    const navigator = new Navigator(input.puppeteer);
    await navigator.init();
    await navigator.getHtml(input.url);
    if (navigator.err) {
      return createError(navigator.err);
    }
    return createSuccess(navigator.html);
  } catch (err) {
    return createError(err);
  }
};
