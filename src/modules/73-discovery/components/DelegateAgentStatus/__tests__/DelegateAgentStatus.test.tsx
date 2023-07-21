/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { DatabaseDelegateTaskStatus } from 'services/servicediscovery'
import { DiscoveryAgentStatus } from '../DelegateAgentStatus'

describe('Discovery Agent Status ', () => {
  test('render', async () => {
    const props = {
      status: 'SUCCESS' as DatabaseDelegateTaskStatus | undefined
    }
    const { container } = render(<DiscoveryAgentStatus {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Discovery agent status is success', () => {
    const { container, getByText } = render(<DiscoveryAgentStatus status="SUCCESS" />)

    expect(container).toHaveTextContent('SUCCESS')
    expect(getByText('SUCCESS')).toHaveClass('StyledProps--color-green700')
  })
  test('Discovery agent status is failed', () => {
    const { container, getByText } = render(<DiscoveryAgentStatus status="FAILED" />)

    expect(container).toHaveTextContent('FAILED')
    expect(getByText('FAILED')).toHaveClass('StyledProps--color-red700')
  })
  test('Discovery agent status is error', () => {
    const { container, getByText } = render(<DiscoveryAgentStatus status="ERROR" />)

    expect(container).toHaveTextContent('ERROR')
    expect(getByText('ERROR')).toHaveClass('StyledProps--color-orange700')
  })
  test('Discovery agent status is processed', () => {
    const { container, getByText } = render(<DiscoveryAgentStatus status="PROCESSED" />)

    expect(container).toHaveTextContent('PROCESSED')
    expect(getByText('PROCESSED')).toHaveClass('StyledProps--color-yellow700')
  })
})
