/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import EnvironmentTabs from '../EnvironmentTabs'

describe('Environment Tabs', () => {
  test('does not show Environment Group Tab', () => {
    const { container } = render(
      <TestWrapper>
        <EnvironmentTabs />
      </TestWrapper>
    )
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="Layout--horizontal Layout--layout-spacing-small StyledProps--main TabNavigation--container"
        >
          <a
            class="TabNavigation--tags TabNavigation--small"
            href="/account/undefined/environments"
          >
            environment
          </a>
        </div>
      </div>
    `)
  })
})
