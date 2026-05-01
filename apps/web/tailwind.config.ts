import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#171717", paper: "#f8f7f2", line: "#dedbd1", pine: "#17483f", clay: "#b65f45", brass: "#a57c25" },
      boxShadow: { quiet: "0 1px 2px rgba(23,23,23,0.07), 0 12px 32px rgba(23,23,23,0.05)" }
    }
  },
  plugins: []
};
export default config;
