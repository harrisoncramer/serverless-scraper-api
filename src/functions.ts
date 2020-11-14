import "source-map-support/register";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
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

const parseInput = (event: APIGatewayProxyEvent) => {
  let inputString = isString(event.body)
    ? event.body
    : JSON.stringify(event.body);
  let input = JSON.parse(inputString);
  return input;
};

export const getLinks: APIGatewayProxyHandler = async (
  event,
  _context,
  callback
): Promise<APIGatewayProxyResult> => {
  let input: InputWithSelector = parseInput(event);
  const navigator = new Navigator(input.puppeteer);
  await navigator.init();
  await navigator.getHtml(input.url);
  if (navigator.err) {
    // If navigator fails, throw callback...
    callback(navigator.err);
  }
  const parser = new Parser(navigator.html, input.selector);
  const links = parser.getLinks({
    onlyUnique: input.unique,
    limit: input.limit,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ links }),
  };
};

export const getHtml: APIGatewayProxyHandler = async (
  event,
  _context,
  callback
): Promise<APIGatewayProxyResult> => {
  try {
    let input: InputType = parseInput(event);
    const navigator = new Navigator(input.puppeteer);
    await navigator.init();
    await navigator.getHtml(input.url);
    if (navigator.err) {
      callback(navigator.err);
    }
    let response = {
      statusCode: 200,
      body: navigator.html,
    };
    return response;
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
