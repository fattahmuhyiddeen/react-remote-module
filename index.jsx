import React, { Suspense, useMemo } from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';

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

export async function fetchComponent(id) {
  try {
    const response = await fetch(`http://localhost:8080/index.js`, {
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

const DynamicComponent = ({ __id, ...props }) => {
  const Component = useMemo(() => {
    return React.lazy(async () => fetchComponent(__id));
  }, [__id]);



  return (
    <Suspense
      fallback={
        <></>
      }
    >
      <SafeAreaProvider>
        <Component {...props} />
      </SafeAreaProvider>
    </Suspense>
  );
};

export default React.memo(DynamicComponent);
