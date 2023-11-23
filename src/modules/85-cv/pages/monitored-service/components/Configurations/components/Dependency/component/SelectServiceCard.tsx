/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect } from 'react'
import { Text, Container, Card, Checkbox, Icon, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { useGetMonitoredService } from 'services/cv'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import type { ServiceCardInterfaceProps, InfrastructureDependencyMetaData } from './SelectServiceCard.types'
import MonitoredServiceCategory from './components/MonitoredServiceCategory/MonitoredServiceCategory'
import K8sNamespaceAndWorkload from './components/K8sNamespaceAndWorkload/K8sNamespaceAndWorkload'
import { getConnectorRefFromChangeSourceService } from './components/SelectServiceCard.utils'
import { KUBERNETES_TYPE } from './SelectServiceCard.constants'
import css from './SelectServiceCard.module.scss'

export default function SelectServiceCard(props: ServiceCardInterfaceProps): JSX.Element | null {
  switch (props.monitoredService?.type) {
    case 'Application':
      return <ServiceCard {...props} />
    case 'Infrastructure':
      return <KubernetesServiceAPIWrapper {...props} />
    default:
      return null
  }
}

export function ServiceCardContent(props: ServiceCardInterfaceProps): JSX.Element {
  const { monitoredService, dependencyMetaData, onChange } = props
  const { serviceRef, identifier, type } = monitoredService || {}
  const isInfraType = type === 'Infrastructure'
  const typeField = isInfraType
    ? {
        type: KUBERNETES_TYPE as typeof KUBERNETES_TYPE,
        dependencyMetadata: {
          namespace: '',
          workload: ''
        }
      }
    : undefined
  const { getString } = useStrings()
  return (
    <Container flex>
      <Container flex>
        <Checkbox
          checked={Boolean(dependencyMetaData)}
          id={serviceRef}
          className={css.selectService}
          onChange={event =>
            onChange(event.currentTarget.checked, {
              monitoredServiceIdentifier: identifier,
              ...typeField
            })
          }
        />
        <Container>
          <Text>{serviceRef}</Text>
          <Text color={Color.GREY_200} font={{ size: 'small' }}>
            {`${getString('common.ID')}: ${serviceRef}`}
          </Text>
        </Container>
      </Container>
      <MonitoredServiceCategory type={type} />
    </Container>
  )
}

export function ServiceCard(props: ServiceCardInterfaceProps): JSX.Element {
  return (
    <Card className={css.serviceCard}>
      <ServiceCardContent {...props} />
    </Card>
  )
}

export function KubernetesServiceAPIWrapper(props: ServiceCardInterfaceProps): JSX.Element {
  const { monitoredService, dependencyMetaData } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const { data, loading, error, refetch } = useGetMonitoredService({
    identifier: monitoredService?.identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (dependencyMetaData?.monitoredServiceIdentifier && !(data || error) && !loading) {
      refetch()
    }
  }, [data, loading, error, dependencyMetaData?.monitoredServiceIdentifier])

  let content = <></>
  if (loading) {
    content = (
      <Layout.Vertical>
        <hr />
        <Icon name="spinner" />
      </Layout.Vertical>
    )
  } else if (error) {
    content = (
      <Layout.Vertical>
        <hr />
        <Text>{getErrorMessage(error)}</Text>
      </Layout.Vertical>
    )
  } else if (data?.data?.monitoredService) {
    content = <KubernetesServiceCard {...props} monitoredService={data?.data?.monitoredService || monitoredService} />
  }

  return (
    <Card className={css.serviceCard}>
      <ServiceCardContent {...props} />
      {content}
    </Card>
  )
}

export function KubernetesServiceCard(props: ServiceCardInterfaceProps): JSX.Element {
  const { monitoredService, dependencyMetaData, onChange, error = {} } = props
  const connectorIdentifier = useMemo(
    () => (dependencyMetaData ? getConnectorRefFromChangeSourceService(monitoredService, 'K8sCluster') : undefined),
    [dependencyMetaData, monitoredService]
  )

  return (
    <>
      <K8sNamespaceAndWorkload
        error={error[monitoredService.identifier] as string[]}
        connectorIdentifier={connectorIdentifier}
        dependencyMetaData={dependencyMetaData as InfrastructureDependencyMetaData}
        onChange={(namespace, workloads) =>
          onChange(true, {
            type: KUBERNETES_TYPE,
            monitoredServiceIdentifier: monitoredService?.identifier,
            dependencyMetadata: {
              namespace,
              workloads
            }
          })
        }
      />
    </>
  )
}
