import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.js",
  output: {
    file: "dist/embed.js",
    format: "cjs",
    compact: true,
    banner: "/*! Simple Analytics Embed script */",
  },
  treeshake: true,
  plugins: [nodeResolve(), process.env.NODE_ENV === "production" && terser()],
};
