import { createFileRoute } from "@tanstack/react-router";
import { NeonApp } from "@/components/game/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <NeonApp />;
}
