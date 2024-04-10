import { FiberNode } from 'react-reconciler/src/ReactFiber';
import { HostText } from 'react-reconciler/src/ReactWorkTags';

/*
 * @Author: wy
 * @Date: 2024-02-29 10:23:35
 * @LastEditors: wy
 * @LastEditTime: 2024-04-10 14:29:40
 * @FilePath: /react-source-learn/packages/react-dom/src/hostConfig.ts
 * @Description:
 */
export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (type: string): Instance => {
	const element = document.createElement(type);
	return element;
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

export const commitUpdate = (fiber: FiberNode) => {
	switch (fiber.tag) {
		case HostText:
			const text = fiber.memoizedProps.content;
			// 更新text
			commitText(fiber.stateNode, text);
	}
};

export const commitText = (textInstance: TextInstance, text: string) => {
	textInstance.textContent = text;
};
