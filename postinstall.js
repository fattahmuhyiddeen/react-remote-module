const fs = require('fs');
const packageFile = require('../../package.json');

const packagesFile = fs.openSync('./packages.js', 'w');

const libs = Object.keys(packageFile.dependencies);

const varName = (key, index) => key.replace(/[^A-Za-z]/g, '').toUpperCase() + 'x' + index;

const libsToExclude = ['sharp'];
for (let i = 0, l = libs.length; i < l; i++) {
  if (!libsToExclude.includes(libs[i])) fs.writeSync(packagesFile, `import * as ${varName(libs[i], i)} from "${libs[i]}"\n`);
}

fs.writeSync(packagesFile, 'const Packages = {\n');
for (let i = 0, l = libs.length; i < l; i++) {
    fs.writeSync(packagesFile, `   "${libs[i]}": () => ${varName(libs[i], i)},\n`);
  }
fs.writeSync(packagesFile, '};\n');
fs.writeSync(packagesFile, `
const fromPairs = (pairs) =>
  Object.assign({}, ...pairs.map(([k, v]) => ({ [k]: v })));
export default fromPairs(
  Object.keys(Packages).map((k) => [k, () => ({ exports: Packages[k]() })])
);`);

fs.closeSync(packagesFile);
