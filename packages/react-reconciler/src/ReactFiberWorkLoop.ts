/*
 * @Author: wy
 * @Date: 2024-02-27 15:34:40
 * @LastEditors: wy
 * @LastEditTime: 2024-03-27 10:11:32
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberWorkLoop.ts
 * @Description:
 */
import { FiberNode, FiberRootNode, createWorkInProgress } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { commitMutationEffects } from './ReactFiberCommitWork';
import { completeWork } from './ReactFiberCompleteWork';
import { MutationMask, NoFlags } from './ReactFiberFlags';
import { HostRoot } from './ReactWorkTags';
let workInProgressRoot: FiberNode | null; // 正在被执行的fiberNode

/**
 * 初始化操作，把workInProgressRoot指向第一个fiberNode,对应根节点
 * @param root
 */
function prepareFreshStack(root: FiberRootNode) {
	// root.current->hostRootFiber
	workInProgressRoot = createWorkInProgress(root.current, {});
}

/**
 * 目的是获取到fiberRootNode
 */
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

/**
 * 触发更新的api调用这些方法
 */
function renderRoot(root: FiberRootNode) {
	prepareFreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop出错', e);
			}

			workInProgressRoot = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	/**
	 * commit 阶段包含如下2个步骤
	 * - beforeMutation
	 * - mutation
	 * layout
	 */
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}
	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}
	// 重置
	root.finishedWork = null;

	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation
		commitMutationEffects(finishedWork);
		root.current = finishedWork;
		// layout
	} else {
		root.current = finishedWork;
	}
}

function workLoop() {
	while (workInProgressRoot !== null) {
		performUnitOfWork(workInProgressRoot);
	}
}

// 递操作
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber); // 子fiberNode
	fiber.memoizedProps = fiber.pendingProps;
	if (next !== null) {
		// next存在继续递操作
		workInProgressRoot = next;
	} else {
		// next不存在归操作
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
