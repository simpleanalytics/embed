import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

const today = new Date().toISOString().slice(0, 16) + "Z";
const emptyComment = "/*! empty comment */";
const commentStart = "/*! ";

const full = {
  input: "src/index-full.js",
  output: {
    file: "dist/embed.js",
    format: "iife",
    compact: true,
    banner: [
      `/*! Simple Analytics - Privacy friendly analytics - Chart embed (docs.simpleanalytics.com/embed; ${today}) */`,
      emptyComment,
    ].join("\n"),
    sourcemap: true,
  },
  treeshake: true,
  plugins: [
    nodeResolve(),
    commonjs(),

    // Use inline babel settings
    babel({
      presets: [
        [
          "@babel/env",
          {
            modules: false,
            useBuiltIns: "usage",
            corejs: 3,
            targets: "ie 11",
          },
        ],
      ],
      extensions: [".js"],
      exclude: [/\/core-js\//],
      babelHelpers: "bundled",
    }),

    // Minify with terser
    terser(),

    // Replace empty comment so we have a new line
    replace({
      preventAssignment: true,
      [emptyComment]: "",
      [commentStart]: "/* ",
      delimiters: ["", ""],
    }),
  ],
};

const dev = {
  input: "src/index.js",
  output: {
    file: "dist/embed.js",
    format: "cjs",
    compact: true,
    banner: "/*! Simple Analytics Embed script development version */",
  },
  treeshake: true,
  plugins: [nodeResolve(), commonjs()],
};

const compile = process.env.NODE_ENV === "production" ? [full] : [dev];

export default compile;
