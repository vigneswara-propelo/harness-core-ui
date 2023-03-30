/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { ArtifactSourceTemplateCanvasWithRef } from '../ArtifactSourceTemplateCanvas'

const artifactSourceTemplateContextMock = getTemplateContextMock(TemplateType.ArtifactSource)

describe('<ArtifactSourceConfigForm /> tests', () => {
  test('Should render artifact source template canvas with details form', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={artifactSourceTemplateContextMock}>
          <ArtifactSourceTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('span[data-tooltip-id="connectorId_DockerRegistry"]')).toBeTruthy()
    expect(container.querySelector('div[data-tooltip-id="artifactSourceConfig_artifactSourceDetails"]')).toBeTruthy()
    expect(container.querySelector('div[data-tooltip-id="artifactSourceConfig_artifactRepoType"]')).toBeTruthy()

    const imagePathInput = container.querySelector('input[value="test/path"]') as HTMLInputElement
    expect(imagePathInput).toBeDefined()

    await waitFor(() => {
      fireEvent.change(imagePathInput, { target: { value: 'test/path/new' } })
    })
    expect(imagePathInput.value).toBe('test/path/new')
  })
})
