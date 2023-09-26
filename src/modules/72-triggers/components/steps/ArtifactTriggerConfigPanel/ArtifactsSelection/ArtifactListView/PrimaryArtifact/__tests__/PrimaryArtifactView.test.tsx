import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import PrimaryArtifactView from '../PrimaryArtifactView'

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn(() => ({ mutate: () => Promise.resolve({ data: {} }) }))
}))

describe('PrimaryArtifactView', () => {
  test('Test for GCR Artifact', async () => {
    const editArtifact = jest.fn()
    const deleteArtifact = jest.fn()
    const connectorRef = 'gcp-test-connection'
    const imagePath = 'test-image-path'
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <PrimaryArtifactView
          artifact={{
            connectorRef,
            imagePath,
            registryHostname: 'us.gcr.io'
          }}
          artifactType="Gcr"
          editArtifact={editArtifact}
          deleteArtifact={deleteArtifact}
        />
      </TestWrapper>
    )

    await findByText('platform.connectors.GCR.name')

    expect(getByText(imagePath)).toBeInTheDocument()
    expect(container.querySelector('[data-icon="service-gcp"]')).toBeInTheDocument()
    expect(getByText(connectorRef)).toBeInTheDocument()
    expect(container.querySelector('[data-icon="full-circle"]')).toBeInTheDocument()

    const editButton = container.querySelector('[data-icon="Edit"]')
    const deleteButton = container.querySelector('[data-icon="main-trash"]')

    if (editButton) {
      userEvent.click(editButton)

      await waitFor(() => {
        expect(editArtifact).toHaveBeenCalled()
      })
    } else {
      throw Error('No Edit Button')
    }

    if (deleteButton) {
      userEvent.click(deleteButton)
      await waitFor(() => {
        expect(deleteArtifact).toHaveBeenCalled()
      })
    } else {
      throw Error('No Delete Button')
    }
  })
})
