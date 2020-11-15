import chromium from "chrome-aws-lambda";
import { Browser } from "puppeteer";

// This function sets up a puppeteer browser and returns it
export const setupPuppeteer = async (): Promise<Browser> => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  return browser;
};
