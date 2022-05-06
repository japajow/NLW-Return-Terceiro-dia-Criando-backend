import express from "express";
import { routes } from "./routes";

import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const port = 3333;
app.listen(process.env.PORT || port, () => {
  console.log("Http server running" + port);
});
