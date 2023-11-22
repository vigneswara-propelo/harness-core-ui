/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { YamlVersionBadge } from '../YamlVersionBadge'

describe('<YamlVersionBadge /> tests', () => {
  test('should show v0', async () => {
    const { getByText } = render(
      <TestWrapper>
        <YamlVersionBadge version={'0'} />
      </TestWrapper>
    )
    expect(getByText('YAML: v0')).toBeInTheDocument()
  })

  test('should show v1', async () => {
    const { getByText } = render(
      <TestWrapper>
        <YamlVersionBadge version={'1'} />
      </TestWrapper>
    )
    expect(getByText('YAML: v1')).toBeInTheDocument()
  })

  test('should show v0 minimal', async () => {
    const { getByText } = render(
      <TestWrapper>
        <YamlVersionBadge version={'0'} minimal />
      </TestWrapper>
    )
    expect(getByText('v0')).toBeInTheDocument()
  })

  test('should show v1 minimal', async () => {
    const { getByText } = render(
      <TestWrapper>
        <YamlVersionBadge version={'1'} minimal />
      </TestWrapper>
    )
    expect(getByText('v1')).toBeInTheDocument()
  })
})
