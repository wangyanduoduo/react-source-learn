/*
 * @Author: wy
 * @Date: 2024-03-27 14:09:16
 * @LastEditors: wy
 * @LastEditTime: 2024-03-27 15:27:12
 * @FilePath: /react-source-learn/scripts/vite/vite.config.js
 * @Description:
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';
import { resolvePkgPath } from '../rollup/utils';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		replace({
			__DEV__: true,
			preventAssignment: true,
		}),
	],
	resolve: {
		alias: [
			{
				find: 'react',
				replacement: resolvePkgPath('react'),
			},
			{
				find: 'react-dom',
				replacement: resolvePkgPath('react-dom'),
			},
			// {
			// 	find: 'react-noop-renderer',
			// 	replacement: resolvePkgPath('react-noop-renderer'),
			// },
			{
				find: 'hostConfig',
				replacement: path.resolve(
					resolvePkgPath('react-dom'),
					'./src/hostConfig.ts',
				),
			},
		],
	},
});
