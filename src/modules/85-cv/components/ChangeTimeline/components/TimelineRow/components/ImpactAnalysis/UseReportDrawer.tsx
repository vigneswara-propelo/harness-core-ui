/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IDrawerProps } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import { useDrawer } from '@modules/85-cv/hooks/useDrawerHook/useDrawerHook'
import ReportDrawer from '@modules/85-cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/ReportDrawer/ReportDrawer'
import { UseDrawerInterface } from '@modules/85-cv/hooks/useDrawerHook/useDrawerHook.types'

export const useReportDrawer = (): { showDrawer: UseDrawerInterface['showDrawer'] } => {
  const drawerOptions = {
    size: '800px',
    onClose: noop
  } as IDrawerProps

  const { showDrawer } = useDrawer({
    createDrawerContent: drawerProps => <ReportDrawer {...drawerProps} />,
    drawerOptions,
    showConfirmationDuringClose: false
  })

  return { showDrawer }
}
