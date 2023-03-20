/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, queryByAttribute } from '@testing-library/react'
import { Form } from 'formik'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineInputParametersV1 } from '../PipelineInputParamsV1/PipelineInputParametersV1'
import { PipelineInputsMetadata, getCICodebaseInputSetFormInitialValues } from './mocks'

describe('PipelineInputParametersV1 tests', () => {
  test('Initial Render', () => {
    const { container } = render(
      <TestWrapper>
        <Formik formName="test-form" initialValues={getCICodebaseInputSetFormInitialValues()} onSubmit={jest.fn()}>
          {formik => (
            <Form>
              <PipelineInputParametersV1 formik={formik} pipelineInputsMetadata={PipelineInputsMetadata} />
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should not render if no inputs present', () => {
    const { container } = render(
      <TestWrapper>
        <Formik formName="test-form" initialValues={getCICodebaseInputSetFormInitialValues()} onSubmit={jest.fn()}>
          {formik => (
            <Form>
              <PipelineInputParametersV1 formik={formik} pipelineInputsMetadata={PipelineInputsMetadata} />
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should set inputs if present and allow changing the value', () => {
    const initialValues = {
      inputs: {
        image: 'golang'
      }
    }
    const { queryAllByText, container } = render(
      <TestWrapper>
        <Formik formName="test-form" initialValues={initialValues} onSubmit={jest.fn()}>
          {formik => (
            <Form>
              <PipelineInputParametersV1 formik={formik} pipelineInputsMetadata={PipelineInputsMetadata} />
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(queryAllByText('golang')).not.toBeNull()
    const input = queryByAttribute('name', container, 'input.golang')
    input && fireEvent.change(input, { target: { value: 'golang:1.15' } })
  })
})
