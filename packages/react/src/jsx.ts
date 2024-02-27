/*
 * @Author: wy
 * @Date: 2024-02-26 15:44:03
 * @LastEditors: wy
 * @LastEditTime: 2024-02-27 10:44:58
 * @FilePath: /笔记/react-source-learn/packages/react/src/jsx.ts
 * @Description:
 */
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import type {
	Type,
	Key,
	Ref,
	Props,
	ElementType,
	ReactElement,
} from 'shared/ReactTypes';
const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props,
): ReactElement {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		_mark: 'wy set',
	};
	return element;
};
// jsx 方法
export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	// key 和 ref 是特殊的props
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}

		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		// 确定config[prop]是config自带的，而不是原型上的
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}

		const childrenLen = maybeChildren.length;
		if (childrenLen) {
			if (childrenLen === 1) {
				props.children = maybeChildren[0];
			} else {
				props.children = maybeChildren;
			}
		}
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	// key 和 ref 是特殊的props
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}

		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		// 确定config[prop]是config自带的，而不是原型上的
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	return ReactElement(type, key, ref, props);
};
