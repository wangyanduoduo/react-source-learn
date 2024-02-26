/*
 * @Author: wy
 * @Date: 2024-02-26 18:06:06
 * @LastEditors: wy
 * @LastEditTime: 2024-02-26 18:49:22
 * @FilePath: /笔记/react-source-learn/scripts/rollup/react.config.js
 * @Description:
 */
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { resolvePkgPath, getPackageJson, getBaseRollupPlugins } from './utils';
const { name, module } = getPackageJson('react'); // package.json 中name

const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);

export default [
	// react
	{
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDistPath}/index.js`,
			name: 'index.js',
			format: 'umd',
		},
		plugins: [
			...getBaseRollupPlugins(),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					main: 'index.js',
				}),
			}),
		],
	},
	// jsx-runtime
	{
		input: `${pkgPath}/src/jsx.ts`,
		output: {
			file: `${pkgDistPath}/jsx-runtime.js`,
			name: 'jsx-runtime.js',
			format: 'umd',
		},
		plugins: getBaseRollupPlugins(),
	},
	// jsx-dev-runtime
	{
		input: `${pkgPath}/src/jsx.ts`,
		output: {
			file: `${pkgDistPath}/jsx-dev-runtime.js`,
			name: 'jsx-dev-runtime.js',
			format: 'umd',
		},
		plugins: getBaseRollupPlugins(),
	},
];
