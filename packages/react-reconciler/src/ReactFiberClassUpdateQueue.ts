/*
 * @Author: wy
 * @Date: 2024-02-27 18:05:43
 * @LastEditors: wy
 * @LastEditTime: 2024-03-28 13:35:41
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberClassUpdateQueue.ts
 * @Description:
 */

import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

/**
 * update有一个action(源码中是callback),处理更新
 * action接收state
 * state可以是单一的变量也可以是函数
 */
export interface Update<State> {
	action: Action<State>;
}

/**
 * updateQueue管理update
 * updateQueue是一个对象，含有shared属性
 * shared也是对象，含有pending属性
 * pending 对应update
 */

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action,
	};
};

/**
 *
 * createUpdateQueue 对应源码中 initializeUpdateQueue
 */
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null,
		},
		dispatch: null,
	} as UpdateQueue<State>;
};

/**
 * 向updateQueue中增加update
 */
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>,
) => {
	updateQueue.shared.pending = update;
};

/**
 * 处理updateQueue中的update
 * update中的action包含state
 * 计算状态的最新值
 *
 * 源码中不是这样的
 * 现在是伪代码
 */
export const processUpdateQueue = <State>(
	baseState: State,
	pendingState: Update<State> | null,
): {
	memoizedState: State;
} => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState,
	};

	if (pendingState) {
		const action = pendingState.action;
		if (action instanceof Function) {
			result.memoizedState = action(baseState);
		} else {
			result.memoizedState = action;
		}
	}

	return result;
};
