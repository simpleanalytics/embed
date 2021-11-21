import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";

const legacy = {
  input: "src/index-legacy.js",
  output: {
    file: "dist/embed.js",
    format: "iife",
    compact: true,
    banner: "/*! Simple Analytics Embed script for IE11 and up */",
  },
  treeshake: true,
  plugins: [
    resolve(),
    babel({
      exclude: "node_modules/**",
    }),
    commonjs(),
    process.env.NODE_ENV === "production" && terser(),
  ],
};

const dev = {
  input: "src/index.js",
  output: {
    file: "dist/embed.js",
    format: "cjs",
    compact: true,
    banner: "/*! Simple Analytics Embed script for modern browsers */",
  },
  treeshake: true,
  plugins: [
    resolve(),
    commonjs(),
    process.env.NODE_ENV === "production" && terser(),
  ],
};

const compile = process.env.NODE_ENV === "production" ? [legacy] : [dev];

export default compile;
