/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Container, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Dialog, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  AutoDiscoveryAsyncResponseDTO,
  AutoDiscoveryResponseDTO,
  useReImportAutoDiscovery,
  useGetReImportStatus
} from 'services/cv'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import ServiceMappingForm from './ServiceMappingForm'
import DiscoveryDetailsCard from './components/DiscoveryDetailsCard/DiscoveryDetailsCard'
import useFunctionPolling from './useFunctionPolling'
import { AutoDiscoveryStatus } from './ServiceMapping.constant'
import css from './ServiceMapping.module.scss'

const ServiceMapping = ({ onImport }: { onImport?: () => void }): JSX.Element => {
  const { getString } = useStrings()
  const POLLING_INTERVAL = 5000
  const MAX_RETRIES = 5
  const [isPolling, setIsPolling] = useState(false)
  const { showError, showSuccess, clear } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [discoveryResource, setDiscoveryResource] = useState<AutoDiscoveryResponseDTO | undefined>()
  const [reImportCorrelationId, setReImportCorrelationId] = useState<string | undefined>()

  const { mutate: reImportAutoDiscovery, error: reImportError } = useReImportAutoDiscovery({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const {
    data: reImportStatusData,
    refetch: fetchReImportStatus,
    error: reImportStatusError
  } = useGetReImportStatus({
    correlationId: reImportCorrelationId || '',
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const onReImportAutoDiscovery = async (): Promise<void> => {
    const { resource } = await reImportAutoDiscovery()
    const { correlationId, status, monitoredServicesCreated, serviceDependenciesImported } =
      resource as AutoDiscoveryAsyncResponseDTO

    if (status === AutoDiscoveryStatus.COMPLETED) {
      setDiscoveryResource({
        monitoredServicesCreated,
        serviceDependenciesImported
      })
      showSuccess(getString('cv.monitoredServices.importServiceMapping.reImportSuccess'))
      onImport?.()
    } else if (correlationId) {
      setReImportCorrelationId(correlationId)
      setIsPolling(true)
      showSuccess(getString('cv.monitoredServices.importServiceMapping.reImportInitiated'))
    }
  }

  useEffect(() => {
    if (reImportStatusData?.resource?.status === AutoDiscoveryStatus.COMPLETED) {
      setDiscoveryResource({
        monitoredServicesCreated: reImportStatusData?.resource?.monitoredServicesCreated,
        serviceDependenciesImported: reImportStatusData?.resource?.serviceDependenciesImported
      })
      showSuccess(getString('cv.monitoredServices.importServiceMapping.reImportSuccess'))
      setIsPolling(false)
      onImport?.()
    }
  }, [reImportStatusData?.resource?.status])

  useFunctionPolling(fetchReImportStatus, {
    maxTries: MAX_RETRIES,
    interval: POLLING_INTERVAL,
    startPolling:
      Boolean(reImportCorrelationId) && reImportStatusData?.resource?.status !== AutoDiscoveryStatus.COMPLETED,
    onCompletePolling: () => {
      setIsPolling(false)
      clear()
      reImportStatusError && showError(getErrorMessage(reImportStatusError))
    }
  })

  if (reImportError) {
    clear()
    showError(getErrorMessage(reImportError))
  }

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog
      isOpen
      usePortal
      enforceFocus={false}
      onClose={hideModal}
      style={{ minWidth: 'max-content' }}
      title={getString('cv.monitoredServices.importServiceMapping.label')}
    >
      <Container margin="large" width={600}>
        <Text>{getString('cv.monitoredServices.importServiceMapping.modal.subtext')}</Text>
        <ServiceMappingForm
          onCancel={hideModal}
          onSubmit={data => {
            hideModal()
            setDiscoveryResource(data)
            onImport?.()
          }}
        />
      </Container>
    </Dialog>
  ))

  return (
    <>
      <Layout.Horizontal spacing="medium">
        <Popover
          position={Position.BOTTOM}
          popoverClassName={css.widgetPopover}
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <Container className={css.containerPopover} width={200}>
              <Text color={Color.WHITE}>{getString('cv.monitoredServices.importServiceMapping.tooltip')}</Text>
            </Container>
          }
        >
          <Text
            icon="import"
            className={css.importButton}
            color={Color.PRIMARY_7}
            font={{ weight: 'semi-bold' }}
            onClick={() => {
              openModal()
              setReImportCorrelationId(undefined)
            }}
            iconProps={{ color: Color.PRIMARY_7, margin: { right: 'small' } }}
            data-testid="importServiceMapping"
          >
            {getString('cv.monitoredServices.importServiceMapping.label')}
          </Text>
        </Popover>

        <Text
          icon={isPolling ? 'spinner' : 'refresh'}
          className={css.importButton}
          color={Color.PRIMARY_7}
          onClick={onReImportAutoDiscovery}
          font={{ weight: 'semi-bold' }}
          iconProps={{ color: Color.PRIMARY_7, margin: { right: 'small' } }}
          data-testid="reImportServiceMapping"
        >
          {getString('common.refresh')}
        </Text>
      </Layout.Horizontal>
      {discoveryResource && (
        <DiscoveryDetailsCard
          data={discoveryResource}
          onClose={() => {
            setDiscoveryResource(undefined)
          }}
        />
      )}
    </>
  )
}

export default ServiceMapping
