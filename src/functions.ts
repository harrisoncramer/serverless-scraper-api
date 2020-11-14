import "source-map-support/register";
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { isString } from "./util";
import axios from "axios";
import { setupPuppeteer } from "./puppeteer";

interface InputType {
  url: string;
  puppeteer: boolean;
}

export const getHtml: APIGatewayProxyHandler = async (
  event,
  _context,
  callback
): Promise<APIGatewayProxyResult> => {
  let inputString = isString(event.body)
    ? event.body
    : JSON.stringify(event.body);
  let input: InputType = JSON.parse(inputString);

  // Get body from provided url...
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

  // Return body to requester...
  try {
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
