/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { debounce, noop } from 'lodash-es'
import {
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  AllowedTypes
} from '@harness/uicore'

import type { ExecutionElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { getIconByType } from '@platform/connectors/pages/connectors/utils/ConnectorUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ServerlessInfraTypes } from '@pipeline/utils/stageHelpers'
import ProvisionerField from '@pipeline/components/Provisioner/ProvisionerField'
import { connectorTypes } from '@pipeline/utils/constants'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { getServerlessAwsLambdaValidationSchema } from '../PipelineStepsUtil'
import css from './ServerlessInfraSpec.module.scss'

export interface ServerlessAwsLambaInfraSpecEditableProps {
  initialValues: ServerlessInfraTypes
  onUpdate?: (data: any) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ServerlessInfraTypes
  allowableTypes: AllowedTypes
  provisioner?: ExecutionElementConfig['steps']
  isSingleEnv?: boolean
}

export const ServerlessAwsLambaInfraSpecEditable: React.FC<ServerlessAwsLambaInfraSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  isSingleEnv
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [subscribeForm, unSubscribeForm])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<ServerlessInfraTypes>
        formName={'serverlessAWSInfra'}
        initialValues={initialValues}
        validate={value => {
          const data: Partial<ServerlessInfraTypes> = {
            connectorRef: undefined,
            region: value.region === '' ? undefined : value.region,
            stage: value.stage === '' ? undefined : value.stage,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments,
            provisioner: value?.provisioner || undefined
          }

          if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || value.connectorRef
          }

          delayedOnUpdate(data)
        }}
        validationSchema={getServerlessAwsLambdaValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          return (
            <FormikForm>
              {isSingleEnv ? (
                <Layout.Horizontal className={css.formRow} spacing="medium">
                  <ProvisionerField name="provisioner" isReadonly />
                </Layout.Horizontal>
              ) : null}
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('common.entityPlaceholderText')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  tooltipProps={{
                    dataTooltipId: 'awsInfraConnector'
                  }}
                  multiTypeProps={{
                    expressions,
                    allowableTypes,
                    newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                  }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={connectorTypes.Aws}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConnectorConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType(connectorTypes.Aws)}></Icon>
                        <Text>{getString('pipelineSteps.awsConnectorLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                    connectorReferenceFieldProps={{
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      type: connectorTypes.Aws,
                      label: getString('connector'),
                      disabled: readonly,
                      gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
                    }}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTextInput
                  name="region"
                  tooltipProps={{
                    dataTooltipId: 'awsRegion'
                  }}
                  className={css.inputWidth}
                  disabled={readonly}
                  placeholder={getString('cd.steps.serverless.regionPlaceholder')}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes,
                    newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                  }}
                  label={getString('regionLabel')}
                />
                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.region}
                    type="String"
                    variableName="region"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('region', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTextInput
                  name="stage"
                  tooltipProps={{
                    dataTooltipId: 'awsStage'
                  }}
                  className={css.inputWidth}
                  label={getString('common.stage')}
                  placeholder={getString('cd.steps.serverless.stagePlaceholder')}
                  multiTextInputProps={{
                    expressions,
                    textProps: { disabled: readonly },
                    allowableTypes,
                    newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                  }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.stage) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.stage as string}
                    type="String"
                    variableName="stage"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('stage', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal
                spacing="medium"
                style={{ alignItems: 'center' }}
                margin={{ top: 'medium' }}
                className={css.lastRow}
              >
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  tooltipProps={{
                    dataTooltipId: 'k8InfraAllowSimultaneousDeployments'
                  }}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
