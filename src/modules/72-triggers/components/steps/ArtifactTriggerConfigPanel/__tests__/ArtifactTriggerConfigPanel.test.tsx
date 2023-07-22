/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import ArtifactTriggerConfigPanel from '../ArtifactTriggerConfigPanel'

const TestComponent: React.FC<{
  isEdit: boolean
  initialValues: any
}> = ({ isEdit, initialValues }) => {
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => <ArtifactTriggerConfigPanel formikProps={formikProps} isEdit={isEdit} />}
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/pipeline-ng', () => ({
  useGetStagesExecutionList: jest.fn().mockReturnValue({
    data: {
      data: []
    }
  }),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn().mockReturnValue({
    data: {
      data: {}
    }
  })
}))

describe('ArtifactTriggerConfigPanel', () => {
  test('Create flow', async () => {
    const { getByText, findByText, container, queryByPlaceholderText } = render(
      <TestComponent
        isEdit={false}
        initialValues={{
          triggerType: 'Artifact',
          name: '',
          identifier: '',
          description: '',
          tags: {},
          source: {
            type: 'Artifact',
            spec: {
              type: 'Gcr',
              eventConditions: [],
              metaDataConditions: [],
              sources: [
                {
                  spec: {
                    type: 'Gcr',
                    connectorRef: '',
                    imagePath: '',
                    registryHostname: '',
                    tag: '<+trigger.artifact.build>'
                  }
                }
              ]
            }
          },
          eventConditions: [],
          metaDataConditions: []
        }}
      />
    )

    expect(await findByText('name')).toBeInTheDocument()

    expect(getByText('Id')).toBeInTheDocument()
    expect(queryByPlaceholderText('common.namePlaceholder')).toBeInTheDocument()
    expect(getByText('pipeline.artifactTriggerConfigPanel.listenOnNewArtifact')).toBeInTheDocument()
    expect(getByText('pipeline.artifactTriggerConfigPanel.artifact')).toBeInTheDocument()
    expect(getByText('pipeline.artifactTriggerConfigPanel.defineArtifactSource')).toBeInTheDocument()

    /*
     * Create flow has 3 edit icons: Do not allow Id to edit
     * 1: Description Edit
     * 2: Tags Edit
     * 2: Id Edit
     */
    expect(container.querySelectorAll('[data-icon="Edit"]')).toHaveLength(3)
  })

  test('Edit flow', async () => {
    const name = 'GCR Test Trigger'
    const identifier = 'GCR_Test_Trigger'
    const description = 'Test Description'
    const tags = { Tag1: '', Tag2: '' }
    const connectorRef = 'test-connector'
    const imagePath = 'test-image-path'

    const { container, getByText, queryByPlaceholderText } = render(
      <TestComponent
        isEdit={true}
        initialValues={{
          triggerType: 'Artifact',
          name,
          identifier,
          description,
          tags,
          source: {
            type: 'Artifact',
            spec: {
              type: 'Gcr',
              eventConditions: [],
              metaDataConditions: [],
              sources: [
                {
                  spec: {
                    type: 'Gcr',
                    connectorRef,
                    imagePath,
                    registryHostname: 'gcr.io',
                    tag: '<+trigger.artifact.build>'
                  }
                }
              ]
            }
          }
        }}
      />
    )

    await waitFor(() => {
      expect(queryByPlaceholderText('common.namePlaceholder')).toHaveValue(name)
    })

    expect(getByText(identifier)).toBeInTheDocument()
    expect(getByText(description)).toBeInTheDocument()
    Object.keys(tags).forEach(tag => {
      expect(getByText(tag)).toBeInTheDocument()
    })

    expect(getByText('pipeline.artifactTriggerConfigPanel.listenOnNewArtifact')).toBeInTheDocument()
    expect(getByText('pipeline.artifactsSelection.artifactType')).toBeInTheDocument()
    expect(getByText('artifactRepository')).toBeInTheDocument()
    expect(getByText('location')).toBeInTheDocument()

    // Artifact Source Values
    expect(getByText('connectors.GCR.name')).toBeInTheDocument()
    expect(getByText(connectorRef)).toBeInTheDocument()
    expect(getByText(imagePath)).toBeInTheDocument()

    // Edit artifact source button
    expect(container.querySelectorAll('[data-icon="Edit"]')).toHaveLength(1)

    // Delete artifact source button
    expect(container.querySelectorAll('[data-icon="main-trash"]')).toHaveLength(1)
  })
})
