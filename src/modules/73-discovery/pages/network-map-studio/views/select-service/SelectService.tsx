/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Checkbox,
  Container,
  DropDown,
  ExpandingSearchInput,
  FlexExpander,
  Layout,
  Page,
  PageSpinner,
  SelectOption,
  TableV2,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { cloneDeep } from 'lodash-es'
import { ReactFlowProvider } from 'reactflow'
import { useStrings } from 'framework/strings'
import {
  ApiCreateNetworkMapRequest,
  useListDiscoveredServiceConnection,
  useListDiscoveredService,
  useListNamespace,
  DatabaseNetworkMapEntity,
  DatabaseNetworkMapResourceKind,
  DatabaseDiscoveredServiceCollection
} from 'services/servicediscovery'
import type {
  NetworkMapPathProps,
  ModulePathParams,
  ProjectPathProps,
  NetworkMapQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@discovery/interface/filters'
import { StudioTabs } from '@discovery/interface/networkMapStudio'
import { useDiscoveryIndexedDBHook } from '@discovery/hooks/useDiscoveryIndexedDBHook'
import {
  getGraphEdgesFromNetworkMap,
  getGraphNodesFromNetworkMap
} from '@discovery/components/NetworkGraph/utils/graphDataTransformation'
import NetworkGraph from '@discovery/components/NetworkGraph/NetworkGraph'
import getConnectionsBetweenServicesInNetworkMap from '@discovery/utils/getConnectionsBetweenServicesInNetworkMap'
import { getRelatedServices } from '@discovery/utils/getRelatedServices'
import {
  RenderMenuCell,
  RenderSelectServiceCheckbox,
  RenderServiceIPAddress,
  RenderServiceName,
  RenderServiceNamespace,
  RenderServicePort
} from './SelectServiceTableCells'
import noServiceIllustration from '../../images/noServiceIllustration.png'
import css from './SelectService.module.scss'

export interface SelectServiceProps {
  networkMap: ApiCreateNetworkMapRequest
  updateNetworkMap: (networkMap: ApiCreateNetworkMapRequest) => Promise<void>
  handleTabChange: (tabID: StudioTabs) => void
}

const SelectService: React.FC<SelectServiceProps> = ({ networkMap, updateNetworkMap, handleTabChange }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, dAgentId } = useParams<
    ProjectPathProps & ModulePathParams & NetworkMapPathProps
  >()
  const { page, size, relatedServicesOf } = useQueryParams<NetworkMapQueryParams>()

  const [search, setSearch] = React.useState<string>()
  const [namespace, selectedNamespace] = React.useState<string>()

  const { dbInstance } = useDiscoveryIndexedDBHook()

  const { data: discoveredServices, loading: listServiceLoading } = useListDiscoveredService({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      namespace: namespace,
      page: page ?? DEFAULT_PAGE_INDEX,
      limit: size ?? DEFAULT_PAGE_SIZE,
      all: false,
      search: search
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

  const paginationProps = useDefaultPaginationProps({
    pageSize: discoveredServices?.page?.limit ?? DEFAULT_PAGE_SIZE,
    pageIndex: discoveredServices?.page?.index ?? DEFAULT_PAGE_INDEX,
    itemCount: discoveredServices?.page?.totalItems ?? 0,
    pageCount: discoveredServices?.page?.totalPages ?? 1,
    hidePageNumbers: true
  })

  React.useEffect(() => {
    if (relatedServicesOf && networkMap.resources.length === 0) handleSelectRelatedServices(relatedServicesOf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkMap, dbInstance])

  async function handleSelectionChange(isSelect: boolean, service: DatabaseDiscoveredServiceCollection): Promise<void> {
    // Select or deselect services
    let selectedServices = cloneDeep(networkMap.resources)
    if (isSelect) {
      selectedServices.push({
        id: service.id,
        kind: 'discoveredservice',
        name: service.spec.kubernetes?.name ?? '',
        kubernetes: {
          namespace: service.spec.kubernetes?.namespace
        }
      })
    } else {
      /* istanbul ignore next */ selectedServices = selectedServices.filter(s => s.id !== service.id)
    }

    const newNetworkMap: ApiCreateNetworkMapRequest = {
      ...networkMap,
      resources: selectedServices,
      connections: getConnectionsBetweenServicesInNetworkMap(selectedServices, connectionList)
    }
    updateNetworkMap(newNetworkMap)
  }

  const dropdownNamespaceOptions: SelectOption[] = [
    { value: '', label: 'All' },
    ...(namespaceList?.items?.map(value => {
      return {
        value: value.name ?? '',
        label: value.name ?? ''
      }
    }) ?? [])
  ]

  const getCheckedStatus = React.useMemo(() => {
    const listOfServicesOnPage = discoveredServices?.items?.map(item => item.id)
    const selectedServicesOnPage = networkMap.resources.filter(item => listOfServicesOnPage?.includes(item.id))

    if (!listOfServicesOnPage || !selectedServicesOnPage || networkMap.resources.length === 0)
      return { allChecked: false, intermediate: false }

    if (listOfServicesOnPage.length === selectedServicesOnPage.length) return { allChecked: true, intermediate: false }

    if (listOfServicesOnPage.length > selectedServicesOnPage.length) return { allChecked: false, intermediate: true }
  }, [discoveredServices, networkMap])

  async function handleSelectAll(checked: boolean): Promise<void> {
    let newNetworkMap: ApiCreateNetworkMapRequest
    const listOfServicesOnPage = discoveredServices?.items?.map(item => item.id)
    const prevSelectedServicesNotOnPage = networkMap.resources.filter(item => !listOfServicesOnPage?.includes(item.id))
    if (checked) {
      const selectedServices: DatabaseNetworkMapEntity[] = [
        ...(prevSelectedServicesNotOnPage ?? []),
        ...(discoveredServices?.items?.map(service => ({
          id: service.id,
          kind: 'discoveredservice' as DatabaseNetworkMapResourceKind,
          name: service.spec.kubernetes?.name ?? '',
          kubernetes: {
            namespace: service.spec.kubernetes?.namespace
          }
        })) ?? [])
      ]

      newNetworkMap = {
        ...networkMap,
        resources: selectedServices,
        connections: getConnectionsBetweenServicesInNetworkMap(selectedServices, connectionList)
      }
    } else {
      /* istanbul ignore next */
      newNetworkMap = {
        ...networkMap,
        resources: prevSelectedServicesNotOnPage,
        connections: getConnectionsBetweenServicesInNetworkMap(prevSelectedServicesNotOnPage, connectionList)
      }
    }

    updateNetworkMap(newNetworkMap)
  }

  // Dev Node: I'm exhausted and the popover won't open in jest env. I give up on this code and life itself.
  /* istanbul ignore next */
  async function handleSelectRelatedServices(serviceID: string): Promise<void> {
    const relatedServices = getRelatedServices(serviceID, discoveredServices, connectionList)
    const additionalServices = relatedServices?.filter(s => !networkMap.resources.some(r => r.id === s.id))
    if (!additionalServices || additionalServices.length === 0) return

    const selectedServices: DatabaseNetworkMapEntity[] = [
      ...networkMap.resources,
      ...(additionalServices?.map(service => ({
        id: service.id,
        kind: 'discoveredservice' as DatabaseNetworkMapResourceKind,
        name: service.spec.kubernetes?.name ?? '',
        kubernetes: {
          namespace: service.spec.kubernetes?.namespace
        }
      })) ?? [])
    ]
    const newNetworkMap: ApiCreateNetworkMapRequest = {
      ...networkMap,
      resources: selectedServices,
      connections: getConnectionsBetweenServicesInNetworkMap(selectedServices, connectionList)
    }

    updateNetworkMap(newNetworkMap)
  }

  const nodes = getGraphNodesFromNetworkMap(networkMap)
  const edges = getGraphEdgesFromNetworkMap(networkMap)

  const columns: Column<DatabaseDiscoveredServiceCollection>[] = React.useMemo(
    () => [
      {
        Header: '',
        width: 'fit-content',
        id: 'action',
        Cell: (props: CellProps<DatabaseDiscoveredServiceCollection>) => (
          <RenderSelectServiceCheckbox
            {...props}
            networkMap={networkMap}
            handleSelectionChange={handleSelectionChange}
          />
        ),
        disableSortBy: true
      },
      {
        Header: '',
        id: 'name',
        width: '42%',
        Cell: RenderServiceName
      },
      {
        Header: '',
        id: 'namespace',
        width: '18%',
        Cell: RenderServiceNamespace
      },
      {
        Header: '',
        id: 'ipAddress',
        width: '17%',
        Cell: RenderServiceIPAddress
      },
      {
        Header: '',
        id: 'port',
        width: '8%',
        Cell: RenderServicePort
      },
      {
        Header: '',
        id: 'menu',
        width: 'fit-content',
        Cell: (props: CellProps<DatabaseDiscoveredServiceCollection>) => (
          <RenderMenuCell {...props} handleClick={() => handleSelectRelatedServices(props.row.original.id ?? '')} />
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [discoveredServices, networkMap, connectionList]
  )

  if (listServiceLoading) {
    return (
      <Page.Body>
        <PageSpinner />
      </Page.Body>
    )
  }

  return (
    <Layout.Horizontal width="100%" height="100%">
      <Container width="40%">
        <Layout.Vertical height="100%" padding="medium" spacing="medium">
          <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
            {getString('discovery.allDiscoveredServices')} ({discoveredServices?.items?.length ?? 0})
          </Text>
          <Container width="100%" flex>
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
              autoFocus={false}
              placeholder={getString('discovery.searchService')}
              throttle={500}
              onChange={value => setSearch(value)}
            />
          </Container>
          <Checkbox
            labelElement={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('common.selectAll')}</Text>}
            width="fit-content"
            checked={getCheckedStatus?.allChecked}
            indeterminate={getCheckedStatus?.intermediate}
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              handleSelectAll(event.currentTarget.checked)
            }}
          />
          <TableV2<DatabaseDiscoveredServiceCollection>
            className={css.tableBody}
            columns={columns}
            data={discoveredServices?.items ?? []}
            pagination={paginationProps}
            hideHeaders
          />
          <Button
            width={80}
            variation={ButtonVariation.PRIMARY}
            text={getString('next')}
            disabled={networkMap.resources.length === 0}
            onClick={() => handleTabChange(StudioTabs.CONFIGURE_RELATIONS)}
          />
        </Layout.Vertical>
      </Container>
      <Container width="60%" height="100%">
        {nodes.length === 0 || !connectionList ? (
          <Layout.Vertical height="100%" flex={{ align: 'center-center' }} background={Color.WHITE} spacing="medium">
            <img src={noServiceIllustration} width={250} height={111} />
            <Text font={{ variation: FontVariation.H5 }}>{getString('discovery.noServiceSelected')}</Text>
            <Text width="40%">{getString('discovery.noServiceSelectedDescription')}</Text>
          </Layout.Vertical>
        ) : (
          <ReactFlowProvider>
            <NetworkGraph nodes={nodes} edges={edges} />
          </ReactFlowProvider>
        )}
      </Container>
    </Layout.Horizontal>
  )
}

export default SelectService
