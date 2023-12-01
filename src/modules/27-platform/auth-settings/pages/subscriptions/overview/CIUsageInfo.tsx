/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageError, OverlaySpinner } from '@harness/uicore'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO, CreditDTO } from 'services/cd-ng'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

interface ActiveDevelopersProps {
  useCredits?: boolean
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
}
interface CreditInfoProps {
  totalCredits: number
  expiryDate: string
  creditsUsed: number | undefined
  useCredits?: boolean
}

interface CIUsageInfoProps {
  loadingCredits?: boolean
  module: ModuleName
  licenseData: ModuleLicenseDTO
  creditsData?: CreditDTO[]
  creditsUsed?: number
}
const ActiveDevelopers: React.FC<ActiveDevelopersProps> = ({
  useCredits,
  subscribedUsers,
  activeUsers,
  rightHeader
}) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.activeDevelopers')
  const tooltip = getString('common.subscriptions.usage.ciTooltip')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const defaultRightHeader = rightHeader || getString('common.subscriptions.usage.last30days')
  const rightFooter = getString('common.usage')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader,
    tooltip,
    rightHeader: defaultRightHeader,
    hasBar,
    leftFooter,
    rightFooter,
    useCredits
  }
  return <UsageInfoCard {...props} />
}
const CreditInfo: React.FC<CreditInfoProps> = ({ totalCredits, expiryDate, creditsUsed, useCredits }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.availableCredits')
  const hasBar = true
  const leftBottomFooter = getString('common.subscribed')
  const leftFooter = getString('common.subscriptions.usage.available')
  const tooltip = getString('common.subscriptions.usage.creditTooltip')
  const tooltipExpiry = getString('common.subscriptions.usage.creditTooltipExpiry', { date: expiryDate })
  const defaultRightHeader = getString('common.subscriptions.usage.creditsRightHeader', {
    date: expiryDate
  })
  const props = {
    leftBottomFooter,
    creditsUsed: creditsUsed || 0,
    credits: totalCredits || 0,
    leftHeader,
    tooltip,
    tooltipExpiry,
    hasBar,
    leftFooter,
    rightHeader: '',
    rightFooter: defaultRightHeader || '',
    useCredits
  }
  return <UsageInfoCard {...props} />
}

export enum creditStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}
export const creditSum = (creditsData: CreditDTO[]): number => {
  let totalCredits = 0
  creditsData.forEach((cd: CreditDTO) => {
    if (cd.creditStatus !== creditStatus.EXPIRED) totalCredits = totalCredits + (cd.quantity || 0)
  })
  return totalCredits
}
const CIUsageInfo: React.FC<CIUsageInfoProps> = props => {
  const { creditsData, creditsUsed, loadingCredits } = props
  let totalCredits = 0

  let expiryDate = ''
  if (creditsData && creditsData.length > 0) {
    totalCredits = creditSum(creditsData)
    const expiryTimeStamp = creditsData[0].expiryTime
    expiryDate = moment(expiryTimeStamp).format('DD-MM-YYYY')
  }
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CI)

  const isLoading = limitData.loadingLimit || usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

  if (usageErrorMsg) {
    return (
      <ErrorContainer>
        <PageError message={usageErrorMsg} onClick={() => refetchUsage?.()} />
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
      <ActiveDevelopers
        rightHeader={usage?.ci?.activeCommitters?.displayName || ''}
        subscribedUsers={limit?.ci?.totalDevelopers || 0}
        activeUsers={usage?.ci?.activeCommitters?.count || 0}
        useCredits={false}
      />
      <OverlaySpinner show={loadingCredits || false}>
        <CreditInfo creditsUsed={creditsUsed} totalCredits={totalCredits} expiryDate={expiryDate} useCredits={true} />
      </OverlaySpinner>
    </Layout.Horizontal>
  )
}

export default CIUsageInfo
