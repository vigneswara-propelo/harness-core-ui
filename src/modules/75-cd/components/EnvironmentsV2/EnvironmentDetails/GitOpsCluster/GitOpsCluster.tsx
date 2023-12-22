/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'

import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'

import { AllowedTypes, ButtonSize, ButtonVariation, Container, MultiTypeInputType } from '@harness/uicore'

import { useGetClusterList } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { ClusterData, ClusterOption } from '@modules/75-cd/components/PipelineSteps/DeployEnvironmentEntityStep/types'
import { FormMultiTypeGitOpsClusterField } from '@modules/70-pipeline/components/FormMultiTypeGitOpsClusterField/FormMultiTypeGitOpsClusterField'

import AddCluster from './AddClusterV2'
import ClusterTableView from './ClusterTableView'

const GitOpsCluster = (props: {
  envRef: string
  onSubmit?: (val: ClusterOption[]) => void
  allowMultiple?: boolean
  showLinkedClusters?: boolean
  label?: string
  onTypeChange?: (type: MultiTypeInputType, val?: ClusterOption[]) => void
  name?: string
  hideConfigOptions?: boolean
  allowableTypes?: AllowedTypes
  headerText?: string
  selectedData?: ClusterOption[]
  disabled?: boolean
  setSelectedClusters?: any
}): React.ReactElement => {
  const [showSelectClusterModal, setShowClusterModal] = React.useState(false)
  const { showLinkedClusters = true } = props
  const { projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
  }>()

  const { accountId } = useParams<AccountPathProps>()

  const { data, refetch, loading } = useGetClusterList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: defaultTo(get(props, 'envRef'), '')
    }
  })

  useEffect(() => {
    if (!loading && data?.data?.content?.length === 1 && props.setSelectedClusters && !props?.selectedData?.length) {
      props.setSelectedClusters(data?.data?.content)
    }
  }, [data, loading])

  const { getString } = useStrings()

  const clusterDialog = (
    <AddCluster
      linkedClusterResponse={data}
      onHide={() => {
        setShowClusterModal(false)
      }}
      refetch={refetch}
      envRef={props.envRef}
    />
  )

  const addClustersForLinked = (): React.ReactElement => {
    return (
      <Container padding={{ left: 'medium', right: 'medium' }}>
        <RbacButton
          minimal
          intent="primary"
          onClick={() => {
            setShowClusterModal(true)
          }}
          icon="plus"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          permission={{
            resource: {
              resourceType: ResourceType.ENVIRONMENT
            },
            permission: PermissionIdentifier.EDIT_ENVIRONMENT
          }}
        >
          {getString('cd.selectClusterLabel')}
        </RbacButton>
        <Container padding={{ top: 'medium' }}>
          <ClusterTableView linkedClusters={data} loading={loading} refetch={refetch} {...props} />
        </Container>
        {showSelectClusterModal ? clusterDialog : null}
      </Container>
    )
  }

  if (showLinkedClusters) {
    return addClustersForLinked()
  }

  return (
    <FormMultiTypeGitOpsClusterField
      name={defaultTo(get(props, 'name'), getString('common.clusters'))}
      label={defaultTo(get(props, 'label'), getString('common.clusters'))}
      placeholder={defaultTo(get(props, 'label'), getString('select'))}
      isNewClusterLabelVisible={false}
      multiTypeProps={{
        allowableTypes: props.allowableTypes ?? [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
      }}
      isMultiSelect={true}
      onMultiSelectChange={(val: ClusterOption[] | string) => {
        if (props.onSubmit) {
          props?.onSubmit(val as ClusterOption[])
        }
      }}
      selected={props.selectedData as ClusterData[]}
      disabled={props.disabled}
      accountIdentifier={accountId}
      projectIdentifier={projectIdentifier}
      orgIdentifier={orgIdentifier}
      linkedClusters={data?.data?.content || []}
      environmentIdentifier={props.envRef}
    />
  )
}

export default GitOpsCluster
