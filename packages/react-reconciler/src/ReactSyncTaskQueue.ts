/*
 * @Author: wy
 * @Date: 2024-04-25 14:15:34
 * @LastEditors: wy
 * @LastEditTime: 2024-04-25 14:21:52
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactSyncTaskQueue.ts
 * @Description:
 */
let syncQueue: ((...args: any) => void)[] | null = null;
let isFlushingSyncQueue = false;

/**
 * 收集所有的调度任务
 */
export function scheduleSyncCallback(callback: (...args: any) => void): void {
	if (syncQueue === null) {
		syncQueue = [callback];
	} else {
		syncQueue.push(callback);
	}
}

/**
 * 执行调度任务
 */
export function flushSyncCallbacks() {
	if (!isFlushingSyncQueue && syncQueue) {
		isFlushingSyncQueue = true;
		try {
			syncQueue.forEach((callback) => callback());
		} catch (e) {
			if (__DEV__) {
				console.error('flushSyncCallbacks报错', e);
			}
		} finally {
			isFlushingSyncQueue = false;
		}
	}
}
