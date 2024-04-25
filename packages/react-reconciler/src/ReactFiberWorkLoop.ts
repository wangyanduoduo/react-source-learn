/*
 * @Author: wy
 * @Date: 2024-02-27 15:34:40
 * @LastEditors: wy
 * @LastEditTime: 2024-04-24 16:52:35
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberWorkLoop.ts
 * @Description:
 */
import { FiberNode, FiberRootNode, createWorkInProgress } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { commitMutationEffects } from './ReactFiberCommitWork';
import { completeWork } from './ReactFiberCompleteWork';
import { MutationMask, NoFlags } from './ReactFiberFlags';
import { Lane, mergeLanes } from './ReactFiberLane';
import { HostRoot } from './ReactWorkTags';
let workInProgressRoot: FiberNode | null; // 正在被执行的fiberNode

/**
 * 初始化操作，把workInProgressRoot指向第一个fiberNode,对应根节点
 * @param root
 */
function prepareFreshStack(root: FiberRootNode) {
	// root.current->hostRootFiber
	// createWorkInProgress的mount之后hostRootFiber就有alternate了指向root.current
	workInProgressRoot = createWorkInProgress(root.current, {});
}

/**
 * 目的是获取到fiberRootNode
 */
export function scheduleUpdateOnFiber(fiberNode: FiberNode, lane: Lane) {
	const root = markUpdateFromFiberToRoot(fiberNode);
	markRootUpdated(root, lane);
	renderRoot(root);
}

/**
 * 标记根节点的pendingLanes
 */
function markRootUpdated(root: FiberRootNode, lane: Lane) {
	root.pendingLanes = mergeLanes(root.pendingLanes, lane);
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
	// 当前是hostRootFiber
	if (node.tag == HostRoot) {
		return node.stateNode;
	}
	return null;
}

/**
 * 触发更新的api调用这些方法
 */
function renderRoot(root: FiberRootNode) {
	// 创建wip
	// 第一次是<App> 对应的wip
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
	// 获取到完成递归的fiberTree
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
