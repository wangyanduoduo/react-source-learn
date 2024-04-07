/*
 * @Author: wy
 * @Date: 2024-04-07 11:16:28
 * @LastEditors: wy
 * @LastEditTime: 2024-04-07 11:18:33
 * @FilePath: /react-source-learn/packages/react-dom/test-utils.ts
 * @Description:
 */
import { ReactElement } from 'shared/ReactTypes';
// @ts-ignore
import { createRoot } from 'react-dom';

export function renderIntoDocument(element: ReactElement) {
	const div = document.createElement('div');
	return createRoot(div).render(element);
}
