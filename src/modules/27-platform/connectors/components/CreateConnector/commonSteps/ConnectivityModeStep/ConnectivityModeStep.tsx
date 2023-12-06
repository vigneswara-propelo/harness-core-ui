/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  Text,
  Toggle,
  Card
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation, Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ConnectorRequestBody,
  EntityGitDetails,
  ResponseConnectorResponse
} from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import ConnectivityMode, {
  ConnectivityCardItem,
  ConnectivityModeForm,
  ConnectivityModeType
} from '@common/components/ConnectivityMode/ConnectivityMode'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ConnectorLabels, Connectors } from '@platform/connectors/constants'
import useCreateEditConnector, { BuildPayloadProps } from '@platform/connectors/hooks/useCreateEditConnector'
import { GitConnectionType } from '@platform/connectors/pages/connectors/utils/ConnectorUtils'
import { useConnectorWizard } from '../../../CreateConnectorWizard/ConnectorWizardContext'
import css from './ConnectivityModeStep.module.scss'

interface ConnectivityModeStepData extends BuildPayloadProps {
  connectivityMode: ConnectivityModeType | undefined
}

interface ConnectivityModeStepProps {
  type: ConnectorConfigDTO['type']
  isEditMode: boolean
  setIsEditMode?: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  buildPayload: (data: BuildPayloadProps) => ConnectorRequestBody
  gitDetails?: EntityGitDetails
  disableGitSync?: boolean
  submitOnNextStep?: boolean
  connectivityMode?: ConnectivityModeType
  setConnectivityMode?: (val: ConnectivityModeType) => void
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  hideModal?: () => void
  customHandleCreate?: (payload: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
  customHandleUpdate?: (payload: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
  helpPanelReferenceId?: string
  delegateImage?: string
  platformImage?: string
}

const EnableProxyForConnectorTypes: ConnectorInfoDTO['type'][] = [Connectors.AWS, Connectors.DOCKER, Connectors.GCP]
const EnableProxyForGitConnectorTypes: ConnectorInfoDTO['type'][] = [
  Connectors.GITHUB,
  Connectors.GITLAB,
  Connectors.BITBUCKET,
  Connectors.GIT
]

const ConnectivityModeStep: React.FC<StepProps<ConnectorConfigDTO> & ConnectivityModeStepProps> = props => {
  const {
    prevStepData,
    nextStep,
    connectorInfo,
    buildPayload,
    customHandleUpdate,
    customHandleCreate,
    delegateImage,
    platformImage
  } = props
  const { getString } = useStrings()
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<ProjectPathProps>()

  const { CI_SECURE_TUNNEL } = useFeatureFlags()
  useConnectorWizard({
    helpPanel: props.helpPanelReferenceId ? { referenceId: props.helpPanelReferenceId, contentWidth: 1040 } : undefined
  })
  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = Boolean(
    isGitSyncEnabledForProject &&
      !gitSyncEnabledOnlyForFF &&
      !props.disableGitSync &&
      orgIdentifier &&
      projectIdentifier
  )
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const afterSuccessHandler = (response: ResponseConnectorResponse): void => {
    props.onConnectorCreated?.(response?.data)
    if (prevStepData?.branch) {
      // updating connector branch to handle if new branch was created while commit
      prevStepData.branch = response?.data?.gitDetails?.branch
    }

    if (stepDataRef?.skipDefaultValidation) {
      props.hideModal?.()
    } else {
      nextStep?.({ ...prevStepData, ...stepDataRef } as ConnectorConfigDTO)
      props.setIsEditMode?.(true)
    }
  }

  const { onInitiate, loading } = useCreateEditConnector<ConnectivityModeStepData>({
    accountId,
    isEditMode: props.isEditMode,
    isGitSyncEnabled,
    afterSuccessHandler,
    gitDetails: props.gitDetails
  })

  let stepDataRef: ConnectorConfigDTO | null = null
  const defaultInitialValues = { connectivityMode: undefined }

  const connectorName = (prevStepData as ConnectorConfigDTO)?.name || (connectorInfo as ConnectorInfoDTO)?.name
  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.ConnectivityModeStepLoad, {
    category: Category.CONNECTOR
  })

  const showSecureConnectForGitConnectors =
    EnableProxyForGitConnectorTypes.includes(props?.type) && prevStepData?.connectionType === GitConnectionType.HTTP

  return (
    <>
      {!isGitSyncEnabled && loading ? (
        <PageSpinner
          message={
            props.isEditMode
              ? getString('platform.connectors.updating', { name: connectorName })
              : getString('platform.connectors.creating', { name: connectorName })
          }
        />
      ) : null}
      <Layout.Vertical>
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Formik<ConnectivityModeForm>
          initialValues={{
            ...defaultInitialValues,
            ...prevStepData
          }}
          validationSchema={Yup.object().shape({
            connectivityMode: Yup.string().required(getString('platform.connectors.connectivityMode.validation'))
          })}
          onSubmit={stepData => {
            trackEvent(ConnectorActions.ConnectivityModeStepSubmit, {
              category: Category.CONNECTOR
            })
            if (props.submitOnNextStep || stepData.connectivityMode === ConnectivityModeType.Delegate) {
              nextStep?.({ ...prevStepData, ...stepData, projectIdentifier, orgIdentifier })
              return
            }

            const connectorData = {
              ...prevStepData,
              ...stepData,
              projectIdentifier: projectIdentifier,
              orgIdentifier: orgIdentifier
            }

            stepDataRef = stepData
            modalErrorHandler?.hide()
            onInitiate({
              connectorFormData: connectorData,
              buildPayload,
              customHandleCreate,
              customHandleUpdate
            })
          }}
          formName={`connectivityModeForm${props.type}`}
          enableReinitialize
        >
          {formik => {
            return (
              <FormikForm>
                <Layout.Vertical className={css.formCss} spacing={'medium'}>
                  <Text
                    font={{ variation: FontVariation.H3 }}
                    color={Color.BLACK}
                    tooltipProps={{ dataTooltipId: 'ConnectivityModeTitle' }}
                  >
                    {getString('platform.connectors.connectivityMode.connectToProvider')}
                  </Text>
                  <Text color={Color.BLACK}>{getString('platform.connectors.connectivityMode.selectText')}</Text>
                  <ConnectivityMode
                    formik={formik}
                    className={css.cardClass}
                    onChange={(val: ConnectivityCardItem) => {
                      props.setConnectivityMode?.(val.type)
                    }}
                    connectorLabel={ConnectorLabels[props.type as ConnectorInfoDTO['type']]}
                    delegateImage={delegateImage}
                    platformImage={platformImage}
                    delegateType={prevStepData?.delegateType}
                  />
                  {(showSecureConnectForGitConnectors || EnableProxyForConnectorTypes.includes(props?.type)) &&
                  formik.values.connectivityMode === ConnectivityModeType.Manager &&
                  CI_SECURE_TUNNEL ? (
                    <Card>
                      <Layout.Horizontal padding={{ top: 'medium', left: 'medium' }}>
                        <Toggle
                          disabled={false}
                          onChange={() => {
                            formik.setFieldValue('proxy', !formik.values.proxy)
                          }}
                          className={css.toggle}
                          checked={formik.values.proxy}
                        />
                        <Text
                          font={{ variation: FontVariation.CARD_TITLE }}
                          color={Color.BLACK}
                          padding={{ left: 'small' }}
                        >
                          {getString('platform.connectors.connectivityMode.enableProxy')}
                        </Text>
                      </Layout.Horizontal>
                      <Text padding={{ top: 'medium', bottom: 'medium', left: 'medium' }}>
                        {getString('platform.connectors.connectivityMode.proxyDescription')}
                      </Text>
                    </Card>
                  ) : null}
                </Layout.Vertical>
                <Layout.Horizontal padding={{ top: 'medium' }} margin={{ top: 'xxxlarge' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="awsBackButton"
                    variation={ButtonVariation.SECONDARY}
                  />
                  <Button
                    type="submit"
                    intent={'primary'}
                    text={getString(
                      formik.values.connectivityMode === ConnectivityModeType.Delegate ? 'continue' : 'saveAndContinue'
                    )}
                    disabled={loading}
                    rightIcon="chevron-right"
                    data-testid="connectivitySaveAndContinue"
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </>
  )
}

export default ConnectivityModeStep
