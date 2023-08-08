/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { stringify } from '@common/utils/YamlHelperMethods'

import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
// eslint-disable-next-line no-restricted-imports
import { ShellScriptStep } from '@cd/components/PipelineSteps/ShellScriptStep/ShellScriptStep'
import { useSubmitExecutionInput, useGetExecutionInputTemplate, useHandleInterrupt } from 'services/pipeline-ng'

import executionMetadata from '@pipeline/components/execution/StepDetails/common/ExecutionContent/PolicyEvaluationContent/__mocks__/executionMetadata.json'
import { ExecutionInputs } from '../ExecutionInputs'

const mockServiceResponseData = {
  data: {
    serviceV2YamlMetadataList: [
      {
        serviceIdentifier: 'tag_as_execution',
        serviceYaml:
          'service:\n  name: tag as execution\n  identifier: tag_as_execution\n  orgIdentifier: default\n  projectIdentifier: KanikaTest\n  serviceDefinition:\n    spec:\n      artifacts:\n        primary:\n          primaryArtifactRef: <+input>\n          sources:\n            - spec:\n                connectorRef: Ajfrog\n                artifactPath: docker-local\n                tag: <+input>.executionInput()\n                repository: docker-local\n                repositoryFormat: docker\n                digest: ""\n              identifier: check\n              type: ArtifactoryRegistry\n    type: Kubernetes\n',
        inputSetTemplateYaml:
          'serviceInputs:\n  serviceDefinition:\n    type: Kubernetes\n    spec:\n      artifacts:\n        primary:\n          primaryArtifactRef: <+input>\n          sources: <+input>\n',
        orgIdentifier: 'default',
        projectIdentifier: 'KanikaTest'
      }
    ]
  }
}

jest.mock('services/pipeline-ng', () => ({
  useGetExecutionInputTemplate: jest.fn().mockReturnValue({
    data: {}
  }),
  useHandleInterrupt: jest.fn().mockReturnValue({}),
  useSubmitExecutionInput: jest.fn().mockReturnValue({})
}))
jest.mock('services/cd-ng-rq', () => ({
  useGetServicesYamlAndRuntimeInputsQuery: jest.fn(() => ({ data: mockServiceResponseData }))
}))

factory.registerStep(new ShellScriptStep())

describe('<ExecutionInputs /> tests', () => {
  describe('stage inputs', () => {
    test('submit works', async () => {
      const mutate = jest.fn()
      ;(useSubmitExecutionInput as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "<+input>.executionInput()"\n',
            fieldYaml:
              'stage:\n  identifier: s1\n  type: Approval\n  name: s1\n  description: ""\n  spec:\n    execution:\n      steps:\n        - step:\n            identifier: some_step\n            type: HarnessApproval\n            name: some step\n            timeout: 1d\n            spec:\n              approvalMessage: |-\n                Please review the following information\n                and approve the pipeline progression\n              includePipelineExecutionHistory: true\n              approvers:\n                minimumCount: 1\n                disallowPipelineExecutor: false\n                userGroups:\n                  - account.UG_Tst_Prat_02\n              isAutoRejectEnabled: false\n              approverInputs: []\n  tags: {}\n  variables:\n    - name: basicVar\n      type: String\n      description: ""\n      required: false\n      value: <+input>.executionInput()\n'
          }
        }
      })
      const { container, findByTestId } = render(
        <TestWrapper>
          <ExecutionInputs
            step={{ stepType: 'APPROVAL_STAGE' }}
            factory={factory}
            executionMetadata={executionMetadata}
          />
        </TestWrapper>
      )

      const input = await waitFor(() => queryByAttribute('name', container, 'stage.variables[0].value')!)
      expect(container).toMatchSnapshot()
      await userEvent.type(input, 'Hello')

      const submit = await findByTestId('submit')

      await userEvent.click(submit)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith(
          stringify({
            stage: {
              identifier: 'app',
              type: 'Approval',
              variables: [{ name: 'test', type: 'String', value: 'Hello' }]
            }
          })
        )
      })
    })

    test('submit throws error', async () => {
      const onErrorMock = jest.fn()
      const mutate = jest.fn().mockImplementation(() => {
        throw new Error('Submit Failed')
      })
      ;(useSubmitExecutionInput as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "<+input>.executionInput()"\n',
            fieldYaml:
              'stage:\n  identifier: s1\n  type: Approval\n  name: s1\n  description: ""\n  spec:\n    execution:\n      steps:\n        - step:\n            identifier: some_step\n            type: HarnessApproval\n            name: some step\n            timeout: 1d\n            spec:\n              approvalMessage: |-\n                Please review the following information\n                and approve the pipeline progression\n              includePipelineExecutionHistory: true\n              approvers:\n                minimumCount: 1\n                disallowPipelineExecutor: false\n                userGroups:\n                  - account.UG_Tst_Prat_02\n              isAutoRejectEnabled: false\n              approverInputs: []\n  tags: {}\n  variables:\n    - name: basicVar\n      type: String\n      description: ""\n      required: false\n      value: <+input>.executionInput()\n'
          }
        }
      })
      const { container, findByTestId } = render(
        <TestWrapper>
          <ExecutionInputs
            step={{ stepType: 'APPROVAL_STAGE' }}
            factory={factory}
            executionMetadata={executionMetadata}
            onError={onErrorMock}
          />
        </TestWrapper>
      )

      const input = await waitFor(() => queryByAttribute('name', container, 'stage.variables[0].value')!)
      await userEvent.type(input, 'Hello')

      const submit = await findByTestId('submit')

      await userEvent.click(submit)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith(
          stringify({
            stage: {
              identifier: 'app',
              type: 'Approval',
              variables: [{ name: 'test', type: 'String', value: 'Hello' }]
            }
          })
        )
      })

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalled()
      })
    })

    test('abort throws error', async () => {
      const onErrorMock = jest.fn()
      const mutate = jest.fn().mockImplementation(() => {
        throw new Error('Abort Failed')
      })
      ;(useHandleInterrupt as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "<+input>.executionInput()"\n',
            fieldYaml:
              'stage:\n  identifier: s1\n  type: Approval\n  name: s1\n  description: ""\n  spec:\n    execution:\n      steps:\n        - step:\n            identifier: some_step\n            type: HarnessApproval\n            name: some step\n            timeout: 1d\n            spec:\n              approvalMessage: |-\n                Please review the following information\n                and approve the pipeline progression\n              includePipelineExecutionHistory: true\n              approvers:\n                minimumCount: 1\n                disallowPipelineExecutor: false\n                userGroups:\n                  - account.UG_Tst_Prat_02\n              isAutoRejectEnabled: false\n              approverInputs: []\n  tags: {}\n  variables:\n    - name: basicVar\n      type: String\n      description: ""\n      required: false\n      value: <+input>.executionInput()\n'
          }
        }
      })
      const { container, findByTestId, findByText } = render(
        <TestWrapper>
          <ExecutionInputs
            step={{ stepType: 'APPROVAL_STAGE' }}
            factory={factory}
            executionMetadata={executionMetadata}
            onError={onErrorMock}
          />
        </TestWrapper>
      )

      const input = await waitFor(() => queryByAttribute('name', container, 'stage.variables[0].value')!)
      await userEvent.type(input, 'Hello')

      const abortBtn = await findByTestId('abort')

      await userEvent.click(abortBtn)

      const confirm = await findByText('confirm')

      await userEvent.click(confirm)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith({})
      })

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalled()
      })
    })

    test('fields should be rendered properly when service inputs are supported as execution inputs ', async () => {
      jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
        CDS_SUPPORT_SERVICE_INPUTS_AS_EXECUTION_INPUTS: true
      })
      const mutate = jest.fn()
      ;(useSubmitExecutionInput as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'stage:\n  identifier: s1\n  type: Deployment\n  spec:\n    service:\n      serviceInputs: <+input>.executionInput()\n',
            fieldYaml:
              'stage:\n  identifier: s1\n  type: Deployment\n  name: s1\n  description: ""\n  spec:\n    deploymentType: Kubernetes\n    service:\n      serviceRef: tag_as_execution\n      serviceInputs: <+input>.executionInput()\n    environment:\n      environmentRef: EnvironmentTest\n      deployToAll: false\n      infrastructureDefinitions:\n        - identifier: IntraTest\n    execution:\n      steps:\n        - step:\n            identifier: rolloutDeployment\n            type: K8sRollingDeploy\n            name: Rollout Deployment\n            timeout: 10m\n            spec:\n              skipDryRun: false\n              pruningEnabled: false\n      rollbackSteps:\n        - step:\n            identifier: rollbackRolloutDeployment\n            type: K8sRollingRollback\n            name: Rollback Rollout Deployment\n            timeout: 10m\n            spec:\n              pruningEnabled: false\n  tags: {}\n  failureStrategies:\n    - onFailure:\n        errors:\n          - AllErrors\n        action:\n          type: StageRollback\n'
          }
        }
      })
      const { findByTestId, findByText } = render(
        <TestWrapper>
          <ExecutionInputs
            step={{ stepType: 'DEPLOYMENT_STAGE_STEP' }}
            factory={factory}
            executionMetadata={executionMetadata}
          />
        </TestWrapper>
      )
      await waitFor(() => {
        expect(findByText('Stage:')).toBeDefined()
        expect(findByTestId('submit')).toBeDefined()
        expect(findByTestId('abort')).toBeDefined()
      })
    })

    test('completed', async () => {
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "<+input>.executionInput()"\n',
            userInput:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "Hello"\n'
          }
        }
      })
      const { container } = render(
        <TestWrapper>
          <ExecutionInputs
            step={{ stepType: 'ShellScript', status: 'Success' }}
            factory={factory}
            executionMetadata={executionMetadata}
          />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('loading', async () => {
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: null,
        loading: true
      })
      const { container } = render(
        <TestWrapper>
          <ExecutionInputs
            step={{ stepType: 'ShellScript', status: 'Success' }}
            factory={factory}
            executionMetadata={executionMetadata}
          />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('step inputs', () => {
    test('submit works', async () => {
      const mutate = jest.fn()
      ;(useSubmitExecutionInput as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "<+input>.executionInput()"\n'
          }
        }
      })
      const { container, findByTestId } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'ShellScript' }} factory={factory} executionMetadata={executionMetadata} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()

      const input = queryByAttribute('name', container, 'timeout')!
      await userEvent.type(input, '1m')

      const submit = await findByTestId('submit')

      await userEvent.click(submit)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith(
          stringify({
            step: {
              identifier: 'hello',
              type: 'ShellScript',
              timeout: '1m'
            }
          })
        )
      })
    })

    test('completed', async () => {
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "<+input>.executionInput()"\n',
            userInput: 'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "1m"\n'
          }
        }
      })
      const { container } = render(
        <TestWrapper>
          <ExecutionInputs
            step={{ stepType: 'ShellScript', status: 'Success' }}
            factory={factory}
            executionMetadata={executionMetadata}
          />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('abort works', async () => {
      const mutate = jest.fn()
      ;(useHandleInterrupt as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "<+input>.executionInput()"\n'
          }
        }
      })
      const { findByTestId, findByText } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'ShellScript' }} executionMetadata={executionMetadata} />
        </TestWrapper>
      )

      const submit = await findByTestId('abort')

      await userEvent.click(submit)

      const confirm = await findByText('confirm')

      await userEvent.click(confirm)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith({})
      })
    })
  })
})
