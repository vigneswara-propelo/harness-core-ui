/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useImperativeHandle, useState, useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import { Classes, Position, Menu } from '@blueprintjs/core'
import { Button, ButtonSize, Icon, Layout, Popover, Text, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ServiceResponseDTO, useGetServiceHeaderInfo, useGetSettingValue } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type {
  GitQueryParams,
  ModulePathParams,
  ProjectPathProps,
  ServicePathProps
} from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ServiceHeaderRefetchRef } from '@cd/components/Services/ServiceStudio/ServiceStudio'
import { useServiceContext } from '@cd/context/ServiceContext'
import { ServiceTabs, getRemoteServiceQueryParams } from '@cd/components/Services/utils/ServiceUtils'
import { DeploymentTypeIcons } from '@cd/components/DeploymentTypeIcons/DeploymentTypeIcons'
import {
  EntityCachedCopy,
  EntityCachedCopyHandle
} from '@pipeline/components/PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import { StoreType } from '@common/constants/GitSyncTypes'
import { SettingType } from '@modules/10-common/constants/Utils'
import ServiceDeleteMenuItem from '../../Services/ServicesListColumns/ServiceDeleteMenuItem'
import notificationImg from './notificationImg.svg'
import css from '@cd/components/ServiceDetails/ServiceDetailsHeader/ServiceDetailsHeader.module.scss'

interface ServiceDetailHeaderProps {
  handleReloadFromCache: () => void
  service: ServiceResponseDTO
}

export const ServiceDetailsHeader = (
  props: ServiceDetailHeaderProps,
  ref: React.ForwardedRef<ServiceHeaderRefetchRef>
): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier, serviceId, module } = useParams<
    ProjectPathProps & ModulePathParams & ServicePathProps
  >()
  const { handleReloadFromCache, service } = props
  const { getString } = useStrings()
  const {
    serviceResponse,
    hasRemoteFetchFailed,
    setDrawerOpen,
    notificationPopoverVisibility,
    setNotificationPopoverVisibility
  } = useServiceContext()
  const { tab, storeType, connectorRef, repoName, branch = '' } = useQueryParams<{ tab: string } & GitQueryParams>()
  const { CDC_SERVICE_DASHBOARD_REVAMP_NG, CDS_SERVICE_GITX } = useFeatureFlags()
  const showNotificationIcon = CDC_SERVICE_DASHBOARD_REVAMP_NG && (!tab || tab === ServiceTabs.SUMMARY)
  const { updateQueryParams } = useUpdateQueryParams()
  const history = useHistory()
  const [menuOpen, setMenuOpen] = useState(false)

  const gitDetails = serviceResponse?.entityGitDetails

  const { loading, error, data, refetch } = useGetServiceHeaderInfo({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId,
      ...(storeType === StoreType.REMOTE
        ? {
            connectorRef,
            repoName,
            ...(branch ? { branch } : { loadFromFallbackBranch: true })
          }
        : {})
    }
  })

  const { data: forceDeleteSettings } = useGetSettingValue({
    identifier: SettingType.ENABLE_FORCE_DELETE,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: false
  })

  const remoteQueryParams = getRemoteServiceQueryParams(service)

  //handler for attaching refetch function to the parent ref
  useImperativeHandle(ref, () => ({
    refetchData() {
      refetch()
    }
  }))

  useDocumentTitle([data?.data?.name || getString('services')])

  const serviceCachedCopyRef = React.useRef<EntityCachedCopyHandle | null>(null)
  const isServiceRemote = storeType === StoreType.REMOTE

  const isForceDeleteEnabled = useMemo(
    () => forceDeleteSettings?.data?.value === 'true',
    [forceDeleteSettings?.data?.value]
  )

  const onGitBranchChange = (selectedFilter: { branch: string }): void => {
    updateQueryParams({ branch: selectedFilter.branch })
  }

  const renderRemoteDetails = (): JSX.Element | null => {
    return CDS_SERVICE_GITX && storeType === StoreType.REMOTE ? (
      <div className={css.gitRemoteDetailsWrapper}>
        <GitRemoteDetails
          connectorRef={connectorRef}
          repoName={defaultTo(gitDetails?.repoName, repoName)}
          filePath={defaultTo(gitDetails?.filePath, '')}
          fileUrl={defaultTo(gitDetails?.fileUrl, '')}
          branch={defaultTo(gitDetails?.branch, branch)}
          onBranchChange={onGitBranchChange}
          flags={{
            readOnly: false
          }}
        />
        {!hasRemoteFetchFailed && (
          <EntityCachedCopy
            ref={serviceCachedCopyRef}
            reloadContent={getString('service')}
            cacheResponse={serviceResponse?.cacheResponseMetadataDTO}
            reloadFromCache={handleReloadFromCache}
            repo={defaultTo(gitDetails?.repoName, repoName)}
            filePath={defaultTo(gitDetails?.filePath, '')}
          />
        )}
      </div>
    ) : null
  }

  const TitleComponent =
    data?.data && !loading && !error ? (
      <Layout.Horizontal padding={{ right: 'medium' }} width="100%">
        <Layout.Horizontal margin={{ right: 'small' }}>
          <DeploymentTypeIcons
            deploymentTypes={defaultTo(data.data.deploymentTypes, [])}
            deploymentIconList={defaultTo(data.data.deploymentIconList, [])}
            size={38}
          />
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} className={css.serviceDetails}>
          <Layout.Horizontal spacing={'small'}>
            <Layout.Vertical
              className={cx(isServiceRemote ? css.detailsSectionForRemote : css.detailsSection)}
              spacing={'small'}
            >
              <Text font={{ variation: FontVariation.BODY2 }} className={css.textOverflow}>
                {data.data.name}
              </Text>
              <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.textOverflow}>
                {`${getString('common.ID')}: ${serviceId}`}
              </Text>
              {data.data.description && (
                <Text font={{ size: 'small' }} color={Color.GREY_500} width={800} lineClamp={1}>
                  {data.data.description}
                </Text>
              )}
            </Layout.Vertical>
            {renderRemoteDetails()}
          </Layout.Horizontal>
          <Layout.Horizontal flex>
            <Layout.Vertical padding={{ right: showNotificationIcon ? 'xxlarge' : '' }}>
              <Layout.Horizontal margin={{ bottom: 'small' }}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK} margin={{ right: 'small' }}>
                  {getString('created')}
                </Text>
                <Text font={{ size: 'small' }}>{getReadableDateTime(data.data.createdAt, 'MMM DD, YYYY hh:mm a')}</Text>
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK} margin={{ right: 'small' }}>
                  {getString('lastUpdated')}
                </Text>
                <Text font={{ size: 'small' }}>
                  {getReadableDateTime(data.data.lastModifiedAt, 'MMM DD, YYYY hh:mm a')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical flex>
              {showNotificationIcon && (
                <Popover
                  interactionKind="click"
                  popoverClassName={Classes.DARK}
                  position={Position.LEFT}
                  isOpen={notificationPopoverVisibility}
                  content={
                    <Layout.Horizontal className={css.notificationPopover}>
                      <img src={notificationImg} alt={getString('cd.openTask.notificationImgAlt')} height={80} />
                      <Layout.Vertical padding={{ left: 'medium' }}>
                        <Text
                          font={{ variation: FontVariation.SMALL, weight: 'bold' }}
                          color={Color.GREY_100}
                          padding={{ bottom: 'xsmall' }}
                        >
                          {getString('cd.openTask.notificationPopoverExpression')}
                        </Text>
                        <Text
                          font={{ variation: FontVariation.SMALL }}
                          color={Color.GREY_100}
                          lineClamp={2}
                          padding={{ bottom: 'medium' }}
                        >
                          {getString('cd.openTask.notificationPopoverMsg')}
                        </Text>
                        <Button
                          size={ButtonSize.SMALL}
                          className={css.notificationPopoverBtn}
                          text={getString('common.gotIt')}
                          onClick={() => setNotificationPopoverVisibility?.(false)}
                        />
                      </Layout.Vertical>
                    </Layout.Horizontal>
                  }
                >
                  <Icon
                    name="right-bar-notification"
                    size={24}
                    className={css.cursor}
                    onClick={() => {
                      setDrawerOpen?.(true)
                      setNotificationPopoverVisibility?.(false)
                    }}
                  />
                </Popover>
              )}

              <Button
                variation={ButtonVariation.ICON}
                icon="Options"
                tooltip={
                  <Menu
                    className={css.optionsMenu}
                    onClick={e => {
                      e.stopPropagation()
                    }}
                  >
                    <ServiceDeleteMenuItem
                      identifier={data?.data?.identifier || ''}
                      name={data?.data?.name || ''}
                      remoteQueryParams={remoteQueryParams}
                      onServiceDeleteSuccess={() => {
                        history.push(routes.toServices({ accountId, projectIdentifier, orgIdentifier, module }))
                      }}
                      onDeleteModalClose={() => {
                        setMenuOpen(false)
                      }}
                      isForceDeleteEnabled={isForceDeleteEnabled}
                    />
                  </Menu>
                }
                tooltipProps={{
                  interactionKind: 'click',
                  onInteraction: nextOpenState => {
                    setMenuOpen(nextOpenState)
                  },
                  isOpen: menuOpen,
                  position: Position.LEFT,
                  className: Classes.DARK
                }}
                onClick={() => {
                  setMenuOpen(true)
                }}
              />
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>
    ) : (
      <Layout.Horizontal>
        <Text
          font={{ variation: FontVariation.BODY2 }}
          className={cx(css.textOverflow, isServiceRemote ? css.detailsSectionForRemote : css.detailsSection)}
        >
          {`${getString('common.ID')}: ${serviceId}`}
        </Text>
        {renderRemoteDetails()}
      </Layout.Horizontal>
    )

  return (
    <Page.Header
      title={TitleComponent}
      className={cx(css.header, { [css.headerWithDescShown]: data?.data?.description })}
      size="large"
      breadcrumbs={
        <NGBreadcrumbs
          links={[
            {
              url: routes.toServices({ orgIdentifier, projectIdentifier, accountId, module }),
              label: getString('services')
            }
          ]}
        />
      }
    />
  )
}

export const ServiceDetailHeaderRef = React.forwardRef(ServiceDetailsHeader)
