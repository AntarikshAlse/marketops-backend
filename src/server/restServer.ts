import express from "express";
import cors from "cors";

import { metricsRoute } from "../routes/metrics.js";
import { newsRoute } from "../routes/news.js";
import { profileRoute } from "../routes/profile.js";

export class RestServer {
    private readonly app = express();

    private server?: ReturnType<typeof this.app.listen>;

    constructor(private readonly restPort: number) {
        this.app.use(
            cors({
                origin: "http://localhost:5173",
            }),
        );

        this.app.use(express.json());

        this.app.get(
            "/api/profile/:symbol",
            profileRoute,
        );

        this.app.get(
            "/api/metrics/:symbol",
            metricsRoute,
        );

        this.app.get(
            "/api/news/:symbol",
            newsRoute,
        );

        this.app.get("/health", (_, res) => {
            res.json({
                status: "ok",
            });
        });

        this.app.use((_, res) => {
            res.status(404).json({
                error: "Route not found",
            });
        });
    }

    start() {
        this.server = this.app.listen(
            this.restPort,
            () => {
                console.log(
                    `REST API running on http://localhost:${this.restPort}`,
                );
            },
        );
    }

    stop() {
        this.server?.close();
    }
}