"use client";

import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  Building2,
  Calculator,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cog,
  Coins,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Droplet,
  Edit,
  Factory,
  FileSpreadsheet,
  FileText,
  Filter,
  Landmark,
  Layers,
  LayoutGrid,
  Leaf,
  List,
  LogOut,
  Medal,
  Menu,
  Package,
  Pencil,
  PieChart,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Sparkles,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  WalletCards,
  Warehouse,
  X,
  Zap
} from "lucide-react";

const icons = {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  Building2,
  Calculator,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cog,
  Coins,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Droplet,
  Edit,
  Factory,
  FileSpreadsheet,
  FileText,
  Filter,
  Landmark,
  Layers,
  LayoutGrid,
  Leaf,
  List,
  LogOut,
  Medal,
  Menu,
  Package,
  Pencil,
  PieChart,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Sparkles,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  WalletCards,
  Warehouse,
  X,
  Zap
};

export type IconName = keyof typeof icons;

export interface AppIconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AppIcon({
  name,
  size = 18,
  strokeWidth = 2.1,
  className,
  style
}: AppIconProps) {
  const Icon = icons[name as IconName] ?? LayoutGrid;
  return (
    <Icon
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    />
  );
}
