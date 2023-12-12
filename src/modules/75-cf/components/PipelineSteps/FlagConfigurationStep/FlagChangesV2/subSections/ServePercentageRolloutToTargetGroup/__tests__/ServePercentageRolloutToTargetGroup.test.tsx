/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import * as cfServices from 'services/cf'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import {
  CFPipelineInstructionType,
  FeatureFlagConfigurationInstruction
} from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import { mockTargetGroups } from '../../__tests__/utils.mocks'
import { SubSectionComponentProps } from '../../../subSection.types'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import ServePercentageRolloutToTargetGroup, {
  hasServePercentageRolloutToTargetGroupRuntime,
  servePercentageRolloutToTargetGroupSchema
} from '../ServePercentageRolloutToTargetGroup'

const renderComponent = (
  props: Partial<SubSectionComponentProps> = {},
  testWrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...testWrapperProps}>
      <ServePercentageRolloutToTargetGroup
        prefixPath="test"
        title="Serve percentage rollout to target group"
        {...props}
      />
    </SubSectionTestWrapper>
  )

describe('ServePercentageRolloutToTargetGroup', () => {
  jest
    .spyOn(cfServices, 'useGetAllTargetAttributes')
    .mockReturnValue({ data: [], loading: false, error: null, refetch: jest.fn() } as any)

  const useGetAllSegmentsMock = jest.spyOn(cfServices, 'useGetAllSegments')

  beforeEach(() => {
    useGetAllSegmentsMock.mockReturnValue({
      data: { segments: mockTargetGroups },
      loading: false,
      refetch: jest.fn()
    } as any)
  })

  describe('runtime', () => {
    const runtimeInstruction: FeatureFlagConfigurationInstruction = {
      identifier: 'test',
      type: CFPipelineInstructionType.ADD_RULE,
      spec: { distribution: { variations: RUNTIME_INPUT_VALUE, clauses: [{ values: [RUNTIME_INPUT_VALUE] }] } }
    }

    test('it should not display the target group when not set as runtime', async () => {
      const instruction = cloneDeep(runtimeInstruction)
      instruction.spec.distribution.clauses[0].values[0] = 'abc'

      renderComponent({}, { flag: MockFeature, mode: StepViewType.DeploymentForm, initialInstructions: [instruction] })

      expect(screen.queryByPlaceholderText('cf.pipeline.flagConfiguration.selectTargetGroup')).not.toBeInTheDocument()
    })

    test('it should not display target group when not set as runtime', async () => {
      const instruction = cloneDeep(runtimeInstruction)
      instruction.spec.distribution.variations = [
        { variation: 'a', weight: 50 },
        { variation: 'b', weight: 50 }
      ]

      renderComponent({}, { flag: MockFeature, mode: StepViewType.DeploymentForm, initialInstructions: [instruction] })

      expect(screen.queryByText('cf.featureFlags.percentageRollout')).not.toBeInTheDocument()
    })

    test('it should display a disabled input when set as read only', async () => {
      renderComponent(
        {},
        { mode: StepViewType.DeploymentForm, readonly: true, initialInstructions: [runtimeInstruction] }
      )

      expect(await screen.findByPlaceholderText('cf.pipeline.flagConfiguration.selectTargetGroup')).toBeDisabled()
    })
  })
})

describe('servePercentageRolloutToTargetGroupSchema', () => {
  test('it should throw when variations is not set', async () => {
    const schema = servePercentageRolloutToTargetGroupSchema(str => str)

    expect(() =>
      schema.validateSync({
        spec: {
          distribution: {
            clauses: [{ values: ['abc'] }],
            bucketBy: 'identifier'
          }
        }
      })
    ).toThrow('cf.featureFlags.flagPipeline.validation.servePercentageRollout.variations')
  })

  test('it should throw when variations is empty', async () => {
    const schema = servePercentageRolloutToTargetGroupSchema(str => str)

    expect(() =>
      schema.validateSync({
        spec: {
          distribution: {
            variations: '',
            clauses: [{ values: ['abc'] }],
            bucketBy: 'identifier'
          }
        }
      })
    ).toThrow('cf.featureFlags.flagPipeline.validation.servePercentageRollout.variations')
  })

  test('it should throw when target group is not set', async () => {
    const schema = servePercentageRolloutToTargetGroupSchema(str => str)

    expect(() =>
      schema.validateSync({
        spec: {
          distribution: {
            variations: [
              { variation: 'a', weight: 50 },
              { variation: 'b', weight: 50 }
            ],
            bucketBy: 'identifier'
          }
        }
      })
    ).toThrow('cf.featureFlags.flagPipeline.validation.servePercentageRollout.targetGroup')
  })

  test('it should throw when target group is empty', async () => {
    const schema = servePercentageRolloutToTargetGroupSchema(str => str)

    expect(() =>
      schema.validateSync({
        spec: {
          distribution: {
            variations: [
              { variation: 'a', weight: 50 },
              { variation: 'b', weight: 50 }
            ],
            bucketBy: 'identifier',
            clauses: [{ values: [''] }]
          }
        }
      })
    ).toThrow('cf.featureFlags.flagPipeline.validation.servePercentageRollout.targetGroup')
  })

  test('it should throw when bucket by is not set', async () => {
    const schema = servePercentageRolloutToTargetGroupSchema(str => str)

    expect(() =>
      schema.validateSync({
        spec: {
          distribution: {
            variations: [
              { variation: 'a', weight: 50 },
              { variation: 'b', weight: 50 }
            ],
            clauses: [{ values: ['abc'] }]
          }
        }
      })
    ).toThrow('cf.featureFlags.flagPipeline.validation.servePercentageRollout.bucketBy')
  })

  test('it should throw when bucket by is empty', async () => {
    const schema = servePercentageRolloutToTargetGroupSchema(str => str)

    expect(() =>
      schema.validateSync({
        spec: {
          distribution: {
            variations: [
              { variation: 'a', weight: 50 },
              { variation: 'b', weight: 50 }
            ],
            clauses: [{ values: ['abc'] }],
            bucketBy: ''
          }
        }
      })
    ).toThrow('cf.featureFlags.flagPipeline.validation.servePercentageRollout.bucketBy')
  })

  test('it should not throw when variations, target group and bucket by are set', async () => {
    const schema = servePercentageRolloutToTargetGroupSchema(str => str)

    expect(() =>
      schema.validateSync({
        spec: {
          distribution: {
            variations: [
              { variation: 'a', weight: 50 },
              { variation: 'b', weight: 50 }
            ],
            bucketBy: 'identifier',
            clauses: [{ values: ['abc'] }]
          }
        }
      })
    ).not.toThrow()
  })
})

describe('hasServePercentageRolloutToTargetGroupRuntime', () => {
  test('it should return true when the instruction is a percentage rollout rule and the target group is set as runtime', async () => {
    expect(
      hasServePercentageRolloutToTargetGroupRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_RULE,
        spec: {
          distribution: {
            clauses: [{ values: [RUNTIME_INPUT_VALUE] }],
            variations: [
              { variation: 'a', weight: 50 },
              { variation: 'b', weight: 50 }
            ]
          }
        }
      })
    ).toBeTruthy()
  })

  test('it should return true when the instruction is a percentage rollout rule and variations is set as runtime', async () => {
    expect(
      hasServePercentageRolloutToTargetGroupRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_RULE,
        spec: {
          distribution: {
            clauses: [{ values: ['abc'] }],
            variations: RUNTIME_INPUT_VALUE
          }
        }
      })
    ).toBeTruthy()
  })

  test('it should return false when the instruction is a percentage rollout rule and neither the variations nor the target group are set as runtime', async () => {
    expect(
      hasServePercentageRolloutToTargetGroupRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_RULE,
        spec: {
          distribution: {
            clauses: [{ values: ['abc'] }],
            variations: [
              { variation: 'a', weight: 50 },
              { variation: 'b', weight: 50 }
            ]
          }
        }
      })
    ).toBeFalsy()
  })

  test('it should return false when the instruction is not a percentage rollout rule', async () => {
    expect(
      hasServePercentageRolloutToTargetGroupRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE,
        spec: { variation: RUNTIME_INPUT_VALUE }
      })
    ).toBeFalsy()
  })
})
