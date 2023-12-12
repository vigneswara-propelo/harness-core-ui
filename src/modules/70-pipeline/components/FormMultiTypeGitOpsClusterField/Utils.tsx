/* eslint-disable strings-restrict-modules */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
// import { defaultTo } from 'lodash-es'

import type { Item, ReferenceSelectProps } from '@common/components/ReferenceSelect/ReferenceSelect'
import { Failure, getClusterListFromSourcePromise, ResponsePageClusterFromGitops } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import environmentEmptyStateSvg from '@pipeline/icons/emptyServiceDetail.svg'
import {
  EntityReferenceResponse,
  getScopeFromDTO
} from '@modules/10-common/components/EntityReference/EntityReference.types'
import { UseStringsReturn } from 'framework/strings/String'

import { ClstrRecord } from './FormMultiTypeGitOpsClusterField'

import css from './FormMultiTypeGitOpsClusterField.module.scss'

interface EntitySelectorReferenceProps {
  defaultScope?: Scope
  projectIdentifier: string
  orgIdentifier: string
  name: string
  width?: string
  selected?: (string | Item)[] | string
  placeholder: string
  isMultiSelect?: boolean
  accountIdentifier: string
  setPagedClusterData: (data: ResponsePageClusterFromGitops) => void
  selectedClusters: (string | Item)[]
  getString: UseStringsReturn['getString']
}

export const DELIMITER = '__'

// const getScopedIdentifier = (identifier: string, scope?: string): string => {
//   if (scope === 'PROJECT') {
//     return identifier
//   } else if (scope === 'ACCOUNT') {
//     return `account.${identifier}`
//   } else if (scope === 'ORGANIZATION') {
//     return `org.${identifier}`
//   }
//   // istanbul ignore next
//   return `${scope}.${identifier}`
// }
export function getReferenceFieldProps({
  defaultScope,
  projectIdentifier,
  orgIdentifier,
  name,
  width,
  selected,
  placeholder,
  isMultiSelect,
  accountIdentifier,
  setPagedClusterData,
  selectedClusters,
  getString
}: EntitySelectorReferenceProps): Omit<
  ReferenceSelectProps<ClstrRecord>,
  'onChange' | 'onMultiSelectChange' | 'onCancel' | 'pagination'
> {
  return {
    name,
    width,
    selectAnReferenceLabel: 'Select Cluster',
    selected: selected as string | Item,
    placeholder,
    defaultScope,
    createNewLabel: 'Cluster',
    isNewConnectorLabelVisible: true,

    fetchRecords: (done, search, page, scope) => {
      getScopeFromDTO
      const orgAndProj: { orgIdentifier?: string; projectIdentifier?: string } = {}

      if (scope === Scope.ORG) {
        orgAndProj.orgIdentifier = orgIdentifier
      }
      if (scope === Scope.PROJECT) {
        orgAndProj.orgIdentifier = orgIdentifier
        orgAndProj.projectIdentifier = projectIdentifier
      }

      return getClusterListFromSourcePromise({
        queryParams: {
          accountIdentifier,
          ...orgAndProj,
          scoped: true,
          searchTerm: search?.trim(),
          page,
          size: 10
        }
      })
        .then(responseData => {
          if (responseData?.data?.content) {
            const content = responseData?.data?.content?.map(item => ({
              ...item,
              identifier: `${item.identifier}${DELIMITER}${item.agentIdentifier}`,
              record: {
                ...item,
                ...orgAndProj
              }
            }))
            setPagedClusterData(responseData)
            done(content as EntityReferenceResponse<ClstrRecord>[])
          } // istanbul ignore else
          else {
            done([])
          }
        })
        .catch((err: Failure) => {
          throw err.message
        })
    },
    projectIdentifier,
    orgIdentifier,
    noRecordsText: getString('cd.noCluster.title'),
    componentName: 'Cluster',
    noDataCard: {
      image: environmentEmptyStateSvg,
      message: getString('cd.noCluster.title'),
      containerClassName: css.noDataCardContainerConnector,
      className: css.noDataCardContainerContent
    },
    isMultiSelect,
    selectedReferences: selectedClusters as Item[],
    recordRender: function recordRender({ item, selected: checked }) {
      const _item = item as EntityReferenceResponse<ClstrRecord>

      const testId = checked ? `highlight-cluster-${_item?.record?.identifier}` : _item?.record?.identifier

      return (
        <div key={`${_item.identifier}-${_item.record.agentIdentifier}`} data-testid={testId}>
          <Text flex>
            <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.BLACK}>
              {_item.name}
            </Text>
          </Text>

          <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
            {getString('cd.agentID')}: {_item.record.agentIdentifier}
          </Text>
        </div>
      )
    }
  }
}
