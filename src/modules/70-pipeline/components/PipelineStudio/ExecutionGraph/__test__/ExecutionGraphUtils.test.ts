/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DependencyElement } from 'services/ci'
import { ExecutionWrapperConfig } from 'services/cd-ng'
import {
  addService,
  convertToDotNotation,
  DependenciesWrapper,
  getDependenciesState,
  getDependencyFromNode,
  getParentPath,
  getStepsPathWithoutStagePath,
  getStepsState,
  isAnyNestedStepGroupContainerSG,
  StepState,
  StepStateMap
} from '../ExecutionGraphUtil'

describe('ExecutionGraphUtils', () => {
  test('getDependencyFromNode()', () => {
    const servicesData: DependencyElement[] = [
      {
        identifier: 'id1',
        type: 'Service'
      }
    ]

    const nodeModel = {
      getIdentifier: () => 'id1'
    } as any

    const ret = getDependencyFromNode(servicesData, nodeModel)
    expect(ret.node).toEqual(servicesData[0])
  })

  test('getDependenciesState()', () => {
    const servicesData: DependenciesWrapper[] = [
      {
        identifier: 'id1'
      }
    ]
    const mapState: StepStateMap = new Map<string, StepState>()

    getDependenciesState(servicesData, mapState)

    expect(mapState.has('id1'))
  })

  test('getStepsState()', () => {
    const node = {
      steps: [
        {
          step: {
            identifier: 'id1'
          }
        }
      ],
      rollbackSteps: [
        {
          step: {
            identifier: 'id2'
          }
        }
      ],
      parallel: [
        {
          steps: [
            {
              step: {
                identifier: 'id3'
              }
            }
          ]
        }
      ],
      stepGroup: {
        steps: [
          {
            step: {
              identifier: 'id4'
            }
          }
        ],
        rollbackSteps: [
          {
            step: {
              identifier: 'id5'
            }
          }
        ]
      }
    }
    const mapState: StepStateMap = new Map<string, StepState>()

    getStepsState(node, mapState)

    expect(mapState.has('id1'))
    expect(mapState.has('id2'))
    expect(mapState.has('id3'))
    expect(mapState.has('id4'))
    expect(mapState.has('id5'))
  })

  test('addService()', () => {
    const data: any = []
    const service: any = {}

    addService(data, service)

    expect(data.length).toBe(1)
  })

  test('returns the parent path for provisioner or execution', () => {
    const resultProvisioner = getParentPath(true)
    const resultExecution = getParentPath()

    expect(resultProvisioner).toBe('stage.spec.environment.provisioner')
    expect(resultExecution).toBe('stage.spec.execution')
  })

  test('getStepsPathWithoutStagePath() - returns the node path from "steps" or "rollbackSteps" under "execution" or "provisioners"', () => {
    const inputExecutionPath = 'stage.execution.steps.1.step.0.stepGroup.steps.3.steps.7.step'
    const inputProvisionerPath = 'stage.spec.environment.provisioner.steps.1.step.0.stepGroup.steps.3.steps.7.step'
    const resultExecution = getStepsPathWithoutStagePath(inputExecutionPath)
    const resultProvisioner = getStepsPathWithoutStagePath(inputProvisionerPath)

    expect(resultExecution).toBe('steps.1.step.0.stepGroup.steps.3.steps.7.step')
    expect(resultProvisioner).toBe('steps.1.step.0.stepGroup.steps.3.steps.7.step')
  })

  test('convertToDotNotation() - converts square brackets with numeric indices to dot notation', () => {
    const inputPath = 'steps[1].step[0].stepGroup.steps[3].steps[7].step'
    const expectedOutput = 'steps.1.step.0.stepGroup.steps.3.steps.7.step'

    const result = convertToDotNotation(inputPath)

    expect(result).toBe(expectedOutput)
  })

  test('isAnyNestedStepGroupContainerSG()', () => {
    const stepsWithChildContainerStepGroup = [
      {
        stepGroup: {
          name: 'sg2',
          identifier: 'sg2',
          steps: [
            {
              stepGroup: {
                name: 'sg3',
                identifier: 'sg3',
                steps: [
                  {
                    stepGroup: {
                      name: 'sg4',
                      identifier: 'sg4',
                      steps: [],
                      stepGroupInfra: {
                        type: 'KubernetesDirect'
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ] as ExecutionWrapperConfig[]

    const steps = [] as ExecutionWrapperConfig[]
    const result = isAnyNestedStepGroupContainerSG(stepsWithChildContainerStepGroup)
    expect(result).toBe(true)

    const result1 = isAnyNestedStepGroupContainerSG(steps)
    expect(result1).toBe(false)
  })
})
