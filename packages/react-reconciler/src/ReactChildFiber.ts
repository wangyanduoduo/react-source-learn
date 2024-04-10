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
 * @LastEditTime: 2024-04-10 11:27:57
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
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild: ReactElement,
	) {
		// update流程
		const { key, type, $$typeof, props } = newChild;
		work: if (currentFiber !== null) {
			if (key === currentFiber.key) {
				// 	确认newChild是不是reactElementType 元素
				if ($$typeof === REACT_ELEMENT_TYPE) {
					if (type === currentFiber.type) {
						// 相同的type，开始复用逻辑
						const existing = useFiber(currentFiber, props);
						existing.return = returnFiber;
						return existing;
					}
					// type不相等 删除旧节点
					deleteChild(returnFiber, currentFiber);
					break work;
				} else {
					if (__DEV__) {
						console.warn('还未实现的react类型', newChild);
					}
					break work;
				}
			} else {
				// 删除旧节点
				deleteChild(returnFiber, currentFiber);
				// break work;
			}
		}

		// mount时的流程
		const fiber = createFiberFromElement(newChild);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number,
	) {
		if (currentFiber !== null) {
			// update
			if (currentFiber.tag === HostText) {
				// 复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				return existing;
			}

			// 不能复用删除
			deleteChild(returnFiber, currentFiber);
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
