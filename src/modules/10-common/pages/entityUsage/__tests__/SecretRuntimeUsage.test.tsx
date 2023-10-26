/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import * as cdNGSVC from 'services/cd-ng'
import SecretRuntimeUsage from '../views/RuntimeUsageView/SecretRuntimeUsage'
import secretRuntimeUsageData from './mocks/entitySecretRuntimeUsage.json'

const listActivitiesPromise = jest.fn(() =>
  Promise.resolve({ data: secretRuntimeUsageData, refetch: () => Promise.resolve(secretRuntimeUsageData) })
)
jest.mock('services/cd-ng', () => ({
  useListActivities: jest.fn().mockImplementation(() => {
    return listActivitiesPromise
  }),
  useGetUniqueReferredByEntities: jest.fn().mockImplementation(() => {
    return {
      data: {
        entityTypeList: ['Connectors']
      }
    }
  })
}))
jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
  return { data: secretRuntimeUsageData, refetch: () => Promise.resolve(secretRuntimeUsageData) }
})

describe('Secret Runtime Usage', () => {
  test('render for No data', async () => {
    jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
      return { data: {}, refetch: () => Promise.resolve({}) }
    })
    render(
      <TestWrapper
        path={routes.toSecretDetailsRuntimeUsage({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretRuntimeUsage
          secretData={{
            data: {
              secret: {
                type: 'SecretText',
                name: 'secretId',
                identifier: 'secretId',
                spec: {}
              }
            }
          }}
        />
      </TestWrapper>
    )

    const element = screen.queryByText('common.secret.noSecretRuntimeUsageData')
    expect(element).toBeVisible()
  })
  test('render for data', async () => {
    jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
      return { data: secretRuntimeUsageData, refetch: () => Promise.resolve(secretRuntimeUsageData) }
    })
    render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretRuntimeUsage
          secretData={{
            data: {
              secret: {
                type: 'SecretText',
                name: 'secretId',
                identifier: 'secretId',
                spec: {}
              }
            }
          }}
        />
      </TestWrapper>
    )

    const connectorName = screen.queryAllByText('Certified_Instance')
    await waitFor(() => {
      expect(connectorName).toHaveLength(3)
    })
  })
})
