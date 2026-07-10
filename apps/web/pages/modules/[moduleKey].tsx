import { useRouter } from "next/router";
import { workitModules } from "@domain/index";
import type { ModuleKey } from "@domain/types";
import { AppShell } from "../../components/app-shell";
import { ModuleDashboard } from "../../components/module-dashboard";

const routeToModule: Record<string, ModuleKey> = {
  accounting: "accounting",
  cash: "cash",
  receivables: "receivables",
  inventory: "inventory",
  sales: "sales",
  purchasing: "purchasing",
  "master-data": "masterData",
  system: "system"
};

export default function ModulePage() {
  const router = useRouter();
  const routeKey = typeof router.query.moduleKey === "string" ? router.query.moduleKey : "accounting";
  const moduleKey = routeToModule[routeKey] ?? "accounting";
  const exists = workitModules.some((module) => module.key === moduleKey);

  return (
    <AppShell activeModule={moduleKey}>
      <ModuleDashboard moduleKey={exists ? moduleKey : "accounting"} />
    </AppShell>
  );
}
