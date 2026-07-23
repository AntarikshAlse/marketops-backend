import type {
    Request,
    Response,
} from "express";
import { finnhubService } from "../services/finnhub.service.ts";


export async function profileRoute(
    req: Request,
    res: Response,
) {
    try {
        const { symbol } = req.params;

        const profile = await finnhubService.getProfile(symbol as string);

        res.json(profile);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch profile",
        });
    }
}
