import { Controller } from "./controller/Controller";
import { createApp } from "./Espresso";
import { auth } from "./middlewares";
import { cors } from "./middlewares/cors";
import { CustomLogger } from "./middlewares/customLog";
import path from "path";
import { staticFiles } from "./middlewares/staticFiles";

const app = createApp();

// Global Middleware
app.use([
  CustomLogger(),
  staticFiles(path.join(__dirname, "../public")),
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
      "X-API-Key",
      "Range",
    ],
    credentials: true,
  }),
]);

// Define Router
app.get("/", Controller.home);
app.get("/about", Controller.about);
app.get("/posts", Controller.posts, [auth]);
app.get("/contact", Controller.contact);

// Server Error Page Route
app.get("/server-error", async (req, res) => {
  await res.render("server-error", {
    title: "Server Error",
    message: "An unexpected error occurred",
  });
});

app.get("/not-found", async (req, res) => {
  await res.render("not-found", {
    title: "Resources Not Found",
    message: "Return to home page",
  });
});

// Server is listening
app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
