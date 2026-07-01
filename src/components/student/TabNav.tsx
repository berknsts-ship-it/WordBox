"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  // defaults
  CalendarDays, ClipboardList, PenLine, NotebookText, Brain, BookText, FolderOpen,
  // ocean
  Anchor, Shell, Fish, Globe, Paintbrush,
  // forest
  Leaf, Squirrel, Scroll, Sprout,
  // sun
  Sun, Zap, Pencil, Cloud, BookMarked,
  // neon
  Target, Diamond, Database, Monitor, BarChart, Gamepad2, Cpu,
  // craft
  Pickaxe, Package, Palette, Sword, Wand2,
  // kawaii
  Ribbon, Star, Flower2, Cat, Heart, Cherry, Rainbow,
  // scene
  Mic2, Disc3, Guitar, Music, Headphones,
  // sunset
  Flower, Sparkles, Moon, Flame,
  // luxury
  Feather, Drama, BookOpen, LeafyGreen,
} from "lucide-react";
import type { ThemeId } from "./themes";

const TABS = [
  { id: "schedule",  label: "Расписание", icon: CalendarDays },
  { id: "homework",  label: "Задания",    icon: ClipboardList },
  { id: "materials", label: "Материалы",  icon: FolderOpen },
  { id: "board",     label: "Доска",      icon: PenLine },
  { id: "journal",   label: "Журнал",     icon: NotebookText },
  { id: "trainer",   label: "Тренажёр",   icon: Brain },
  { id: "grammar",   label: "Грамматика", icon: BookText },
] as const;

type TabId = (typeof TABS)[number]["id"];
type TabIconSet = Partial<Record<TabId, LucideIcon>>;

// Per-theme Lucide icon overrides — falls back to default if tab not listed
const THEME_ICONS: Partial<Record<ThemeId, TabIconSet>> = {
  ocean: {
    schedule:  Anchor,
    materials: Shell,
    board:     Paintbrush,
    journal:   BookOpen,
    trainer:   Fish,
    grammar:   Globe,
  },
  forest: {
    schedule:  Leaf,
    materials: Sprout,
    board:     Paintbrush,
    journal:   BookOpen,
    trainer:   Squirrel,
    grammar:   Scroll,
  },
  sun: {
    schedule:  Sun,
    homework:  Pencil,
    materials: Cloud,
    board:     Paintbrush,
    journal:   BookOpen,
    trainer:   Zap,
    grammar:   BookMarked,
  },
  neon: {
    schedule:  Target,
    homework:  Diamond,
    materials: Database,
    board:     Monitor,
    journal:   BarChart,
    trainer:   Gamepad2,
    grammar:   Cpu,
  },
  craft: {
    schedule:  Pickaxe,
    homework:  Scroll,
    materials: Package,
    board:     Palette,
    journal:   BookOpen,
    trainer:   Sword,
    grammar:   Wand2,
  },
  kawaii: {
    schedule:  Ribbon,
    homework:  Star,
    materials: Flower2,
    board:     Cat,
    journal:   Heart,
    trainer:   Cherry,
    grammar:   Rainbow,
  },
  scene: {
    schedule:  Mic2,
    homework:  PenLine,
    materials: Disc3,
    board:     Guitar,
    journal:   NotebookText,
    trainer:   Music,
    grammar:   Headphones,
  },
  sunset: {
    schedule:  Flower,
    homework:  Sparkles,
    materials: FolderOpen,
    board:     PenLine,
    journal:   Moon,
    trainer:   Flame,
    grammar:   BookMarked,
  },
  classic: {
    homework:  Feather,
    board:     PenLine,
    journal:   BookOpen,
    trainer:   Drama,
    grammar:   BookMarked,
  },
  emerald: {
    schedule:  Leaf,
    homework:  Feather,
    board:     PenLine,
    journal:   BookOpen,
    trainer:   LeafyGreen,
    grammar:   BookMarked,
  },
  graphite: {
    homework:  Feather,
    board:     PenLine,
    journal:   BookOpen,
    trainer:   Target,
    grammar:   BookMarked,
  },
};

// Icon foreground on theme-accent background: dark for light accents, white elsewhere
const ICON_FG: Partial<Record<ThemeId, string>> = {
  sun:      "#5A3800",
  craft:    "#2A4010",
  kawaii:   "#8B2252",
  emerald:  "#0E2A22",
  graphite: "#1A1A1D",
};

export default function TabNav({
  code,
  activeTab,
  pendingHomework = 0,
  themeId,
}: {
  code: string;
  activeTab: string;
  pendingHomework?: number;
  themeId?: string | null;
}) {
  const tid = themeId as ThemeId | undefined;
  const themeIconSet = tid ? THEME_ICONS[tid] : undefined;
  const iconFg = tid ? (ICON_FG[tid] ?? "#ffffff") : "#ffffff";

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
      <div className="flex sm:grid sm:grid-cols-7 gap-1.5 sm:gap-2 w-max sm:w-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "homework" && pendingHomework > 0;
          const Icon: LucideIcon = themeIconSet?.[tab.id] ?? tab.icon;

          return (
            <Link
              key={tab.id}
              href={`/student/${code}?tab=${tab.id}`}
              className="relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 sm:px-1 rounded-xl sm:rounded-2xl transition-all min-w-[62px] sm:min-w-0"
              style={
                isActive
                  ? {
                      background: "color-mix(in srgb, var(--theme-accent) 12%, var(--theme-card-bg))",
                      border: "2px solid var(--theme-accent)",
                      transform: "translateY(-1px)",
                    }
                  : {
                      background: "var(--theme-card-bg)",
                      border: "1.5px solid var(--theme-card-border)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }
              }
            >
              {/* App-icon square */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: isActive ? "var(--gradient-primary)" : "var(--theme-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isActive
                    ? "0 4px 14px rgba(0,0,0,0.22)"
                    : "0 2px 8px rgba(0,0,0,0.14)",
                }}
              >
                <Icon size={20} color={isActive ? "#ffffff" : iconFg} />
              </div>

              <span
                className="text-xs font-semibold text-center leading-tight whitespace-nowrap"
                style={{ color: isActive ? "var(--theme-accent)" : "var(--theme-text-secondary)" }}
              >
                {tab.label}
              </span>

              {showBadge && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                  style={{ background: "#e85d4a", fontSize: "10px" }}
                >
                  {pendingHomework}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
