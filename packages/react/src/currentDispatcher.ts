/*
 * @Author: wy
 * @Date: 2024-03-27 17:10:48
 * @LastEditors: wy
 * @LastEditTime: 2024-03-28 11:25:19
 * @FilePath: /react-source-learn/packages/react/src/currentDispatcher.ts
 * @Description:
 */

import { Action } from 'shared/ReactTypes';

export type Dispatch<state> = (action: Action<state>) => void;

export interface Dispatcher {
	useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
}

const currentDispatcher: { current: Dispatcher | null } = {
	current: null,
};

export const resolveDispatcher = () => {
	const dispatcher = currentDispatcher.current;
	if (dispatcher === null) {
		throw new Error('hook只能在函数组件中使用');
	}
	return dispatcher;
};

export default currentDispatcher;
