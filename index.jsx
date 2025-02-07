import React, { Suspense, useMemo } from "react";

import packages from "./packages";

function getParsedModule(code, moduleName, packages) {
  const obj = Object.create(packages);

  function require(name) {
    if (!(name in obj) && moduleName === name) {
      const module = { exports: {} };
      obj[name] = () => module;

      try {
        const wrapper = eval(`(function(require, exports, module) { ${code} })`);
        wrapper(require, module.exports, module);
      } catch (e) {
        console.error(`Error evaluating module ${name}:`, e);
        throw e;
      }
    } else if (!(name in obj)) {
      throw `Module '${name}' not found`;
    }

    return obj[name]().exports;
  }

  return require(moduleName);
}

export async function fetchComponent(id, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Fail to request " + url);
    }

    return { default: getParsedModule(await response.text(), id, packages) };
  } catch (error) {
    return { default: () => false };
  }
}

const Main = ({ __id, url, ...props }) => {
  const Component = useMemo(() => React.lazy(async () => fetchComponent(__id, url)), [__id]);

  return (
    <Suspense fallback={<></>}>
      <Component {...props} />
    </Suspense>
  );
};

export default React.memo(Main);
