/*
 * @Author: wy
 * @Date: 2024-03-27 11:24:07
 * @LastEditors: wy
 * @LastEditTime: 2024-04-26 18:01:23
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
	processUpdateQueue,
	UpdateQueue,
} from './ReactFiberClassUpdateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';
import { Lane, NoLane, requestUpdateLane } from './ReactFiberLane';
import { Flags, PassiveEffect } from './ReactFiberFlags';
import { HasEffect, Passive } from './ReactHookEffectTags';
const { currentDispatcher } = internals;

/**
 * 处理每一个fiberNode对应的hooks
 * 每一个fiberNode可能有多个hook，所以hook也是一个链表，通过next连接
 * hook存放在fiberNode上的memoizedState上
 */
interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

export interface Effect {
	tag: Flags;
	create: EffectCallback | void;
	destroy: EffectCallback | void;
	deps: EffectDeps;
	next: Effect | null;
}

export interface FCUpdateQueue<State> extends UpdateQueue<State> {
	lastEffect: Effect | null;
}

type EffectCallback = () => void;
type EffectDeps = any[] | null;

// 当前正在执行的fiber
let currentlyRenderingFiber: FiberNode | null = null;
// 当前初始化的hook
let workInProgressHook: Hook | null = null;
// update的hook
let currentHook: Hook | null = null;

let renderLane: Lane = NoLane;

export const renderWithHooks = (wip: FiberNode, lane: Lane) => {
	// 赋值
	renderLane = lane;
	currentlyRenderingFiber = wip;
	wip.memoizedState = null; // 重置
	const current = wip.alternate;
	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// mount
		// 为函数组件绑定Dispatcher
		currentDispatcher.current = HooksDispatcherOnMount;
	}
	const Component = wip.type;
	const props = wip.pendingProps;
	const child = Component(props);

	// 重置
	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;
	renderLane = NoLane;
	return child;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
	useEffect: mountEffect,
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState,
};

function mountEffect(create: EffectCallback | void, deps: EffectDeps | void) {
	const hook = mountWorkInProgressHook();
	const nextDeps = deps === undefined ? null : deps;
	// 对fiber做作用标记
	(currentlyRenderingFiber as FiberNode).flags |= PassiveEffect;
	hook.memoizedState = pushEffect(
		Passive | HasEffect,
		create,
		undefined,
		nextDeps,
	);
}

function pushEffect(
	hookFlags: Flags,
	create: EffectCallback | void,
	destroy: EffectCallback | void,
	deps: EffectDeps,
) {
	const effect: Effect = {
		tag: hookFlags,
		create,
		destroy,
		deps,
		next: null,
	};

	const fiber = currentlyRenderingFiber as FiberNode;
	const updateQueue = fiber.updateQueue as FCUpdateQueue<any>;
	if (updateQueue === null) {
		const updateQueue = createFCUpdateQueue();
		fiber.updateQueue = updateQueue;
		effect.next = effect;
		updateQueue.lastEffect = effect;
	} else {
		const lastEffect = updateQueue.lastEffect;
		if (lastEffect === null) {
			effect.next = effect;
			updateQueue.lastEffect = effect;
		} else {
			const firstEffect = effect.next;
			lastEffect.next = effect;
			effect.next = firstEffect;
			updateQueue.lastEffect = effect;
		}
	}

	return effect;
}
function createFCUpdateQueue<State>() {
	const updateQueue = createUpdateQueue<State>() as FCUpdateQueue<State>;
	updateQueue.lastEffect = null;
	return updateQueue;
}

function updateState<State>(): [State, Dispatch<State>] {
	// 找到当前useState 对应的数据
	const hook = updateWorkInProgressHook();

	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;
	queue.shared.pending = null;
	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(
			hook.memoizedState,
			pending,
			renderLane,
		);
		hook.memoizedState = memoizedState;
	}
	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

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
	const lane = requestUpdateLane();
	const update = createUpdate(action, lane);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber, lane);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null,
	};
	// mount 时第一个hook
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

function updateWorkInProgressHook(): Hook {
	let nextCurrentHook: Hook | null = null;
	// 第一次update的hook
	if (currentHook === null) {
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			currentHook = null;
		}
	} else {
		nextCurrentHook = currentHook.next;
	}

	// 在条件表达式中使用了hook
	if (nextCurrentHook === null) {
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行的hook比上次执行时多`,
		);
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null,
	};

	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
}
