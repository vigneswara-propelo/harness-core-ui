/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineInfoConfig } from 'services/pipeline-ng'
import TriggerOverviewPanel from '../TriggerOverviewPanel'

const TestComponent: React.FC<{
  isEdit: boolean
  initialValues: { originalPipeline?: PipelineInfoConfig; pipeline?: PipelineInfoConfig }
}> = ({ isEdit, initialValues }) => {
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => <TriggerOverviewPanel formikProps={formikProps} isEdit={isEdit} />}
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/pipeline-ng', () => ({
  useGetStagesExecutionList: jest.fn().mockReturnValue({
    data: {
      data: []
    }
  }),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn().mockReturnValue({
    data: {
      data: {}
    }
  })
}))

describe('TriggerOverviewPanel', () => {
  test('Loading data', () => {
    const { queryByText, container } = render(<TestComponent isEdit={true} initialValues={{}} />)

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
    expect(queryByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('Create flow', () => {
    const { queryByText } = render(
      <TestComponent
        isEdit={false}
        initialValues={{
          originalPipeline: {
            name: 'test-pipeline',
            identifier: 'testpipeline'
          }
        }}
      />
    )
    expect(queryByText('triggers.selectPipelineStages')).toBeInTheDocument()
  })

  test('Edit flow', () => {
    const { container } = render(
      <TestComponent
        isEdit={true}
        initialValues={{
          originalPipeline: {
            name: 'test-pipeline',
            identifier: 'testpipeline'
          }
        }}
      />
    )
    /*
     * Create flow has 2 edit icons: Do not allow Id to edit
     * 1: Description Edit
     * 2: Tags Edit
     */
    expect(container.querySelectorAll('[data-icon="Edit"]')).toHaveLength(2)
  })
})
