/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { identity } from 'lodash-es'
import { fireEvent, render, screen } from '@testing-library/react'
import { validateEulaSign } from '@harnessio/react-ng-manager-client'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingDTO } from 'services/cd-ng'
import type { SettingCategory } from '@default-settings/interfaces/SettingType.types'
import { TestWrapper } from '@common/utils/testUtils'
import { AIDASettingsRenderer } from '../EULAComponents'

jest.mock('@harnessio/react-ng-manager-client')
const validateEulaSignMock = validateEulaSign as jest.MockedFunction<any>
validateEulaSignMock.mockImplementation(() => {
  return Promise.resolve({ content: { signed: false } })
})

describe('Eula Components Renderer', () => {
  const settingValue: SettingDTO = {
    value: 'false',
    allowOverrides: true,
    category: 'EULA' as SettingCategory,
    groupIdentifier: '',
    identifier: 'aida',
    isSettingEditable: true,
    name: 'AIDA',
    valueType: 'String',
    allowedValues: undefined,
    allowedScopes: ['ACCOUNT', 'PROJECT']
  }
  const props: SettingRendererProps = {
    setFieldValue: jest.fn(),
    categoryAllSettings: new Map(),
    identifier: 'aida',
    onRestore: jest.fn(),
    onSettingSelectionChange: jest.fn(),
    settingValue: settingValue,
    errorMessage: '',
    getString: identity
  }

  test('EULA Component Renderer', async () => {
    render(
      <TestWrapper
        path={'/account/:accountId/orgs/:orgIdentifier/projects/:projectIdentifier/settings/resources/default-settings'}
        pathParams={{
          accountId: 'accountId',
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier'
        }}
      >
        <AIDASettingsRenderer {...props} />
      </TestWrapper>
    )
    const input = await screen.findByTestId('aidaToggleStatus')
    expect(input).toBeInTheDocument()

    if (input) {
      fireEvent.click(input)
    }
    expect(validateEulaSignMock).toHaveBeenCalled()
  })
})
