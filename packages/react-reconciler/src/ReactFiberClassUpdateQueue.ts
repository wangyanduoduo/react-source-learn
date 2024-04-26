/*
 * @Author: wy
 * @Date: 2024-02-27 18:05:43
 * @LastEditors: wy
 * @LastEditTime: 2024-04-26 10:55:48
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberClassUpdateQueue.ts
 * @Description:
 */

import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
import { Lane } from './ReactFiberLane';

/**
 * update有一个action(源码中是callback),处理更新
 * action接收state
 * state可以是单一的变量也可以是函数
 */
export interface Update<State> {
	action: Action<State>;
	lane: Lane;
	next: Update<any> | null;
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

export const createUpdate = <State>(
	action: Action<State>,
	lane: Lane,
): Update<State> => {
	return {
		action,
		lane,
		next: null,
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
	// 链表结构，保存所有的update，完成批处理
	const pending = updateQueue.shared.pending;
	if (pending === null) {
		update.next = update;
	} else {
		update.next = pending.next;
		pending.next = update;
	}
	updateQueue.shared.pending = update;
};

/**
 * 处理updateQueue中的update
 * update中的action包含state
 * 计算状态的最新值
 * 源码中不是这样的
 * 现在是伪代码
 */
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null,
	renderLane: Lane,
): {
	memoizedState: State;
} => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState,
	};

	if (pendingUpdate) {
		// update是链表，要遍历链表上所有的update
		const first = pendingUpdate.next;
		let pending = pendingUpdate.next as Update<any>;

		do {
			const updateLane = pending.lane;
			if (updateLane === renderLane) {
				const action = pendingUpdate.action;
				if (action instanceof Function) {
					baseState = action(baseState);
				} else {
					baseState = action;
				}
			} else {
				if (__DEV__) {
					console.error('不因该进入updateLane !== renderLane');
				}
			}
			pending = pending.next as Update<any>;
		} while (first !== pending);
	}
	result.memoizedState = baseState;

	return result;
};
