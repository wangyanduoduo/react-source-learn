import { ReactElement } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './ReactFiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './ReactWorkTags';
import { Placement } from './ReactFiberFlags';

/*
 * @Author: wy
 * @Date: 2024-03-25 11:37:36
 * @LastEditors: wy
 * @LastEditTime: 2024-03-25 14:29:08
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactChildFiber.ts
 * @Description:
 */
function childReconciler(shouldTrackEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild: ReactElement,
	) {
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
