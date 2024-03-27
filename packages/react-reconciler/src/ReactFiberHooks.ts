/*
 * @Author: wy
 * @Date: 2024-03-27 11:24:07
 * @LastEditors: wy
 * @LastEditTime: 2024-03-27 11:25:45
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberHooks.ts
 * @Description:
 */
import { FiberNode } from './ReactFiber';

export const renderWithHooks = (wip: FiberNode) => {
	const Component = wip.type;
	const props = wip.pendingProps;
	const child = Component(props);
	return child;
};
