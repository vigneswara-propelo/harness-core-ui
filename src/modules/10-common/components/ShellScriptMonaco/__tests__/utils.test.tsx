/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getStartColumnForMonacoRange } from '../utils'

describe('test shellscript monaco util functions', () => {
  test('test getStartColumnForMonacoRange with all possible scenarios', () => {
    const responseForValidExpression = getStartColumnForMonacoRange('echo <+expression')
    expect(responseForValidExpression).toBe(8)

    const responseForNoExpression = getStartColumnForMonacoRange('echo')
    expect(responseForNoExpression).toBeUndefined()

    const responseForNestedExpression = getStartColumnForMonacoRange('echo <+expression<+expression2')
    expect(responseForNestedExpression).toBe(20)

    const responseForWithoutInput = getStartColumnForMonacoRange()
    expect(responseForWithoutInput).toBeUndefined()
  })
})
