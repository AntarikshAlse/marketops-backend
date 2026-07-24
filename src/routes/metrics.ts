import type {
    Request,
    Response,
} from "express";

import { finnhubService } from "../services/finnhub.service.js";

export async function metricsRoute(
    req: Request,
    res: Response,
) {
    try {
        const { symbol } = req.params;

        const metrics =
            await finnhubService.getMetrics(symbol as string);

        res.json(metrics);
    } catch {
        res.status(500).json({
            error: "Failed to fetch metrics",
        });
    }
}