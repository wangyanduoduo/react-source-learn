/*
 * @Author: wy
 * @Date: 2024-03-26 14:23:52
 * @LastEditors: wy
 * @LastEditTime: 2024-04-18 10:35:56
 * @FilePath: /react-source-learn/packages/react-dom/src/root.ts
 * @Description:
 */
// ReactDOM.createRoot(root).render(<app>)

import { Container } from 'hostConfig';
import {
	createContainer,
	updateContainer,
} from 'react-reconciler/src/ReactFiberReconciler';
import { ReactElement } from 'shared/ReactTypes';
import { initEvent } from './SyntheticEvent';

export function createRoot(container: Container) {
	const root = createContainer(container);
	return {
		render(element: ReactElement) {
			// 初始化事件
			initEvent(container, 'click');
			return updateContainer(element, root);
		},
	};
}
