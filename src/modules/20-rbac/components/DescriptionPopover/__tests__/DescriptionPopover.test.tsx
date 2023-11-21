/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import DescriptionPopover from '../DescriptionPopover'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (id: string) => id
  })
}))
describe('DescriptionPopover', () => {
  test('empty description props', () => {
    const { container } = render(<DescriptionPopover description={''} />)
    expect(container.querySelector('[data-icon="description"]')).toBeNull()
  })
  test('valid description props', () => {
    const { container } = render(<DescriptionPopover description={'Hey this is description'} />)
    expect(container.querySelector('[data-icon="description"]')).not.toBeNull()
  })
})
