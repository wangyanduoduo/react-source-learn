/*
 * @Author: wy
 * @Date: 2024-03-26 14:23:52
 * @LastEditors: wy
 * @LastEditTime: 2024-03-26 18:13:08
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

export function createRoot(container: Container) {
	const root = createContainer(container);
	return {
		render(element: ReactElement) {
			updateContainer(element, root);
		},
	};
}
