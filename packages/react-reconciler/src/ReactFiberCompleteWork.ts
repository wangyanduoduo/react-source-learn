import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance,
} from 'hostConfig';
import { FiberNode } from './ReactFiber';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText,
} from './ReactWorkTags';
import { NoFlags, Update } from './ReactFiberFlags';

/*
 * @Author: wy
 * @Date: 2024-02-27 15:37:10
 * @LastEditors: wy
 * @LastEditTime: 2024-03-27 11:27:09
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberCompleteWork.ts
 * @Description:
 */

function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update;
}
export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// 构建dom
				// dom插入dom树
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type);
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
				const oldText = wip.memoizedProps.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				// 构建dom
				const instance = createTextInstance(newProps.content);
				// dom插入dom树
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork', wip);
			}
	}
};

function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			node.child.return = node; //
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;
		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
