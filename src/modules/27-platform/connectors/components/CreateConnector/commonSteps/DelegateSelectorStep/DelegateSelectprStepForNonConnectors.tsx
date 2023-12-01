/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getErrorInfoFromErrorObject, ModalErrorHandler, ModalErrorHandlerBinding, StepProps } from '@harness/uicore'
import React, { useState } from 'react'
import type { ConnectorConfigDTO, ResponseNgSmtpDTO } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import type { ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import DelegateSelectorStep, { DelegateSelectorProps, DelegateSelectorStepData } from './DelegateSelectorStep'

export type BuildPayLoadDelegateSelectorStepPropForNonConnectorType = (
  data: ConnectorConfigDTO
) => undefined | ConnectorConfigDTO

export type CustomHandlerDelegateSelectorProp = (payload?: ConnectorConfigDTO) => Promise<ResponseNgSmtpDTO>

export type DelegateSelectorSourceForNonConnectorsType = { delegateSelectors: string[] }
interface DelegateSelectorStepForNonConnectorsProps {
  dialogTitle: string
  buildPayloadForNonConnectors: BuildPayLoadDelegateSelectorStepPropForNonConnectorType

  customHandleCreateForNonConnectors?: CustomHandlerDelegateSelectorProp
  customHandleUpdateForNonConnectors?: CustomHandlerDelegateSelectorProp
  delegateSelectorSourceForNonConnectors?: DelegateSelectorSourceForNonConnectorsType
}

const DelegateSelectorStepForNonConnectors: React.FC<
  StepProps<ConnectorConfigDTO> & DelegateSelectorProps & DelegateSelectorStepForNonConnectorsProps
> = props => {
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const onErrorHandler = (error: ResponseMessage) => {
    modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(error))
  }
  const afterSuccessHandler = (response: ResponseNgSmtpDTO) => {
    if (response.status === 'SUCCESS') {
      props.nextStep?.(response.data)
    } else {
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(response))
    }
  }
  const onSubmitForNonConnectors = (nonConnectorData: DelegateSelectorStepData) => {
    try {
      const payload = props.buildPayloadForNonConnectors(nonConnectorData)
      const connectorCustomCreateOrUpdate = props.isEditMode
        ? props.customHandleUpdateForNonConnectors?.(payload)
        : props.customHandleCreateForNonConnectors?.(payload)

      if (connectorCustomCreateOrUpdate) {
        connectorCustomCreateOrUpdate
          ?.then(val => {
            afterSuccessHandler(val as ResponseNgSmtpDTO)
          })
          .catch((error: ResponseMessage) => {
            onErrorHandler(error)
          })
      } else {
        // Go to next step when "customHandle" methods are not provided.
        props.nextStep?.()
      }
    } catch (e) {
      modalErrorHandler?.showDanger(getString('platform.connectors.delegate.errorWhileSelectingDelegates'), e)
    }
  }

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <DelegateSelectorStep
        isNonConnector
        {...props}
        onSubmitForNonConnectors={onSubmitForNonConnectors}
        delegateSelectorSourceForNonConnectors={props.delegateSelectorSourceForNonConnectors}
      />
    </>
  )
}

export default DelegateSelectorStepForNonConnectors
