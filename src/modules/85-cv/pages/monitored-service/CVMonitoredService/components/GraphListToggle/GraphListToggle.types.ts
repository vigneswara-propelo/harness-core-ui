/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { IconName, Views } from '@harness/uicore'
import { UseStringsReturn } from 'framework/strings'

export interface GetViewLabelAndIconProps {
  view: Views
  getString: UseStringsReturn['getString']
}

export interface GetViewLabelAndIconReturn {
  icon: IconName
  label: string
}
