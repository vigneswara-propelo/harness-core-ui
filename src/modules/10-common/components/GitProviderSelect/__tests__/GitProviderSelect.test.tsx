/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { GitProviderSelect, getGitProviderCards } from '../GitProviderSelect'

const getString = (key: any): any => {
  return key
}

describe('GitProviderSelect tests', () => {
  test('initial render', async () => {
    const { getByText } = render(
      <TestWrapper>
        <GitProviderSelect
          gitProvider={getGitProviderCards(getString)[0]}
          setFieldValue={jest.fn()}
          connectorFieldName="connectorRef"
          repoNameFieldName="repoName"
          handleChange={jest.fn()}
          showDescription={true}
        />
      </TestWrapper>
    )

    expect(getByText('common.harnessCodeRepo')).toBeInTheDocument()
    expect(getByText('common.harnessCodeRepoInfo')).toBeInTheDocument()
    expect(getByText('common.thirdPartyGitProvider')).toBeInTheDocument()
    expect(getByText('common.thirdPartyGitProviderInfo')).toBeInTheDocument()
  })

  test('change git provider type', async () => {
    const { getByText } = render(
      <TestWrapper>
        <GitProviderSelect
          gitProvider={getGitProviderCards(getString)[0]}
          setFieldValue={jest.fn()}
          connectorFieldName="connectorRef"
          repoNameFieldName="repoName"
          handleChange={jest.fn()}
        />
      </TestWrapper>
    )
    const text = getByText('common.thirdPartyGitProvider')
    fireEvent.click(getByText('common.thirdPartyGitProvider'))
    expect(text).toHaveClass('StyledProps--color-primary7')

    fireEvent.click(getByText('common.harnessCodeRepo'))
    expect(text).not.toHaveClass('StyledProps--color-primary7')
  })
})
