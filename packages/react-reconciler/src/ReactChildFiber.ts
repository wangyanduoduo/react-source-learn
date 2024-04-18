import { Props, ReactElement } from 'shared/ReactTypes';
import {
	createFiberFromElement,
	createWorkInProgress,
	FiberNode,
} from './ReactFiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './ReactWorkTags';
import { ChildDeletion, Placement } from './ReactFiberFlags';

/*
 * @Author: wy
 * @Date: 2024-03-25 11:37:36
 * @LastEditors: wy
 * @LastEditTime: 2024-04-18 15:50:35
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactChildFiber.ts
 * @Description:
 */
function childReconciler(shouldTrackEffects: boolean) {
	// 标记需要被删除的节点
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffects) {
			return;
		}

		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}
	// 在diff比较的时候，父节点的所有孩子都需要被删除的时候
	// 当前被删除的节点，设置兄弟节点也要被删除
	function deleteRemainingChild(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
	) {
		if (!shouldTrackEffects) {
			return;
		}
		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}
	// 更新之后变成单节点
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild: ReactElement,
	) {
		// update流程
		const { key, type, $$typeof, props } = newChild;
		// 创建<app>时currentFiber === null
		while (currentFiber !== null) {
			if (key === currentFiber.key) {
				// 	确认newChild是不是reactElementType 元素
				if ($$typeof === REACT_ELEMENT_TYPE) {
					// key相同, type相同 复用节点
					if (type === currentFiber.type) {
						// 相同的type，开始复用逻辑
						const existing = useFiber(currentFiber, props);
						existing.return = returnFiber;
						// 因为是变成单一节点，所以能够复用的肯定是只有一个节点，剩余的节点就需要被删除
						deleteRemainingChild(returnFiber, currentFiber.sibling);
						return existing;
					}
					// type不相等 一个能复用的节点都不存在，所有的节点都需要被删除
					deleteRemainingChild(returnFiber, currentFiber);
					break;
				} else {
					if (__DEV__) {
						console.warn('还未实现的react类型', newChild);
					}
					break;
				}
			} else {
				// key不同删除旧节点,需要判断别的兄弟节点的key有没有和变化之后的key相同
				// 所以不能直接把所有的兄弟节点直接删除
				deleteChild(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
				// break work;
			}
		}

		// mount时的流程
		const fiber = createFiberFromElement(newChild);
		fiber.return = returnFiber;
		return fiber;
	}

	// 更新之后变成单节点
	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number,
	) {
		while (currentFiber !== null) {
			// update
			if (currentFiber.tag === HostText) {
				// 类型不变复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				deleteRemainingChild(returnFiber, currentFiber.sibling);
				return existing;
			}

			// 不能复用删除
			deleteChild(returnFiber, currentFiber);
			currentFiber = currentFiber.sibling;
		}
		// mount
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	// 定义是否shouldTrackEffects
	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}

	// 处理多节点转化的问题
	/**
	 * 1.current同级的fiber要保存在map中
	 * 2.遍历newChild数组，遍历的每一个element会存在可以复用或者不能复用的情况
	 * 3.判断是插入还是移动
	 * 4.map中剩下的都标记删除
	 */
	function reconcileChildrenArray(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild: any[],
	);

	return function reconcilerChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElement,
	) {
		// todo
		// 根据新的reactElement生成fiberNode
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild),
					);

				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
					break;
			}

			if (Array.isArray(newChild)) {
				return reconcileChildrenArray(returnFiber, currentFiber, newChild);
			}
		}

		// HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild),
			);
		}

		// 兜底删除
		if (currentFiber) {
			deleteChild(returnFiber, currentFiber);
		}

		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild);
		}

		return null;
	};
}

// 处理复用的情况
function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
	const clone = createWorkInProgress(fiber, pendingProps);
	clone.index = 0;
	clone.sibling = null;
	return clone;
}

export const reconcileChildrenFibers = childReconciler(true);
export const mountChildrenFibers = childReconciler(false);
