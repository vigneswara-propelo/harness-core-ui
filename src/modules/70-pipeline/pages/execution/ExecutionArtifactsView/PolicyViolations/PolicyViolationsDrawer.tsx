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
  GetPolicyViolationsOkResponse,
  GetPolicyViolationsQueryQueryParams,
  useGetPolicyViolationsQuery
} from '@harnessio/react-ssca-manager-client'
import React, { ReactElement, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import EmptySearchResults from '@common/images/EmptySearchResults.svg'
import { Width } from '@common/constants/Utils'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PolicyViolationsTable } from './PolicyViolationsTable'
import {
  ENFORCEMENT_VIOLATIONS_DEFAULT_SORT,
  ENFORCEMENT_VIOLATIONS_DEFAULT_SORT_ORDER,
  ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
  ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
  PageOptions
} from './utils'
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
  const [pageOptions, setPageOptions] = useState<PageOptions>({
    page: ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
    size: ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
    sort: ENFORCEMENT_VIOLATIONS_DEFAULT_SORT,
    order: ENFORCEMENT_VIOLATIONS_DEFAULT_SORT_ORDER,
    searchTerm: undefined
  })
  const { page, size, searchTerm, sort, order } = pageOptions
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const updatePageOptions = (data: Partial<typeof pageOptions>): void => setPageOptions(prev => ({ ...prev, ...data }))

  const resetFilter = (): void => {
    updatePageOptions({ searchTerm: '', page: 0 })
    searchRef.current?.clear()
  }

  const { isLoading, error, refetch, data } = useGetPolicyViolationsQuery({
    org: orgIdentifier,
    project: projectIdentifier,
    'enforcement-id': enforcementId,
    queryParams: {
      page,
      limit: size,
      sort: sort as GetPolicyViolationsQueryQueryParams['sort'], // TODO: change the PageOptions client side type to this after removing FF
      order: order as GetPolicyViolationsQueryQueryParams['order'],
      search_text: searchTerm
    }
  })

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
        {getString('pipeline.sbomPolicyViolations')}
      </Heading>

      <Page.Body
        loading={isLoading}
        error={get(error, 'message', error)}
        retryOnError={() => {
          refetch()
        }}
        noData={{
          when: () => !error && !(data as GetPolicyViolationsOkResponse)?.content?.length,
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
            onChange={value => updatePageOptions({ searchTerm: value, page: 0 })}
            width={Width.LARGE}
            autoFocus={false}
            ref={searchRef}
          />
        </div>

        {data && (
          <PolicyViolationsTable
            data={data as GetPolicyViolationsOkResponse}
            pageOptions={pageOptions}
            updatePageOptions={updatePageOptions}
          />
        )}
      </Page.Body>
    </Drawer>
  )
}
