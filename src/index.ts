import { createApp } from "./Espresso";
import { Request } from "./Espresso/Request";
import { Response } from "./Espresso/Response";

const app = createApp();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello World",
  });
});

app.get("/products/:id/reviews/:reviewId", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello World",
    params: req.params,
  });
});

app.on("request on", (...args: any[]) => {
  console.log(args);
});

app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
