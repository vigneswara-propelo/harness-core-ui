/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { isEmpty, isNil } from 'lodash-es'

import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Container,
  Formik,
  FormikForm,
  Layout,
  MultiTypeInputType,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type {
  ApplicationSettingsConfiguration,
  ConfigFileWrapper,
  ConnectionStringsConfiguration,
  ManifestConfigWrapper
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { RequiredField } from '@common/interfaces/RouteInterfaces'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import {
  ApplicationSettingsOverrideDetails,
  ConfigFileOverrideDetails,
  ConnectionStringsOverrideDetails,
  ManifestOverrideDetails,
  OverrideDetails,
  OverrideTypes,
  PartiallyRequired,
  ServiceOverrideRowFormState,
  ServiceOverrideRowProps,
  VariableOverrideDetails,
  validateServiceOverrideRow
} from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import { serviceOverridesConfig } from '@cd/components/ServiceOverrides/ServiceOverridesConfig'
import type {
  OverrideManifestStoresTypes,
  OverrideManifestTypes
} from '@cd/components/EnvironmentsV2/EnvironmentDetails/ServiceOverrides/ServiceManifestOverride/ServiceManifestOverrideUtils'

import RowItemFromValue from './RowItemFromValue/RowItemFromValue'
import { VariableOverrideEditable } from './VariableOverrideEditable'
import RowActionButtons from './RowActionButtons'
import ManifestOverrideInfo from '../ViewOnly/ManifestOverrideInfo'
import ConfigFileOverrideInfo from '../ViewOnly/ConfigFileOverrideInfo'
import ApplicationSettingOverrideInfo from '../ViewOnly/ApplicationSettingOverrideInfo'
import ConnectionStringOverrideInfo from '../ViewOnly/ConnectionStringOverrideInfo'
import useServiceManifestOverride from './useManifestOverride'
import useConfigFileOverride from './useConfigFileOverride'
import useApplicationSettingOverride from './useApplicationSettingOverride'
import useConnectionStringOverride from './useConnectionStringOverride'

import css from '../ListRows.module.scss'

export default function EditableRow({
  rowIndex,
  overrideDetails,
  isNew,
  isEdit,
  isClone
}: PartiallyRequired<ServiceOverrideRowProps, 'rowIndex' | 'isEdit' | 'isClone'>): React.ReactElement {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()

  const { onAdd, onUpdate, serviceOverrideType } = useServiceOverridesContext()

  const { overrideType, environmentRef, infraIdentifier, serviceRef } = overrideDetails || ({} as OverrideDetails)

  const handleSubmit = (values: ServiceOverrideRowFormState): void => {
    const validationArray = validateServiceOverrideRow(values, serviceOverrideType)

    if (validationArray.length) {
      clear()
      showError(
        <Layout.Vertical>
          <Text color={Color.WHITE}>{getString('common.serviceOverrides.fillValuesBeforeSubmit')} -</Text>
          {validationArray.map(validationStringKey => {
            return (
              <Text key={validationStringKey} color={Color.WHITE} padding={{ top: 'xsmall', bottom: 'xsmall' }}>
                &#8226; {getString(validationStringKey)}{' '}
              </Text>
            )
          })}
        </Layout.Vertical>
      )
    } else {
      isNew || isClone
        ? onAdd?.(values)
        : onUpdate?.(rowIndex, values as RequiredField<ServiceOverrideRowFormState, 'environmentRef'>)
    }
  }

  const getInitialValues = (): ServiceOverrideRowFormState => {
    if (isNil(overrideDetails)) {
      return {}
    }
    const variableValue = (overrideDetails as VariableOverrideDetails).variableValue
    const manifestValue = (overrideDetails as ManifestOverrideDetails).manifestValue
    const configFileValue = (overrideDetails as ConfigFileOverrideDetails).configFileValue
    const applicationSettingsValue = (overrideDetails as ApplicationSettingsOverrideDetails).applicationSettingsValue
    const connectionStringsValue = (overrideDetails as ConnectionStringsOverrideDetails).connectionStringsValue

    return {
      environmentRef,
      infraIdentifier,
      serviceRef,
      overrideType,
      ...(!isNil(variableValue) && { variables: [{ ...variableValue }] }),
      ...(!isNil(manifestValue) && { manifests: [{ ...manifestValue }] }),
      ...(!isNil(configFileValue) && { configFiles: [{ ...configFileValue }] }),
      ...(!isNil(applicationSettingsValue) && { applicationSettings: { ...applicationSettingsValue } }),
      ...(!isNil(connectionStringsValue) && { connectionStrings: { ...connectionStringsValue } })
    }
  }

  return (
    <Formik<ServiceOverrideRowFormState>
      formName="editableServiceOverride"
      initialValues={getInitialValues()}
      onSubmit={handleSubmit}
    >
      <FormikForm>
        <EditableRowInternal overrideDetails={overrideDetails} isEdit={isEdit} isClone={isClone} />
      </FormikForm>
    </Formik>
  )
}

function EditableRowInternal({
  overrideDetails,
  isEdit,
  isClone
}: {
  isEdit: boolean
  isClone: boolean
  overrideDetails?: OverrideDetails
}): React.ReactElement {
  const { values, setFieldValue, submitForm } = useFormikContext<ServiceOverrideRowFormState>()

  const { serviceOverrideType } = useServiceOverridesContext()
  const rowConfigs = serviceOverridesConfig[serviceOverrideType]

  const handleOverrideSubmit = useCallback(
    (
      overrideObj:
        | ManifestConfigWrapper
        | ConfigFileWrapper
        | ApplicationSettingsConfiguration
        | ConnectionStringsConfiguration,
      type: string
    ): void => {
      switch (type) {
        case 'applicationSettings':
        case 'connectionStrings':
          setFieldValue(type, overrideObj)
          break
        default:
          setFieldValue(`${type}.0`, overrideObj)
      }
      setTimeout(() => {
        submitForm()
      }, 150)
    },
    []
  )

  const allowableTypes: AllowedTypes =
    serviceOverrideType === 'ENV_GLOBAL_OVERRIDE' || serviceOverrideType === 'ENV_SERVICE_OVERRIDE'
      ? [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
      : [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]

  const { editManifestOverride } = useServiceManifestOverride({
    manifestOverrides: isEdit ? [(overrideDetails as ManifestOverrideDetails).manifestValue] : [],
    isReadonly: false,
    handleManifestOverrideSubmit: manifestObj => handleOverrideSubmit(manifestObj, 'manifests'),
    fromEnvConfigPage: true,
    expressions: [],
    allowableTypes
  })

  const { editFileOverride } = useConfigFileOverride({
    fileOverrides: isEdit ? [(overrideDetails as ConfigFileOverrideDetails).configFileValue] : [],
    isReadonly: false,
    fromEnvConfigPage: true,
    handleConfigFileOverrideSubmit: filesObj => handleOverrideSubmit(filesObj, 'configFiles'),
    expressions: [],
    allowableTypes
  })

  const { editApplicationConfig } = useApplicationSettingOverride({
    applicationSettings: isEdit
      ? (overrideDetails as ApplicationSettingsOverrideDetails).applicationSettingsValue
      : undefined,
    isReadonly: false,
    allowableTypes,
    handleSubmitConfig: config => handleOverrideSubmit(config, 'applicationSettings')
  })

  const { editConnectionString } = useConnectionStringOverride({
    connectionStrings: isEdit
      ? (overrideDetails as ConnectionStringsOverrideDetails).connectionStringsValue
      : undefined,
    isReadonly: false,
    allowableTypes,
    handleSubmitConfig: config => handleOverrideSubmit(config, 'connectionStrings')
  })

  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
      padding={{ top: 'small', bottom: 'small' }}
      className={css.editableRow}
    >
      {rowConfigs.map(rowConfig => {
        if (rowConfig.accessKey) {
          return (
            <Container width={rowConfig.rowWidth} key={rowConfig.value} margin={{ right: 'small' }}>
              <RowItemFromValue value={rowConfig.value} isEdit={isEdit} isClone={isClone} />
            </Container>
          )
        } else {
          const overrideTypeValue = values.overrideType
          const manifestValue = (overrideDetails as ManifestOverrideDetails)?.manifestValue
          const configFileValue = (overrideDetails as ConfigFileOverrideDetails)?.configFileValue
          const applicationSettingsValue = (overrideDetails as ApplicationSettingsOverrideDetails)
            ?.applicationSettingsValue
          const connectionStringsValue = (overrideDetails as ConnectionStringsOverrideDetails)?.connectionStringsValue

          return (
            <Layout.Horizontal
              key={rowConfig.value}
              flex={{ justifyContent: 'space-between' }}
              className={css.flexGrow}
            >
              <Layout.Horizontal
                padding={{ left: 'medium', right: 'small' }}
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                className={css.flexWrap}
              >
                {overrideTypeValue === OverrideTypes.VARIABLE && <VariableOverrideEditable />}
                {overrideTypeValue === OverrideTypes.MANIFEST && isEdit && !isEmpty(manifestValue) && (
                  <ManifestOverrideInfo {...manifestValue} />
                )}
                {overrideTypeValue === OverrideTypes.CONFIG && isEdit && !isEmpty(configFileValue) && (
                  <ConfigFileOverrideInfo {...configFileValue} />
                )}
                {overrideTypeValue === OverrideTypes.APPLICATIONSETTING &&
                  isEdit &&
                  !isEmpty(applicationSettingsValue) && (
                    <ApplicationSettingOverrideInfo {...applicationSettingsValue} />
                  )}
                {overrideTypeValue === OverrideTypes.CONNECTIONSTRING && isEdit && !isEmpty(connectionStringsValue) && (
                  <ConnectionStringOverrideInfo {...connectionStringsValue} />
                )}
                {overrideDetails && overrideTypeValue && overrideTypeValue !== OverrideTypes.VARIABLE && (
                  <Button
                    icon="Edit"
                    variation={ButtonVariation.ICON}
                    font={{ variation: FontVariation.BODY1 }}
                    onClick={() => {
                      if (overrideTypeValue === OverrideTypes.MANIFEST) {
                        editManifestOverride(
                          (overrideDetails as ManifestOverrideDetails).manifestValue.manifest
                            ?.type as OverrideManifestTypes,
                          (overrideDetails as ManifestOverrideDetails).manifestValue.manifest?.spec?.store
                            ?.type as OverrideManifestStoresTypes
                        )
                      } else if (overrideTypeValue === OverrideTypes.CONFIG) {
                        editFileOverride()
                      } else if (overrideTypeValue === OverrideTypes.APPLICATIONSETTING) {
                        editApplicationConfig()
                      } else if (overrideTypeValue === OverrideTypes.CONNECTIONSTRING) {
                        editConnectionString()
                      }
                    }}
                  />
                )}
              </Layout.Horizontal>
              <RowActionButtons />
            </Layout.Horizontal>
          )
        }
      })}
    </Layout.Horizontal>
  )
}
