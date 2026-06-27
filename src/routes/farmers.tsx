import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/farmers")({
  component: () => <Outlet />,
});