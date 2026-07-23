import finnhub from "finnhub";
import { env } from "../config/env.ts";
export const finnhubClient = new finnhub.DefaultApi(env.finnhubToken);