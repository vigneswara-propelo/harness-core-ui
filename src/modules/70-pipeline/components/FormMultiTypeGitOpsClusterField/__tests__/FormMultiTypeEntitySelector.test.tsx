/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Formik from 'formik'

import { fireEvent, getByTestId, render, waitFor, screen } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { ClusterResponse } from 'services/cd-ng'

import { FormMultiTypeGitOpsClusterField } from '../FormMultiTypeGitOpsClusterField'
import { clusters, linkedClusters } from './mocks'

const addApi = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('services/cd-ng', () => ({
  getClusterListFromSourcePromise: jest.fn().mockImplementation(() => Promise.resolve({ data: { content: clusters } })),
  useLinkClusters: jest.fn().mockImplementation(() => {
    return { mutate: addApi }
  })
}))

const initialValues = {
  environment: 'env1',
  infrastructure: 'infra1'
}

describe('FormMultiTypeConnectorField tests', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')

  beforeEach(() => {
    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      values: initialValues,
      setValues: jest.fn(),
      setFieldValue: jest.fn()
    } as unknown as any)
  })
  test(`renders without crashing`, async () => {
    const { getByText } = render(
      <TestWrapper>
        <FormMultiTypeGitOpsClusterField
          key={'Github'}
          name="gitOpsClusters"
          label={'clusters'}
          placeholder={`Select Clusters`}
          onMultiSelectChange={() => jest.fn()}
          isMultiSelect={true}
          multiTypeProps={{ expressions: [], allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] }}
          accountIdentifier={'accountId'}
          projectIdentifier={'test'}
          orgIdentifier={'default'}
          linkedClusters={linkedClusters as ClusterResponse[]}
          environmentIdentifier={'Prod'}
        />
      </TestWrapper>
    )
    const selectCluster = getByText('Select Clusters')
    fireEvent.click(selectCluster)

    const dialog = findDialogContainer() as HTMLElement

    fireEvent.click(getByText('account'))

    await waitFor(() => {
      expect(getByTestId(dialog, 'incluster')).toBeInTheDocument()
    })
  })

  test('if gitOpsClusters is runtime', async () => {
    useFormikContextMock.mockReturnValue({
      values: { ...initialValues, gitOpsClusters: '<+input>' },
      setValues: jest.fn(),
      setFieldValue: jest.fn()
    } as unknown as any)
    render(
      <TestWrapper>
        <FormMultiTypeGitOpsClusterField
          key={'Github'}
          name="gitOpsClusters"
          label={'clusters'}
          placeholder={`Select Clusters`}
          onMultiSelectChange={() => jest.fn()}
          isMultiSelect={true}
          multiTypeProps={{ expressions: [], allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] }}
          accountIdentifier={'accountId'}
          projectIdentifier={'test'}
          orgIdentifier={'default'}
          linkedClusters={linkedClusters as ClusterResponse[]}
          environmentIdentifier={'Prod'}
        />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('<+input>')).toBeInTheDocument()
  })
})
