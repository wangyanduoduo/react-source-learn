/*
 * @Author: wy
 * @Date: 2024-04-07 11:02:45
 * @LastEditors: wy
 * @LastEditTime: 2024-04-07 11:02:57
 * @FilePath: /react-source-learn/scripts/jest/jest.config.js
 * @Description:
 */
const { defaults } = require('jest-config');

module.exports = {
	...defaults,
	rootDir: process.cwd(),
	modulePathIgnorePatterns: ['<rootDir>/.history'],
	moduleDirectories: [
		// 对于 React ReactDOM
		'dist/node_modules',
		// 对于第三方依赖
		...defaults.moduleDirectories,
	],
	testEnvironment: 'jsdom',
};
