/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import { IDrawerProps } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import { useDrawer } from '@modules/85-cv/hooks/useDrawerHook/useDrawerHook'
import { NGTemplateInfoConfig } from 'services/template-ng'
import ReconcileMonitoredServiceFormInTemplate from './ReconcileMonitoredServiceFormInTemplate'

export interface ReconileDrawerProp {
  identifier: string
  templateIdentifier: string
  versionLabel: string
  templateValue: NGTemplateInfoConfig
  refetch: () => void
}

export interface UseReconcileDrawerHook {
  openInputsetModal: (data?: ReconileDrawerProp) => void
  closeInputsetModal: () => void
}

const useReconcileDrawer = (): UseReconcileDrawerHook => {
  const drawerOptions = {
    size: '600px',
    onClose: noop
  } as IDrawerProps

  const { showDrawer, hideDrawer } = useDrawer({
    drawerOptions,
    createDrawerContent: ({ identifier, templateValue, refetch }: ReconileDrawerProp) => {
      return (
        <Container margin="medium">
          <ReconcileMonitoredServiceFormInTemplate
            templateValue={templateValue}
            monitoredServiceIdentifier={identifier}
            closeDrawer={() => {
              hideDrawer()
              refetch()
            }}
          />
        </Container>
      )
    }
  })

  return {
    openInputsetModal: showDrawer,
    closeInputsetModal: hideDrawer
  }
}

export default useReconcileDrawer
