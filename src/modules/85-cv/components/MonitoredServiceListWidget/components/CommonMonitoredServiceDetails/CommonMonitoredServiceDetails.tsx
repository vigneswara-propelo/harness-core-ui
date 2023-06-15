import React, { useEffect } from 'react'
import { Page, PageError } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import Configurations from '@cv/pages/monitored-service/components/Configurations/Configurations'
import { useGetMonitoredService } from 'services/cv'
import type { Module, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import DetailsToolbar from '@cv/pages/monitored-service/views/DetailsToolbar'
import DetailsHeaderTitle from '@cv/pages/monitored-service/views/DetailsHeaderTitle'
import DetailsBreadcrumb from '@cv/pages/monitored-service/views/DetailsBreadcrumb'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { isProjectChangedOnMonitoredService } from '@cv/pages/monitored-service/MonitoredServicePage.utils'
import type { MonitoredServiceConfig } from '../../MonitoredServiceListWidget.types'
import css from './CommonMonitoredServiceDetails.module.scss'

interface CommonMonitoredServiceDetailsProps {
  config: MonitoredServiceConfig
}

export default function CommonMonitoredServiceDetails(props: CommonMonitoredServiceDetailsProps): JSX.Element {
  const { config } = props
  const { module } = config
  const { getString } = useStrings()
  const history = useHistory()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const {
    data: monitoredServiceData,
    refetch: fetchMonitoredServiceData,
    loading,
    error
  } = useGetMonitoredService({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (identifier && fetchMonitoredServiceData) {
      fetchMonitoredServiceData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier])

  const { monitoredService, lastModifiedAt } = monitoredServiceData?.data ?? {}

  if (error) {
    /* istanbul ignore next */
    if (isProjectChangedOnMonitoredService(error, identifier)) {
      history.push(
        routes.toMonitoredServices({
          projectIdentifier,
          orgIdentifier,
          accountId,
          ...(module && { module: module as Module })
        })
      )
    } else {
      return <PageError message={getErrorMessage(error)} onClick={() => fetchMonitoredServiceData()} />
    }
  }

  return (
    <>
      {identifier ? (
        <Page.Header
          size="large"
          breadcrumbs={<DetailsBreadcrumb config={config} />}
          title={<DetailsHeaderTitle loading={loading} monitoredService={monitoredService} />}
          toolbar={
            <DetailsToolbar loading={loading} monitoredService={monitoredService} lastModifiedAt={lastModifiedAt} />
          }
          className={css.header}
        />
      ) : (
        <Page.Header
          breadcrumbs={<DetailsBreadcrumb config={config} />}
          title={getString('cv.monitoredServices.addNewMonitoredServices')}
        />
      )}

      <Configurations config={config} />
    </>
  )
}
