/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, ExpandingSearchInput, Layout } from '@harness/uicore'
import { Drawer, Position } from '@blueprintjs/core'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { ApiGetAgentResponse, useListAgent } from 'services/servicediscovery'
import RbacButton from '@rbac/components/Button/Button'
import DiscoveryAgentTable from '@discovery/components/DiscoveryAgentTable/DiscoveryAgentTable'
import { useQueryParams } from '@common/hooks'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { DEFAULT_PAGE_SIZE, ServiceDiscoveryFilterParams } from '@discovery/interface/filters'
import EmptyStateDiscoveryAgent from './views/empty-state/EmptyStateDiscoveryAgent'
import CreateDAgent from './views/create-discovery-agent/CreateDAgent'
import css from './DiscoveryPage.module.scss'

const DiscoveryPage: React.FC = /* istanbul ignore next */ () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const discoveryLabel = getString('common.discovery')
  const [search, setSearch] = useState('')
  const [isOpen, setDrawerOpen] = useState(false)
  useDocumentTitle(discoveryLabel)

  //States for pagination
  const { page, size } = useQueryParams<ServiceDiscoveryFilterParams>()

  const { data: discoveryAgentList, loading: discoveryAgentListLoading } = useListAgent({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      search: search,
      all: false,
      page: page ? parseInt(page) : 0,
      limit: size ? parseInt(size) : DEFAULT_PAGE_SIZE
    }
  })

  const paginationProps = useDefaultPaginationProps({
    itemCount: discoveryAgentList?.page?.totalItems ?? 0,
    pageSize: size ? parseInt(size) : DEFAULT_PAGE_SIZE,
    pageCount: discoveryAgentList?.page?.totalPages ?? 1,
    pageIndex: page ? parseInt(page) : 0
  })

  const discoveryAgentListData: ApiGetAgentResponse[] = React.useMemo(
    () => discoveryAgentList?.items || [],
    [discoveryAgentList?.items]
  )

  return (
    <Container>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: discoveryLabel,
              [Scope.ORG]: discoveryLabel,
              [Scope.ACCOUNT]: discoveryLabel
            }}
          />
        }
      />

      <Page.Body loading={discoveryAgentListLoading}>
        {discoveryAgentList && discoveryAgentList.items && discoveryAgentList?.items?.length > 0 ? (
          <>
            <Page.SubHeader>
              <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
                <Layout.Horizontal>
                  <RbacButton
                    text={getString('discovery.homepage.newDiscoveryAgentBtn')}
                    variation={ButtonVariation.PRIMARY}
                    icon="plus"
                    onClick={() => setDrawerOpen(true)}
                  />
                </Layout.Horizontal>
                <Container data-name="monitoredServiceSeachContainer">
                  <ExpandingSearchInput
                    width={250}
                    alwaysExpanded
                    throttle={500}
                    defaultValue={search}
                    onChange={value => setSearch(value)}
                    placeholder={getString('discovery.homepage.searchDiscoveryAgent')}
                  />
                </Container>
              </Layout.Horizontal>
            </Page.SubHeader>
            <Page.Body className={css.discoveryAgentTable}>
              <DiscoveryAgentTable listData={discoveryAgentListData} pagination={paginationProps} />
            </Page.Body>
          </>
        ) : (
          <EmptyStateDiscoveryAgent setDrawerOpen={setDrawerOpen} />
        )}
      </Page.Body>
      <Drawer position={Position.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
        <Button
          minimal
          className={css.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => setDrawerOpen(false)}
        />
        <CreateDAgent setDrawerOpen={setDrawerOpen} />
      </Drawer>
    </Container>
  )
}

export default DiscoveryPage
