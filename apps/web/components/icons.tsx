"use client";

import {
  ArrowLeft,
  Bot,
  Calculator,
  Database,
  BookOpen,
  ChevronDown,
  FileText,
  LayoutGrid,
  List,
  ReceiptText,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  PieChart,
  Printer,
  TrendingUp,
  Upload,
  WalletCards,
  Warehouse
} from "lucide-react";

const icons = {
  ArrowLeft,
  BookOpen,
  Bot,
  Calculator,
  Database,
  ChevronDown,
  FileText,
  LayoutGrid,
  List,
  PieChart,
  Printer,
  ReceiptText,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Upload,
  WalletCards,
  Warehouse
};

export type IconName = keyof typeof icons;

export function AppIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = icons[name as IconName] ?? LayoutGrid;
  return <Icon aria-hidden="true" size={size} strokeWidth={2.1} />;
}
