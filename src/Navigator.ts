import puppeteer from "puppeteer";
import axios from "axios";
import { setupPuppeteer } from "./puppeteer";

export class Navigator {
  browser: puppeteer.Browser;
  err: Error;
  html: string;
  constructor(
    public isPuppeteer: boolean = false,
    public initialized: boolean = false
  ) {}

  async init() {
    try {
      this.browser = await setupPuppeteer();
      this.initialized = true;
    } catch (err) {
      this.err = err;
    }
  }

  async getHtml(link: string) {
    // If requires browser but not initialized, throw error.
    if (!this.initialized && this.isPuppeteer) {
      console.log(this.err);
      throw new Error("Navigator is not initialized.");
    }

    try {
      if (this.isPuppeteer) {
        const page = await this.browser.newPage();
        await page.goto(link);
        this.html = await page.evaluate(() => document.body.innerHTML);
        await this.browser.close();
      } else {
        let res = await axios.get(link);
        this.html = res.data;
        if (res.status !== 200) {
          throw new Error(`Site ${link} could not be reached.`);
        }
      }
    } catch (err) {
      await this.browser.close();
      this.err = err;
    }
  }
}
