/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import NewServiceOverrideButton from './NewServiceOverrideButton'

export default function NewButtonWithSearchFilter(): React.ReactElement {
  return (
    <Layout.Horizontal
      border={{ bottom: true }}
      padding={{ bottom: 'medium' }}
      margin={{ right: 'xlarge', left: 'xlarge' }}
    >
      <NewServiceOverrideButton />
    </Layout.Horizontal>
  )
}
