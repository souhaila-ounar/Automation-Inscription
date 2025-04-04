import express from "express";
import { tutoratRoutes } from "./routes/clientRoute";
import { fallbackWorker } from "./workers/fallbackProcessor";
const app = express();
const port = 3000;

app.use(express.json());
app.use("/api", tutoratRoutes);

app.listen(port, () => {
  console.log("Server running on http://localhost:3000");
});
