import { PuppeteerNavigator } from "../Navigator";
import { createError, createSuccess } from "./helpers";
import { handler } from "./Types";
import { wait } from "../util";

export const getSenateDisclosures: handler = async (_event, _context) => {
  try {
    const navigator = new PuppeteerNavigator();
    await navigator.init();
    await navigator.goto("https://efdsearch.senate.gov/search/home/");
    await navigator.clickAndWait("#agree_statement");
    await navigator.click(".form-check-input");
    await navigator.clickAndWait(".btn-primary");
    await navigator.clickAndWaitForResponse(
      "#filedReports th:nth-child(5)",
      "https://efdsearch.senate.gov/search/report/data/"
    );
    await navigator.clickAndWaitForResponse(
      "#filedReports th:nth-child(5)",
      "https://efdsearch.senate.gov/search/report/data/"
    );

    await wait(1000);
    await navigator.setHtmlFromCurrentPage();
    await navigator.close();
    return createSuccess(navigator.html);
  } catch (err) {
    return createError(err);
  }
};
