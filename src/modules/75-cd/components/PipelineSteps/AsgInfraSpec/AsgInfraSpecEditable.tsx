/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  AllowedTypes,
  SelectOption
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { debounce, defaultTo, noop, get } from 'lodash-es'
import type { FormikProps } from 'formik'

import { useAutoScalingGroups, AsgInfrastructure } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getIconByType } from '@platform/connectors/pages/connectors/utils/ConnectorUtils'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { connectorTypes } from '@pipeline/utils/constants'
import ProvisionerField from '@pipeline/components/Provisioner/ProvisionerField'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { getAsgInfraValidationSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import css from './AsgInfraSpec.module.scss'

export interface AsgInfraSpecEditableProps {
  initialValues: AsgInfrastructure
  onUpdate?: (data: AsgInfrastructure) => void
  readonly?: boolean
  allowableTypes: AllowedTypes
}

export const AsgInfraSpecEditable: React.FC<AsgInfraSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const [asgBaseNames, setAsgBaseNames] = React.useState<SelectOption[]>([])
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [subscribeForm, unSubscribeForm])

  const { data: awsRegionsData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsRegionsData?.resource, []).map(regionAws => ({
      value: regionAws.value,
      label: regionAws.name as string
    }))
  }, [awsRegionsData?.resource])

  const {
    data: awsAutoScalingData,
    refetch,
    loading,
    error
  } = useAutoScalingGroups({
    queryParams: {
      accountIdentifier: accountId,
      region: initialValues?.region,
      awsConnectorRef: initialValues?.connectorRef,
      projectIdentifier,
      orgIdentifier
    }
  })

  React.useEffect(() => {
    setAsgBaseNames(
      defaultTo(awsAutoScalingData?.data, []).map((asgBaseOption: string) => ({
        value: asgBaseOption,
        label: asgBaseOption
      }))
    )
  }, [awsAutoScalingData])

  React.useEffect(() => {
    setAsgBaseNames([])
  }, [error])

  const validationSchema = getAsgInfraValidationSchema(getString)

  const getItems = (isFetching: boolean, items: SelectOption[]): SelectOption[] => {
    if (isFetching) {
      const labelStr = getString('common.loadingFieldOptions', { fieldName: 'Asg Base Names' })
      return [{ label: labelStr, value: labelStr }]
    }
    return defaultTo(items, [])
  }

  return (
    <Layout.Vertical spacing="medium">
      <Formik<AsgInfrastructure>
        formName={'AsgInfraSpecEditable'}
        initialValues={initialValues}
        validate={value => {
          const data: Partial<AsgInfrastructure> = {
            connectorRef: undefined,
            region: value.region === '' ? undefined : value.region,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments,
            provisioner: value?.provisioner || undefined,
            baseAsgName: value?.baseAsgName || undefined
          }
          if (value.connectorRef) {
            data.connectorRef = getConnectorRefValue(value.connectorRef as ConnectorRefFormValueType)
          }
          delayedOnUpdate(data)
        }}
        validationSchema={validationSchema}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          const isBaseNameFixed = getMultiTypeFromValue(get(formik.values, 'baseAsgName')) === MultiTypeInputType.FIXED
          if (get(formik.errors, 'region') && get(formik.values, 'region')) {
            formik.setFieldError('region', undefined)
          }
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <ProvisionerField name="provisioner" isReadonly />
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('common.entityPlaceholderText')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  tooltipProps={{
                    dataTooltipId: 'awsConnector'
                  }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={connectorTypes.Aws}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  onChange={() => {
                    if (isBaseNameFixed) {
                      formik.setFieldValue('baseAsgName', '')
                      setAsgBaseNames([])
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
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
                      if (isBaseNameFixed) {
                        setAsgBaseNames([])
                        formik.setFieldValue('baseAsgName', '')
                      }
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  className={css.inputWidth}
                  name="region"
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    selectProps: {
                      items: regions,
                      popoverClassName: css.regionPopover,
                      allowCreatingNewItems: true
                    },
                    onChange: () => {
                      if (isBaseNameFixed) {
                        setAsgBaseNames([])
                        formik.setFieldValue('baseAsgName', '')
                      }
                    }
                  }}
                  label={getString('regionLabel')}
                  placeholder={getString('pipeline.regionPlaceholder')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values?.region as string}
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
                <FormInput.MultiTypeInput
                  className={css.inputWidth}
                  name="baseAsgName"
                  selectItems={getItems(loading, asgBaseNames)}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    selectProps: {
                      items: asgBaseNames,
                      popoverClassName: css.regionPopover,
                      allowCreatingNewItems: true,
                      loadingItems: loading,
                      noResults: (
                        <Text padding={'small'}>
                          {loading
                            ? getString('common.loadingFieldOptions', { fieldName: 'Base Asg Names' })
                            : get(error, 'data.message', null) || getString('common.filters.noResultsFound')}
                        </Text>
                      )
                    },
                    onClick: () => {
                      refetch({
                        queryParams: {
                          accountIdentifier: accountId,
                          region: formik?.values?.region,
                          awsConnectorRef: get(formik?.values, 'connectorRef.value'),
                          projectIdentifier,
                          orgIdentifier
                        }
                      })
                    }
                  }}
                  label={getString('cd.baseAsgLabel')}
                  placeholder={getString('cd.baseAsgPlaceholder')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.baseAsgName) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values?.baseAsgName as string}
                    type="String"
                    variableName="baseAsgName"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('baseAsgName', value)
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
