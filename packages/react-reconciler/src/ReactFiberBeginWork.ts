/*
 * @Author: wy
 * @Date: 2024-02-27 15:35:11
 * @LastEditors: wy
 * @LastEditTime: 2024-04-23 17:04:36
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberBeginWork.ts
 * @Description:
 */
import { ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './ReactFiber';
import { processUpdateQueue, UpdateQueue } from './ReactFiberClassUpdateQueue';
import {
	Fragment,
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText,
} from './ReactWorkTags';
import {
	mountChildrenFibers,
	reconcileChildrenFibers,
} from './ReactChildFiber';
import { renderWithHooks } from './ReactFiberHooks';
/**
 * 寻找子节点
 * @param fiber
 * @returns
 */
export const beginWork = (wip: FiberNode) => {
	const tag = wip.tag;

	switch (tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case FunctionComponent:
			return updateFunctionComponent(wip);
		case Fragment:
			return updateFragment(wip);
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork还未实现的类型');
			}
			return null;
	}
};

/**
 * processUpdateQueue计算状态的最新值
 *
 */

const updateFragment = (wip: FiberNode) => {
	const nextChildren = wip.pendingProps;
	reconcilerChildren(wip, nextChildren);
	return wip.child;
};

const updateHostRoot = (wip: FiberNode) => {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending; // 新的属性，用于更新赋值
	updateQueue.shared.pending = null; // 新值被使用了，就把旧值变成null
	// 开始更新
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	// 创建子fiberNode
	// nextChildren是reactElement,利用这个生成对应的子fiberNode
	const nextChildren = wip.memoizedState;
	reconcilerChildren(wip, nextChildren);
	return wip.child;
};

// 元素节点没有更新操作，只生成子fiberNode
function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	// 创建fiber.child
	// nextChildren是虚拟dom
	reconcilerChildren(wip, nextChildren);
	return wip.child;
}

function updateFunctionComponent(wip: FiberNode) {
	reconcilerChildren(wip, renderWithHooks(wip));
	return wip.child;
}

function reconcilerChildren(wip: FiberNode, children?: ReactElement) {
	const current = wip.alternate;
	if (current !== null) {
		// update

		// <App>对应的fiberNode的child是null,开始做对应生成
		wip.child = reconcileChildrenFibers(wip, current.child, children);
	} else {
		// mount
		wip.child = mountChildrenFibers(wip, null, children);
	}
}
