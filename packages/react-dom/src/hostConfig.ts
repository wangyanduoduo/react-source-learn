/*
 * @Author: wy
 * @Date: 2024-02-29 10:23:35
 * @LastEditors: wy
 * @LastEditTime: 2024-03-26 14:47:27
 * @FilePath: /react-source-learn/packages/react-dom/src/hostConfig.ts
 * @Description:
 */
export type Container = Element;
export type Instance = Element;

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
