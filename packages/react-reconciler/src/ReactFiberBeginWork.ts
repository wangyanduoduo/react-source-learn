/*
 * @Author: wy
 * @Date: 2024-02-27 15:35:11
 * @LastEditors: wy
 * @LastEditTime: 2024-02-27 15:54:46
 * @FilePath: /笔记/react-source-learn/packages/react-reconciler/src/ReactFiberBeginWork.ts
 * @Description:
 */
import { FiberNode } from './ReactFiber';

export const beginWork = (fiber: FiberNode) => {
	return fiber.child;
};
