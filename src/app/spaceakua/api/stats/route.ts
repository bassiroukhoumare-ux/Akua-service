import type { NextRequest } from "next/server";
import { statsHandler } from "@/lib/analytics/stats-handler";

export const dynamic = "force-dynamic";
export const GET = (req: NextRequest) => statsHandler(req, "owner");
