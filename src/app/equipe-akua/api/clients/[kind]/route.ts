import { clientsDelete, clientsGet, clientsPatch } from "@/lib/admin/clients-handler";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ kind: string }> };

export async function GET(req: Request, { params }: Ctx) {
  return clientsGet("team", (await params).kind, req);
}
export async function PATCH(req: Request, { params }: Ctx) {
  return clientsPatch("team", (await params).kind, req);
}
export async function DELETE(req: Request, { params }: Ctx) {
  return clientsDelete("team", (await params).kind, req);
}
