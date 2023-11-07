/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Segments } from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'

export const buildMockTargetGroupsData = (segments = 3): Segments => ({
  segments: Array(segments)
    .fill({})
    .map((_, index) => ({
      identifier: `targetGroup${index}`,
      name: `Target Group${index}`,
      createdAt: 1615914009436,
      modifiedAt: 1615914009436,
      environment: 'QA',
      excluded: [],
      included: [],
      tags: [],
      rules: [],
      version: 1
    })),
  itemCount: segments,
  pageCount: Math.ceil(segments / CF_DEFAULT_PAGE_SIZE),
  pageIndex: 0,
  pageSize: CF_DEFAULT_PAGE_SIZE
})
