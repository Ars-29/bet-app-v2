"use client";

import { use } from "react";
import MatchDetailPage from "@/components/match/MatchDetailPage";

export default function MatchDetail({ params }) {
  const resolvedParams = use(params);
  return <MatchDetailPage matchId={resolvedParams.id} />;
}
