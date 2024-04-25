/*
 * @Author: wy
 * @Date: 2024-02-27 14:43:41
 * @LastEditors: wy
 * @LastEditTime: 2024-04-24 16:39:14
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiber.ts
 * @Description:
 */
import { Key, Ref, Props, ReactElement } from 'shared/ReactTypes';
import {
	FunctionComponent,
	HostComponent,
	WorkTag,
	Fragment,
} from './ReactWorkTags';
import { Flags, NoFlags } from './ReactFiberFlags';
import { Container } from 'hostConfig';
import { Lane, Lanes, NoLane, NoLanes } from './ReactFiberLane';

export class FiberNode {
	tag: WorkTag; // fiberNode 是什么类型的节点
	ref: Ref;

	key: Key | null;
	stateNode: any; // 当前fiberNode对应的真实的dom 例如 div hostRootFiber的stateNode指向fiberRootNode
	type: any; // 对应的element的函数， 例如functionComponent的函数，如果节点是一个函数，type就是函数本身

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	alternate: FiberNode | null; // current 和 wip 之间的fiberNode相互指向
	index: number; // 同级别有很多元素，依次为0，1，2，3。。。

	pendingProps: Props; // 在fiberNode作为工作单元刚开始工作的时候的props
	memoizedProps: Props; // 在fiberNode作为工作单元结束工作的时候props
	updateQueue: unknown;
	memoizedState: any;

	flags: Flags; // 当前节点的操作类型 例如 插入，删除 flags 被统称为副作用
	subtreeFlags: Flags; // 子树的操作类型
	deletions: FiberNode[] | null;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.ref = null;
		this.key = key || null;
		this.stateNode = null;
		this.type = null;

		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.alternate = null;

		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.updateQueue = null;

		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
		this.deletions = null;
	}
}

/**
 * 指向hostRootFiber跟节点的fiberNode
 */
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;
	pendingLanes: Lanes;
	finishedLane: Lane;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
		this.pendingLanes = NoLanes;
		this.finishedLane = NoLane;
	}
}

/**
 * createWorkInProgress 在hostRootFiber的时候创建的时候，
 * 创建第一个fiberNode,命中wip === null，为这个wip绑定了alternate
 */
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props,
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.type = current.type;
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags; // 初始化所有副作用
		wip.subtreeFlags = NoFlags; // 初始化所有副作用
		wip.deletions = null;
	}

	// 复用current中的部分属性
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedState = current.memoizedState;
	return wip;
};

export function createFiberFromElement(element: ReactElement) {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		// div type: div
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}

export function createFiberFromFragment(elements: any[], key: Key): FiberNode {
	const fiber = new FiberNode(Fragment, elements, key);
	return fiber;
}
