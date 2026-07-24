import finnhub from "finnhub";
import { env } from "../config/env.js";
export const finnhubClient = new finnhub.DefaultApi(env.finnhubToken);