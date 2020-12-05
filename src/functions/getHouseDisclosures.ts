//import { PuppeteerNavigator } from "../Navigator";
import { Parser } from "../Parser";
import { createError, createSuccess } from "./helpers";
import { handler } from "./Types";
import { isString } from "../util";
import axios from "axios";

export const getHouseDisclosures: handler = async (_event, _context) => {
  try {
    let res = await axios.post(
      "https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure/ViewMemberSearchResult",
      "LastName=&FilingYear=2020&State=&District=",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,ar;q=0.8,af;q=0.7,ru;q=0.6",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          cookie:
            "_ga=GA1.2.1885079424.1605024094; _gid=GA1.2.1594900103.1607029709; _gat=1",
        },
      }
    );

    const results: {
      office: string;
      first: string;
      last: string;
      title: string;
      year: number;
      link: string;
    }[] = [];

    let html: string = res.data;
    const parser = new Parser(html);
    const rowLength = parser.getCheerios("tbody tr").length;
    for (let i = 0; i < rowLength; i++) {
      let row = i + 1;
      let name = parser.getNthText(
        `tbody tr:nth-child(${row}) td:nth-child(1)`
      );
      let last = name.split(",")[0];
      let first = name.split(",")[1].replace(" Hon.. ", "");

      let baseLink = "https://disclosures-clerk.house.gov";
      let link = parser.getLink(`tbody tr:nth-child(${row})`);
      if (isString(link)) {
        link = baseLink.concat(link);
      }

      let office = parser.getNthText(
        `tbody tr:nth-child(${row}) td:nth-child(2)`
      );
      let year = parseInt(
        parser.getNthText(`tbody tr:nth-child(${row}) td:nth-child(3)`)
      );
      let title = parser.getNthText(
        `tbody tr:nth-child(${row}) td:nth-child(4)`
      );

      results.push({ title, office, year, link, first, last });
    }

    return createSuccess(JSON.stringify(results));
  } catch (err) {
    return createError(err);
  }

  createSuccess("OK");
};