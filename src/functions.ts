import "source-map-support/register";
import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
  Context,
  Callback,
} from "aws-lambda";
import { Parser } from "./Parser";
import { Navigator } from "./Navigator";
import { parseInput, createError, createSuccess } from "./helpers";

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

export const getLinks: handler = async (event, _context) => {
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

export const getHtml: handler = async (event, _context) => {
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
