import { Key, Props, ReactElement } from 'shared/ReactTypes';
import {
	createFiberFromElement,
	createFiberFromFragment,
	createWorkInProgress,
	FiberNode,
} from './ReactFiber';
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols';
import { HostText, Fragment } from './ReactWorkTags';
import { ChildDeletion, Placement } from './ReactFiberFlags';

type ExistingChildren = Map<string | number, FiberNode>;

/*
 * @Author: wy
 * @Date: 2024-03-25 11:37:36
 * @LastEditors: wy
 * @LastEditTime: 2024-04-18 16:13:22
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
		const { key, type, $$typeof } = newChild;
		let { props } = newChild;
		// 创建<app>时currentFiber === null
		while (currentFiber !== null) {
			if (key === currentFiber.key) {
				// 	确认newChild是不是reactElementType 元素
				if ($$typeof === REACT_ELEMENT_TYPE) {
					// key相同, type相同 复用节点
					if (type === currentFiber.type) {
						// 相同的type，开始复用逻辑
						// 处理fragment
						if (type === REACT_FRAGMENT_TYPE) {
							props = props.children;
						}
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
		// 创建fragment的fiber
		let fiber;
		if (newChild.type === REACT_FRAGMENT_TYPE) {
			fiber = createFiberFromFragment(newChild.props.children, key);
		} else {
			fiber = createFiberFromElement(newChild);
		}

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
	) {
		// 最后一个可复用fiber在current中的位置
		let lastPlacedIndex: number = 0;
		let lastNewFiber: FiberNode | null = null;
		let firstNewFiber: FiberNode | null = null;
		// 1.current同级的fiber要保存在map中
		const existingChildren: ExistingChildren = new Map();
		let current = currentFirstChild;
		while (current !== null) {
			const keyToUse = current.key !== null ? current.key : current.index;
			existingChildren.set(keyToUse, current);
			current = current.sibling;
		}
		// 2.遍历newChild数组，遍历的每一个element会存在可以复用或者不能复用的情况
		for (let i = 0; i < newChild.length; i++) {
			const after = newChild[i];

			const newFiber = updateFromMap(returnFiber, existingChildren, i, after);
			// newFiber可能是复用的，可能是新创建的，可能是null
			// {xx===xxx? && <xxx>} 这种情况产生的newFiber就可能是null
			if (newFiber === null) {
				continue;
			}

			// 3.判断是插入还是移动
			newFiber.index = i;
			newFiber.return = returnFiber;
			if (lastNewFiber === null) {
				lastNewFiber = newFiber;
				firstNewFiber = newFiber;
			} else {
				lastNewFiber.sibling = newFiber;
				lastNewFiber = lastNewFiber.sibling;
			}

			if (!shouldTrackEffects) {
				continue;
			}
			// 在newFiber之前的信息
			const current = newFiber.alternate;
			if (current !== null) {
				// update
				const oldIndex = current.index;
				if (oldIndex < lastPlacedIndex) {
					// 移动
					newFiber.flags |= Placement;
					continue;
				} else {
					// 位置没有变，更新lastPlacedIndex
					lastPlacedIndex = oldIndex;
				}
			} else {
				// mount
				// 新的fiber插入
				newFiber.flags |= Placement;
			}
		}

		// 4.map中剩下的不可复用的都标记删除
		existingChildren.forEach((fiber) => {
			deleteChild(returnFiber, fiber);
		});
		return firstNewFiber;
	}

	// 处理节点的复用情况
	function updateFromMap(
		returnFiber: FiberNode,
		existingChildren: ExistingChildren,
		index: number,
		element: any,
	): FiberNode | null {
		const keyToUse = element.key !== null ? element.key : index;
		const before = existingChildren.get(keyToUse) || null;
		// 文本节点 HostText
		if (typeof element === 'string' || typeof element === 'number') {
			if (before) {
				// 找到可以复用的节点之后，把保存信息删除
				if (before.tag === HostText) {
					existingChildren.delete(keyToUse);
					return useFiber(before, { content: element + '' });
				}
			}
			// 可复用节点不存在，创建新新的节点
			return new FiberNode(HostText, { content: element + '' }, null);
		}

		// element是reactElement节点
		if (typeof element === 'object' || element !== null) {
			switch (element.$$typeof) {
				case REACT_ELEMENT_TYPE:
					// 处理fragment
					if (element.type === REACT_FRAGMENT_TYPE) {
						return updateFragment(
							returnFiber,
							before,
							element,
							keyToUse,
							existingChildren,
						);
					}
					if (before) {
						if (before.type === element.type) {
							existingChildren.delete(keyToUse);
							return useFiber(before, element.props);
						}
					}
					return createFiberFromElement(element);
				default:
					break;
			}
		}
		// element是数组/fragment的情况
		if (Array.isArray(element) && __DEV__) {
			// 先当成fragment处理
			return updateFragment(
				returnFiber,
				before,
				element,
				keyToUse,
				existingChildren,
			);
		}
		return null;
	}

	return function reconcilerChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: any,
	) {
		// 1 判断fragment的react元素
		const isUnKeyedTopLevelFragment =
			typeof newChild === 'object' &&
			newChild !== null &&
			newChild.type === REACT_FRAGMENT_TYPE &&
			newChild.key === null;
		// 当newChild是fragment的元素的时候，真正的newChild是newChild.props.children
		if (isUnKeyedTopLevelFragment) {
			// 此时newChild是数组，进入“reconcileChildrenArray”逻辑
			newChild = newChild.props.children;
		}

		if (typeof newChild === 'object' && newChild !== null) {
			if (Array.isArray(newChild)) {
				return reconcileChildrenArray(returnFiber, currentFiber, newChild);
			}
			// 2 根据新的reactElement生成fiberNode
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
			deleteRemainingChild(returnFiber, currentFiber);
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

function updateFragment(
	returnFiber: FiberNode,
	currentFiber: FiberNode | null,
	elements: any[],
	key: Key,
	existingChildren: ExistingChildren,
) {
	let fiber;
	if (!currentFiber || currentFiber.tag !== Fragment) {
		fiber = createFiberFromFragment(elements, key);
	} else {
		existingChildren.delete(key);
		fiber = useFiber(currentFiber, elements);
	}
	fiber.return = returnFiber;
	return fiber;
}

export const reconcileChildrenFibers = childReconciler(true);
export const mountChildrenFibers = childReconciler(false);
