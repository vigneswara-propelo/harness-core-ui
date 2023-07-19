/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import TagCount, { TagCountProps } from '../TagCount'

const mockData: TagCountProps = {
  tagItems: ['Test1', 'Test2', 'Test3', 'Test4', 'Test5'],
  icon: 'code-settings',
  tagCount: 2,
  tooltipHeader: 'Test headers'
}

describe('TagCount component test', () => {
  test('should match snapshot with mock data', async () => {
    const { container } = render(<TagCount {...mockData} />)
    expect(container).toMatchSnapshot()
  })
  test('validate tooltip items count', () => {
    const { container } = render(<TagCount {...mockData} />)
    expect(container).toHaveTextContent('+3')
  })
})
