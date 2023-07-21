/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Button, ButtonVariation, Checkbox, Container, Icon, Layout, TableV2, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer, Row } from 'react-table'
import { useStrings } from 'framework/strings'
import {
  ApiCreateNetworkMapRequest,
  DatabaseConnection,
  DatabaseNetworkMapEntity,
  DatabaseServiceCollection,
  useCreateNetworkMap,
  useListService
} from 'services/servicediscovery'
import type { DiscoveryPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { CommonPaginationQueryParams, useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@discovery/interface/filters'
import type { FormValues } from '../../NetworkMapStudio'
import css from './SelectService.module.scss'

export interface Props {
  details: FormValues | undefined
}

const SelectService: React.FC<Props> = /* istanbul ignore next */ ({ details }) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { relatedServices } = useQueryParams<{ relatedServices?: string }>()
  const { accountId, orgIdentifier, projectIdentifier, dAgentId } = useParams<DiscoveryPathProps>()
  const [selectedServices, setSelectedServices] = useState<DatabaseServiceCollection[]>([])
  const { showError, showSuccess } = useToaster()

  const { page, size } = useQueryParams<CommonPaginationQueryParams>()

  const { data: discoveredServices, loading } = useListService({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      limit: size ?? 0,
      page: page ?? 0,
      all: false
    }
  })

  const paginationProps = useDefaultPaginationProps({
    pageSize: discoveredServices?.page?.limit ?? DEFAULT_PAGE_SIZE,
    pageIndex: discoveredServices?.page?.index ?? DEFAULT_PAGE_INDEX,
    itemCount: discoveredServices?.page?.totalItems ?? 0,
    pageCount: discoveredServices?.page?.totalPages ?? 0,
    showPagination: true
  })

  const { mutate: createNetworkMapMutate } = useCreateNetworkMap({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    },
    agentIdentity: dAgentId
  })

  const handleSelectChange = (isSelect: boolean, row: Row<DatabaseServiceCollection>): void => {
    if (isSelect) {
      setSelectedServices(state => state.concat(row.original))
    } else {
      setSelectedServices(state => state.filter(service => service.id !== row.original.id))
    }
  }

  const handleCreateNetworkMap = async (): Promise<void> => {
    const connections: DatabaseConnection[] = []
    const resources: DatabaseNetworkMapEntity[] = []

    if (details?.name === getString('discovery.untitledNetworkMap')) {
      showError(`${getString('discovery.networkMapNameError')}`)
      return
    }

    // For loop to loop over connections serially, to be removed after graph is introduced
    for (let index = 0; index < selectedServices.length - 1; index++) {
      const service = selectedServices[index]
      const nextService = selectedServices[index + 1]
      connections.push({
        from: {
          id: service.id,
          kind: service.kind
        },
        port: service.spec && service.spec.ports && service.spec.ports[0].port?.toString(),
        to: {
          id: nextService.id,
          kind: nextService.kind
        }
      })
    }
    for (let index = 0; index < selectedServices.length - 1; index++) {
      resources.push({
        id: selectedServices[index].id,
        kind: selectedServices[index].kind
      })
    }
    const response: ApiCreateNetworkMapRequest = {
      connections: connections,
      identity: details?.identifier,
      resources,
      name: details?.name
    }
    try {
      await createNetworkMapMutate({
        ...response
      }).then(() => {
        showSuccess(getString('discovery.networkMapCreated'))
        history.push(
          routes.toDiscoveryDetails({
            accountId,
            orgIdentifier,
            projectIdentifier,
            dAgentId: dAgentId
          })
        )
      })
    } catch (error) {
      showError(error.data?.description || error.data?.message)
    }
  }

  const RenderSelectServiceCheckbox: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => {
    if (relatedServices)
      return relatedServices.split(',').map(releatedService => {
        if (row.original.name === releatedService)
          return (
            <Checkbox
              checked
              key={row.original.name}
              margin={{ left: 'medium' }}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                handleSelectChange(event.currentTarget.checked, row)
              }}
            />
          )
      })
    else
      return (
        <Checkbox
          key={row.original.name}
          margin={{ left: 'medium' }}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            handleSelectChange(event.currentTarget.checked, row)
          }}
        />
      )
  }

  const RenderServiceName: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'} margin={{ left: 'small' }}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.name}
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_400}>
        ID: {row.original.id}
      </Text>
    </Layout.Vertical>
  )

  const RenderServiceNamespace: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        Namespace
      </Text>
      <Text
        lineClamp={1}
        font={{ size: 'small', weight: 'semi-bold' }}
        color={Color.GREY_600}
        icon="service-deployment"
      >
        {row.original.namespace}
      </Text>
    </Layout.Vertical>
  )

  const RenderServiceIPAddress: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        IP Address
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.spec && row.original.spec?.clusterIP}
      </Text>
    </Layout.Vertical>
  )

  const RenderServicePort: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        Port
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.spec && row.original.spec?.ports && row.original.spec?.ports[0]?.port}
      </Text>
    </Layout.Vertical>
  )

  const columns: Column<DatabaseServiceCollection>[] = useMemo(
    () => [
      {
        Header: '',
        width: '10%',
        id: 'action',
        Cell: RenderSelectServiceCheckbox,
        disableSortBy: true
      },
      {
        Header: '',
        id: 'name',
        width: '40%',
        Cell: RenderServiceName
      },
      {
        Header: '',
        id: 'namespace',
        width: '15%',
        Cell: RenderServiceNamespace
      },
      {
        Header: '',
        id: 'ipAddress',
        width: '15%',
        Cell: RenderServiceIPAddress
      },
      {
        Header: '',
        id: 'port',
        width: '8%',
        Cell: RenderServicePort
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [discoveredServices]
  )

  return (
    <Layout.Horizontal width="100%" height="100%">
      <Container background={Color.PRIMARY_BG} className={css.services}>
        <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }} margin={{ top: 'large', left: 'large' }}>
          {getString('discovery.allDiscoveredServices')} {`(${discoveredServices?.items?.length ?? '0'})`}
        </Text>
        <Container>
          {loading ? (
            <Container width={'100%'} flex={{ align: 'center-center' }}>
              <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
                <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
                <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
                  {getString('loading')}
                </Text>
              </Layout.Vertical>
            </Container>
          ) : (
            <Container width="95%" height="75vh" style={{ margin: 'auto' }}>
              <TableV2<DatabaseServiceCollection>
                className={css.tableBody}
                columns={columns}
                data={discoveredServices?.items ?? []}
                pagination={paginationProps}
              />
            </Container>
          )}
        </Container>
        <Container className={css.bottomNav} padding={'medium'} height="8vh">
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
            <Button
              variation={ButtonVariation.TERTIARY}
              text={getString('cancel')}
              onClick={() =>
                history.push(
                  routes.toDiscoveryDetails({
                    accountId,
                    orgIdentifier,
                    projectIdentifier,
                    dAgentId: dAgentId
                  })
                )
              }
            />
            <Button
              type="submit"
              variation={ButtonVariation.PRIMARY}
              text={'Create Network Map'}
              onClick={() => handleCreateNetworkMap()}
            />
          </Layout.Horizontal>
        </Container>
      </Container>

      {/* TODO: Add Graph here */}
      <div className={css.visualization}></div>
    </Layout.Horizontal>
  )
}

export default SelectService
