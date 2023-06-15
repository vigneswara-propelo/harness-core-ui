/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Page, useToaster } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  useListMonitoredService,
  useSetHealthMonitoringFlag,
  useDeleteMonitoredService,
  useGetMonitoredServicePlatformList,
  GetMonitoredServicePlatformListQueryParams
} from 'services/cv'
import type { Module, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDeepCompareEffect } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import noServiceAvailableImage from '@cv/assets/noMonitoredServices.svg'
import { getErrorMessage, getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import CommonMonitoredServiceListView from '@cv/components/MonitoredServiceListWidget/components/CommonMonitoredServiceListView/CommonMonitoredServiceListView'
import { getIfModuleIsCD } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.utils'
import MonitoredServiceListView from './MonitoredServiceListView'
import { FilterTypes, MonitoredServiceListProps } from '../../CVMonitoredService.types'
import css from '../../CVMonitoredService.module.scss'

const MonitoredServiceList: React.FC<MonitoredServiceListProps> = ({
  page,
  setPage,
  createButton,
  environmentIdentifier,
  selectedFilter,
  onFilter,
  serviceCountData,
  serviceCountLoading,
  serviceCountErrorMessage,
  refetchServiceCountData,
  search,
  config
}) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const isCDModule = getIfModuleIsCD(config)

  const pathParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  }, [accountId, orgIdentifier, projectIdentifier])
  const projectRef = useRef(projectIdentifier)

  const commonQueryParams = useMemo(() => {
    return {
      offset: page,
      pageSize: 10,
      ...pathParams,
      filter: search,
      hideNotConfiguredServices: false,
      servicesAtRiskFilter: false
    }
  }, [page, pathParams, search])

  const srmListMonitoredServicesQueryParams = useMemo(() => {
    return {
      ...commonQueryParams,
      environmentIdentifier,
      servicesAtRiskFilter: selectedFilter === FilterTypes.RISK
    }
  }, [commonQueryParams, environmentIdentifier, selectedFilter])

  const platformListMonitoredServicesQueryParams = useMemo(() => {
    return {
      ...commonQueryParams,
      hideNotConfiguredServices: false,
      ...(isCDModule && {
        monitoredServiceType: 'Application' as GetMonitoredServicePlatformListQueryParams['monitoredServiceType']
      }),
      environmentIdentifiers: [environmentIdentifier as string]
    }
  }, [commonQueryParams, environmentIdentifier, isCDModule])

  const { mutate: setHealthMonitoringFlag, loading: healthMonitoringFlagLoading } = useSetHealthMonitoringFlag({
    identifier: ''
  })

  const { mutate: deleteMonitoredService, loading: deleteMonitoredServiceLoading } = useDeleteMonitoredService({
    queryParams: pathParams
  })

  const {
    data: srmMonitoredServiceListData,
    loading: srmMonitoredServiceListLoading,
    refetch: refetchSRMMonitoredServiceList,
    error: srmMonitoredServiceListError
  } = useListMonitoredService({
    lazy: true,
    queryParams: srmListMonitoredServicesQueryParams
  })

  const {
    data: platformMonitoredServiceListData,
    loading: platformMonitoredServiceListLoading,
    refetch: platformRefetchMonitoredServiceList,
    error: platformMonitoredServiceListError
  } = useGetMonitoredServicePlatformList({
    lazy: true,
    queryParams: platformListMonitoredServicesQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const refetchMonitoredServiceList = config ? platformRefetchMonitoredServiceList : refetchSRMMonitoredServiceList
  const monitoredServiceListError = config ? platformMonitoredServiceListError : srmMonitoredServiceListError
  const monitoredServiceListLoading = config ? platformMonitoredServiceListLoading : srmMonitoredServiceListLoading
  const monitoredServiceListData = config ? platformMonitoredServiceListData : srmMonitoredServiceListData
  const queryParams = config ? platformListMonitoredServicesQueryParams : srmListMonitoredServicesQueryParams

  useDeepCompareEffect(() => {
    // On mount call and filter update happens here
    if (projectRef.current === projectIdentifier) {
      refetchServiceCountData()
      refetchMonitoredServiceList({
        queryParams: queryParams
      })
    }
  }, [page, search, selectedFilter, environmentIdentifier])

  useDeepCompareEffect(() => {
    // Call during project change happens here
    if (projectRef.current !== projectIdentifier) {
      projectRef.current = projectIdentifier
      refetchServiceCountData({
        queryParams: {
          ...pathParams,
          filter: ''
        }
      })
      refetchMonitoredServiceList({
        queryParams: {
          ...queryParams,
          offset: 0,
          filter: '',
          servicesAtRiskFilter: false
        }
      })
    }
  }, [projectIdentifier])

  const onToggleService = async (identifier: string, checked: boolean): Promise<void> => {
    try {
      const response = await setHealthMonitoringFlag(undefined, {
        pathParams: {
          identifier
        },
        queryParams: {
          enable: checked,
          ...pathParams
        }
      })

      await Promise.all([refetchServiceCountData(), refetchMonitoredServiceList()])

      showSuccess(
        getString('cv.monitoredServices.monitoredServiceToggle', {
          enabled: response.resource?.healthMonitoringEnabled ? 'enabled' : 'disabled'
        })
      )
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const onDeleteService = async (identifier: string): Promise<void> => {
    try {
      await deleteMonitoredService(identifier)

      const { pageIndex = 0, pageItemCount } = defaultTo(monitoredServiceListData?.data, {})

      if (pageIndex && pageItemCount === 1) {
        setPage(page - 1)
        await refetchServiceCountData()
      } else {
        await Promise.all([refetchServiceCountData(), refetchMonitoredServiceList()])
      }

      showSuccess(getString('cv.monitoredServices.monitoredServiceDeleted'))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const onEditService = (identifier: string): void => {
    if (config) {
      const { module } = config
      history.push({
        pathname: routes.toMonitoredServicesConfigurations({
          ...pathParams,
          ...(module && { module: module as Module }),
          identifier
        })
      })
    } else {
      history.push({
        pathname: routes.toCVAddMonitoringServicesEdit({
          ...pathParams,
          identifier,
          module: 'cv'
        }),
        search: getCVMonitoringServicesSearchParam({ tab: MonitoredServiceEnum.Configurations })
      })
    }
  }

  return (
    <Page.Body
      loading={
        serviceCountLoading ||
        monitoredServiceListLoading ||
        deleteMonitoredServiceLoading ||
        healthMonitoringFlagLoading
      }
      error={serviceCountErrorMessage || getErrorMessage(monitoredServiceListError)}
      retryOnError={() => {
        if (serviceCountErrorMessage) {
          refetchServiceCountData()
        }
        if (monitoredServiceListError) {
          refetchMonitoredServiceList()
        }
      }}
      noData={{
        when: () => !serviceCountData?.allServicesCount,
        image: noServiceAvailableImage,
        imageClassName: css.noServiceAvailableImage,
        message: getString('cv.monitoredServices.youHaveNoMonitoredServices'),
        button: createButton
      }}
      className={css.pageBody}
    >
      {config ? (
        <CommonMonitoredServiceListView
          monitoredServiceListData={monitoredServiceListData?.data}
          selectedFilter={selectedFilter}
          onEditService={onEditService}
          onDeleteService={onDeleteService}
          setPage={setPage}
          config={config}
        />
      ) : (
        <MonitoredServiceListView
          serviceCountData={serviceCountData}
          refetchServiceCountData={refetchServiceCountData}
          monitoredServiceListData={monitoredServiceListData?.data}
          selectedFilter={selectedFilter}
          onFilter={onFilter}
          onEditService={onEditService}
          onDeleteService={onDeleteService}
          setPage={setPage}
          onToggleService={onToggleService}
          healthMonitoringFlagLoading={healthMonitoringFlagLoading}
        />
      )}
    </Page.Body>
  )
}

export default MonitoredServiceList
