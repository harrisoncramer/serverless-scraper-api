import puppeteer from "puppeteer";
import axios from "axios";
import { setupPuppeteer } from "./puppeteer";

export class Navigator {
  browser: puppeteer.Browser;
  page: puppeteer.Page;
  err: Error;
  html: string;
  constructor(
    public isPuppeteer: boolean = false,
    public initialized: boolean = false
  ) {}

  // If puppeteer passed during creation, create browser and page
  async init() {
    if (this.isPuppeteer) {
      try {
        const browser = await setupPuppeteer();
        this.browser = browser;
        const page = await this.browser.newPage();
        await setPageBlockers(page);
        this.page = page;
      } catch (err) {
        this.err = err;
      }
      this.initialized = true;
    }
  }

  async getHtml(link: string) {
    if (!this.initialized && this.isPuppeteer) {
      console.log(this.err);
      throw new Error("Navigator is not initialized.");
    }

    try {
      if (this.isPuppeteer) {
        await this.page.goto(link);
        this.html = await this.page.evaluate(() => document.body.innerHTML);
        await this.browser.close();
      } else {
        let res = await axios.get(link);
        this.html = res.data;
        if (res.status !== 200) {
          throw new Error(`Site ${link} could not be reached.`);
        }
      }
    } catch (err) {
      // If browser exists and is connected, close it.
      if (this.browser && this.browser.isConnected()) {
        await this.browser.close();
      }
      this.err = err;
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
