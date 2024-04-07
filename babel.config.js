/*
 * @Author: wy
 * @Date: 2024-04-07 11:07:26
 * @LastEditors: wy
 * @LastEditTime: 2024-04-07 11:07:34
 * @FilePath: /react-source-learn/babel.config.js
 * @Description:
 */
module.exports = {
	presets: ['@babel/preset-env'],
	plugins: [['@babel/plugin-transform-react-jsx', { throwIfNamespace: false }]],
};
