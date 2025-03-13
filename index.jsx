import React, { Suspense, useMemo, useState } from 'react';

import packages from './packages';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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

const Main = ({ __id, url, LocalComponent, ErrorComponent = () => false, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(true);

  const fetchComponent = async (id, url) => {
    try {
      const response = await fetch(url);
      setIsLoading(false);
      setIsError(true);
      if (!response.ok) {
        throw new Error('Fail to request ' + url);
      }

      return { default: getParsedModule(await response.text(), id, packages) };
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      return { default: () => false };
    }
  };
  const Component = useMemo(
    () => LocalComponent || React.lazy(() => fetchComponent(__id, url)),
    [LocalComponent, __id],
  );

  return (
    <Suspense fallback={<></>}>
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      )}
      {isError ? <ErrorComponent /> : <Component {...props} />}
    </Suspense>
  );
};

export default React.memo(Main);

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
