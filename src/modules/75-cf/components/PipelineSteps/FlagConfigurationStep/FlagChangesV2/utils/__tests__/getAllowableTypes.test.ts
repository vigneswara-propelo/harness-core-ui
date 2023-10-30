/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import { getAllowableTypes } from '../getAllowableTypes'

describe('getAllowableTypes', () => {
  test('it should return only FIXED when the mode is DeploymentForm', async () => {
    expect(getAllowableTypes(StepViewType.DeploymentForm)).toEqual([MultiTypeInputType.FIXED])
  })

  test('it should return FIXED, EXPRESSION and RUNTIME when the mode is not DeploymentForm and no flag or environmentIdentifier are passed', async () => {
    expect(getAllowableTypes(StepViewType.Edit)).toEqual([
      MultiTypeInputType.FIXED,
      MultiTypeInputType.EXPRESSION,
      MultiTypeInputType.RUNTIME
    ])
  })

  test('it should return FIXED, EXPRESSION and RUNTIME when the mode is not DeploymentForm and a flag is passed', async () => {
    expect(getAllowableTypes(StepViewType.Edit, { flag: mockFeature })).toEqual([
      MultiTypeInputType.FIXED,
      MultiTypeInputType.EXPRESSION,
      MultiTypeInputType.RUNTIME
    ])
  })

  test('it should return RUNTIME and EXPRESSION when the mode is not DeploymentForm and a runtime flag is passed', async () => {
    expect(getAllowableTypes(StepViewType.Edit, { flag: RUNTIME_INPUT_VALUE })).toEqual([
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ])
  })

  test('it should return only EXPRESSION when the mode is not DeploymentForm and an expression flag is passed', async () => {
    expect(getAllowableTypes(StepViewType.Edit, { flag: '<+someExpression>' })).toEqual([MultiTypeInputType.EXPRESSION])
  })

  test('it should return RUNTIME and EXPRESSION when the mode is not DeploymentForm and a runtime environmentIdentifier is passed', async () => {
    expect(getAllowableTypes(StepViewType.Edit, { environmentIdentifier: RUNTIME_INPUT_VALUE })).toEqual([
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ])
  })

  test('it should return only EXPRESSION when the mode is not DeploymentForm and an expression environmentIdentifier is passed', async () => {
    expect(getAllowableTypes(StepViewType.Edit, { environmentIdentifier: '<+someExpression>' })).toEqual([
      MultiTypeInputType.EXPRESSION
    ])
  })

  test('it should return only EXPRESSION when the mode is not DeploymentForm and an expression environmentIdentifier is passed along with a runtime flag', async () => {
    expect(
      getAllowableTypes(StepViewType.Edit, { flag: RUNTIME_INPUT_VALUE, environmentIdentifier: '<+someExpression>' })
    ).toEqual([MultiTypeInputType.EXPRESSION])
  })

  test('it should return FIXED, EXPRESSION and RUNTIME when the mode is not DeploymentForm and a environmentIdentifier is passed', async () => {
    expect(getAllowableTypes(StepViewType.Edit, { environmentIdentifier: 'abc123' })).toEqual([
      MultiTypeInputType.FIXED,
      MultiTypeInputType.EXPRESSION,
      MultiTypeInputType.RUNTIME
    ])
  })
})
