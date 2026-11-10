import { notificationsGet, notificationsSeen } from "@/lib/admin/notifications";

export const dynamic = "force-dynamic";
export const GET = () => notificationsGet("team");
export const POST = (req: Request) => notificationsSeen("team", req);
