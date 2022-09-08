/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'

export const NewFreezeWindowButton = () => {
  const { getString } = useStrings()
  return (
    <Button
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      text={getString('freezeWindows.freezeWindowsPage.newFreezeWindow')}
      onClick={noop}
      // disabled={!canEdit || !templatesEnabled}
      // tooltip={tooltipBtn()}
    />
  )
}
