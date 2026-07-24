import express from "express";
import cors from "cors";
import http from "http"; // Import standard Node HTTP module

import { metricsRoute } from "../routes/metrics.js";
import { newsRoute } from "../routes/news.js";
import { profileRoute } from "../routes/profile.js";

export class RestServer {
    private readonly app = express();
    private readonly server: http.Server; // Explicitly manage the server instance

    constructor() {
        this.app.use(
            cors({
                origin: "http://localhost:5173",
            }),
        );

        this.app.use(express.json());

        this.app.get("/api/profile/:symbol", profileRoute);
        this.app.get("/api/metrics/:symbol", metricsRoute);
        this.app.get("/api/news/:symbol", newsRoute);

        this.app.get("/health", (_, res) => {
            res.json({ status: "ok" });
        });

        this.app.use((_, res) => {
            res.status(404).json({ error: "Route not found" });
        });

        // FIXED: Wrap the express app into a native HTTP server
        this.server = http.createServer(this.app);
    }

    // Expose the raw server instance to hook the WebSocket server to it
    getHttpServer(): http.Server {
        return this.server;
    }

    // Listen exclusively on Cloud Run's single allocated port interface
    start(port: number) {
        this.server.listen(port, "0.0.0.0", () => {
            console.log(`Unified REST & WS Server running on port ${port}`);
        });
    }

    stop() {
        this.server.close();
    }
}
