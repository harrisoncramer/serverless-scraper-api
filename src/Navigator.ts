import puppeteer from "puppeteer";
import { setupPuppeteer } from "./puppeteer";

export class PuppeteerNavigator {
  browser: puppeteer.Browser;
  page: puppeteer.Page;
  html: string;
  initialized: boolean = false;

  // Close down puppeteer on error and return error
  private async handleError(err: Error): Promise<Error> {
    if (this.browser && this.browser.isConnected()) {
      await this.browser.close();
    }
    return Promise.reject(err);
  }

  // If handler does not initialize the browser, throw error.
  private isInitialized(): void {
    if (!this.initialized) {
      throw new Error("Puppeteer is not initialized!");
    }
  }

  // Initialize
  async init(): Promise<void | Error> {
    try {
      const browser = await setupPuppeteer();
      this.browser = browser;
      const page = await this.browser.newPage();
      await setPageBlockers(page);
      this.page = page;
    } catch (err) {
      return await this.handleError(err);
    }

    this.initialized = true;
  }

  async close(): Promise<void> {
    this.isInitialized();
    await this.browser.close();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  async goto(link: string) {
    this.isInitialized();
    try {
      await this.page.goto(link);
    } catch (err) {
      return await this.handleError(err);
    }
  }

  async click(selector: string) {
    this.isInitialized();
    try {
      await this.page.click(selector);
    } catch (err) {
      return await this.handleError(err);
    }
  }

  async clickAndWait(selector: string) {
    this.isInitialized();
    try {
      await Promise.all([
        this.page.click(selector),
        this.page.waitForNavigation(),
      ]);
    } catch (err) {
      return await this.handleError(err);
    }
  }

  async clickAndWaitForResponse(selector: string, url: string) {
    this.isInitialized();
    try {
      await Promise.all([
        this.page.click(selector),
        this.page.waitForResponse(url),
      ]);
    } catch (err) {
      return await this.handleError(err);
    }
  }

  async setHtml(link: string) {
    this.isInitialized();
    try {
      await this.page.goto(link);
      this.html = await this.page.evaluate(() => document.body.innerHTML);
    } catch (err) {
      return await this.handleError(err);
    }
  }

  async setHtmlFromCurrentPage() {
    this.isInitialized();
    try {
      const html = await this.page.evaluate(() => document.body.innerHTML);
      this.html = html;
    } catch (err) {
      return await this.handleError(err);
    }
  }
}

const setPageBlockers = async (page: puppeteer.Page) => {
  await page.setRequestInterception(true);
  const blockedResources = [
    "quantserve",
    "adzerk",
    "doubleclick",
    "adition",
    "exelator",
    "sharethrough",
    "twitter",
    "google-analytics",
    "fontawesome",
    "facebook",
    "analytics",
    "optimizely",
    "clicktale",
    "mixpanel",
    "zedo",
    "clicksor",
    "tiqcdn",
    "googlesyndication",
    "youtube",
  ];

  page.on("request", async (request) => {
    const url = request.url().toLowerCase();
    // const headers = request.headers();
    if (
      url.endsWith(".mp4") ||
      url.endsWith(".avi") ||
      url.endsWith(".flv") ||
      url.endsWith(".mov") ||
      url.endsWith(".wmv") ||
      ["image", "stylesheet", "media", "jpg", "png"].includes(
        request.resourceType()
      ) ||
      blockedResources.some((resource) => url.indexOf(resource) !== -1)
    ) {
      try {
        await request.abort();
      } catch (err) {
        if (err.message !== "Request is already handled!") {
          console.error(`Problem blocking resource from ${url}`);
        }
      }
    } else {
      try {
        await request.continue();
      } catch (err) {
        if (err.message !== "Request is already handled!") {
          console.error(`Problem blocking resource from ${url}`);
        }
      }
    }
  });
};
