import * as React from "react";

import * as Axios from "axios";
import * as ReactRedux from "react-redux";
import * as LottieReactNative from "lottie-react-native";
import * as ReactNative from "react-native";
import * as ReactNativeSafeAreaContext from "react-native-safe-area-context";
import * as ReactNativeSvg from "react-native-svg";
const Packages = {
  axios: () => Axios,
  react: () => React,
  "react-native": () => ReactNative,
  "react-redux": () => ReactRedux,
  "react-native-svg": () => ReactNativeSvg,
  "react-native-safe-area-context": () => ReactNativeSafeAreaContext,
  "lottie-react-native": () => LottieReactNative,
};

const fromPairs = (pairs) =>
  Object.assign({}, ...pairs.map(([k, v]) => ({ [k]: v })));
export default fromPairs(
  Object.keys(Packages).map((k) => [k, () => ({ exports: Packages[k]() })])
);