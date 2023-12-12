/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { defaultTo, get, isBoolean, isEqual, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Spinner } from '@blueprintjs/core'
import { v4 as uuid } from 'uuid'

import {
  AllowedTypes,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { useDeepCompareEffect } from '@common/hooks'
import { SELECT_ALL_OPTION } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDownUtils'
import { isValueRuntimeInput } from '@common/utils/utils'

import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getScopeAppendedToIdentifier } from '@modules/10-common/utils/StringUtils'

import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import { useGetClustersData } from '../DeployEnvironmentEntityStep/DeployCluster/useGetClustersData'
import type { ClusterOption, DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
import type { DeployClusterEntityCustomInputStepProps } from './types'
import GitOpsCluster from '../../EnvironmentsV2/EnvironmentDetails/GitOpsCluster/GitOpsCluster'
import { getSelectedClustersFromOptions } from '../DeployEnvironmentEntityStep/DeployCluster/DeployCluster'

import css from './DeployClusterEntityStep.module.scss'

export interface DeployClusterEntityInputStepProps extends Required<DeployClusterEntityCustomInputStepProps> {
  initialValues: DeployEnvironmentEntityConfig['environment']
  readonly: boolean
  allowableTypes: AllowedTypes
  stepViewType: StepViewType
  inputSetData?: {
    template?: DeployEnvironmentEntityConfig['environment']
    path?: string
    readonly?: boolean
  }
  scopePrefix?: string
}

export default function DeployClusterEntityInputStep({
  initialValues,
  allowableTypes,
  inputSetData,
  environmentIdentifier,
  isMultipleCluster,
  deployToAllClusters,
  showEnvironmentsSelectionInputField,
  scopePrefix
}: DeployClusterEntityInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()
  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)

  const pathForDeployToAll = 'deployToAll'

  const isStageTemplateInputSetForm = inputSetData?.path?.startsWith(TEMPLATE_INPUT_PATH)

  const clusterValue = get(initialValues, `gitOpsClusters.[0].identifier`)
  const clusterValues = get(initialValues, 'gitOpsClusters')

  const getClusterIdentifiers = useCallback(() => {
    if (!isMultipleCluster && clusterValue) {
      return [clusterValue]
    }

    if (isMultipleCluster && Array.isArray(clusterValues)) {
      return clusterValues.map(val => val.identifier)
    }

    return []
  }, [isMultipleCluster, clusterValue, clusterValues])

  const [clusterIdentifiers, setClusterIdentifiers] = useState<string[]>(getClusterIdentifiers())

  const { clustersList, loadingClustersList } = useGetClustersData({
    environmentIdentifier: defaultTo(scopePrefix, '') + environmentIdentifier
  })

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (clustersList.length) {
      return clustersList.map(clusterInList => ({
        label: clusterInList.name,
        value: clusterInList.clusterRef
      }))
    }
    return []
  }, [clustersList])

  const loading = loadingClustersList

  useDeepCompareEffect(() => {
    if (!clustersList.length) {
      return
    }

    // if this is a multi clusters, then set up a dummy field,
    // so that clusters can be updated in this dummy field
    if (isMultipleCluster) {
      if (
        isValueRuntimeInput(get(formik.values, 'gitOpsClusters') as SelectOption[]) &&
        !showEnvironmentsSelectionInputField
      ) {
        formik.setFieldValue(uniquePath.current, RUNTIME_INPUT_VALUE)
      } else {
        const isDeployToAll = get(formik.values, pathForDeployToAll)

        formik.setFieldValue(
          uniquePath.current,
          isDeployToAll
            ? [SELECT_ALL_OPTION]
            : clusterIdentifiers.map(clusterId => ({
                label: defaultTo(
                  clustersList.find(clusterInList => clusterInList.clusterRef === clusterId)?.name,
                  clusterId
                ),
                value: clusterId
              }))
        )
      }
    }

    // update identifiers in state when deployToAll is true. This sets the clustersData
    if (deployToAllClusters === true) {
      const newIdentifiers = clustersList.map(clusterInList => clusterInList.clusterRef)
      if (!isEqual(newIdentifiers, clusterIdentifiers)) {
        setClusterIdentifiers(newIdentifiers)
      }
    }
  }, [clustersList])

  const onClusterRefChange = (value: SelectOption): void => {
    if (
      isStageTemplateInputSetForm &&
      getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME &&
      inputSetData?.path
    ) {
      return
    }
    setClusterIdentifiers(getClusterIdentifiers())
  }

  function handleClustersChange(values: ClusterOption[]): void {
    if (isValueRuntimeInput(values as SelectOption[])) {
      setClusterIdentifiers([])

      const newFormikValues = { ...formik.values }
      set(newFormikValues, 'gitOpsClusters', RUNTIME_INPUT_VALUE)

      if (!isBoolean(deployToAllClusters)) {
        set(newFormikValues, pathForDeployToAll, RUNTIME_INPUT_VALUE)
      }

      formik.setValues(newFormikValues)
    } else {
      const filterValues = values.filter(val => val.identifier)
      const newValues = filterValues.map(val => ({
        identifier: getScopeAppendedToIdentifier(val.identifier as string, val.scope as string),
        agentIdentifier: val.agentIdentifier as string
      }))

      const newFormikValues = { ...formik.values }

      set(newFormikValues, `gitOpsClusters`, newValues)
      if (!isBoolean(deployToAllClusters)) {
        set(newFormikValues, pathForDeployToAll, false)
      }

      setClusterIdentifiers(getClusterIdentifiers())
      formik.setValues(newFormikValues)
    }
  }

  const fieldLabel = defaultTo(get(formik.values, 'gitOpsClusters'), []).length
    ? `${getString('common.clusters')}: (${defaultTo(get(formik.values, 'gitOpsClusters'), []).length})`
    : getString('common.allClusters')

  const selectedClusterData = getSelectedClustersFromOptions(
    (formik?.values as DeployEnvironmentEntityConfig)?.gitOpsClusters
  )
  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        {!isMultipleCluster && (
          <ExperimentalInput
            tooltipProps={{ dataTooltipId: 'specifyGitOpsClusters' }}
            label={getString('pipeline.specifyGitOpsClusters')}
            name={'gitOpsClusters[0].identifier'}
            placeholder={getString('pipeline.specifyGitOpsClusters')}
            selectItems={selectOptions}
            useValue
            multiTypeInputProps={{
              allowableTypes: allowableTypes,
              selectProps: {
                addClearBtn: !inputSetData?.readonly,
                items: selectOptions
              },
              onChange: onClusterRefChange
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
            formik={formik}
          />
        )}

        {isMultipleCluster ? (
          <GitOpsCluster
            envRef={environmentIdentifier}
            showLinkedClusters={false}
            allowMultiple={isMultipleCluster}
            label={fieldLabel}
            headerText={getString('pipeline.specifyGitOpsClusters')}
            hideConfigOptions={allowableTypes.length ? false : true}
            onSubmit={(values: ClusterOption[]) => {
              handleClustersChange(values)
            }}
            allowableTypes={
              (allowableTypes as MultiTypeInputType[])?.filter(
                item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
              ) as AllowedTypes
            }
            name={isMultipleCluster ? `gitOpsClusters` : 'clusters'}
            selectedData={selectedClusterData}
            disabled={inputSetData?.readonly || loading}
          />
        ) : null}
        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
    </>
  )
}
