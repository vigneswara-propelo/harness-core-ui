/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSectionTestWrapper from '../../__tests__/SubSectionTestWrapper.mock'
import DefaultOffRule, { defaultOffRuleSchema, hasDefaultOffRuleRuntime } from '../DefaultOffRule'

describe('DefaultOffRule', () => {
  test('it should display the OFF variation label', async () => {
    render(
      <SubSectionTestWrapper>
        <DefaultOffRule prefixPath="test" title="Default OFF rule" />
      </SubSectionTestWrapper>
    )

    expect(await screen.findByText('cf.pipeline.flagConfiguration.whenTheFlagIsOffServe')).toBeInTheDocument()
  })
})

describe('defaultOffRuleSchema', () => {
  test('it should throw when variation is not set', async () => {
    const schema = defaultOffRuleSchema(str => str)

    expect(() => schema.validateSync({ spec: {} })).toThrow(
      'cf.featureFlags.flagPipeline.validation.defaultOffRule.offVariation'
    )
  })

  test('it should throw when variation is empty', async () => {
    const schema = defaultOffRuleSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: '' } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.defaultOffRule.offVariation'
    )
  })

  test('it should not throw when variation is set', async () => {
    const schema = defaultOffRuleSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test' } })).not.toThrow()
  })
})

describe('hasDefaultOffRuleRuntime', () => {
  test('it should return true when the instruction is a default off rule and the variation is set as runtime', async () => {
    expect(
      hasDefaultOffRuleRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION,
        spec: { variation: RUNTIME_INPUT_VALUE }
      })
    ).toBeTruthy()
  })

  test('it should return false when the instruction is a default off rule and the variation is not set as runtime', async () => {
    expect(
      hasDefaultOffRuleRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION,
        spec: { variation: 'test' }
      })
    ).toBeFalsy()
  })

  test('it should return false when the instruction is not a default off rule and the variation is set as runtime', async () => {
    expect(
      hasDefaultOffRuleRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE,
        spec: { variation: RUNTIME_INPUT_VALUE }
      })
    ).toBeFalsy()
  })
})
