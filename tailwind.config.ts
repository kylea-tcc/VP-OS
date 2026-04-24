import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#06060f",
          surface: "#0c0c1a",
          card: "#10101f",
          elevated: "#151527",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          strong: "rgba(255,255,255,0.12)",
        },
        accent: {
          DEFAULT: "#6366f1",
          bright: "#818cf8",
          dim: "#4f46e5",
          muted: "rgba(99,102,241,0.15)",
        },
        atlas: {
          DEFAULT: "#8b5cf6",
          bright: "#a78bfa",
          muted: "rgba(139,92,246,0.15)",
        },
        renewals: {
          DEFAULT: "#06b6d4",
          bright: "#22d3ee",
          muted: "rgba(6,182,212,0.15)",
        },
        core: {
          DEFAULT: "#f59e0b",
          bright: "#fbbf24",
          muted: "rgba(245,158,11,0.15)",
        },
        success: {
          DEFAULT: "#10b981",
          bright: "#34d399",
          muted: "rgba(16,185,129,0.12)",
        },
        danger: {
          DEFAULT: "#ef4444",
          bright: "#f87171",
          muted: "rgba(239,68,68,0.12)",
        },
        warn: {
          DEFAULT: "#f59e0b",
          muted: "rgba(245,158,11,0.12)",
        },
        ink: {
          1: "#f1f5f9",
          2: "#94a3b8",
          3: "#475569",
          4: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "atlas-glow": "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, transparent 60%)",
        "renewals-glow": "linear-gradient(135deg, rgba(6,182,212,0.2) 0%, transparent 60%)",
        "core-glow": "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, transparent 60%)",
        "card-shimmer": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5)",
        glow: "0 0 24px rgba(99,102,241,0.3)",
        "glow-atlas": "0 0 24px rgba(139,92,246,0.3)",
        "glow-renewals": "0 0 24px rgba(6,182,212,0.3)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
