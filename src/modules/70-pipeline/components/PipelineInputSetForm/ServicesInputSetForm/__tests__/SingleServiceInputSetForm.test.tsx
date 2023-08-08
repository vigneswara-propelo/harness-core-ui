/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Formik, Form } from 'formik'
import { MultiTypeInputType, EXECUTION_TIME_INPUT_VALUE, AllowedTypesWithExecutionTime } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import SingleServiceInputSetForm from '@pipeline/components/PipelineInputSetForm/ServicesInputSetForm/SingleServiceInputSetForm'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

const getPipelineContext = () => ({
  state: {
    templateTypes: {
      account: {
        stage: 'Deployment'
      }
    },
    pipeline: {
      name: 'simple service as expression new',
      identifier: 'simple_service_as_expression_new',
      projectIdentifier: 'kanikaTest',
      orgIdentifier: 'default',
      tags: {},
      stages: [
        {
          stage: {
            name: 'somestage',
            identifier: 'somestage',
            template: {
              templateRef: 'account.stage',
              versionLabel: 'v1',
              templateInputs: {
                type: 'Deployment',
                spec: {
                  service: {
                    serviceInputs: {
                      serviceDefinition: {
                        type: 'Kubernetes',
                        spec: {
                          artifacts: {
                            primary: {
                              primaryArtifactRef: '<+input>',
                              sources: '<+input>'
                            }
                          },
                          variables: [
                            {
                              name: 'aa',
                              type: 'String',
                              value: '<+input>'
                            }
                          ]
                        }
                      }
                    }
                  },
                  environment: {
                    environmentRef: '<+input>',
                    environmentInputs: '<+input>',
                    infrastructureDefinitions: '<+input>'
                  }
                }
              }
            }
          }
        },
        {
          stage: {
            name: 's1',
            identifier: 's1',
            description: '',
            type: 'Deployment',
            spec: {
              deploymentType: 'Kubernetes',
              service: {
                serviceRef: '<+input>',
                serviceInputs: '<+input>'
              },
              environment: {
                environmentRef: 'test_env_here',
                deployToAll: false,
                infrastructureDefinitions: '<+input>'
              },
              execution: {
                steps: [
                  {
                    step: {
                      name: 'Rollout Deployment',
                      identifier: 'rolloutDeployment',
                      type: 'K8sRollingDeploy',
                      timeout: '10m',
                      spec: {
                        skipDryRun: false,
                        pruningEnabled: false
                      }
                    }
                  }
                ],
                rollbackSteps: [
                  {
                    step: {
                      name: 'Rollback Rollout Deployment',
                      identifier: 'rollbackRolloutDeployment',
                      type: 'K8sRollingRollback',
                      timeout: '10m',
                      spec: {
                        pruningEnabled: false
                      }
                    }
                  }
                ]
              }
            },
            tags: {},
            failureStrategies: [
              {
                onFailure: {
                  errors: ['AllErrors'],
                  action: {
                    type: 'StageRollback'
                  }
                }
              }
            ]
          }
        },
        {
          stage: {
            name: 's2',
            identifier: 's2',
            description: '',
            type: 'Deployment',
            spec: {
              deploymentType: 'Kubernetes',
              service: {
                useFromStage: {
                  stage: 's1'
                }
              },
              environment: {
                environmentRef: 'DEV',
                deployToAll: false,
                infrastructureDefinitions: [
                  {
                    identifier: 'adfdf'
                  }
                ]
              },
              execution: {
                steps: [
                  {
                    step: {
                      name: 'Rollout Deployment',
                      identifier: 'rolloutDeployment',
                      type: 'K8sRollingDeploy',
                      timeout: '10m',
                      spec: {
                        skipDryRun: false,
                        pruningEnabled: false
                      }
                    }
                  }
                ],
                rollbackSteps: [
                  {
                    step: {
                      name: 'Rollback Rollout Deployment',
                      identifier: 'rollbackRolloutDeployment',
                      type: 'K8sRollingRollback',
                      timeout: '10m',
                      spec: {
                        pruningEnabled: false
                      }
                    }
                  }
                ]
              }
            },
            tags: {},
            failureStrategies: [
              {
                onFailure: {
                  errors: ['AllErrors'],
                  action: {
                    type: 'StageRollback'
                  }
                }
              }
            ]
          }
        }
      ],
      variables: [
        {
          name: 'serviceVar',
          type: 'String',
          description: '',
          required: false,
          value: 'svc2'
        },
        {
          name: 'serviceVarNoRuntime',
          type: 'String',
          description: '',
          required: false,
          value: 'svc3'
        }
      ]
    }
  }
})

const commonProps = {
  path: 'stages[0].stage.spec',
  stageIdentifier: 's2',
  viewType: StepViewType.DeploymentForm,
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.EXECUTION_TIME
  ] as AllowedTypesWithExecutionTime[]
}

describe('SingleServiceInputSetForm test', () => {
  test('Should render correctly when service ref is present', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_SUPPORT_SERVICE_INPUTS_AS_EXECUTION_INPUTS: true
    })

    const mockDeploymentStageTemplate = {
      service: {
        serviceInputs: EXECUTION_TIME_INPUT_VALUE,
        serviceRef: 'DockerServicetest'
      }
    }

    const mockDeploymentStage = {
      deploymentType: 'Kubernetes',
      service: {
        serviceRef: '<+pipeline.variables.serviceVar>',
        serviceInputs: '<+input>.executionInput()'
      }
    }

    const { findByText } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Form>
            <SingleServiceInputSetForm
              {...commonProps}
              deploymentStageTemplate={mockDeploymentStageTemplate as any}
              deploymentStage={mockDeploymentStage as any}
              readonly={false}
            />
          </Form>
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(findByText('service')).toBeDefined()
    })
  })

  test('Should render correctly when service inputs are execution time inputs', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_SUPPORT_SERVICE_INPUTS_AS_EXECUTION_INPUTS: true
    })

    const mockDeploymentStageTemplate = {
      service: {
        serviceInputs: EXECUTION_TIME_INPUT_VALUE
      }
    }

    const mockDeploymentStage = {
      deploymentType: 'Kubernetes',
      service: {
        serviceRef: '<+pipeline.variables.serviceVar>',
        serviceInputs: '<+input>.executionInput()'
      }
    }

    const mockEmptyDeploymentStageTemplate = {
      service: undefined
    }

    const mockEmptyDeploymentStage = {
      deploymentType: 'Kubernetes',
      service: undefined
    }

    const { findByText, rerender } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getPipelineContext() as any}>
          <Formik initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <SingleServiceInputSetForm
                {...commonProps}
                deploymentStageTemplate={mockEmptyDeploymentStageTemplate as any}
                deploymentStage={mockEmptyDeploymentStage as any}
                readonly={false}
              />
            </Form>
          </Formik>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    rerender(
      <TestWrapper>
        <PipelineContext.Provider value={getPipelineContext() as any}>
          <Formik initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <SingleServiceInputSetForm
                {...commonProps}
                deploymentStageTemplate={mockDeploymentStageTemplate as any}
                deploymentStage={mockDeploymentStage as any}
                readonly={false}
              />
            </Form>
          </Formik>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(findByText('service')).toBeDefined()
    })
  })
})
