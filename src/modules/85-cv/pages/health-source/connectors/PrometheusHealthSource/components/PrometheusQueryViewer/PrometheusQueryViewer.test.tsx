/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { FormikForm } from '@harness/uicore'
import { Formik } from 'formik'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { PrometheusQueryViewer, PrometheusQueryViewerProps } from './PrometheusQueryViewer'

function WrapperComponent(props: PrometheusQueryViewerProps): any {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <FormikForm>
          <PrometheusQueryViewer {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for PrometheusQueryViewer', () => {
  test('Verify that fetchRecordsButton should not render if there is no query', async () => {
    const onChange = jest.fn()
    const { queryByText } = render(<WrapperComponent values={{} as any} onChange={onChange} />)
    const fetchRecordsButton = await waitFor(() => queryByText('cv.monitoringSources.gcoLogs.fetchRecords'))

    expect(fetchRecordsButton).toBeNull()
  })

  test('should check the title is rendered within the query viewer', async () => {
    const onChange = jest.fn()
    render(<WrapperComponent values={{} as any} onChange={onChange} />)

    await waitFor(() => expect(screen.getByTestId('queryLabel')).toBeInTheDocument())
  })

  test('should show proper error message from API response', async () => {
    jest
      .spyOn(cvService, 'useGetSampleData')
      .mockReturnValue({ error: { data: { message: 'Error from response' } } } as any)
    const onChange = jest.fn()
    render(<WrapperComponent values={{} as any} onChange={onChange} />)

    await waitFor(() => expect(screen.getByText('Error from response')).toBeInTheDocument())
  })
})
