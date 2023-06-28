/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import NumberedList from '../NumberedList'

const index = 0
const content = 'Content for numbered list at index 0'

describe('NumberedList', () => {
  test('render component paint lists', async () => {
    const { container } = render(
      <TestWrapper>
        <NumberedList index={index} content={content} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('it should render line if prop is present', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <NumberedList index={0} content={content} showLine />
      </TestWrapper>
    )

    expect(getByTestId('showLine')).toBeInTheDocument()
  })
})
