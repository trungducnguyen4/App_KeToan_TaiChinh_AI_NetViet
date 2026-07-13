"use client";

import {
  ArrowRight,
  Bot,
  Calculator,
  Database,
  BookOpen,
  ArrowLeft,
  ChevronDown,
  FileText,
  LayoutGrid,
  List,
  LockKeyhole,
  LogOut,
  ReceiptText,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  PieChart,
  Printer,
  RefreshCw,
  TrendingUp,
  Upload,
  User,
  WalletCards,
  Warehouse,
} from "lucide-react";

const icons = {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Bot,
  Calculator,
  Database,
  ChevronDown,
  FileText,
  LayoutGrid,
  List,
  LockKeyhole,
  LogOut,
  PieChart,
  Printer,
  RefreshCw,
  ReceiptText,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Upload,
  User,
  WalletCards,
  Warehouse,
};

export type IconName = keyof typeof icons;

export function AppIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = icons[name as IconName] ?? LayoutGrid;
  return <Icon aria-hidden="true" size={size} strokeWidth={2.1} />;
}
