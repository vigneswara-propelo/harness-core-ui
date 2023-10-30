/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Container,
  DropDown,
  ExpandingSearchInput,
  FlexExpander,
  GridListToggle,
  Layout,
  Page,
  SelectOption,
  Views
} from '@harness/uicore'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DiscoveryPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useListDiscoveredServiceConnection, useListNamespace } from 'services/servicediscovery'
import DiscoveredServices from './tableView/DiscoveredServices'
import DiscoveredResourcesGraph from './graphView/DiscoveredResourcesGraph'

export default function DiscoveredResources(): React.ReactElement {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & DiscoveryPathProps>()

  const { getString } = useStrings()
  const [search, setSearch] = React.useState<string>()
  const [namespace, selectedNamespace] = React.useState<string>()
  const [view, setView] = React.useState<Views>(Views.GRID)

  const { data: namespaceList } = useListNamespace({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      all: true,
      page: 0,
      limit: 0
    }
  })

  const { data: connectionList } = useListDiscoveredServiceConnection({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const dropdownNamespaceOptions: SelectOption[] = [
    { value: '', label: 'All' },
    ...(namespaceList?.items?.map(value => {
      return {
        value: value.name ?? '',
        label: value.name ?? ''
      }
    }) ?? [])
  ]

  return (
    <Container>
      <Page.SubHeader>
        <Layout.Horizontal width="100%" flex style={{ gap: 8 }}>
          <DropDown
            buttonTestId="namespace"
            width={160}
            items={dropdownNamespaceOptions ?? []}
            onChange={option => {
              selectedNamespace(option.value as string)
            }}
            placeholder={getString('common.namespace')}
            value={namespace}
          />
          <FlexExpander />
          <ExpandingSearchInput
            data-testid="searchBox"
            alwaysExpanded
            width={232}
            defaultValue={search}
            placeholder={getString('discovery.searchService')}
            throttle={500}
            onChange={value => setSearch(value)}
          />
          <GridListToggle initialSelectedView={view} onViewToggle={v => setView(v)} />
        </Layout.Horizontal>
      </Page.SubHeader>
      <Container>
        {view === Views.GRID ? (
          <DiscoveredResourcesGraph connectionList={connectionList} search={search} namespace={namespace} />
        ) : (
          <DiscoveredServices connectionList={connectionList} search={search} namespace={namespace} />
        )}
      </Container>
    </Container>
  )
}
