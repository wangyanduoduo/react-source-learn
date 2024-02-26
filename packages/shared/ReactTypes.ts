/*
 * @Author: wy
 * @Date: 2024-02-26 16:32:56
 * @LastEditors: wy
 * @LastEditTime: 2024-02-26 16:51:13
 * @FilePath: /笔记/react-source-learn/packages/shared/ReactTypes.ts
 * @Description:
 */

export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElementType = any;

export interface ReactElement {
	$$typeof: symbol | number;
	type: ElementType;
	key: Key;
	ref: Ref;
	props: Props;
	_mark: string;
}