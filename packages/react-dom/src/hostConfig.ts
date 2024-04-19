import { FiberNode } from 'react-reconciler/src/ReactFiber';
import { HostText } from 'react-reconciler/src/ReactWorkTags';
import { DOMElement, updateFiberProps } from './SyntheticEvent';
import { Props } from 'shared/ReactTypes';

/*
 * @Author: wy
 * @Date: 2024-02-29 10:23:35
 * @LastEditors: wy
 * @LastEditTime: 2024-04-19 17:44:48
 * @FilePath: /react-source-learn/packages/react-dom/src/hostConfig.ts
 * @Description:
 */
export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (type: string, props: Props): Instance => {
	const element = document.createElement(type) as unknown;
	updateFiberProps(element as DOMElement, props);
	return element as DOMElement;
};

export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance,
) => {
	parent.appendChild(child);
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendChildToContainer = appendInitialChild;

export const insertChildToContainer = (
	child: Instance,
	container: Container,
	before: Instance,
) => {
	container.insertBefore(child, before);
};

export const commitUpdate = (fiber: FiberNode) => {
	switch (fiber.tag) {
		case HostText:
			const text = fiber.memoizedProps.content;
			// 更新text
			return commitText(fiber.stateNode, text);
		default:
			if (__DEV__) {
				console.warn('未实现的update', fiber);
			}
			break;
	}
};

export const commitText = (textInstance: TextInstance, text: string) => {
	textInstance.textContent = text;
};

export const removeChild = (
	child: Instance | TextInstance,
	container: Container,
) => {
	container.removeChild(child);
};
