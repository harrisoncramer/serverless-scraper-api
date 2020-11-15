import { Parser } from "../Parser";
import { PuppeteerNavigator } from "../Navigator";
import { parseInput, createError, createSuccess } from "./helpers";
import { InputWithSelector, handler } from "./Types";

export const getLinks: handler = async (event, _context) => {
  try {
    let input: InputWithSelector = parseInput(event);
    const navigator = new PuppeteerNavigator();
    await navigator.init();
    await navigator.setHtml(input.url);
    const parser = new Parser(navigator.html, input.selector);
    const links = parser.getLinks({
      onlyUnique: input.unique,
      limit: input.limit,
    });

    await navigator.close();
    return createSuccess(JSON.stringify({ links }));
  } catch (err) {
    return createError(err);
  }
};
