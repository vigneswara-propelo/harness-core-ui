/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getAllByText, fireEvent, getByText, waitFor, queryByText } from '@testing-library/react'
import { serviceListResponse, serviceRow } from '@cd/mock'
import mockImport from 'framework/utils/mockImport'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import { ServiceName, ServiceDescription, ServiceMenu } from '../ServicesListColumns/ServicesListColumns'

jest.mock('services/cd-ng', () => {
  return {
    useGetYamlSchema: jest.fn(() => ({ data: null })),
    useDeleteServiceV2: jest.fn(() => ({ mutate: jest.fn() })),
    useCreateServiceV2: jest.fn(() => ({ data: null })),
    useUpsertServiceV2: jest.fn(() => ({ data: null })),
    useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
    useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
    useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
    useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() }))
  }
})
const mutate = jest.fn(() => {
  return Promise.resolve({ data: {} })
})

describe('ServiceListColumns', () => {
  test('ServiceName', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceName {...serviceRow} />
      </TestWrapper>
    )

    expect(getAllByText(document.body, serviceRow.row.original.name)).toBeDefined()
    expect(getAllByText(document.body, 'Id: ' + serviceRow.row.original.identifier)).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  test('ServiceDescription', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceDescription {...serviceRow} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('ServiceMenu', () => {
  const services = serviceListResponse?.data?.content?.map(service => service.service) || []
  test('Should render options edit/delete', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceMenu data={services} isForceDeleteEnabled />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should go to editModal by clicking edit', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceMenu data={services} isForceDeleteEnabled />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)
    expect(container).toMatchSnapshot()
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()

    expect(getByText(document.body, 'cancel')).toBeDefined()
    fireEvent.click(getByText(document.body, 'cancel') as HTMLButtonElement)
    expect(findDialogContainer()).toBeFalsy()
  })

  test('Should allow deleting', async () => {
    mockImport('services/cd-ng', {
      useDeleteServiceV2: () => ({
        mutate
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceMenu data={services} isForceDeleteEnabled />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)
    let form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()
    expect(getByText(document.body, 'confirm')).toBeDefined()
    fireEvent.click(getByText(document.body, 'confirm') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)
    form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(getByText(document.body, 'cancel')).toBeDefined()
    fireEvent.click(getByText(document.body, 'cancel') as HTMLButtonElement)
    expect(findDialogContainer()).toBeFalsy()
  })

  test('Should render option Move To Git, for Inline service if all required FF is on', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_SVC_ENV_REDESIGN: true, CDS_SERVICE_GITX: true } }}>
        <ServiceMenu data={{ ...services[0], storeType: StoreType.INLINE }} isForceDeleteEnabled />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)

    expect(getByText(document.body, 'common.moveToGit')).toBeInTheDocument()
  })

  test('Should not render option Move To Git, if NG_SVC_ENV_REDESIGN (V2 FF) is off', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_SVC_ENV_REDESIGN: false, CDS_SERVICE_GITX: true } }}>
        <ServiceMenu data={services[0]} isForceDeleteEnabled />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    expect(queryByText(document.body, 'common.moveToGit')).not.toBeInTheDocument()
  })

  test('Should not render option Move To Git, if CDS_SERVICE_GITX FF is off', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_SVC_ENV_REDESIGN: true, CDS_SERVICE_GITX: false } }}>
        <ServiceMenu data={services[0]} isForceDeleteEnabled />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    expect(queryByText(document.body, 'common.moveToGit')).not.toBeInTheDocument()
  })

  test('Should not render option Move To Git for Remote services', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_SVC_ENV_REDESIGN: true, CDS_SERVICE_GITX: true } }}>
        <ServiceMenu data={{ ...services[0], storeType: StoreType.REMOTE }} isForceDeleteEnabled />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    expect(queryByText(document.body, 'common.moveToGit')).not.toBeInTheDocument()
  })
})
