/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ResourceType } from '@common/interfaces/GitSyncInterface'
import { getDisableFields } from '../MigrateUtils'

describe('Migrate Utils', () => {
  test('Git fields should be disabled for input sets', () => {
    expect(getDisableFields(ResourceType.INPUT_SETS)).toEqual({
      branch: true,
      provider: true,
      connectorRef: true,
      repoName: true
    })
  })

  test('Git fields should not be disabled for pipeline', () => {
    expect(getDisableFields(ResourceType.PIPELINES)).toEqual(undefined)
  })
})
