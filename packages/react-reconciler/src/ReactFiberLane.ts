/*
 * @Author: wy
 * @Date: 2024-04-24 15:32:01
 * @LastEditors: wy
 * @LastEditTime: 2024-04-25 13:58:48
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactFiberLane.ts
 * @Description:
 */
export type Lanes = number;
export type Lane = number;
export const TotalLanes = 31;

export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncHydrationLane: Lane = /*               */ 0b0000000000000000000000000000001;
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000010;
export const SyncLaneIndex: number = 1;

export const InputContinuousHydrationLane: Lane = /*    */ 0b0000000000000000000000000000100;
export const InputContinuousLane: Lane = /*             */ 0b0000000000000000000000000001000;

export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000000010000;
export const DefaultLane: Lane = /*                     */ 0b0000000000000000000000000100000;

export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
	return a | b;
}

export function requestUpdateLane(): Lane {
	return SyncLane;
}

/**
 * 获取优先级最高的lane
 */
export function getHighestPriorityLane(lanes: Lanes): Lane {
	return lanes & -lanes;
}
