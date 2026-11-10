import { liveHandler } from "@/lib/analytics/stats-handler";

export const dynamic = "force-dynamic";
export const GET = () => liveHandler("owner");
