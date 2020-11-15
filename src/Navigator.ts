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

  // If puppeteer passed during creation, create browser
  async init() {
    if (this.isPuppeteer) {
      await setupPuppeteer()
        .then((browser) => {
          this.browser = browser;
        })
        .catch((err) => {
          this.err = err;
        });
    }
    this.initialized = true;
  }

  async getHtml(link: string) {
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
      // If browser exists and is connected, close it.
      if (this.browser && this.browser.isConnected()) {
        await this.browser.close();
      }
      this.err = err;
    }
  }
}
