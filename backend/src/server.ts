import cors from "cors";
import express from "express";
import helmet from "helmet";
import propertiesController from "./properties/controller";

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

server.use("/", propertiesController);

server.get("//health", (_, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "bcn-workation-hub-api",
        version: "2.0",
    });
});

export default server;
