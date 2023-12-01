/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO, CDModuleLicenseDTO } from 'services/cd-ng'
import { useGetCreditsByAccount } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useGetCredits } from 'services/ci'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import type { TrialInformation } from '../SubscriptionsPage'
import { BuildCreditInfoTable } from './BuildCreditInfoTable'
import SubscriptionUsageCard from './SubscriptionUsageCard'
import CETActiveAgentsCard from './CETActiveAgentsCard'
import SubscriptionTabPage from './SubscriptionTabPage'

interface SubscriptionOverviewProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
}

const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = props => {
  const { accountName, licenseData, module, trialInformation } = props
  const enabled = useFeatureFlag(FeatureFlag.VIEW_USAGE_ENABLED)
  const [filteredSmallestTime, setfilteredSmallestTime] = useState<number>(0)
  const { accountId } = useParams<AccountPathProps>()
  const { data: creditsData } = useGetCreditsByAccount({
    accountIdentifier: accountId
  })

  const {
    data: creditsUsed,
    refetch: refetchCreditsUsed,
    loading
  } = useGetCredits({
    queryParams: {
      accountIdentifier: accountId,
      startTime: filteredSmallestTime,
      endTime: Date.now()
    },
    lazy: true
  })
  useEffect(() => {
    const filteredData = creditsData?.data?.filter(d => d.creditStatus === 'ACTIVE')
    if (filteredData && filteredData?.length > 0) {
      const filteredSmallestTimeObject = filteredData?.reduce((prev, curr) =>
        (prev?.purchaseTime || 0) < (curr?.purchaseTime || 0) ? prev : curr
      )
      setfilteredSmallestTime(filteredSmallestTimeObject?.purchaseTime || 0)
    }
  }, [creditsData])

  useEffect(() => {
    if (filteredSmallestTime > 0) refetchCreditsUsed()
  }, [filteredSmallestTime])
  // call the get usage api ,call it creditsUsed

  return (
    <Layout.Vertical spacing="large" width={'90%'}>
      <SubscriptionDetailsCard
        accountName={accountName}
        module={module}
        licenseData={licenseData}
        trialInformation={trialInformation}
      />
      {enabled && licenseData && (
        <SubscriptionUsageCard
          loadingCredits={loading}
          module={module}
          licenseData={licenseData}
          creditsData={creditsData?.data}
          creditsUsed={creditsUsed?.data?.credits}
        />
      )}
      {licenseData && module === ModuleName.CET && <CETActiveAgentsCard />}
      <SubscriptionTabPage
        module={module}
        licenseData={licenseData}
        accountId={accountId}
        licenseType={(licenseData as CDModuleLicenseDTO)?.cdLicenseType}
      />
      {module === 'CI' ? (
        <BuildCreditInfoTable
          creditsUsed={creditsUsed?.data?.credits || 0}
          data={creditsData?.data || []}
          licenseData={(licenseData as ModuleLicenseDTO) || ''}
        />
      ) : null}
    </Layout.Vertical>
  )
}
export default SubscriptionOverview
