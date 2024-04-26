/*
 * @Author: wy
 * @Date: 2024-02-27 15:05:42
 * @LastEditors: wy
 * @LastEditTime: 2024-04-26 18:01:11
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberFlags.ts
 * @Description:
 */
export type Flags = number;

export const NoFlags = /*                      */ 0b0000000000000000000000000000;
export const PerformedWork = /*                */ 0b0000000000000000000000000001;
export const Placement = /*                    */ 0b0000000000000000000000000010;
export const DidCapture = /*                   */ 0b0000000000000000000010000000;
export const Hydrating = /*                    */ 0b0000000000000001000000000000;

// You can change the rest (and add more).
export const Update = /*                       */ 0b0000000000000000000000000100;

export const ChildDeletion = /*                */ 0b0000000000000000000000010000;

/**
 * 标记当前的fiber在更新中有没有副作用
 */
export const PassiveEffect = /*                      */ 0b0000000000000000100000000000;

export const MutationMask = Placement | Update | ChildDeletion;

// 组件卸载的时候。useEffect中的return函数也需要执行的
export const PassiveMask = PassiveEffect | ChildDeletion;
