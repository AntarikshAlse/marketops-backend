import { finnhubClient } from "../lib/finnhub.js";

export class FinnhubService {
    async getProfile(symbol: string) {
        return new Promise((resolve, reject) => {
            finnhubClient.companyProfile2(
                { symbol },
                (error: any, data: any) => {
                    if (error) reject(error);
                    else resolve(data);
                }
            );
        });
    }

    async getMetrics(symbol: string) {
        return new Promise((resolve, reject) => {
            finnhubClient.companyBasicFinancials(
                symbol,
                "all",
                (error: any, data: any) => {
                    if (error) reject(error);
                    else resolve(data);
                }
            );
        });
    }

    async getNews(symbol: string) {
        const today = new Date();

        const weekAgo = new Date();

        weekAgo.setDate(today.getDate() - 7);

        return new Promise((resolve, reject) => {
            finnhubClient.companyNews(
                symbol,
                weekAgo.toISOString().slice(0, 10),
                today.toISOString().slice(0, 10),
                (error: any, data: any) => {
                    if (error) reject(error);
                    else resolve(data);
                }
            );
        });
    }
}

export const finnhubService = new FinnhubService();