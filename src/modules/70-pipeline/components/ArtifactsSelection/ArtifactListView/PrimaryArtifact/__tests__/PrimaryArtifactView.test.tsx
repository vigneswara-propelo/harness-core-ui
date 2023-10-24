/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import PrimaryArtifactView from '@pipeline/components/ArtifactsSelection/ArtifactListView/PrimaryArtifact/PrimaryArtifactView'
import { artifactTemplateMockResponse, mockConnectorResponse, mockPrimaryArtifact } from './mocks'

jest.mock('services/template-ng', () => ({
  ...jest.requireActual('services/template-ng'),
  useGetTemplate: jest
    .fn()
    .mockImplementation(() => ({ data: artifactTemplateMockResponse, refetch: jest.fn(), error: null, loading: false }))
}))

const editArtifactMock = jest.fn()
const removePrimaryMock = jest.fn()

describe('Primary Artifact view tests', () => {
  test(`should render artifact source template list correctly`, async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PrimaryArtifactView
          primaryArtifact={mockPrimaryArtifact as any}
          isReadonly={false}
          accountId={'px7xd_BFRCi-pfWPYXVjvw'}
          fetchedConnectorResponse={mockConnectorResponse as any}
          editArtifact={editArtifactMock}
          removePrimary={removePrimaryMock}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="template-library"]')).toBeInTheDocument()
    expect(getByText('someartifacttemplate')).toBeInTheDocument()
    expect(getByText('Using Template: artifact template stale (12)')).toBeInTheDocument()
    expect(getByText('server/best/nginx')).toBeInTheDocument()

    fireEvent.click(container.querySelector('[data-icon="Edit"]')!)
    fireEvent.click(container.querySelector('[data-icon="main-trash"]') as HTMLElement)

    await waitFor(() => expect(editArtifactMock).toHaveBeenCalled())
    await waitFor(() => expect(removePrimaryMock).toHaveBeenCalled())
  })
})
