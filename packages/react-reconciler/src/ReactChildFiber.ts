import { ReactElement } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './ReactFiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './ReactWorkTags';
import { ChildDeletion, Placement } from './ReactFiberFlags';

/*
 * @Author: wy
 * @Date: 2024-03-25 11:37:36
 * @LastEditors: wy
 * @LastEditTime: 2024-04-09 18:01:45
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactChildFiber.ts
 * @Description:
 */
function childReconciler(shouldTrackEffects: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffects) {
			return;
		}

		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		}
	}
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild: ReactElement,
	) {
		// update流程
		const { key, type, $$typeof } = newChild;
		if (currentFiber !== null) {
			if (key === currentFiber.key) {
				// 	确认newChild是不是reactElementType 元素
				if ($$typeof === REACT_ELEMENT_TYPE) {
					if (type === currentFiber.type) {
						// 相等要删除原来的
					}
				} else {
					if (__DEV__) {
						console.warn('还未实现的react类型', newChild);
					}
				}
			} else {
				// 删除旧节点
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

		return null;
	};
}

export const reconcileChildrenFibers = childReconciler(true);
export const mountChildrenFibers = childReconciler(false);
