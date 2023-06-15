/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { CellProps, Renderer } from 'react-table'
import { Container, Layout, TableV2, NoDataCard, Heading, Icon } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import type { MonitoredServicePlatformResponse } from 'services/cv'
import { ServiceDeleteContext } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.utils'
import { getListTitle } from '@cv/pages/monitored-service/CVMonitoredService/components/MonitoredServiceListView/MonitoredServiceListView.utils'
import MonitoredServiceCategory from '@cv/pages/monitored-service/components/Configurations/components/Dependency/component/components/MonitoredServiceCategory/MonitoredServiceCategory'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import routes from '@common/RouteDefinitions'
import type { CommonMonitoredServiceListViewProps } from './CommonMonitoredServiceListView.types'
import ServiceName from './components/ServiceName/ServiceName'
import ConfiguredLabel from './components/ConfiguredLabel/ConfiguredLabel'
import { getIfModuleIsCD } from '../../MonitoredServiceListWidget.utils'
import css from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.module.scss'

const CategoryProps: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => (
  <MonitoredServiceCategory type={row.original.type} abbrText verticalAlign />
)

const RenderServiceNameForProjects: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => {
  return <ServiceName row={row} />
}

const RenderHealthSourceForProjects: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => {
  const healthSourcesConfigured = row?.original?.configuredHealthSources || 0
  return <ConfiguredLabel count={healthSourcesConfigured} />
}

const RenderChangeSourceForProjects: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => {
  const changeSourcesConfigured = row?.original?.configuredChangeSources || 0
  return <ConfiguredLabel count={changeSourcesConfigured} />
}

const RenderServiceNameForCD: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => {
  return <ServiceName row={row} module={'cd'} />
}

const RenderGoToColumn: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => {
  const history = useHistory()
  const { identifier } = row?.original || {}
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  return (
    <Icon
      name="cv-main"
      size={20}
      className={css.srmIcon}
      onClick={
        /* istanbul ignore next */ () => {
          history.push(
            routes.toCVAddMonitoringServicesEdit({
              accountId,
              orgIdentifier,
              projectIdentifier,
              identifier,
              module: 'cv'
            })
          )
        }
      }
    />
  )
}

const CommonMonitoredServiceListView: React.FC<CommonMonitoredServiceListViewProps> = ({
  monitoredServiceListData,
  selectedFilter,
  onEditService,
  onDeleteService,
  setPage,
  config
}) => {
  const { getString } = useStrings()
  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = monitoredServiceListData || {}
  const isCDModule = getIfModuleIsCD(config)
  const {
    listing: { changeSource, agentConfiguration, goto }
  } = config || {}

  const RenderContextMenuForProjects: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => {
    const monitoredService = row.original
    const { projectIdentifier } = useParams<ProjectPathProps>()

    return (
      <>
        <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
          <ContextMenuActions
            titleText={getString('common.delete', { name: monitoredService.serviceName })}
            contentText={<ServiceDeleteContext serviceName={monitoredService.serviceName} />}
            confirmButtonText={getString('yes')}
            deleteLabel={getString('cv.monitoredServices.deleteService')}
            onDelete={
              /* istanbul ignore next */ () => {
                onDeleteService(monitoredService.identifier as string)
              }
            }
            editLabel={getString('cv.monitoredServices.editService')}
            onEdit={
              /* istanbul ignore next */ () => {
                onEditService(monitoredService.identifier as string)
              }
            }
            RbacPermissions={{
              edit: {
                permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              },
              delete: {
                permission: PermissionIdentifier.DELETE_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              }
            }}
          />
        </Layout.Horizontal>
      </>
    )
  }

  const RenderContextMenuForCD: Renderer<CellProps<MonitoredServicePlatformResponse>> = ({ row }) => {
    const monitoredService = row.original
    const { projectIdentifier } = useParams<ProjectPathProps>()

    return (
      <>
        <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
          <ContextMenuActions
            titleText={getString('common.delete', { name: monitoredService.serviceName })}
            contentText={<ServiceDeleteContext serviceName={monitoredService.serviceName} />}
            confirmButtonText={getString('yes')}
            deleteLabel={getString('cv.monitoredServices.deleteService')}
            onDelete={
              /* istanbul ignore next */ () => {
                onDeleteService(monitoredService.identifier as string)
              }
            }
            RbacPermissions={{
              edit: {
                permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              },
              delete: {
                permission: PermissionIdentifier.DELETE_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              }
            }}
          />
        </Layout.Horizontal>
      </>
    )
  }

  return (
    <Container padding={{ top: 'medium', left: 'xlarge', right: 'xlarge' }} height="inherit">
      <HelpPanel referenceId="monitoredServiceDetails" type={HelpPanelType.FLOATING_CONTAINER} />
      {content?.length ? (
        <>
          <Heading
            level={2}
            font={{ variation: FontVariation.H6 }}
            color={Color.GREY_800}
            padding={{ top: 'large', bottom: 'large' }}
          >
            {getListTitle(getString, selectedFilter, totalItems)}
          </Heading>
          <TableV2
            sortable={true}
            columns={[
              {
                Header: ' ',
                width: '2.5%',
                Cell: CategoryProps
              },
              {
                Header: getString('cv.commonMonitoredServices.monitoredService').toLocaleUpperCase(),
                width: '13.5%',
                Cell: isCDModule ? RenderServiceNameForCD : RenderServiceNameForProjects
              },
              {
                Header: getString('cv.commonMonitoredServices.healthSource').toLocaleUpperCase(),
                width: '13.5%',
                Cell: RenderHealthSourceForProjects
              },
              ...(changeSource
                ? [
                    {
                      Header: getString('cv.commonMonitoredServices.changeSource').toLocaleUpperCase(),
                      width: '13.5%',
                      Cell: RenderChangeSourceForProjects
                    }
                  ]
                : []),
              ...(agentConfiguration
                ? [
                    {
                      Header: getString('cv.commonMonitoredServices.agentConfiguration').toLocaleUpperCase(),
                      width: '13.5%',
                      Cell: <></>
                    }
                  ]
                : []),
              ...(goto
                ? [
                    {
                      Header: getString('cv.commonMonitoredServices.goTo').toLocaleUpperCase(),
                      width: '13.5%',
                      Cell: RenderGoToColumn
                    }
                  ]
                : []),
              {
                id: 'contextMenu',
                width: isCDModule ? '70.5%' : '30%',
                Cell: isCDModule ? RenderContextMenuForCD : RenderContextMenuForProjects
              }
            ]}
            data={content}
            pagination={{
              pageSize,
              pageIndex,
              pageCount: totalPages,
              itemCount: totalItems,
              gotoPage: nextPage => {
                setPage(nextPage)
              }
            }}
          />
        </>
      ) : content && !content.length ? (
        <NoDataCard
          image={noServiceAvailableImage}
          message={getString('cv.monitoredServices.youHaveNoMonitoredServices')}
          imageClassName={css.noServiceAvailableImage}
          containerClassName={css.noDataContainer}
        />
      ) : null}
    </Container>
  )
}

export default CommonMonitoredServiceListView
