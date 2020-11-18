import { PuppeteerNavigator } from "../Navigator";
import { Parser } from "../Parser";
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

    // Parse the data...
    const parser = new Parser(navigator.html, "#filedReports");

    const results: {
      first: string;
      last: string;
      title: string;
      date: Date;
      link: string;
    }[] = [];

    const rowLength = parser.getCheerios("tbody tr").length;
    for (let i = 0; i < rowLength; i++) {
      let row = i + 1;
      let first = parser.getNthText(
        `tbody tr:nth-child(${row}) td:nth-child(1)`
      );
      let last = parser.getNthText(
        `tbody tr:nth-child(${row}) td:nth-child(2)`
      );
      let title = parser.getNthText(
        `tbody tr:nth-child(${row}) td:nth-child(4)`
      );
      let date = new Date(
        parser.getNthText(`tbody tr:nth-child(${row}) td:nth-child(5)`)
      );
      let link = parser.getLink(`tbody tr:nth-child(${row})`);
      results.push({ first, last, title, date, link });
    }

    return createSuccess(JSON.stringify(results));
  } catch (err) {
    return createError(err);
  }
};
