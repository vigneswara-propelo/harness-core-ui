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

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

jest.mock(
  '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceConfigForm/ArtifactSourceConfigForm',
  () => ({
    ...(jest.requireActual(
      '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceConfigForm/ArtifactSourceConfigForm'
    ) as any),
    ArtifactSourceConfigFormWithRef: React.forwardRef(({ updateTemplate }: any, _ref: any) => {
      return (
        <div className="artifact-source-config-mock">
          <button
            id="mock-update-button"
            onClick={() => updateTemplate({ artifactType: 'DockerRegistry', connectorId: 'test', artifactConfig: {} })}
          >
            update template
          </button>
        </div>
      )
    })
  })
)

describe('<ArtifactSourceTemplateCanvas /> tests', () => {
  test('Should call update template', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={artifactSourceTemplateContextMock}>
          <ArtifactSourceTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    const updateBtn = container.querySelector('button[id="mock-update-button"]')

    await waitFor(() => {
      fireEvent.click(updateBtn as HTMLElement)
    })
    expect(artifactSourceTemplateContextMock.updateTemplate).toHaveBeenCalled()
  })
})
