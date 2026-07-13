"use client";

import {
  Bot,
  Calculator,
  Database,
  BookOpen,
  ArrowLeft,
  ArrowLeftRight,
  BadgeDollarSign,
  ChevronDown,
  CircleDollarSign,
  FileText,
  LayoutGrid,
  List,
  Landmark,
  ReceiptText,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  PieChart,
  TrendingUp,
  Upload,
  WalletCards,
  Warehouse
} from "lucide-react";

const icons = {
  BookOpen,
  Bot,
  ArrowLeft,
  ArrowLeftRight,
  BadgeDollarSign,
  Calculator,
  Database,
  ChevronDown,
  CircleDollarSign,
  FileText,
  LayoutGrid,
  List,
  Landmark,
  PieChart,
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
