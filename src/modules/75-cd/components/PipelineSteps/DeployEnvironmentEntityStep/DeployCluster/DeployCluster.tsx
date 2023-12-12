/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { isEmpty, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'
import { v4 as uuid } from 'uuid'

import {
  AllowedTypes,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text
} from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { isValueRuntimeInput } from '@common/utils/utils'
import { useStrings } from 'framework/strings'
import GitOpsCluster from '@modules/75-cd/components/EnvironmentsV2/EnvironmentDetails/GitOpsCluster/GitOpsCluster'

import ClusterEntitiesList from '../ClusterEntitiesList/ClusterEntitiesList'
import type { ClusterItem, ClusterOption, DeployEnvironmentEntityFormState } from '../types'

interface DeployClusterProps {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  environmentIdentifier: string
  isMultiCluster?: boolean
  lazyCluster?: boolean
}

export function getAllFixedClusters(
  data: DeployEnvironmentEntityFormState,
  environmentIdentifier: string
): ClusterItem[] | any {
  if (data.cluster && getMultiTypeFromValue(data.cluster) === MultiTypeInputType.FIXED) {
    return [data.cluster as string]
  } else if (data.clusters?.[environmentIdentifier] && Array.isArray(data.clusters[environmentIdentifier])) {
    return (data.clusters[environmentIdentifier] as ClusterOption[]).map(cluster => ({
      clusterRef: cluster.value,
      value: cluster.value as string,
      agentIdentifier: cluster.agentIdentifier as string,
      name: cluster.label
    })) as ClusterItem[]
  }

  return []
}

export function getSelectedClustersFromOptions(items: ClusterOption[] | any): ClusterOption[] {
  if (Array.isArray(items)) {
    const selItems: ClusterOption[] = items.map(item => ({
      value: item.value || item.identifier,
      agentIdentifier: item.agentIdentifier,
      name: item.identifier
    }))
    return selItems
  }

  return []
}

const getName = (environmentIdentifier: string): string => {
  if (environmentIdentifier) {
    return `clusters.['${environmentIdentifier}']`
  }
  return 'gitOpsClusters'
}

export default function DeployCluster({
  initialValues,
  readonly,
  environmentIdentifier,
  isMultiCluster
}: DeployClusterProps): JSX.Element {
  const { values, setFieldValue, setValues } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()
  const uniquePathForClusters = React.useRef(`_pseudo_field_${uuid()}`)
  // State
  const [selectedClusters, setSelectedClusters] = useState(getAllFixedClusters(initialValues, environmentIdentifier))

  const isFixed =
    getMultiTypeFromValue(
      isMultiCluster ? (values.clusters?.[environmentIdentifier] as SelectOption[]) : values.cluster
    ) === MultiTypeInputType.FIXED

  React.useEffect(() => {
    // update clusters in formik
    /* istanbul ignore else */

    if (values && selectedClusters.length > 0) {
      if (values.clusters && Array.isArray(values.clusters?.[environmentIdentifier])) {
        setValues({
          ...values,
          // set value of unique path created to handle clusters if some clusters are already selected, else select All
          [uniquePathForClusters.current]: selectedClusters
        })
      }
    } else if (isMultiCluster && isEmpty(selectedClusters)) {
      // This if condition is used to show runtime value for the cluster when it is shown for filtering
      if (readonly && isValueRuntimeInput(initialValues.environments)) {
        setFieldValue(`${uniquePathForClusters.current}`, RUNTIME_INPUT_VALUE)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClusters])

  const error = React.useMemo(() => {
    const nonAgentClusters = selectedClusters.find((item: ClusterItem) => !item.agentIdentifier)
    if (nonAgentClusters) {
      return getString('cd.reConfigurePipelineClusters')
    }
  }, [selectedClusters])

  const updateFormikAndLocalState = (newFormValues: DeployEnvironmentEntityFormState): void => {
    // this sets the form values
    setValues(newFormValues)
    // this updates the local state
    setSelectedClusters(getAllFixedClusters(newFormValues, environmentIdentifier))
  }

  const onRemoveClusterFromList = (clusterToDelete: string): void => {
    const newFormValues = produce(values, draft => {
      // istanbul ignore next
      if (draft.cluster) {
        draft.cluster = ''
        delete draft.clusters
      } else if (draft.clusters && Array.isArray(draft.clusters[environmentIdentifier])) {
        const filteredClusters = (draft.clusters[environmentIdentifier] as ClusterOption[]).filter(
          cluster => cluster.value !== clusterToDelete
        )
        draft.clusters[environmentIdentifier] = filteredClusters
        set(draft, uniquePathForClusters.current, filteredClusters)
      }
    })
    updateFormikAndLocalState(newFormValues)
  }

  return (
    <>
      <Layout.Vertical spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {error ? <Text intent={Intent.WARNING}>{error}</Text> : null}
        <GitOpsCluster
          envRef={environmentIdentifier}
          showLinkedClusters={false}
          allowMultiple={isMultiCluster}
          headerText={getString('pipeline.specifyGitOpsClusters')}
          label={
            selectedClusters?.length
              ? `${getString('common.clusters')}: (${selectedClusters.length})`
              : getString('common.allClusters')
          }
          onSubmit={(val: ClusterOption[] | ClusterOption) => {
            // istanbul ignore next
            if (isMultiCluster) {
              if (!isValueRuntimeInput(val as SelectOption)) {
                const filterVal = (val as ClusterOption[]).filter(item => item.agentIdentifier)
                setFieldValue(`clusters.['${environmentIdentifier}']`, filterVal)
                setSelectedClusters(getSelectedClustersFromOptions(filterVal as ClusterOption[]))
              } else {
                setFieldValue(`clusters.['${environmentIdentifier}']`, val)
                setSelectedClusters(getSelectedClustersFromOptions(val as ClusterOption[]))
              }
            } // istanbul ignore else
            else {
              setFieldValue('clusters', [])
              setSelectedClusters(getSelectedClustersFromOptions([val]))
            }
          }}
          selectedData={selectedClusters}
          name={isMultiCluster ? getName(environmentIdentifier) : 'clusters'}
          disabled={readonly}
        />
      </Layout.Vertical>
      {isFixed && !isEmpty(selectedClusters) && (
        <ClusterEntitiesList
          clustersData={selectedClusters}
          readonly={readonly}
          onRemoveClusterFromList={onRemoveClusterFromList}
        />
      )}
    </>
  )
}
