/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const EXPRESSION_START_REGEX = /<\+([A-Za-z0-9_.'"()]*?)$/

export function getStartColumnForMonacoRange(prevText?: string): number | undefined {
  if (typeof prevText !== 'string') return undefined
  const startColumnWithTriggerChar = prevText.match(EXPRESSION_START_REGEX)?.index
  if (startColumnWithTriggerChar === undefined) return undefined
  const startColumn = startColumnWithTriggerChar + 2 + 1 // 2 for trigger chars + 1 for monaco as it starts index from 1
  return startColumn
}
