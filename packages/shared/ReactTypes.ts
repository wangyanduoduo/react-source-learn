/*
 * @Author: wy
 * @Date: 2024-02-26 16:32:56
 * @LastEditors: wy
 * @LastEditTime: 2024-03-25 14:19:39
 * @FilePath: /react-source-learn/packages/shared/ReactTypes.ts
 * @Description:
 */

export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElementType = any;

// 对应ReactElementType
export interface ReactElement {
	$$typeof: symbol | number;
	type: ElementType; // 元素的标签 <div>
	key: Key;
	ref: Ref;
	props: Props;
	_mark: string;
}

export type Action<State> = State | ((prevState: State) => State);
