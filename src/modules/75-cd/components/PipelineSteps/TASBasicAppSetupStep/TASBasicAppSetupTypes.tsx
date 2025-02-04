/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepElementConfig } from 'services/cd-ng'

export enum InstancesType {
  FromManifest = 'FromManifest',
  MatchRunningInstances = 'MatchRunningInstances'
}

export enum ResizeStrategyType {
  UpScaleNewFirst = 'UpScaleNewFirst',
  DownScaleOldFirst = 'DownScaleOldFirst'
}

export type TASBasicAppSetupTemplate<T> = StepElementConfig & {
  spec: T
}

export enum ExistingVersionToKeep {
  MIN_NEW = 0,
  MIN_OLD = 1
}
