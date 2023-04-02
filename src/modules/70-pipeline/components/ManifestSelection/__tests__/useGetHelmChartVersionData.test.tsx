/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetHelmChartVersionDetailsV1 } from 'services/cd-ng'
import { useGetHelmChartVersionData } from '../ManifestWizardSteps/CommonManifestDetails/useGetHelmChartVersionData'

const mockChartData = {
  data: { helmChartVersions: ['v1', 'v3'] }
}

const pathParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier'
}

jest.mock('services/cd-ng', () => ({
  useGetHelmChartVersionDetailsV1: jest.fn().mockImplementation(() => ({ loading: true, data: mockChartData }))
}))

const useGetHelmChartVersionDetailsV1Mock = useGetHelmChartVersionDetailsV1 as jest.MockedFunction<any>
describe('useGetHelmChartVersionData', () => {
  const modifiedPrevStepData = {
    connectorRef: {
      value: 'testConnector',
      connector: {
        name: 'testConnector',
        identifier: 'testConnector',
        orgIdentifier: 'orgIdentifier',
        type: 'HttpHelmRepo',
        spec: {
          helmRepoUrl: 'https://abc.xyz',
          auth: {
            type: 'UsernamePassword',
            spec: {
              username: 'harnessadmin',
              usernameRef: null,
              passwordRef: 'account.testPassword'
            }
          },
          delegateSelectors: []
        }
      }
    },
    selectedManifest: 'HelmChart',
    store: 'Http'
  }

  const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
    <TestWrapper pathParams={pathParams}>{children}</TestWrapper>
  )
  test('should return chart versions data and fetch chart versions data when the dependent fields change', async () => {
    const { result, rerender } = renderHook(
      () =>
        useGetHelmChartVersionData({
          modifiedPrevStepData,
          fields: ['chartName', 'region', 'bucketName', 'folderPath']
        }),
      {
        wrapper
      }
    )

    expect(result.current.chartVersions).toEqual([{ label: 'loading', value: 'loading' }])
    expect(result.current.loadingChartVersions).toEqual(true)

    await act(async () => {
      result.current.fetchChartVersions({
        chartName: 'chartName',
        region: 'region',
        bucketName: 'bucketName',
        folderPath: 'folderPath'
      })
    })

    useGetHelmChartVersionDetailsV1Mock.mockImplementation((): any => {
      return {
        loading: false,
        data: mockChartData,
        error: null,
        refetch: jest.fn()
      }
    })
    rerender({
      modifiedPrevStepData,
      fields: ['chartName', 'region', 'bucketName', 'folderPath']
    })
    expect(result.current.chartVersions).toEqual([
      { label: 'v1', value: 'v1' },
      { label: 'v3', value: 'v3' }
    ])
    expect(result.current.loadingChartVersions).toEqual(false)
    expect(result.current.chartVersionsError).toEqual(null)
  })
})
