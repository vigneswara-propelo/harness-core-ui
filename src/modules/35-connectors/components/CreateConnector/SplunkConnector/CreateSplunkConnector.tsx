/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Button, FormInput, FormikForm, Text, ButtonVariation } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { buildSplunkPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Connectors } from '@connectors/constants'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference.types'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { ConnectorSecretField } from '../CommonCVConnector/components/ConnectorSecretField/ConnectorSecretField'
import { initializeSplunkConnector } from './utils'
import { StepDetailsHeader } from '../CommonCVConnector/components/CredentialsStepHeader/CredentialsStepHeader'
import { getAuthOptions } from './CreateSplunkConnector.constants'
import css from '../AppDynamicsConnector/CreateAppDynamicsConnector.module.scss'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'

function SplunkConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, accountId, projectIdentifier, orgIdentifier, isEditMode } = props
  const { getString } = useStrings()
  const initialValues = initializeSplunkConnector({ prevStepData, accountId, projectIdentifier, orgIdentifier })

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    trackEvent(ConnectorActions.CreateConnectorSubmit, {
      category: Category.CONNECTOR,
      connector_type: Connectors.Splunk
    })
    nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })
  }
  const secretValue = prevStepData?.passwordRef?.referenceString || prevStepData?.spec?.passwordRef

  const { trackEvent } = useTelemetry()

  const authOptions = getAuthOptions(getString)

  useTrackEvent(ConnectorActions.CreateConnectorLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.Splunk
  })

  const scope: ScopedObjectDTO | undefined = isEditMode
    ? {
        orgIdentifier: prevStepData?.orgIdentifier,
        projectIdentifier: prevStepData?.projectIdentifier
      }
    : undefined

  return (
    <Formik
      initialValues={{
        ...initialValues
      }}
      validationSchema={Yup.object().shape({
        url: Yup.string().trim().required(getString('common.validation.urlIsRequired')),
        authType: Yup.string().trim().required(getString('validation.authType')),
        username: Yup.string().when('authType', {
          is: val => val === AuthTypes.USER_PASSWORD,
          then: Yup.string().trim().required(getString('validation.username')),
          otherwise: Yup.string().nullable()
        }),
        passwordRef: Yup.object().when('authType', {
          is: val => val === AuthTypes.USER_PASSWORD,
          then: Yup.object().required(getString('validation.password')),
          otherwise: Yup.object().nullable()
        }),
        tokenRef: Yup.object().when('authType', {
          is: val => val === AuthTypes.BEARER_TOKEN,
          then: Yup.object().required(getString('connectors.jenkins.bearerTokenRequired')),
          otherwise: Yup.object().nullable()
        })
      })}
      onSubmit={handleSubmit}
    >
      {formikProps => (
        <FormikForm className={css.connectionForm}>
          <Layout.Vertical spacing="medium" className={css.appDContainer}>
            <StepDetailsHeader connectorTypeLabel={getString('connectors.splunkLabel')} />
            <FormInput.Text label={getString('UrlLabel')} name="url" />

            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Text
                font={{ variation: FontVariation.H6 }}
                inline
                tooltipProps={{ dataTooltipId: 'jenkinsConnectorAuthentication' }}
              >
                {getString('authentication')}
              </Text>
              <FormInput.Select
                name="authType"
                items={authOptions}
                disabled={false}
                className={commonStyles.authTypeSelectLarge}
              />
            </Layout.Horizontal>

            {formikProps.values.authType === AuthTypes.USER_PASSWORD ? (
              <>
                <FormInput.Text name="username" label={getString('username')} />
                <ConnectorSecretField
                  secretInputProps={{ name: 'passwordRef', label: getString('password') }}
                  secretFieldValue={secretValue}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  onSuccessfulFetch={result => {
                    formikProps.setFieldValue('passwordRef', result)
                  }}
                />
              </>
            ) : (
              <SecretInput name={'tokenRef'} label={getString('connectors.bearerToken')} scope={scope} />
            )}
          </Layout.Vertical>
          <Layout.Horizontal spacing="large">
            <Button
              variation={ButtonVariation.SECONDARY}
              icon="chevron-left"
              onClick={() => props.previousStep?.({ ...props.prevStepData })}
              text={getString('back')}
            />
            <Button
              variation={ButtonVariation.PRIMARY}
              rightIcon="chevron-right"
              type="submit"
              text={getString('connectors.connectAndSave')}
            />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}

export default cvConnectorHOC({
  connectorType: 'Splunk',
  ConnectorCredentialsStep: SplunkConfigStep,
  buildSubmissionPayload: buildSplunkPayload
})
