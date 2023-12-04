/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, act, fireEvent, waitFor, screen } from '@testing-library/react'

import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import { mockDelegateSelectorsResponse } from '@common/components/DelegateSelectors/__tests__/DelegateSelectorsMockData'

import { NGTemplateInfoConfig } from 'services/template-ng'
import { ScriptTemplateFormWithRef } from '../ScriptTemplateForm'

const template: NGTemplateInfoConfig = {
  name: 'Test_Secret_Manager_Template',
  identifier: 'Test Secret Manager Template',
  type: 'SecretManager',
  versionLabel: 'V1',
  spec: {
    environmentVariables: [{ name: 'var1', type: 'String', value: 'hello' }],
    onDelegate: true,
    shell: 'Bash',
    source: {
      type: 'Inline',
      spec: {
        script: 'echo Hello World'
      }
    }
  }
}

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(() => {
    return mockDelegateSelectorsResponse
  })
}))
describe('Test OptionalConfigurations', () => {
  test('Initial Render with values', async () => {
    const { container, getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <ScriptTemplateFormWithRef template={template} updateTemplate={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText('common.scriptType')).toBeInTheDocument()
    expect(getByPlaceholderText('- common.scriptType -')).toHaveValue('Bash')
    expect(container.querySelector('[name="spec.source.type"][value="Inline"]')).toBeChecked()
    expect(getByText('echo Hello World')).toBeInTheDocument()

    // Change Script location
    act(() => {
      fireEvent.click(container.querySelector('[name="spec.source.type"][value="Harness"]')!)
    })

    expect(getByText('common.git.filePath')).toBeInTheDocument()
    expect(getByText('cd.steps.commands.selectScriptLocation')).toBeInTheDocument()

    act(() => {
      fireEvent.click(container.querySelector('[data-icon="fixed-input"]')!)
    })

    const popover = findPopoverContainer() as HTMLDivElement
    expect(popover.querySelectorAll('.MultiTypeInput--menuItemLabel')).toHaveLength(1)
    expect(screen.getByText('Fixed value')).toBeInTheDocument()
  })

  test('Switch the tabs with data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ScriptTemplateFormWithRef template={template} updateTemplate={jest.fn()} />
      </TestWrapper>
    )

    // Change Tab to Configuration
    act(() => {
      fireEvent.click(getByText('Configuration'))
    })

    // Check for the Environment Variables
    await waitFor(() => {
      expect(container.querySelector('[name="spec.environmentVariables[0].name"]')).toHaveValue('var1')
    })
    expect(container.querySelector('[name="spec.environmentVariables[0].type"]')).toHaveValue('String')
    expect(container.querySelector('[name="spec.environmentVariables[0].value"]')).toHaveValue('hello')
  })
})
