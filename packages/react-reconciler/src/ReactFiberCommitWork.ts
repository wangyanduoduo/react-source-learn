/*
 * @Author: wy
 * @Date: 2024-03-26 10:36:42
 * @LastEditors: wy
 * @LastEditTime: 2024-04-19 17:49:18
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberCommitWork.ts
 * @Description:
 */
import {
	appendChildToContainer,
	commitUpdate,
	Container,
	insertChildToContainer,
	Instance,
	removeChild,
} from 'hostConfig';
import { FiberNode, FiberRootNode } from './ReactFiber';
import {
	ChildDeletion,
	MutationMask,
	NoFlags,
	Placement,
	Update,
} from './ReactFiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText,
} from './ReactWorkTags';

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
				// 操作当前fiber的flags
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
	// 更新
	if ((flags & Update) !== NoFlags) {
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update; // 更新完成了，把完成的标记取消
	}
	// 删除
	if ((flags & ChildDeletion) !== NoFlags) {
		const deletions = finishedWork.deletions;
		if (deletions) {
			deletions.forEach((childToDelete) => {
				commitDeletion(childToDelete);
			});
		}

		finishedWork.flags &= ~ChildDeletion; // 更新完成了，把完成的标记取消
	}
}

/**
 * 删除节点
 * - 函数组件需要处理删除时的unMount情况，解绑ref
 * - hostComponent解绑ref
 * - 子树的根节点需要移除dom
 */
const commitDeletion = (childToDelete: FiberNode) => {
	let rootHostNode: FiberNode | null = null; // 需要被删除节点的根节点
	// 递归子树
	commitNestedComponent(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				// todo
				if (rootHostNode === null) {
					rootHostNode = unmountFiber;
				}
				return;
			case FunctionComponent:
				// todo
				// 处理useEffect的unmount
				break;
			case HostText:
				if (rootHostNode === null) {
					rootHostNode = unmountFiber;
				}
				return;
			default:
				if (__DEV__) {
					console.warn('未实现的delete fiber', unmountFiber);
				}
				return;
		}
	});
	// 移除rootHostNode的dom
	if (rootHostNode !== null) {
		const hostParent = getHostParent(childToDelete);
		if (hostParent !== null) {
			removeChild((rootHostNode as FiberNode).stateNode, hostParent);
		}
	}

	childToDelete.return = null;
	childToDelete.child = null;
};

const commitNestedComponent = (
	root: FiberNode,
	onCommitUnmount: (fiber: FiberNode) => void,
) => {
	let node = root;
	while (true) {
		onCommitUnmount(node);
		if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === root) {
			return;
		}
		while (node.sibling === null) {
			if (node.return === null || node.return === root) {
				return;
			}
			node = node.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
};

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行placement操作');
	}

	// parentDOM 用于插入
	const hostParent = getHostParent(finishedWork);
	const sibling = getHostSibling(finishedWork);
	// // 开始找被插入的节点Dom
	if (hostParent) {
		insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
	}
};
/**
 * 在处理多节点的时候，插入就单单是子插入父中，还有兄弟节点，依据兄弟节点插入
 * 用于获取Fiber节点的宿主节点的兄弟节点
 *
 */
function getHostSibling(fiber: FiberNode) {
	let node: FiberNode = fiber;

	findSibling: while (true) {
		// 当sibling不存在的时候，需要向上查找
		/**
		 * 例如<Test/><div>
		 * Test = return <div></div>
		 * 向插入Test就需要向上查找到Test的兄弟div
		 */
		while (node.sibling === null) {
			const parent = node.return;
			// 如果到达根节点还未找到，则返回null。
			if (
				parent === null ||
				parent.tag === HostComponent ||
				parent.tag === HostRoot
			) {
				return null;
			}
			node = parent;
		}

		node.sibling.return = node.return;
		node = node.sibling;

		// 不是期望的可以使用的sibling，向下寻找可以使用的child节点
		while (node.tag !== HostText && node.tag !== HostComponent) {
			// 当前节点的flags是Placement说明这个节点也是需要被插入或者移动的节点，也不能作为一个可以依靠的sibling
			if ((node.flags & Placement) !== NoFlags) {
				continue findSibling;
			}

			if (node.child === null) {
				// 没有child，也跳出findSibling
				continue findSibling;
			} else {
				node.child.return = node;
				node = node.child;
			}
		}
		// node.tag === HostText && node.tag == HostComponent && node.flags 不是Placement，是满足需要使用的siblingNode
		if ((node.flags & Placement) === NoFlags) {
			return node.stateNode;
		}
	}
}

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

const insertOrAppendPlacementNodeIntoContainer = (
	finishedWork: FiberNode,
	hostParent: Container,
	before?: Instance,
) => {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		if (before) {
			insertChildToContainer(finishedWork.stateNode, hostParent, before);
		} else {
			appendChildToContainer(hostParent, finishedWork.stateNode);
		}

		return;
	}
	// // 继续查找需要被插入的节点
	const child = finishedWork.child;
	if (child !== null) {
		insertOrAppendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;
		while (sibling !== null) {
			insertOrAppendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
};
