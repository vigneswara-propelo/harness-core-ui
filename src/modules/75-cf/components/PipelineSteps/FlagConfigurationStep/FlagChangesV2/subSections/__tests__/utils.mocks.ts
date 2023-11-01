/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Segment, Target, Variation } from 'services/cf'

export const mockTargets = [
  { identifier: 't1', name: 'Target 1' },
  { identifier: 't2', name: 'Target 2' },
  { identifier: 't3', name: 'Target 3' }
] as Target[]

export const mockTargetGroups = [
  { identifier: 'tg1', name: 'TargetGroup 1' },
  { identifier: 'tg2', name: 'TargetGroup 2' },
  { identifier: 'tg3', name: 'TargetGroup 3' }
] as Segment[]

export const mockVariations = [
  { identifier: 'v1', name: 'Variation 1' },
  { identifier: 'v2' },
  { identifier: 'v3', name: 'Variation 3' }
] as Variation[]
