import { getState, putState } from "@/lib/admin/state-handler";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  return getState("team", (await params).key);
}

export async function PUT(req: Request, { params }: Ctx) {
  return putState("team", (await params).key, req);
}
