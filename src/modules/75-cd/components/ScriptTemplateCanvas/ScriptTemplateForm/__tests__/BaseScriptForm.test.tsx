/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType, Formik } from '@harness/uicore'
import { render, waitFor, fireEvent, queryByAttribute } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { BaseScriptWithRef } from '../BaseScriptForm'

const defaultInitialValues = {
  identifier: 'id',
  name: 'name',
  type: '',
  spec: {}
}
const defaultInitialValuesCorrect = {
  identifier: 'id',
  name: 'name',
  type: 'PowerShell',
  spec: {
    shell: 'Bash',
    source: {
      type: 'Inline',
      spec: {
        script: 'check'
      }
    }
  }
}

const initialValues = {
  ...defaultInitialValues,
  spec: {
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: 'echo test'
      }
    }
  }
}
const initialValuesWithExpressions = {
  ...defaultInitialValues,
  spec: {
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: '<+spec.environmentVariable.var1>'
      }
    }
  }
}

const initialValuesWithRI = {
  ...defaultInitialValues,
  spec: {
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: '<+input>'
      }
    }
  }
}

describe('Test BaseScriptWithRef', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <BaseScriptWithRef initialValues={defaultInitialValues} allowableTypes={[]} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('should match snapshot for BaseScriptWithRef with initial values', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <BaseScriptWithRef initialValues={initialValues} allowableTypes={[MultiTypeInputType.EXPRESSION]} />
      </TestWrapper>
    )
    await waitFor(() => getByText('cd.steps.commands.selectScriptLocation'))
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for BaseScriptWithRef with initial script values with expressions', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <BaseScriptWithRef
          initialValues={initialValuesWithExpressions}
          allowableTypes={[MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    await waitFor(() => getByText('cd.steps.commands.locationFileStore'))
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for BaseScriptWithRef with initial script values with runtimeInput', async () => {
    const { container } = render(
      <TestWrapper>
        <BaseScriptWithRef initialValues={initialValuesWithRI} allowableTypes={[MultiTypeInputType.RUNTIME]} />
      </TestWrapper>
    )
    const configureBtn = container.querySelector('button[id="configureOptions_spec.source.spec.script"]')

    await waitFor(() => expect(configureBtn).toBeDefined())

    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for BaseScriptWithRef without initial values ', async () => {
    const onChangeMock = jest.fn()

    const { container } = render(
      <TestWrapper>
        <Formik<any> formName="test-form" initialValues={defaultInitialValuesCorrect} onSubmit={jest.fn()}>
          {formik => {
            return (
              <BaseScriptWithRef
                initialValues={defaultInitialValuesCorrect}
                allowableTypes={[]}
                ref={formik as any}
                onChange={onChangeMock}
              />
            )
          }}
        </Formik>
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await waitFor(() => expect(queryByNameAttribute('spec.shell')).toBeDefined())

    const radioButtons = container.querySelectorAll('input[type="radio"]')

    await fireEvent.click(radioButtons[1])
    fireEvent.input(queryByNameAttribute('spec.source.spec.script')!, {
      target: { value: 'echo Hello World' },
      bubbles: true
    })

    expect(onChangeMock).toBeCalledWith({
      identifier: 'id',
      name: 'name',
      type: 'PowerShell',
      spec: {
        executionTarget: {},
        onDelegate: true,
        shell: 'Bash',
        source: {
          type: 'Inline',
          spec: {
            script: 'echo Hello World'
          }
        }
      }
    })
  })
})
