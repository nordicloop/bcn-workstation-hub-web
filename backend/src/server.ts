import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import propertiesController from "./properties/controller";

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/", propertiesController);

export default server;
