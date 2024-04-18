import { Container } from 'react-reconciler/src/hostConfig';
import { Props } from 'shared/ReactTypes';

/*
 * @Author: wy
 * @Date: 2024-04-17 16:59:20
 * @LastEditors: wy
 * @LastEditTime: 2024-04-18 10:30:47
 * @FilePath: /react-source-learn/packages/react-dom/src/SyntheticEvent.ts
 * @Description:
 */
const validEventTypeList = ['click']; // 可以匹配的事件
type EventCallback = (e: Event) => void;
interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}
// 声明合成事件
interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}
export const elementPropsKey = '__props'; // 在dom元素上绑定一个属性，用来存放操作的方法

export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}
// 为dom添加props属性
export function updateFiberProps(node: DOMElement, props: Props) {
	node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
	if (!validEventTypeList.includes(eventType)) {
		console.warn('当前不支持', eventType, '事件');
		return;
	}
	if (__DEV__) {
		console.log('初始化事件', eventType);
	}

	container.addEventListener(eventType, (e: Event) => {
		// todo
		dispatchEvent(container, eventType, e);
	});
}

// 创建合成事件
function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;
	// 重写原生的阻止冒泡的事件
	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};
	return syntheticEvent;
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	const targetElement = e.target as DOMElement;
	if (targetElement === null) {
		console.warn('事件不存在target', targetElement);
		return;
	}
	// 1.收集从目标dom到container的事件
	const { capture, bubble } = collectPaths(targetElement, eventType, container);
	// 2.构造合成事件
	const se = createSyntheticEvent(e);
	// 3.遍历capture
	triggerEventFlow(capture, se);

	if (!se.__stopPropagation) {
		// 4.遍历bubble
		triggerEventFlow(bubble, se);
	}
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);
		// 阻止冒泡
		if (se.__stopPropagation) {
			break;
		}
	}
}

function getEventCallbackNameFromEventType(
	eventType: string,
): string[] | undefined {
	return {
		click: ['onClickCapture', 'onClick'],
	}[eventType];
}

function collectPaths(
	targetElement: DOMElement,
	eventType: string,
	container: Container,
) {
	const paths: Paths = {
		capture: [],
		bubble: [],
	};
	// 开始收集事件
	while (targetElement && targetElement !== container) {
		const elementProps = targetElement[elementPropsKey];
		if (elementProps) {
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList?.forEach((callbackName, i) => {
					const eventCallback = elementProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							paths.capture.unshift(eventCallback);
						} else {
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
		}
		targetElement = targetElement.parentNode as DOMElement;
	}
	return paths;
}
