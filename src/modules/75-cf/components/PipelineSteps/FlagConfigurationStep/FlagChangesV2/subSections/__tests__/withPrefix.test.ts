/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { withPrefix } from '../withPrefix'

describe('withPrefix', () => {
  test('it should add the prefix if passed', async () => {
    expect(withPrefix('this.is', 'my.path')).toBe('this.is.my.path')
  })

  test('it should not add the prefix if empty', async () => {
    expect(withPrefix('', 'my.path')).toBe('my.path')
  })

  test('it should remove any extra dots in the path', async () => {
    expect(withPrefix('', '.my..path.')).toBe('my.path')
  })
})
