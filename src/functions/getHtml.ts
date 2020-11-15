import { PuppeteerNavigator } from "../Navigator";
import { parseInput, createError, createSuccess } from "./helpers";
import { InputType, handler } from "./Types";

export const getHtml: handler = async (event, _context) => {
  try {
    let input: InputType = parseInput(event);
    const navigator = new PuppeteerNavigator();
    await navigator.init();
    await navigator.setHtml(input.url);
    await navigator.close();
    return createSuccess(navigator.html);
  } catch (err) {
    return createError(err);
  }
};
