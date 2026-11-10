import { mediaUpload } from "@/lib/admin/media";

export const dynamic = "force-dynamic";
export const POST = (req: Request) => mediaUpload("team", req);
