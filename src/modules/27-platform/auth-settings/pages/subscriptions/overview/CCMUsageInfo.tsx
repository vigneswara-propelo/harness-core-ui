/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Layout, PageError } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetCCMExpiryTimeStamp, useGetCCMTimeStamp, useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { AccountPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { useGetCCMLicenseUsage } from 'services/ce'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

const ActiveCloudSpend: React.FC<{
  activeCloudSpend: number
  subscribedCloudSpend: number
  displayName: string | undefined
  tooltip: string
  heading?: string
}> = ({ activeCloudSpend, subscribedCloudSpend, displayName, heading, tooltip }) => {
  const prefix = '$'
  const { getString } = useStrings()
  const leftHeader = heading || getString('common.subscriptions.usage.cloudSpend')
  const rightHeader = displayName
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedCloudSpend,
    usage: activeCloudSpend,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter,
    prefix
  }
  return <UsageInfoCard {...props} />
}

const CCMUsageInfo: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CE)
  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData
  const ccmStartTimestamp = useGetCCMTimeStamp()
  const ccmExpiryTimestamp = useGetCCMExpiryTimeStamp()

  const [annualizedSpendTimestamp, buffer] = useMemo(() => {
    const currentTimestamp = moment()
    const hasStartTime = moment(ccmStartTimestamp).year() >= 2015
    if (hasStartTime) {
      const diffInDays = currentTimestamp.diff(moment(ccmStartTimestamp), 'days')
      const maxAllowedDate =
        diffInDays > 365 ? moment(ccmStartTimestamp).add(Math.floor(diffInDays / 365), 'years') : ccmStartTimestamp
      const calculationPeriod = currentTimestamp.diff(maxAllowedDate, 'days')
      const daysBuffer = calculationPeriod > 30 ? 30 : calculationPeriod
      return [currentTimestamp.subtract(daysBuffer, 'days').valueOf(), daysBuffer]
    } else {
      const ccmCurrentYearDate = moment(ccmExpiryTimestamp).year(moment().year())
      const diffInDays = currentTimestamp.diff(ccmCurrentYearDate, 'days')
      const daysBuffer = diffInDays < 0 || diffInDays > 30 ? 30 : diffInDays
      return [currentTimestamp.subtract(daysBuffer, 'days').valueOf(), daysBuffer]
    }
  }, [ccmStartTimestamp, ccmExpiryTimestamp])

  const {
    data: ccmUsageData,
    error: ccmUsageError,
    refetch: ccmUsageRefetch
  } = useGetCCMLicenseUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp: annualizedSpendTimestamp
    }
  })

  if (usageErrorMsg || ccmUsageError) {
    return (
      <ErrorContainer>
        <PageError
          message={usageErrorMsg || ccmUsageError}
          onClick={() => {
            if (usageErrorMsg) {
              refetchUsage?.()
            } else if (ccmUsageError) {
              ccmUsageRefetch()
            }
          }}
        />
      </ErrorContainer>
    )
  }

  if (limitErrorMsg) {
    return (
      <ErrorContainer>
        <PageError message={limitErrorMsg} onClick={() => refetchLimit?.()} />
      </ErrorContainer>
    )
  }

  return (
    <Layout.Horizontal spacing="large">
      <ActiveCloudSpend
        activeCloudSpend={usage?.ccm?.activeSpend?.count as number}
        subscribedCloudSpend={limit?.ccm?.totalSpendLimit || 0}
        displayName={usage?.ccm?.activeSpend?.displayName}
        tooltip={getString('common.subscriptions.usage.ccmTooltip')}
      />
      <ActiveCloudSpend
        activeCloudSpend={(((ccmUsageData?.data?.activeSpend?.count || 0) / buffer) * 365) as number}
        subscribedCloudSpend={limit?.ccm?.totalSpendLimit || 0}
        displayName={usage?.ccm?.activeSpend?.displayName}
        heading={getString('common.subscriptions.usage.annualizedCloudSpend')}
        tooltip={getString('common.subscriptions.usage.annualizedSpendTooltip')}
      />
    </Layout.Horizontal>
  )
}

export default CCMUsageInfo
