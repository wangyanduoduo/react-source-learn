/*
 * @Author: wy
 * @Date: 2024-02-27 15:34:40
 * @LastEditors: wy
 * @LastEditTime: 2024-02-29 11:45:57
 * @FilePath: /笔记/react-source-learn/packages/react-reconciler/src/ReactFiberWorkLoop.ts
 * @Description:
 */
import { FiberNode, FiberRootNode, createWorkInProgress } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { completeWork } from './ReactFiberCompleteWork';
import { HostRoot } from './ReactWorkTags';
let workInProgressRoot: FiberNode | null; // 正在被执行的fiberNode

function prepareFreshStack(root: FiberRootNode) {
	// root.current->hostRootFiber
	workInProgressRoot = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiberNode: FiberNode) {
	const root = markUpdateFromFiberToRoot(fiberNode);
	renderRoot(root);
}

/**
 * 通过fiberNode向上寻找到fiberRootNode
 */
function markUpdateFromFiberToRoot(fiberNode: FiberNode) {
	let node = fiberNode;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	// 当前事hostRootFiber
	if (node.tag == HostRoot) {
		return node.stateNode;
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	prepareFreshStack(root);
	do {
		try {
			workLoop();
		} catch (e) {
			console.warn('workLoop出错', e);
			workInProgressRoot = null;
		}
	} while (true);
}

function workLoop() {
	while (workInProgressRoot !== null) {
		performUnitOfWork(workInProgressRoot);
	}
}

// 递操作
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber); // 子fiberNode
	if (next !== null) {
		workInProgressRoot = next;
	} else {
		completeUnitWork(fiber);
	}
}

// 归操作
function completeUnitWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgressRoot = sibling;
			return;
		}

		node = node.return;
		workInProgressRoot = node;
	} while (node !== null);
}
