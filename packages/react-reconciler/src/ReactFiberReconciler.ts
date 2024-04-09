/*
 * @Author: wy
 * @Date: 2024-02-29 10:40:40
 * @LastEditors: wy
 * @LastEditTime: 2024-04-07 16:52:53
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberReconciler.ts
 * @Description:
 */
import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './ReactFiber';
import { HostRoot } from './ReactWorkTags';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
} from './ReactFiberClassUpdateQueue';
import { ReactElement } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';

/**
 * 返回fiberRootNode节点
 * const root = ReactDOM.createRoot(document.getElementById('root'));
 * createRoot触发createContainer
 */
export const createContainer = (container: Container) => {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue(); // 连接更新机制
	return root;
};

/**
 * render触发updateContainer
 * root.render(<App />);在updateContainer中使用的就是element=<app>
 * 更新的时候，也需要container
 * 需要把这个方法和workLoop中的renderRoot连接起来
 */

export const updateContainer = (
	element: ReactElement | null,
	root: FiberRootNode,
) => {
	const hostRootFiber = root.current; // mount的时候current指向的就是render时候的<App>
	const update = createUpdate<ReactElement | null>(element);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElement | null>,
		update,
	);
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
};
