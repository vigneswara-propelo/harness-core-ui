/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { RenderResult, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'

import { TestWrapper } from '@common/utils/testUtils'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import routes from '@common/RouteDefinitions'
import { referencedByResponse } from './mock'
import ReferencedBy from '../ReferencedBy'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useGetReferencedBy: jest.fn().mockImplementation(() => ({ data: referencedByResponse, loading: false }))
}))

jest.useFakeTimers()

function WrapperComponent(props: any): JSX.Element {
  const { context } = props || {}
  return (
    <TestWrapper>
      <FileStoreContext.Provider value={context}>
        <ReferencedBy />
      </FileStoreContext.Provider>
    </TestWrapper>
  )
}

const renderComponent = (): RenderResult => {
  const context = getDummyFileStoreContextValue() || {}
  return render(
    <WrapperComponent
      context={{
        ...context,
        isCachedNode: jest.fn().mockReturnValue(false)
      }}
    />
  )
}

const referencedByContentArray = referencedByResponse.data.content
const accountId = referencedByContentArray[0].accountIdentifier
const serviceId = referencedByContentArray[0].referredByEntity.entityRef.identifier
const orgIdentifier = referencedByContentArray[0].referredByEntity.entityRef.orgIdentifier
const projectIdentifier = referencedByContentArray[0].referredByEntity.entityRef.projectIdentifier

describe('Define referenced by component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render referenced list view', async () => {
    const { container, getByText } = renderComponent()

    expect(getByText(referencedByContentArray[0].referredByEntity.name)).toBeInTheDocument()
    expect(getByText(referencedByContentArray[0].referredByEntity.entityRef.projectIdentifier)).toBeInTheDocument()
    expect(container).toBeDefined()
  })

  test('should route to service detail page on row click', async () => {
    const { getByTestId } = renderComponent()

    const rows = await screen.findAllByRole('row')
    fireEvent.click(rows[1])
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent(
      `${routes.toServiceStudio({
        accountId,
        serviceId,
        orgIdentifier,
        projectIdentifier
      })}?tab=configuration`
    )
  })
})
