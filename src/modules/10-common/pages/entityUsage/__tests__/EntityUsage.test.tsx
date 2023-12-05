/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText, screen, within, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, connectorPathProps, projectPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import EntityUsage from '../EntityUsage'
import referencedData from './mocks/entity-usage-data.json'
import referencedDataWithGit from './mocks/entity-usage-data-with-git.json'
import referencedDataWithDetails from './mocks/entity-usage-connector-data.json'

const getPipelineSummryMock = jest.fn(() => Promise.resolve({ status: 'SUCCESS' }))

jest.mock('services/pipeline-ng', () => ({
  getPipelineSummaryPromise: jest.fn().mockImplementation(() => getPipelineSummryMock())
}))

jest.mock('services/template-ng', () => ({
  getTemplateMetadataListPromise: jest.fn().mockImplementation(() => Promise.resolve({}))
}))

describe('Entity Usage', () => {
  test('render for no data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <EntityUsage
          mockData={{
            data: {} as any,
            loading: false
          }}
          entityIdentifier="secretId"
          entityType="Secrets"
        />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'entityReference.noRecordFound'))
    expect(container).toMatchSnapshot()
  })
  test('render for data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <EntityUsage
          mockData={{
            data: referencedData as any,
            loading: false
          }}
          entityIdentifier="secretId"
          entityType="Secrets"
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render for connector data with gitSync', async () => {
    window.open = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ ...projectPathProps, ...connectorPathProps })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier',
          connectorId: 'connectorId'
        }}
        queryParams={{ repoIdentifier: 'firstRepo', branch: 'master' }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <EntityUsage
          mockData={{
            data: referencedDataWithGit as any,
            loading: false
          }}
          entityIdentifier="connectorId"
          entityType="Connectors"
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(queryByText(container, 'Refer test')).toBeInTheDocument())

    await act(async () => {
      fireEvent.click(queryByText(container, 'Refer test')!)
    })

    await waitFor(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(window.open).toBeCalledWith(
      expect.stringContaining('/account/px7xd_BFRCi-pfWPYXVjvw/home/orgs/AaTestOrg/projects/dev7/pipelines'),
      '_blank'
    )
  })

  test('render for connector data with details', async () => {
    const { getByText } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ ...projectPathProps, ...connectorPathProps })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier',
          connectorId: 'connectorId'
        }}
      >
        <EntityUsage
          mockData={{
            data: referencedDataWithDetails as any,
            loading: false
          }}
          entityIdentifier="connectorId"
          entityType="Connectors"
        />
      </TestWrapper>
    )
    const cell1 = await screen.findByRole('row', {
      name: 'infraTest typeLabel: Infrastructure delegateInfra1 Jan 31, 2023 04:20 am account'
    })
    expect(within(cell1).getByText('delegateInfra1')).toBeInTheDocument()
    expect(getByText('e1')).toBeDefined()
  })
})
