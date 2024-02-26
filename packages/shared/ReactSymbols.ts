/*
 * @Author: wy
 * @Date: 2024-02-26 15:48:33
 * @LastEditors: wy
 * @LastEditTime: 2024-02-26 15:51:11
 * @FilePath: /笔记/react-source-learn/packages/shared/ReactSymbols.ts
 * @Description:
 */
const supportSymbol = typeof Symbol === 'function' && Symbol.for; // 判断是否支持symbol

export const REACT_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7;
