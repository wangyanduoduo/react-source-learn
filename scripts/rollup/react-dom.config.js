/*
 * @Author: wy
 * @Date: 2024-02-26 18:06:06
 * @LastEditors: wy
 * @LastEditTime: 2024-04-07 11:27:04
 * @FilePath: /react-source-learn/scripts/rollup/react-dom.config.js
 * @Description:
 */
import alias from '@rollup/plugin-alias';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { resolvePkgPath, getPackageJson, getBaseRollupPlugins } from './utils';
const { name, module, peerDependencies } = getPackageJson('react-dom'); // package.json 中name

const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);

export default [
	// react-dom
	{
		input: `${pkgPath}/${module}`,
		output: [
			{
				file: `${pkgDistPath}/index.js`,
				name: 'ReactDOM',
				format: 'umd',
			},
			{
				file: `${pkgDistPath}/client.js`,
				name: 'client',
				format: 'umd',
			},
		],
		external: [...Object.keys(peerDependencies)], // 排除不需要打包的依赖
		plugins: [
			...getBaseRollupPlugins(),
			alias({
				entries: {
					hostConfig: `${pkgPath}/src/hostConfig.ts`,
				},
			}),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					peerDependencies: {
						react: version, // 让react-dom 中依赖的react的version和react中的保持一致
					},
					main: 'index.js',
				}),
			}),
		],
	},
	// react-test-utils
	{
		input: `${pkgPath}/test-utils.ts`,
		output: [
			{
				file: `${pkgDistPath}/test-utils.js`,
				name: 'testUtils',
				format: 'umd',
			},
		],
		external: ['react', 'react-dom'], // 排除不需要打包的依赖
		plugins: [...getBaseRollupPlugins()],
	},
];
