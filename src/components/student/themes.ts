export type ThemeId =
  | "classic" | "coral" | "ocean" | "forest" | "sun"
  | "neon" | "craft" | "kawaii" | "scene"
  | "sunset" | "emerald" | "graphite";

export type ThemeCategory = "bright" | "game" | "atmospheric" | "luxury";

export interface ThemeData {
  id: ThemeId;
  name: string;
  category: ThemeCategory;
  isDark: boolean;
  bg: string;       // thumbnail bg color
  accent: string;   // thumbnail accent color
  accent2: string;  // thumbnail secondary
  text: string;
  cardBg: string;
  fontName: string;
  fontFamily: string;
  fontUrl: string;  // Google Fonts embed URL
}

export const CATEGORY_NAMES: Record<ThemeCategory, string> = {
  bright:      "Яркие",
  game:        "Игровые",
  atmospheric: "Атмосферные",
  luxury:      "Взрослые",
};

export const THEMES: ThemeData[] = [
  // ── Яркие ─────────────────────────────────────────────────────────────
  {
    id: "coral", name: "Коралл", category: "bright", isDark: false,
    bg: "#FFF1EC", accent: "#FF6B5C", accent2: "#FFB347",
    text: "#A8421F", cardBg: "#FFFFFF",
    fontName: "Baloo 2",
    fontFamily: "'Baloo 2', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600&display=swap",
  },
  {
    id: "ocean", name: "Океан", category: "bright", isDark: false,
    bg: "#EAF1FB", accent: "#4A7FE0", accent2: "#7FC4D4",
    text: "#1E4A7A", cardBg: "#FFFFFF",
    fontName: "Quicksand",
    fontFamily: "'Quicksand', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600&display=swap",
  },
  {
    id: "forest", name: "Лес", category: "bright", isDark: false,
    bg: "#EDF5E8", accent: "#3FA66B", accent2: "#9ED1A0",
    text: "#2B5A38", cardBg: "#FFFFFF",
    fontName: "Fredoka",
    fontFamily: "'Fredoka', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&display=swap",
  },
  {
    id: "sun", name: "Солнце", category: "bright", isDark: false,
    bg: "#FFF9E8", accent: "#F5C04D", accent2: "#FADE9E",
    text: "#7A5A0A", cardBg: "#FFFFFF",
    fontName: "Comfortaa",
    fontFamily: "'Comfortaa', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@600;700&display=swap",
  },
  // ── Игровые ───────────────────────────────────────────────────────────
  {
    id: "neon", name: "Неон", category: "game", isDark: true,
    bg: "#1C1B29", accent: "#7C6BE0", accent2: "#9B7FE8",
    text: "#E8E6FF", cardBg: "rgba(255,255,255,0.08)",
    fontName: "Space Grotesk",
    fontFamily: "'Space Grotesk', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap",
  },
  {
    id: "craft", name: "Крафт", category: "game", isDark: false,
    bg: "#7FAE5C", accent: "#D4C896", accent2: "#5C8740",
    text: "#3D5A28", cardBg: "#D4C896",
    fontName: "Press Start 2P",
    fontFamily: "'Press Start 2P', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
  },
  {
    id: "kawaii", name: "Кавай", category: "game", isDark: false,
    bg: "#FFE3EF", accent: "#F5A8C4", accent2: "#FFD6E8",
    text: "#C97B9E", cardBg: "#FFFFFF",
    fontName: "Mochiy Pop One",
    fontFamily: "'Mochiy Pop One', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap",
  },
  {
    id: "scene", name: "Сцена", category: "game", isDark: true,
    bg: "#15131F", accent: "#FF5AA0", accent2: "#6E5AFF",
    text: "#FFFFFF", cardBg: "rgba(255,255,255,0.08)",
    fontName: "Unbounded",
    fontFamily: "'Unbounded', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&display=swap",
  },
  // ── Атмосферные ───────────────────────────────────────────────────────
  {
    id: "sunset", name: "Закат", category: "atmospheric", isDark: false,
    bg: "#FFD9A8", accent: "#7C5BC4", accent2: "#FFADC4",
    text: "#3A2050", cardBg: "rgba(255,255,255,0.85)",
    fontName: "Zen Maru Gothic",
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@600&display=swap",
  },
  // ── Взрослые ─────────────────────────────────────────────────────────
  {
    id: "classic", name: "Классика", category: "luxury", isDark: false,
    bg: "#F2EBDD", accent: "#7A1F1F", accent2: "#9C7A45",
    text: "#3A2117", cardBg: "#FFFFFF",
    fontName: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap",
  },
  {
    id: "emerald", name: "Изумруд", category: "luxury", isDark: true,
    bg: "#0E2A22", accent: "#C9A668", accent2: "#8EB49B",
    text: "#E8F0E5", cardBg: "#1B4D3E",
    fontName: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap",
  },
  {
    id: "graphite", name: "Графит", category: "luxury", isDark: true,
    bg: "#1A1A1D", accent: "#B08D57", accent2: "#D4B896",
    text: "#EDEBE5", cardBg: "#2C2C2E",
    fontName: "Cinzel",
    fontFamily: "'Cinzel', Georgia, serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500&display=swap",
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map(t => [t.id, t])) as Record<ThemeId, ThemeData>;

export const THEMES_BY_CATEGORY: Record<ThemeCategory, ThemeData[]> = {
  bright:      THEMES.filter(t => t.category === "bright"),
  game:        THEMES.filter(t => t.category === "game"),
  atmospheric: THEMES.filter(t => t.category === "atmospheric"),
  luxury:      THEMES.filter(t => t.category === "luxury"),
};

export const DEFAULT_THEME: ThemeId = "classic";
