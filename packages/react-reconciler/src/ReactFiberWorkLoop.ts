/*
 * @Author: wy
 * @Date: 2024-02-27 15:34:40
 * @LastEditors: wy
 * @LastEditTime: 2024-02-27 16:04:59
 * @FilePath: /笔记/react-source-learn/packages/react-reconciler/src/ReactFiberWorkLoop.ts
 * @Description:
 */
import { FiberNode } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { completeWork } from './ReactFiberCompleteWork';
let workInProgressRoot: FiberNode | null; // 正在被执行的fiberNode

function prepareFreshStack(root: FiberNode) {
	workInProgressRoot = root;
}

function renderRoot(root: FiberNode) {
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
