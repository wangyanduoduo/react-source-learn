/*
 * @Author: wy
 * @Date: 2024-02-26 15:48:33
 * @LastEditors: wy
 * @LastEditTime: 2024-04-23 15:14:29
 * @FilePath: /react-source-learn/packages/shared/ReactSymbols.ts
 * @Description:
 */
const supportSymbol = typeof Symbol === 'function' && Symbol.for; // 判断是否支持symbol

export const REACT_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7;

export const REACT_FRAGMENT_TYPE = supportSymbol
	? Symbol.for('react.fragment')
	: 0xeacb;
