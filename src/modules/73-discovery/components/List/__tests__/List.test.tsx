/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import List from '../List'

const title = 'What is a network map?'
const description =
  'A map of services designed to ensure that the different entity types within Kubernetes can communicate'

describe('List', () => {
  test('render component paint lists', async () => {
    const { container } = render(
      <TestWrapper>
        <List title={title} content={description} margin={{ top: 'medium', bottom: 'xlarge' }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('it should have correct color props', async () => {
    const { getByText } = render(
      <TestWrapper>
        <List title={title} content={description} />
      </TestWrapper>
    )

    expect(getByText(title)).toBeInTheDocument()
    expect(getByText(title)).toHaveClass('StyledProps--color-grey900')

    expect(getByText(description)).toBeInTheDocument()
    expect(getByText(description)).toHaveClass('StyledProps--color-grey600')
  })
})
