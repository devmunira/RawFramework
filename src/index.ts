import { createApp } from "./Espresso";
import { Request } from "./Espresso/Request";
import { Response } from "./Espresso/Response";

const app = createApp();

app.use([
  (req, res, next) => {
    console.log("I am global Middleware");
    next();
  },
]);

app.get(
  "/",
  (req: Request, res: Response) => {
    res.status(200).json({
      message: "Hello World",
    });
  },
  [
    (req, res, next) => {
      console.log("I am home router middlewares ");
      next();
    },
  ]
);

app.get("/products/:id/reviews/:reviewId", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello World",
    params: req.params,
  });
});

app.get(
  "/products/search",
  (req: Request, res: Response) => {
    res.status(200).json({
      message: "Hello World",
      params: req.params,
      body: req.body,
      query: req.query,
    });
  },
  [
    (req, res, next) => {
      console.log("I am product serach router middlewares");
      next();
    },
  ]
);

app.on("request on", (...args: any[]) => {
  console.log(args);
});

app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
