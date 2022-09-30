/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { useGetOrganizationAggregateDTOList, useGetServiceList } from 'services/cd-ng'
import { ResourcesInterface, FreezeWindowLevels } from '@freeze-windows/types'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

interface FreezeStudioDataInterface extends ProjectPathProps {
  freezeWindowLevel: FreezeWindowLevels
}

export const useFreezeStudioData = ({
  accountId,
  freezeWindowLevel,
  projectIdentifier,
  orgIdentifier
}: FreezeStudioDataInterface): ResourcesInterface => {
  const {
    loading: loadingOrgs,
    data: orgsData,
    refetch: refetchOrgs
    // error: orgsError
  } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const {
    data: serviceData,
    // error,
    loading: loadingServices,
    refetch: refetchServices
  } = useGetServiceList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const [orgs, setOrgs] = React.useState<SelectOption[]>([])
  const [services, setServices] = React.useState<SelectOption[]>([])
  const [servicesMap, setServicesMap] = React.useState<Record<string, SelectOption>>({})
  // data.content[1].organizationResponse.organization.identifier
  React.useEffect(() => {
    refetchOrgs()
  }, [accountId])

  React.useEffect(() => {
    if (freezeWindowLevel === FreezeWindowLevels.PROJECT) {
      refetchServices()
    }
  }, [projectIdentifier, freezeWindowLevel])

  React.useEffect(() => {
    if (!loadingOrgs && orgsData?.data?.content) {
      const adaptedOrgsData = orgsData.data.content.map(org => {
        const organization = org?.organizationResponse?.organization
        return {
          label: organization?.name,
          value: organization?.identifier
        }
      })
      setOrgs(adaptedOrgsData)
    }
  }, [loadingOrgs])

  React.useEffect(() => {
    if (!loadingServices && serviceData?.data?.content) {
      const servicesMapp: Record<string, SelectOption> = { All: { label: 'All Services', value: 'All' } }
      const adaptedServicesData = serviceData?.data?.content.map(item => {
        const label = item?.service?.name || ''
        const obj = {
          label,
          value: item?.service?.identifier || ''
        }
        servicesMapp[label] = obj
        return obj
      })
      // data.serviceDeploymentDetailsList[0].serviceIdentifier
      setServices([{ label: 'All Services', value: 'All' }, ...adaptedServicesData])
      setServicesMap(servicesMapp)
    }
  }, [loadingServices])

  return {
    orgs,
    projects: [],
    services,
    servicesMap,
    freezeWindowLevel
  }
}
