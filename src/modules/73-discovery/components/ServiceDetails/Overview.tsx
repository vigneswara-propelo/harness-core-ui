/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import React from 'react'
import { useStrings } from 'framework/strings'
import { useGetServiceFromK8SCustomService, useGetK8SCustomService } from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import ListItems from './ListItems'

interface Overview {
  infraId: string
  serviceId: string
}

const Overview: React.FC<Overview> = /* istanbul ignore next */ props => {
  const { infraId, serviceId } = props

  const { accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const { data: serviceData, loading: getServiceLoader } = useGetServiceFromK8SCustomService({
    agentIdentity: infraId,
    kcs_id: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const { data: serviceWorkloadData, loading: getServiceWorkloadLoading } = useGetK8SCustomService({
    agentIdentity: infraId,
    kcs_id: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  let totalReplicas = 0
  if (serviceWorkloadData && serviceWorkloadData.workloads) {
    serviceWorkloadData.workloads?.forEach(workload => {
      totalReplicas += workload?.replicas ? workload.replicas.length : 0
    })
  }

  return (
    <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Layout.Vertical style={{ width: '48%' }}>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
          {getString('common.serviceDetails')}
        </Text>
        {getServiceLoader ? (
          <Container height={'100%'} width={'100%'} flex={{ align: 'center-center' }}>
            <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
              <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
              <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
                {getString('loading')}
              </Text>
            </Layout.Vertical>
          </Container>
        ) : (
          <Layout.Vertical
            background={Color.WHITE}
            spacing="medium"
            style={{
              boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
              padding: '36px',
              borderRadius: '4px'
            }}
          >
            <ListItems
              title={getString('common.cluster')}
              content={
                <Text icon={'kubernetes-harness'} color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.agentID}
                </Text>
              }
            />
            <ListItems
              title={getString('common.namespace')}
              content={
                <Text icon={'kubernetes-harness'} color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.namespace}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            <ListItems
              title={getString('discovery.serviceDrawer.ipFamily')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.ipFamilies?.map(ipFamily => ipFamily).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <ListItems
              title={'IP Address'}
              content={
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.clusterIPs?.map(clusterIP => clusterIP).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            <ListItems
              title={getString('common.smtp.port')}
              content={
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.ports?.map(ports => ports.port).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />

            <ListItems
              title={'Target Port'}
              content={
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.ports?.map(ports => ports.targetPort).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            {serviceData?.spec?.selector ? (
              <ListItems
                title={getString('discovery.serviceDrawer.selector')}
                content={
                  <>
                    <Layout.Vertical width={'60%'}>
                      {Object.entries(serviceData?.spec?.selector).map(([key, value]) => {
                        return (
                          <Text
                            color={Color.GREY_700}
                            font={{ variation: FontVariation.BODY2 }}
                            lineClamp={1}
                            key={key}
                          >
                            {key}:{value}
                          </Text>
                        )
                      })}
                    </Layout.Vertical>
                  </>
                }
                padding={{ top: 'medium' }}
              />
            ) : (
              <></>
            )}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
      <Layout.Vertical style={{ width: '48%' }}>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
          {getString('discovery.serviceDrawer.workloads')}
        </Text>
        {getServiceWorkloadLoading ? (
          <Container height={'100%'} width={'100%'} flex={{ align: 'center-center' }}>
            <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
              <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
              <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
                {getString('loading')}
              </Text>
            </Layout.Vertical>
          </Container>
        ) : (
          <Layout.Vertical
            spacing="medium"
            background={Color.WHITE}
            style={{
              boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
              padding: '36px',
              borderRadius: '4px'
            }}
          >
            <ListItems
              title={getString('kind')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceWorkloadData?.kind}
                </Text>
              }
            />
            <ListItems
              title={getString('delegates.commandLineCreation.replicas')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {totalReplicas}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            {serviceWorkloadData && serviceWorkloadData?.workloads && serviceWorkloadData?.workloads[0]?.podLabels ? (
              <>
                <ListItems
                  title={getString('pipelineSteps.labelsLabel')}
                  content={
                    <Layout.Vertical width={'60%'}>
                      {Object.entries(serviceWorkloadData && serviceWorkloadData?.workloads[0]?.podLabels).map(
                        ([key, value]) => {
                          return (
                            <Text
                              color={Color.GREY_700}
                              font={{ variation: FontVariation.BODY2 }}
                              lineClamp={1}
                              key={key}
                            >
                              {key}:{value}
                            </Text>
                          )
                        }
                      )}
                    </Layout.Vertical>
                  }
                  padding={{ top: 'medium' }}
                />
                <Divider />
              </>
            ) : (
              <></>
            )}
            {serviceWorkloadData &&
            serviceWorkloadData?.workloads &&
            serviceWorkloadData?.workloads[0]?.podAnnotations ? (
              <ListItems
                title={getString('common.annotations')}
                content={
                  <Layout.Vertical width={'60%'}>
                    {Object.entries(serviceWorkloadData && serviceWorkloadData?.workloads[0]?.podAnnotations).map(
                      ([key, value]) => {
                        return (
                          <Text
                            color={Color.GREY_700}
                            font={{ variation: FontVariation.BODY2 }}
                            lineClamp={1}
                            key={key}
                          >
                            {key}:{value}
                          </Text>
                        )
                      }
                    )}
                  </Layout.Vertical>
                }
                padding={{ top: 'medium' }}
              />
            ) : (
              <></>
            )}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default Overview
