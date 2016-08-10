import npm from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: "index.js",
  format: "umd",
  moduleName: "d3",
  plugins: [
    npm({
      jsnext: true
    }),
    commonjs({
      include: "node_modules/**"
    })
  ],
  dest: "d3.js"
};
