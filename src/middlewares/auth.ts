import { Request, Response } from "@src/Espresso";
import { NextFunction } from "./../Espresso/types";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  console.log(`I am from auth middleware`);
  //Do all logics here

  next();
};
