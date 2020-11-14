import "source-map-support/register";
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { isString } from "./util";
import axios from "axios";
import { setupPuppeteer } from "./puppeteer";
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

export const getLinks: APIGatewayProxyHandler = async (
  event,
  _context,
  callback
): Promise<APIGatewayProxyResult> => {
  let inputString = isString(event.body)
    ? event.body
    : JSON.stringify(event.body);
  let input: InputWithSelector = JSON.parse(inputString);
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
    // Get provided url
    let inputString = isString(event.body)
      ? event.body
      : JSON.stringify(event.body);
    let input: InputType = JSON.parse(inputString);

    // Get body of page from url
    let body: string;
    if (input.puppeteer) {
      const browser = await setupPuppeteer();
      const page = await browser.newPage();
      await page.goto(input.url);
      body = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
    } else {
      let res = await axios.get(input.url);
      body = res.data;
      if (res.status !== 200) {
        throw new Error(`Site ${input.url} could not be reached.`);
      }
    }

    // Return body.
    let response = {
      statusCode: 200,
      body,
    };
    return response;
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
