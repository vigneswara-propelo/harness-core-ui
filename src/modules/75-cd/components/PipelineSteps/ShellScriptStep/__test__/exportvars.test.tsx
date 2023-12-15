/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'

import { mockDelegateSelectorsResponse } from '@common/components/DelegateSelectors/__tests__/DelegateSelectorsMockData'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { ShellScriptStep } from '../ShellScriptStep'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(() => {
    return mockDelegateSelectorsResponse
  })
}))

describe('Test Shell Script Step', () => {
  beforeEach(() => {
    factory.registerStep(new ShellScriptStep())
  })
  beforeAll(() => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
  })
  test('export variables panel- validates for empty scope', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'SSH' } })
      fireEvent.change(queryByNameAttribute('spec.shell')!, { target: { value: 'Bash' } })
      fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '10m' } })
      fireEvent.input(queryByNameAttribute('spec.source.spec.script')!, {
        target: { value: 'script test' },
        bubbles: true
      })

      await fireEvent.click(getByText('common.optionalConfig'))

      await fireEvent.click(getByText('addInputVar'))

      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].name')!, { target: { value: 'testInput1' } })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].value')!, {
        target: { value: 'testInputValue' }
      })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].type')!, { target: { value: 'String' } })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].name')!, { target: { value: 'testOutput1' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].value')!, {
        target: { value: 'response.message' }
      })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].name')!, { target: { value: 'testOutput2' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].value')!, {
        target: { value: 'response.message' }
      })

      fireEvent.change(queryByNameAttribute('spec.outputAlias.key')!, { target: { value: 'key' } })

      await ref.current?.submitForm()
    })
    expect(onUpdate).not.toBeCalled()

    expect(getByText('pipeline.exportVars.scopeValidation')).toBeDefined()
  })

  test('export variables panel- validates for empty key', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          spec: {
            outputAlias: {
              scope: ''
            }
          }
        }}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'SSH' } })
      fireEvent.change(queryByNameAttribute('spec.shell')!, { target: { value: 'Bash' } })
      fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '10m' } })
      fireEvent.input(queryByNameAttribute('spec.source.spec.script')!, {
        target: { value: 'script test' },
        bubbles: true
      })

      await fireEvent.click(getByText('common.optionalConfig'))

      await fireEvent.click(getByText('addInputVar'))

      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].name')!, { target: { value: 'testInput1' } })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].value')!, {
        target: { value: 'testInputValue' }
      })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].type')!, { target: { value: 'String' } })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].name')!, { target: { value: 'testOutput1' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].value')!, {
        target: { value: 'response.message' }
      })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].name')!, { target: { value: 'testOutput2' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].value')!, {
        target: { value: 'response.message' }
      })

      //   userEvent.selectOptions(getByLabelText('Select Scope'), 'Pipeline')
      await ref.current?.submitForm()
    })

    expect(onUpdate).not.toBeCalled()

    expect(getByText('pipeline.exportVars.keyValidation')).toBeDefined()
  })

  test('export variables panel with scope and key', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, findByText } = render(
      <TestStepWidget
        initialValues={{
          spec: {
            shell: 'Bash',
            outputAlias: {
              scope: 'Pipeline'
            }
          }
        }}
        type={StepType.SHELLSCRIPT}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'SSH' } })
      const scriptTypeDropdown = container.querySelector('[data-icon="chevron-down"]')

      // Change Script Type
      act(() => {
        fireEvent.click(scriptTypeDropdown!)
      })

      expect(await findByText('PowerShell')).toBeInTheDocument()

      act(() => {
        fireEvent.click(getByText('PowerShell'))
      })

      fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '10m' } })
      fireEvent.input(queryByNameAttribute('spec.source.spec.script')!, {
        target: { value: 'script test' },
        bubbles: true
      })

      await fireEvent.click(getByText('common.optionalConfig'))

      await fireEvent.click(getByText('addInputVar'))

      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].name')!, { target: { value: 'testInput1' } })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].value')!, {
        target: { value: 'testInputValue' }
      })
      fireEvent.change(queryByNameAttribute('spec.environmentVariables[0].type')!, { target: { value: 'String' } })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].name')!, { target: { value: 'testOutput1' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[0].value')!, {
        target: { value: 'response.message' }
      })

      await fireEvent.click(getByText('addOutputVar'))
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].name')!, { target: { value: 'testOutput2' } })
      fireEvent.change(queryByNameAttribute('spec.outputVariables[1].value')!, {
        target: { value: 'response.message' }
      })
      fireEvent.change(queryByNameAttribute('spec.outputAlias.key')!, { target: { value: 'test-key' } })
      //   userEvent.selectOptions(getByLabelText('Select Scope'), 'Pipeline')
      await ref.current?.submitForm()
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'SSH',
      name: 'SSH',
      timeout: '10m',
      type: 'ShellScript',
      spec: {
        shell: 'PowerShell',
        executionTarget: {},
        delegateSelectors: [],
        source: {
          type: 'Inline',
          spec: {
            script: 'script test'
          }
        },
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'testInputValue'
          }
        ],
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'response.message'
          },
          {
            name: 'testOutput2',
            type: 'String',
            value: 'response.message'
          }
        ],
        outputAlias: {
          key: 'test-key',
          scope: 'Pipeline'
        }
      }
    })
  })
})
