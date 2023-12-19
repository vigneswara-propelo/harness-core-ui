/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Layout,
  Text,
  MultiSelectOption,
  SelectOption,
  useToaster,
  AllowedTypes
} from '@harness/uicore'
import { Color } from '@harness/design-system'

import { connect, FormikContextType } from 'formik'
import { map, get, defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { useListAwsRegions } from 'services/portal'
import { useGetIamRolesForAws } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { Scope } from '@common/interfaces/SecretsInterface'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@platform/connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isFieldFixed } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { TerraformProviderCredential, ConnectorValue, TerraformData } from '../TerraformInterfaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TerraformSelectArnProps {
  pathName: string
  formik?: FormikContextType<TerraformProviderCredential>
  allowableTypes: AllowedTypes
  readonly?: boolean
  renderConnector: boolean
  renderRegion: boolean
  renderRole: boolean
  allValues?: TerraformData
  fieldPath: string
}

const TerraformSelectArn = (props: TerraformSelectArnProps): React.ReactElement => {
  const {
    allowableTypes,
    readonly,
    formik,
    pathName,
    allValues,
    renderConnector,
    renderRegion,
    renderRole,
    fieldPath
  } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const connectorName = `${pathName}.providerCredential.spec.connectorRef`
  const regionName = `${pathName}.providerCredential.spec.region`
  const roleName = `${pathName}.providerCredential.spec.roleArn`

  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  const values = formik?.values
  const roleValue = isFieldFixed(defaultTo(get(values, roleName), '')) ? defaultTo(get(values, roleName), '') : ''
  const [regions, setRegions] = useState<MultiSelectOption[]>([])
  const [awsRoles, setAwsRoles] = useState<MultiSelectOption[]>(defaultTo([{ label: roleValue, value: roleValue }], []))
  const [awsRef, setAwsRef] = useState<string>('')
  const [regionsRef, setRegionsRef] = useState<string>('')
  const { showError } = useToaster()

  const setFieldValue = (name: string, value: string | undefined): void => {
    formik?.setFieldValue(name, value)
  }
  const queryParams = {
    accountIdentifier: accountId,
    orgIdentifier: orgIdentifier,
    projectIdentifier: projectIdentifier,
    awsConnectorRef: defaultTo(get(values, connectorName), get(allValues, `${fieldPath}.connectorRef`)),
    region: defaultTo(get(values, regionName), get(allValues, `${fieldPath}.region`))
  }
  const {
    data: regionData,
    loading: regionLoading,
    error: regionError
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    if (regionData && !regions.length) {
      const regionValues = map(regionData.resource, reg => ({ label: reg.name, value: reg.value }))
      setRegions(regionValues as MultiSelectOption[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionData])

  const {
    data: roleData,
    refetch,
    loading: rolesLoading
  } = useGetIamRolesForAws({
    lazy: true,
    debounce: 500,
    queryParams
  })

  useEffect(() => {
    if (regionError) {
      showError(getRBACErrorMessage(regionError as RBACError))
    }

    /*  eslint-disable-next-line react-hooks/exhaustive-deps  */
  }, [regionError])

  /* istanbul ignore next */
  useEffect(() => {
    if (roleData) {
      const roles = []
      for (const key in roleData.data) {
        roles.push({ label: roleData?.data[key], value: key })
      }
      setAwsRoles(roles)
    }
  }, [roleData])

  const getLoading = (status: boolean): string => {
    return getString(status ? 'common.loading' : 'select')
  }
  return (
    <Layout.Vertical>
      {renderConnector && (
        <Layout.Horizontal className={stepCss.formGroup}>
          <FormMultiTypeConnectorField
            label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
            type={Connectors.AWS}
            name={connectorName}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            style={{ marginBottom: 10 }}
            multiTypeProps={{ expressions, allowableTypes, newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT }}
            disabled={readonly}
            width={300}
            setRefValue
            onChange={(value, _unused, multiType) => {
              const connectorValue = value as ConnectorValue
              const scope = connectorValue?.scope
              let newConnectorRef: string | ConnectorValue
              const connectorId = connectorValue?.record?.identifier
              if (scope === Scope.ORG || scope === Scope.ACCOUNT) {
                newConnectorRef = `${scope}.${connectorId}`
              } else if (isMultiTypeRuntime(multiType) || multiType === MultiTypeInputType.EXPRESSION) {
                newConnectorRef = connectorValue
              } else {
                newConnectorRef = connectorId as string
              }
              if (connectorId !== awsRef) {
                setAwsRef(newConnectorRef as string)
                setAwsRoles([])
                getMultiTypeFromValue(get(values, roleName)) === MultiTypeInputType.FIXED && setFieldValue(roleName, '')
              }
              setFieldValue(connectorName, newConnectorRef as string)
            }}
          />
        </Layout.Horizontal>
      )}
      {renderRegion && (
        <Layout.Horizontal className={stepCss.formGroup}>
          <FormInput.MultiTypeInput
            label={getString('regionLabel')}
            name={regionName}
            disabled={readonly}
            useValue
            multiTypeInputProps={{
              onChange: value => {
                if ((value as SelectOption).value !== regionsRef) {
                  setRegionsRef((value as SelectOption).value as string)
                  setAwsRoles([])
                  getMultiTypeFromValue(get(values, roleName)) === MultiTypeInputType.FIXED &&
                    setFieldValue(roleName, '')
                }
              },
              selectProps: {
                allowCreatingNewItems: false,
                items: regions
              },
              expressions,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
              allowableTypes,
              width: 300
            }}
            selectItems={regions}
            placeholder={getLoading(regionLoading)}
          />
          {getMultiTypeFromValue(get(values, regionName)) === MultiTypeInputType.RUNTIME && (
            <SelectConfigureOptions
              value={defaultTo(get(values, regionName), '')}
              options={regions}
              loading={false}
              type="String"
              variableName={regionName}
              showRequiredField={false}
              showDefaultField={false}
              isReadonly={readonly}
              onChange={value => setFieldValue(regionName, value)}
            />
          )}
        </Layout.Horizontal>
      )}
      {renderRole && (
        <Layout.Horizontal className={stepCss.formGroup}>
          <FormInput.MultiTypeInput
            label={getString('optionalField', {
              name: getString('platform.connectors.awsKms.roleArnLabel')
            })}
            name={roleName}
            placeholder={getLoading(rolesLoading)}
            disabled={readonly || rolesLoading}
            useValue
            multiTypeInputProps={{
              selectProps: {
                addClearBtn: true,
                allowCreatingNewItems: false,
                items: awsRoles
              },
              onSelect: () => refetch(),
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
              width: 300
            }}
            selectItems={awsRoles}
          />
          {getMultiTypeFromValue(get(values, roleName)) === MultiTypeInputType.RUNTIME && (
            <SelectConfigureOptions
              value={defaultTo(get(values, roleName), '')}
              options={awsRoles}
              loading={false}
              type="String"
              variableName={roleName}
              showRequiredField={false}
              showDefaultField={false}
              isReadonly={readonly}
              onChange={value => setFieldValue(roleName, value)}
            />
          )}
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}

export default connect(TerraformSelectArn)
