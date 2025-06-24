import { TemplateRender } from "./TemplateRender";
import fs from "fs";
import path from "path";
import { TemplateParser } from "./TemplateParser";
import { Context } from "./types";
import { Writable } from "stream";

export class TemplateEngine {
  private renderer: TemplateRender;
  private viewsDir: string;
  private partialsDir: string;

  constructor(viewsDir: string = path.join(process.cwd(), "src", "views")) {
    this.viewsDir = viewsDir;
    this.partialsDir = path.join(viewsDir, "partials");

    const parser = new TemplateParser("");
    this.loadPartials(parser);
    this.renderer = new TemplateRender(parser.getPartials());
  }

  private loadPartials(parser: TemplateParser) {
    if (!fs.existsSync(this.partialsDir)) return;

    const files = fs
      .readdirSync(this.partialsDir)
      .filter((f) => f.endsWith(".html"));

    for (const file of files) {
      const partialName = path.basename(file, ".html");
      const content = fs.readFileSync(
        path.join(this.partialsDir, file),
        "utf-8"
      );
      parser.registerPartial(partialName, content);
    }
  }

  async renderToStream(
    templateName: string,
    context: Context,
    stream: Writable
  ) {
    return new Promise((resolve, reject) => {
      const templatePath = path.join(this.viewsDir, `${templateName}.html`);
      console.log(path.join(this.viewsDir, `${templateName}.html`));

      if (!fs.existsSync(templatePath)) {
        reject(new Error(`Template ${templateName} not found`));
        return;
      }

      const template = fs.readFileSync(templatePath, "utf-8");
      const parser = new TemplateParser(template);
      const nodes = parser.parse();

      this.renderer.render(nodes, context, stream);
      stream.on("finish", resolve);
      stream.on("error", reject);

      stream.end();
    });
  }

  async render(templateName: string, context: Context) {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });

      stream.on("finish", () => {
        resolve(Buffer.concat(chunks).toString("utf-8"));
      });

      stream.on("error", reject);

      this.renderToStream(templateName, context, stream);
    });
  }
}
