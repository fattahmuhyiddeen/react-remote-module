import * as React from "react"

const Packages = {
   "react": () => React,
}

const fromPairs = (pairs) =>
  Object.assign({}, ...pairs.map(([k, v]) => ({ [k]: v })));
export default fromPairs(
  Object.keys(Packages).map((k) => [k, () => ({ exports: Packages[k]() })])
);