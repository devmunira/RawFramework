import { Request, Response } from "@src/Espresso";
import { Handler, NextFunction } from "@src/Espresso/types";
const home = require("../../data/home.json");
const about = require("../../data/about.json");
const posts = require("../../data/post.json");

export class Controller {
  public static home: Handler = (
    req: Request,
    res: Response,
    next?: NextFunction
  ): void | Promise<void> => {
    try {
      res.render("home", { title: home.banner.title, data: home });
    } catch (error) {
      res.status(500).redirect("/server-error");
    }
  };

  public static about: Handler = (
    req: Request,
    res: Response,
    next?: NextFunction
  ): void | Promise<void> => {
    try {
      res.render("about", { title: home.banner.title, data: about });
    } catch (error) {
      res.status(500).redirect("/server-error");
    }
  };

  public static posts: Handler = (
    req: Request,
    res: Response,
    next?: NextFunction
  ): void | Promise<void> => {
    try {
      res.render("posts", { title: home.banner.title, data: posts });
    } catch (error) {
      res.status(500).redirect("/server-error");
    }
  };

  public static contact: Handler = (
    req: Request,
    res: Response,
    next?: NextFunction
  ): void | Promise<void> => {
    try {
      res.render("contact", { title: home.banner.title, data: home });
    } catch (error) {
      res.status(500).redirect("/server-error");
    }
  };
}
