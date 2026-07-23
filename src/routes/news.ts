import type {
    Request,
    Response,
} from "express";

import { finnhubService } from "../services/finnhub.service.ts";

export async function newsRoute(
    req: Request,
    res: Response,
) {
    try {
        const { symbol } = req.params;

        const news =
            await finnhubService.getNews(symbol as string);

        res.json(news);
    } catch {
        res.status(500).json({
            error: "Failed to fetch news",
        });
    }
}