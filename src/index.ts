import { createApp } from "./Espresso";

const app = createApp();

app.on("request on", (...args: any[]) => {
  console.log(args);
});

app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
