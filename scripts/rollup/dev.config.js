/*
 * @Author: wy
 * @Date: 2024-03-26 14:57:35
 * @LastEditors: wy
 * @LastEditTime: 2024-03-26 15:08:59
 * @FilePath: /react-source-learn/scripts/rollup/dev.config.js
 * @Description:
 */
import reactDomConfig from './react-dom.config';
import reactConfig from './react.config';

export default () => {
	return [...reactDomConfig, ...reactConfig];
};
