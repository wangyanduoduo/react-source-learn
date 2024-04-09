/*
 * @Author: wy
 * @Date: 2024-02-26 17:21:07
 * @LastEditors: wy
 * @LastEditTime: 2024-04-07 14:23:30
 * @FilePath: /react-source-learn/packages/react/index.ts
 * @Description:
 */
import currentDispatcher, {
	Dispatcher,
	resolveDispatcher,
} from './src/currentDispatcher';
import { jsxDEV, jsx, isValidElement as isValidElementFn } from './src/jsx';
export const useState: Dispatcher['useState'] = (initialState) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};
// 内部共享数据
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher,
};

export const version = '0.0.0';
export const createElement = jsx;
export const isValidElement = isValidElementFn;
