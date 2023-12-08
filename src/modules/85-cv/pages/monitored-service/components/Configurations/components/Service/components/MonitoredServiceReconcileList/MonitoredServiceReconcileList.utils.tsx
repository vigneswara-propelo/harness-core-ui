/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import moment from 'moment'
import { Icon, Layout, Tag, Text, useConfirmationDialog, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Renderer, CellProps } from 'react-table'
import { MonitoredServiceReference, useDetachMonitoredServiceFromTemplate } from 'services/cv'
import DetachIcon from '@cv/assets/Detach.svg'
import { useStrings } from 'framework/strings'
import { TemplateContextInterface } from '@modules/72-templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import { ReconileDrawerProp } from './useReconcileDrawer'
import css from './MonitoredServiceReconcileList.module.scss'

export const RenderMonitoredServiceIdentifier: Renderer<CellProps<MonitoredServiceReference>> = ({ row }) => {
  const { identifier, serviceIdentifier } = row.original

  return (
    <>
      <Text color={Color.PRIMARY_7} title={identifier} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
        {identifier}
      </Text>
      <Text title={serviceIdentifier} font={{ align: 'left', size: 'small' }}>
        {serviceIdentifier}
      </Text>
    </>
  )
}

export const RenderAccount: Renderer<CellProps<MonitoredServiceReference>> = ({ row }) => {
  const { accountIdentifier } = row.original
  return (
    <Text lineClamp={1} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {accountIdentifier}
    </Text>
  )
}

export const RenderLastReconciled: Renderer<CellProps<MonitoredServiceReference>> = ({ row }) => {
  const { lastReconciledTimestamp } = row.original
  return (
    <Text lineClamp={1} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {moment(lastReconciledTimestamp).format('MMM D, YYYY h:mm A')}
    </Text>
  )
}

export const RenderReconciliationStatus: Renderer<CellProps<MonitoredServiceReference>> = ({ row }) => {
  const { getString } = useStrings()
  const { reconciliationStatus } = row.original
  return (
    <Layout.Horizontal spacing="small">
      {reconciliationStatus === 'NO_RECONCILIATION_REQUIRED' && <Icon name="tick-circle" color={Color.GREEN_800} />}
      {reconciliationStatus === 'INPUT_REQUIRED_FOR_RECONCILIATION' && <Icon name="refresh" />}
      {reconciliationStatus === 'NO_INPUT_REQUIRED_FOR_RECONCILIATION' && <Icon name="refresh" />}
      {reconciliationStatus === 'INPUT_REQUIRED_FOR_RECONCILIATION' && (
        <Tag className={css.reconcileTag}>
          {getString('cv.monitoredServices.ReconcileTab.InputRequiredReconcile').toUpperCase()}
        </Tag>
      )}
    </Layout.Horizontal>
  )
}

export const RenderActionButtons: React.FC<
  CellProps<MonitoredServiceReference> & {
    tempcontext: TemplateContextInterface
    openInputsetModal: (data?: ReconileDrawerProp) => void
    templateIdentifier: string
    versionLabel: string
    refetch: () => void
  }
> = ({ row, refetch, tempcontext, openInputsetModal, templateIdentifier, versionLabel }) => {
  const { identifier = '', orgIdentifier = '', accountIdentifier = '', projectIdentifier = '' } = row.original
  const { showError } = useToaster()
  const { getString } = useStrings()
  const [rowToDetach, setRowToDetach] = useState<MonitoredServiceReference>()
  const {
    mutate: detachMonitoredService,
    error: detachError,
    loading: detachLoading
  } = useDetachMonitoredServiceFromTemplate({
    identifier,
    queryParams: {
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openDialog } = useConfirmationDialog({
    titleText: getString('cv.healthSource.detachHealthSource'),
    contentText: getString('cv.healthSource.detachHealthSourceWarning') + `: ${rowToDetach?.identifier}`,
    confirmButtonText: getString('cv.healthSource.detachLabel'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (shouldDelete: boolean) => {
      if (shouldDelete) {
        try {
          await detachMonitoredService()
        } catch (_) {
          showError(getErrorMessage(detachError))
        }
      }
    }
  })

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Layout.Horizontal width="50px" flex={{ justifyContent: 'space-between' }}>
        <Icon
          name="edit"
          className={css.actionButton}
          data-testid="reconcileTemplate"
          onClick={e => {
            e.stopPropagation()
            openInputsetModal({
              refetch,
              identifier,
              versionLabel,
              templateIdentifier,
              templateValue: tempcontext.state.template
            })
          }}
        />
        {detachLoading ? (
          <Icon name={'loading'} />
        ) : (
          <img
            data-testid="detachTemplate"
            src={DetachIcon}
            className={css.actionButton}
            width={14}
            height={14}
            onClick={e => {
              e.stopPropagation()
              setRowToDetach(row.original)
              openDialog()
            }}
          />
        )}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}
