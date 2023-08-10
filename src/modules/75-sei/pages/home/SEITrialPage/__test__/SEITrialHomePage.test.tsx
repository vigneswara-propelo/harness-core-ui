/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SEITrialPage from '../SEITrialPage'

describe('SEITrialPage snapshot test', () => {
  test('should render properly', async () => {
    const { getByText, getByRole } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <SEITrialPage />
      </TestWrapper>
    )
    expect(getByText('common.purpose.sei.fullName')).toBeInTheDocument()
    expect(getByRole('button')).toHaveTextContent('common.banners.trial.contactSales')
  })
})
