/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { ChangeSourceInputset } from '../ChangeSourceInputset'
import { msTemplateResponse, templateRefData } from './ChangeSourceInputset.mock'

describe('ChangeSourceInputset', () => {
  test('should render changeSourcesWithRuntimeList', () => {
    const msTemplateRefetch = jest.fn().mockResolvedValue({})
    const { getByText, getAllByText } = render(
      <TestWrapper>
        <Formik formName="" initialValues={{}} onSubmit={() => undefined}>
          <ChangeSourceInputset
            data={msTemplateResponse}
            changeSourcesWithRuntimeList={['PD']}
            templateRefData={templateRefData}
            loading={false}
            error={null}
            refetch={msTemplateRefetch}
          />
        </Formik>
      </TestWrapper>
    )
    expect(getAllByText('changeSource').length).toEqual(2)
    expect(getByText('PD')).toBeInTheDocument()
  })

  test('should render ChangeSourceInputset in loading state', () => {
    const { container } = render(
      <TestWrapper>
        <ChangeSourceInputset
          data={{}}
          loading={true}
          error={null}
          refetch={jest.fn()}
          templateRefData={templateRefData}
          isReadOnlyInputSet={true}
          changeSourcesWithRuntimeList={[]}
        />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="spinner"]')).toBeInTheDocument()
  })

  test('should render ChangeSourceInputset in error state', () => {
    const { getByText } = render(
      <TestWrapper>
        <ChangeSourceInputset
          data={{}}
          loading={false}
          error={{ data: { message: 'api call failed' }, message: 'api call failed' }}
          refetch={jest.fn()}
          templateRefData={templateRefData}
          isReadOnlyInputSet={true}
          changeSourcesWithRuntimeList={[]}
        />
      </TestWrapper>
    )
    expect(getByText('api call failed')).toBeInTheDocument()
  })

  test('should render ChangeSourceInputset in no data state', () => {
    const { getByText } = render(
      <TestWrapper>
        <ChangeSourceInputset
          data={{}}
          loading={false}
          error={null}
          refetch={jest.fn()}
          templateRefData={templateRefData}
          isReadOnlyInputSet={true}
          changeSourcesWithRuntimeList={[]}
        />
      </TestWrapper>
    )
    expect(getByText('templatesLibrary.noInputsRequired')).toBeInTheDocument()
  })
})
