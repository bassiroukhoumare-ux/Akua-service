"use client";

import { ActivityFeed } from "./activity-feed";
import { useActivity } from "./use-activity";

/** Portail équipe : les actions de l'équipier connecté. */
export function MyActivity({ memberId }: { memberId: string }) {
  return <ActivityFeed entries={useActivity(memberId).slice(0, 6)} grouped={false} empty="Vos ajouts et modifications apparaîtront ici." />;
}
