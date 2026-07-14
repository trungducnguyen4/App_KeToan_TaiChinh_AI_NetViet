import { useRouter } from "next/router";
import { workitModules } from "@domain/index";
import type { ModuleKey } from "@domain/types";
import { AppShell } from "../../components/app-shell";
import { ModuleDashboard } from "../../components/module-dashboard";
import ReceivableDetailScreen from "../../screens/receivable-detail-screen";
import PayableDetailScreen from "../../screens/payable-detail-screen";
import DebtOverviewScreen from "../../screens/debt-overview-screen";

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
  const receivablesView = typeof router.query.view === "string" ? router.query.view : "menu";

  return (
    <AppShell activeModule={moduleKey}>
      {moduleKey === "receivables" && receivablesView === "overview" ? (
        <DebtOverviewScreen />
      ) : moduleKey === "receivables" && receivablesView === "receivable" ? (
        <ReceivableDetailScreen />
      ) : moduleKey === "receivables" && receivablesView === "payable" ? (
        <PayableDetailScreen />
      ) : (
        <ModuleDashboard moduleKey={exists ? moduleKey : "accounting"} />
      )}
    </AppShell>
  );
}
