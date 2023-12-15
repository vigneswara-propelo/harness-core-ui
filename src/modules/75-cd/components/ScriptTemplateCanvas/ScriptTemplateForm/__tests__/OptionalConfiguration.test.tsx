/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { Form } from 'formik'

import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { ShellScriptFormData } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import { mockDelegateSelectorsResponse } from '@common/components/DelegateSelectors/__tests__/DelegateSelectorsMockData'

import { OptionalConfigurationWithRef } from '../OptionalConfigurations'

jest.mock('uuid')

const initialValues = {
  identifier: 'id',
  name: 'name',
  type: 'ShellScript',
  spec: {
    shell: 'Bash',
    source: {
      type: 'Inline',
      spec: {
        script: 'echo test'
      }
    }
  }
}

// const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(() => {
    return mockDelegateSelectorsResponse
  })
}))

describe('Test OptionalConfigurations', () => {
  test('Should render OptionalConfigurations without initial values ', async () => {
    const { getByText, container } = render(
      <TestWrapper>
        <OptionalConfigurationWithRef initialValues={initialValues} allowableTypes={[]} />
      </TestWrapper>
    )

    expect(getByText('pipeline.scriptInputVariables common.optionalLabel')).toBeInTheDocument()
    expect(getByText('name')).toBeInTheDocument()
    expect(getByText('typeLabel')).toBeInTheDocument()
    expect(getByText('valueLabel')).toBeInTheDocument()
    expect(getByText('addInputVar')).toBeInTheDocument()
    expect(getByText('pipeline.executionTarget')).toBeInTheDocument()
    expect(getByText('pipeline.execTargetLabel')).toBeInTheDocument()
    expect(getByText('cd.specifyTargetHost')).toBeInTheDocument()
    expect(getByText('pipeline.delegateLabel')).toBeInTheDocument()
    expect(container.querySelector('[value="delegate"]')).toBeChecked()
    expect(getByText('common.defineDelegateSelector')).toBeInTheDocument()
  })

  test('should match snapshot for OptionalConfigurations without initial values ', async () => {
    const name = 'Var1'
    const value = 'hello'
    const mockedID = 'MockedUUID'

    let formikCopy: any
    jest.spyOn(uuid, 'v4').mockReturnValue(mockedID)
    const onChangeMock = jest.fn()
    const updateTemplateMock = jest.fn()
    const { container, getByTestId } = render(
      <TestWrapper>
        <Formik<ShellScriptFormData> formName="test-form" initialValues={initialValues} onSubmit={jest.fn()}>
          {formik => {
            if (formik) {
              formikCopy = formik
            }

            return (
              <Form>
                <OptionalConfigurationWithRef
                  initialValues={initialValues}
                  allowableTypes={[]}
                  ref={formik as any}
                  onChange={onChangeMock}
                  updateTemplate={updateTemplateMock}
                />
              </Form>
            )
          }}
        </Formik>
      </TestWrapper>
    )
    const addEnvVars = getByTestId('add-environmentVar')
    act(() => {
      fireEvent.click(addEnvVars)
    })
    const envVarName = container.querySelector('input[name="spec.environmentVariables[0].name"]')
    await waitFor(() => expect(envVarName).toBeDefined())
    act(() => {
      fireEvent.change(envVarName!, {
        target: { value: name }
      })
    })
    const envVarValue = container.querySelector('input[name="spec.environmentVariables[0].value"]')
    await waitFor(() => expect(envVarValue).toBeDefined())
    act(() => {
      fireEvent.change(envVarValue!, {
        target: { value }
      })
    })
    expect(onChangeMock).toBeCalled()

    act(() => {
      formikCopy.submitForm()
    })

    expect(onChangeMock).toHaveBeenCalledWith({
      identifier: 'id',
      name: 'name',
      type: 'ShellScript',
      spec: {
        shell: 'Bash',
        source: {
          type: 'Inline',
          spec: {
            script: 'echo test'
          }
        },
        executionTarget: {},
        delegateSelectors: [],
        environmentVariables: [
          {
            id: mockedID,
            name,
            type: 'String',
            value
          }
        ],
        outputVariables: []
      }
    })
  })
})
