// tailwind.config.mjs
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,astro}",
    "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(button|checkbox|input|ripple|spinner|form).js",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#404040',
        secondary: '#8C8C8C',
        border: '#D9D9D9',
        background: '#f6f4f5',
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            default: {
              50: "#F6F4F4",
              100: "#D9D9D9",
              200: "#D4D4D8",
              300: "#8C8C8C",
              400: "#404040",
              500: "#404040",
            },
            primary: {
              50: "#F6F4F4",
              100: "#D9D9D9",
              200: "#D4D4D8",
              300: "#8C8C8C",
              400: "#404040",
              500: "#404040",
            },
            secondary: {
              50: "#FFFFFF",
              100: "#F6F4F4",
              200: "#D9D9D9",
              300: "#D4D4D8",
              400: "#8C8C8C",
              500: "#404040",
            },
            danger: {
              50: "#FEECEC",
              100: "#FCAAAA",
              200: "#F57474",
              300: "#E04444",
              400: "#B63939", // tu rojo de Figma
              500: "#8C2929",
            },
          },
        },
      },
    }),
  ],
};
