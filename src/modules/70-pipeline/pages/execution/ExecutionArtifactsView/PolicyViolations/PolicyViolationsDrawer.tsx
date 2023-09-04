/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Drawer, Position } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import {
  Button,
  ButtonVariation,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Heading,
  Page,
  Text
} from '@harness/uicore'
import {
  EnforcementnewViolationsOkResponse,
  useEnforcementnewViolationsQuery
} from '@harnessio/react-ssca-service-client'
import {
  GetPolicyViolationsOkResponse,
  GetPolicyViolationsQueryQueryParams,
  useGetPolicyViolationsQuery
} from '@harnessio/react-ssca-manager-client'
import React, { ReactElement, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import EmptySearchResults from '@common/images/EmptySearchResults.svg'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { Width } from '@common/constants/Utils'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PolicyViolationsTable } from './PolicyViolationsTable'
import { EnforcementViolationQueryParams, getQueryParamOptions } from './utils'
import { PolicyViolationsTableOld } from './PolicyViolationsTableOld'
import css from './PolicyViolations.module.scss'

interface PolicyViolationsDrawerProps {
  enforcementId: string
  showEnforcementViolations: (enforcementId?: string) => void
}

export function PolicyViolationsDrawer({
  enforcementId,
  showEnforcementViolations
}: PolicyViolationsDrawerProps): ReactElement {
  const { getString } = useStrings()
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const { updateQueryParams } = useUpdateQueryParams<Partial<EnforcementViolationQueryParams>>()
  const { page, size, searchTerm, sort, order } = useQueryParams<EnforcementViolationQueryParams>(
    getQueryParamOptions()
  )
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const resetFilter = (): void => {
    updateQueryParams({ searchTerm: undefined, page: 0 })
    searchRef.current.clear()
  }

  const SSCA_MANAGER_ENABLED = useFeatureFlag(FeatureFlag.SSCA_MANAGER_ENABLED)

  const useEnforcementnewViolationsQueryResult = useEnforcementnewViolationsQuery(
    {
      enforcementId,
      queryParams: {
        page,
        pageSize: size,
        searchTerm,
        sort,
        order
      }
    },
    { enabled: !SSCA_MANAGER_ENABLED }
  )

  const useGetPolicyViolationsQueryResult = useGetPolicyViolationsQuery(
    {
      org: orgIdentifier,
      project: projectIdentifier,
      'enforcement-id': enforcementId,
      queryParams: {
        page,
        limit: size,
        sort: sort as GetPolicyViolationsQueryQueryParams['sort'], // TODO: change the EnforcementViolationQueryParams client side type to this after removing FF
        order: order as GetPolicyViolationsQueryQueryParams['order'],
        search_text: searchTerm
      }
    },
    { enabled: SSCA_MANAGER_ENABLED }
  )

  const { isLoading, error, refetch, data } = SSCA_MANAGER_ENABLED
    ? useGetPolicyViolationsQueryResult
    : useEnforcementnewViolationsQueryResult

  return (
    <Drawer
      onClose={() => showEnforcementViolations()}
      usePortal
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus={false}
      hasBackdrop={true}
      size="calc(100vw - 272px)"
      isOpen
      position={Position.RIGHT}
    >
      <Button
        className={css.drawerCloseButton}
        minimal
        icon="cross"
        withoutBoxShadow
        onClick={() => showEnforcementViolations()}
      />

      <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }} padding="large">
        {getString('pipeline.policyViolationDetails')}
      </Heading>

      <Page.Body
        loading={isLoading}
        error={get(error, 'message', error)}
        retryOnError={() => {
          refetch()
        }}
        noData={{
          when: () =>
            !error && SSCA_MANAGER_ENABLED
              ? !(data as GetPolicyViolationsOkResponse)?.content?.length
              : !(data as EnforcementnewViolationsOkResponse)?.content.results?.length,
          image: EmptySearchResults,
          messageTitle: getString('common.filters.noResultsFound'),
          message: getString('common.filters.noMatchingFilterData'),
          button: (
            <Button
              variation={ButtonVariation.LINK}
              onClick={resetFilter}
              text={getString('common.filters.clearFilters')}
            />
          )
        }}
      >
        <div className={css.subHeader}>
          <Text color={Color.GREY_900} font={{ weight: 'bold' }}>
            {`${getString('total')}: ${data?.pagination?.total}`}
          </Text>
          <ExpandingSearchInput
            defaultValue={searchTerm}
            alwaysExpanded
            onChange={value => updateQueryParams({ searchTerm: value, page: 0 })}
            width={Width.LARGE}
            autoFocus={false}
            ref={searchRef}
          />
        </div>

        {data &&
          (SSCA_MANAGER_ENABLED ? (
            <PolicyViolationsTable data={data as GetPolicyViolationsOkResponse} />
          ) : (
            <PolicyViolationsTableOld data={data as EnforcementnewViolationsOkResponse} />
          ))}
      </Page.Body>
    </Drawer>
  )
}
