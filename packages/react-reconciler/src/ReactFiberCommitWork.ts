/*
 * @Author: wy
 * @Date: 2024-03-26 10:36:42
 * @LastEditors: wy
 * @LastEditTime: 2024-03-27 10:25:09
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberCommitWork.ts
 * @Description:
 */
import { appendChildToContainer, Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './ReactFiber';
import { MutationMask, NoFlags, Placement } from './ReactFiberFlags';
import { HostComponent, HostRoot, HostText } from './ReactWorkTags';

/**
 * 向下查找，找到fiberNode的节点是不是需要做副作用操作
 */
let nextEffect: FiberNode | null = null;
export const commitMutationEffects = (finishedWork: FiberNode) => {
	console.warn('commitMutationEffects开始');
	nextEffect = finishedWork;
	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;
		// 不是叶子结点且有mutation,需要执行effect,向下查找，下面的节点有没有需要effect的
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			// 没有effect的节点了，开始向上遍历，在向上遍历的时候，开始真正的操作effect
			// 开始查找兄弟节点
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				// 兄弟节点查找完成，向上遍历
				nextEffect = nextEffect.return;
			}
		}
	}
};

function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
	const flags = finishedWork.flags;

	// 插入
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement; // 插入完成了，把完成的标记取消
	}
}

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行placement操作');
	}

	// parentDOM 用于插入
	const hostParent = getHostParent(finishedWork);
	// // 开始找被插入的节点Dom
	if (hostParent) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
};

/**
 * 可以插入元素的父节点有HostComponent HostRoot的父节点
 */
const getHostParent = (finishedWork: FiberNode) => {
	let parent = finishedWork.return;
	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent) {
			return parent.stateNode as Container; // 对应的真实dom
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	if (__DEV__) {
		console.warn('未找到host parent');
	}
	return null;
};

/**
 * 需要被插入的节点，这些节点就是HostComponent HostText对应的节点
 */

const appendPlacementNodeIntoContainer = (
	finishedWork: FiberNode,
	hostParent: Container,
) => {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);

		return;
	}
	// // 继续查找需要被插入的节点
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
};
