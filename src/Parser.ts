import cheerio from "cheerio";
import { unique, limitList, isString } from "./util";

interface QueryOpts {
  onlyUnique?: boolean;
  limit?: number;
}

type Flags = "g" | "gi";

const convertToString = (el: cheerio.Element): string =>
  cheerio(el).text().trim();

export class Parser {
  root: cheerio.Root;
  private readonly oldRoot: cheerio.Root;

  constructor(public html: string, public discriminator: string = "*") {
    this.root = cheerio.load(html);
    this.oldRoot = cheerio.load(html);
  }

  discriminate(query: string = "*"): void {
    this.discriminator = query;
  }

  activateSubroot(
    query: string,
    frontPad: string = "",
    endPad: string = ""
  ): void {
    let newHtml = this.root(query).html();
    this.root = cheerio.load(frontPad + newHtml + endPad);
    console.log(this.root("*").html());
  }

  // Return oldRoot to becoming root.
  deactivateSubroot(): void {
    this.root = this.oldRoot;
  }

  getHtml(query: string): string[] {
    return this.root(`${this.discriminator}`)
      .find(query)
      .toArray()
      .map((x) => this.root(x).html());
  }

  getCheerios(query: string): cheerio.Cheerio {
    return this.root(query);
  }

  // Strings...
  getTexts(query: string, opts: QueryOpts): string[] {
    return this.root(`${this.discriminator} ${query}`)
      .toArray()
      .map(convertToString)
      .filter(limitList(opts.limit));
  }

  getTextsWithRegex(query: string, flags: Flags, _opts: QueryOpts): string[] {
    const regex = new RegExp(query, flags);
    return this.root(`${this.discriminator} ${query}`)
      .toArray()
      .filter((x) => {
        const text = this.root(x).text();
        return text.match(regex);
      })
      .map(convertToString);
  }

  getNthText(query: string, instanceOf?: number): string {
    return instanceOf
      ? this.root(query).eq(instanceOf).text().trim()
      : this.root(query).first().text().trim();
  }

  getLinks(opts: QueryOpts): string[] {
    const links = this.root(`${this.discriminator} a`)
      .toArray()
      .map((x) => this.root(x).attr("href"))
      .filter((x): x is string => isString(x))
      .filter(limitList(opts.limit));
    return opts.onlyUnique ? unique<string>(links) : links;
  }

  getLink(query: string): string {
    return this.root(`${query} a`).attr("href");
  }

  // Elements
  getElements(query: string, opts: QueryOpts): cheerio.Element[] {
    return this.root(`${this.discriminator} ${query}`)
      .toArray()
      .filter(limitList(opts.limit));
  }

  // Cheerios...
  getNthCheerio(query: string, instanceOf?: number): cheerio.Cheerio {
    return instanceOf
      ? this.root(query).eq(instanceOf)
      : this.root(query).first();
  }
}
