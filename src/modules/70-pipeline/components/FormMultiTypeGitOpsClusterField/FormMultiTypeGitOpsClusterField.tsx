/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { Classes, FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import {
  Container,
  errorCheck,
  FormError,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTypeInputType
} from '@harness/uicore'
import { get, isArray } from 'lodash-es'

import type { EnvironmentGroupResponseDTO, ResponsePageClusterFromGitops } from 'services/cd-ng'
import {
  EntityReferenceResponse,
  getIdentifierFromValue,
  getScopeFromValue,
  ScopedObjectDTO
} from '@common/components/EntityReference/EntityReference'
import {
  Item,
  MultiTypeReferenceInput,
  MultiTypeReferenceInputProps,
  ReferenceSelectProps
} from '@common/components/ReferenceSelect/ReferenceSelect'
import { useStrings } from 'framework/strings'

import {
  ClusterData,
  ClusterItem,
  ClusterOption
} from '@modules/75-cd/components/PipelineSteps/DeployEnvironmentEntityStep/types'
import { ScopeAndIdentifier } from '@modules/10-common/components/MultiSelectEntityReference/MultiSelectEntityReference'

import { DELIMITER, getReferenceFieldProps } from './Utils'
import css from './FormMultiTypeGitOpsClusterField.module.scss'

export interface EntityGroupProps extends Omit<IFormGroupProps, 'label'> {
  name: string
  label: string
  placeholder: string
  multiTypeProps?: Omit<MultiTypeReferenceInputProps<EnvironmentGroupResponseDTO>, 'name' | 'referenceSelectProps'>
  width?: string
  selected?: string | ClusterData[]
  disabled?: boolean
  isMultiSelect?: boolean
  onMultiSelectChange: (val: ClusterOption[] | string) => void
  isNewClusterLabelVisible?: boolean
  accountIdentifier: string
  projectIdentifier: string
  orgIdentifier: string
}

interface GitOpsCluster {
  identifier: string
  agentIdentifier: string
}

function getIdentifierFormatted(identifier: string, agentIdentifier: string): string {
  const val = getIdentifierFromValue(identifier)
  return `${val}${DELIMITER}${agentIdentifier}`
}

function generateInitialValues(selected: ClusterOption[] | string): (string | Item)[] | string {
  if (isArray(selected)) {
    const vals = selected?.map((item: (Item & GitOpsCluster) | ClusterOption) => ({
      label: item.label,
      value: getIdentifierFormatted(item.value as string, item.agentIdentifier as string),
      scope: item.scope || getScopeFromValue(item.value as string)
    }))

    return vals as Item[]
  }
  return selected
}

function generateGitOpsClusterInitialValues(selected: ClusterOption[] | string): (string | Item)[] | string {
  if (isArray(selected)) {
    const vals = selected?.map((item: (Item & GitOpsCluster) | ClusterOption) => ({
      label: item.identifier,
      value: getIdentifierFormatted(item.identifier as string, item.agentIdentifier as string),
      scope: getScopeFromValue(item.identifier as string)
    }))

    return vals as Item[]
  }
  return selected
}

export type ClstrRecord = EntityReferenceResponse<ClusterItem> &
  ScopedObjectDTO & { agentIdentifier?: string; value?: string }

export function FormMultiTypeGitOpsClusterField(props: EntityGroupProps): React.ReactElement {
  const {
    name,
    style,
    multiTypeProps = {},
    disabled,
    width,
    isMultiSelect,
    onMultiSelectChange,
    isNewClusterLabelVisible,
    placeholder,
    ...restProps
  } = props

  const formik = useFormikContext()

  const { getString } = useStrings()
  const { accountIdentifier: accountId, projectIdentifier, orgIdentifier } = props
  const [page, setPage] = useState(0)
  const [clusterPageData, setPagedClusterData] = useState<ResponsePageClusterFromGitops>({})

  const isEnvRunTime = (): boolean => {
    if (
      (get(formik?.values, 'category') === 'multi' &&
        getMultiTypeFromValue(get(formik?.values, 'environments')) === MultiTypeInputType.RUNTIME) ||
      (get(formik?.values, 'category') === 'single' &&
        getMultiTypeFromValue(get(formik?.values, 'environment')) === MultiTypeInputType.RUNTIME)
    ) {
      return true
    }

    return false
  }

  const getValue = (val: string): string | [] => {
    if (getMultiTypeFromValue(val) === MultiTypeInputType.RUNTIME || isEnvRunTime()) {
      return '<+input>'
    } else if (val) {
      return val
    }
    return isMultiSelect ? [] : ''
  }

  const clusters = getValue(get(formik?.values, name))
  const selected =
    name === 'gitOpsClusters' ? generateGitOpsClusterInitialValues(clusters) : generateInitialValues(clusters)
  // console.log(selected, 'sel')
  const [selectedValue, setSelectedValue] = React.useState<(string | Item | ClusterOption)[] | string>(
    selected as (string | Item)[]
  )
  const hasError = errorCheck(name, formik)
  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    label,
    ...rest
  } = restProps

  const getReferenceFieldPropsValues = getReferenceFieldProps({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    name,
    width,
    selected,
    placeholder,
    isMultiSelect,
    setPagedClusterData,
    selectedClusters: Array.isArray(selected) ? selected : [],
    getString
  })

  const handleMultiSelectChange = (clstrOptions: ScopeAndIdentifier[]): void => {
    const filteredClstrOptions = clstrOptions.filter(item => item.identifier)
    const clstrArray: ClusterOption[] = filteredClstrOptions.map((opt: ScopeAndIdentifier) => {
      const { identifier, scope } = opt || {}
      if (!identifier) return {}
      const [clusterId, agentIdentifier] = identifier.split(DELIMITER)
      return {
        value: clusterId,
        clusterRef: clusterId,
        identifier: clusterId,
        agentIdentifier,
        scope
      }
    })

    let selClstrs = []

    selClstrs = [...clstrArray]

    formik.setFieldValue(name, selClstrs)
    setSelectedValue(selClstrs)
    onMultiSelectChange(selClstrs)
  }
  return (
    <div style={style} className={cx(css.environmentGroupLabel)}>
      <Container>
        <HarnessDocTooltip
          tooltipId={'env-cluster-drodpwn'}
          labelText={getString('pipeline.specifyGitOpsClusters')}
          className={Classes.LABEL}
        />
      </Container>
      <FormGroup {...rest} labelFor={name} helperText={helperText} intent={intent}>
        <MultiTypeReferenceInput<ClstrRecord>
          name={name}
          disabled={disabled}
          referenceSelectProps={
            {
              ...getReferenceFieldPropsValues,

              isNewConnectorLabelVisible: isNewClusterLabelVisible,
              placeholderClass: css.placeholderClass,
              disabled: disabled,
              disableCollapse: true,
              width: 300,

              onMultiSelectChange: handleMultiSelectChange,
              isMultiSelect: isMultiSelect,
              pagination: {
                itemCount: clusterPageData?.data?.totalItems || 0,
                pageSize: clusterPageData?.data?.pageSize || 10,
                pageCount: clusterPageData?.data?.totalPages || -1,
                pageIndex: page || 0,
                gotoPage: pageIndex => setPage(pageIndex)
              }
            } as ReferenceSelectProps<ClstrRecord>
          }
          onChange={(val, _valueType) => {
            formik.setFieldValue(name, val)
            onMultiSelectChange(val as string)
            setSelectedValue(val as string)
          }}
          value={Array.isArray(selectedValue) ? '' : selectedValue}
          resetExpressionOnFixedTypeChange
          {...multiTypeProps}
        />
      </FormGroup>
    </div>
  )
}
