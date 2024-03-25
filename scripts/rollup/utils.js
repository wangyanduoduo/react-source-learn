/*
 * @Author: wy
 * @Date: 2024-02-26 18:06:52
 * @LastEditors: wy
 * @LastEditTime: 2024-03-22 16:44:42
 * @FilePath: /react-source-learn/scripts/rollup/utils.js
 * @Description:
 */

import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export const resolvePkgPath = (pkgName, isDist) => {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}

	return `${pkgPath}/${pkgName}`;
};

// 读取对应包package.json中的json
export const getPackageJson = (pkgName) => {
	const path = `${resolvePkgPath(pkgName)}/package.json`;

	const str = fs.readFileSync(path, 'utf8');

	return JSON.parse(str);
};

/**
 * 基础的打包插件
 * @param {*} param0
 * @returns
 * // cjs 符合umd
 * // ts 打包转化ts
 */
export const getBaseRollupPlugins = ({
	alias = { __DEV__: true }, // 在全局使用__DEV__
	typescript,
} = {}) => {
	return [replace(alias), cjs(), ts(typescript)];
};
