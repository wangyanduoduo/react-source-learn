/*
 * @Author: wy
 * @Date: 2024-04-26 16:19:35
 * @LastEditors: wy
 * @LastEditTime: 2024-04-26 16:19:44
 * @FilePath: /react-source-learn/packages/react-reconciler/src/ReactHookEffectTags.ts
 * @Description:
 */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type HookFlags = number;

export const NoFlags = /*   */ 0b0000;

// Represents whether effect should fire.
export const HasEffect = /* */ 0b0001;

// Represents the phase in which the effect (not the clean-up) fires.
export const Insertion = /* */ 0b0010;
export const Layout = /*    */ 0b0100;
export const Passive = /*   */ 0b1000;
