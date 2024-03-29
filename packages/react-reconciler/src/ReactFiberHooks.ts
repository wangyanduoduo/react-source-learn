/*
 * @Author: wy
 * @Date: 2024-03-27 11:24:07
 * @LastEditors: wy
 * @LastEditTime: 2024-03-28 13:54:45
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberHooks.ts
 * @Description:
 */
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import { FiberNode } from './ReactFiber';
import internals from 'shared/internals';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue,
} from './ReactFiberClassUpdateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';
const { currentDispatcher } = internals;

/**
 * 处理每一个fiberNode对应的hooks
 * 每一个fiberNode可能有多个hook，所以hook也是一个链表，通过memoizedState连接
 * hook存放在fiberNode上的memoizedState上
 */
interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

// 当前正在执行的fiber
let currentlyRenderingFiber: FiberNode | null = null;
// 当前正在执行的hook
let workInProgressHook: Hook | null = null;

export const renderWithHooks = (wip: FiberNode) => {
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;
	const current = wip.alternate;
	if (current !== null) {
		// update
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}
	const Component = wip.type;
	const props = wip.pendingProps;
	const child = Component(props);
	currentlyRenderingFiber = null;
	return child;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
};

function mountState<State>(
	initialState: (() => State) | State,
): [State, Dispatch<State>] {
	// 找到当前useState 对应的数据
	const hook = mountWorkInProgressHook();
	let state = null;
	if (initialState instanceof Function) {
		state = initialState();
	} else {
		state = initialState;
	}
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = state;

	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);

	queue.dispatch = dispatch;

	return [state, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>,
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null,
	};
	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			throw new Error('当前hook不在函数组件中');
		} else {
			// 指向第一个hook
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// 从第二个开始的hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}
