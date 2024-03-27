/*
 * @Author: wy
 * @Date: 2024-02-26 17:21:07
 * @LastEditors: wy
 * @LastEditTime: 2024-03-27 17:54:10
 * @FilePath: /react-source-learn/packages/react/index.ts
 * @Description:
 */
import currentDispatcher, {
	Dispatcher,
	resolveDispatcher,
} from './src/currentDispatcher';
import { jsxDEV } from './src/jsx';
export const useState: Dispatcher['useState'] = (initialState) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};
// 内部共享数据
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher,
};
export default {
	version: '0.0.0',
	createElement: jsxDEV,
};
