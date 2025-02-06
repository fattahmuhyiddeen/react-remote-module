import React, { Suspense, useMemo } from 'react';

import packages from './packages';

function getParsedModule(code, moduleName, packages) {
  const _this = Object.create(packages);

  function require(name) {
    if (!(name in _this) && moduleName === name) {
      const module = { exports: {} };
      _this[name] = () => module;

      try {
        const wrappedCode = `(function(require, exports, module) { ${code} })`;
        const wrapper = eval(wrappedCode);
        wrapper(require, module.exports, module);
      } catch (e) {
        console.error(`Error evaluating module ${name}:`, e);
        throw e;
      }
    } else if (!(name in _this)) {
      throw `Module '${name}' not found`;
    }

    return _this[name]().exports;
  }

  return require(moduleName);
}

export async function fetchComponent(id, url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const text = await response.text();

    return { default: getParsedModule(text, id, packages) };
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
