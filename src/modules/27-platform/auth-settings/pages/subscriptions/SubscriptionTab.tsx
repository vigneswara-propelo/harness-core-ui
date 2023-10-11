/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState, useEffect } from 'react'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { SubscriptionTabNames, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { useQueryParams } from '@common/hooks'
import { ModuleName } from 'framework/types/ModuleName'
import type { AccountDTO, ModuleLicenseDTO } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import SubscriptionOverview from './overview/SubscriptionOverview'
import SubscriptionBanner from './SubscriptionBanner'
import SubscriptionPlans from './plans/SubscriptionPlans'

export interface SubscriptionTabInfo {
  name: SubscriptionTabNames
  label: keyof StringsMap
}

export const SUBSCRIPTION_TABS: SubscriptionTabInfo[] = [
  {
    name: SubscriptionTabNames.OVERVIEW,
    label: 'common.subscriptions.tabs.overview'
  },
  {
    name: SubscriptionTabNames.PLANS,
    label: 'common.subscriptions.tabs.plans'
  }
  // {
  //   name: SUBSCRIPTION_TAB_NAMES.BILLING,
  //   label: 'common.subscriptions.tabs.billing'
  // }
]

interface TrialInformation {
  days: number
  expiryDate: string
  isExpired: boolean
  expiredDays: number
  edition: Editions
  isFreeOrCommunity: boolean
}

interface SubscriptionTabProps {
  isPlansPage: boolean
  trialInfo: TrialInformation
  hasLicense?: boolean | ModuleLicenseDTO
  selectedModule: ModuleName
  licenseData?: ModuleLicenseDTO
  refetchGetLicense: () => void
  accountData?: AccountDTO
}

const SubscriptionTab = ({
  isPlansPage,
  accountData,
  trialInfo,
  selectedModule,
  hasLicense,
  licenseData,
  refetchGetLicense
}: SubscriptionTabProps): ReactElement => {
  const [selectedSubscriptionTab, setSelectedSubscriptionTab] = useState<SubscriptionTabInfo>(SUBSCRIPTION_TABS[0])
  let { tab: queryTab } = useQueryParams<{ tab?: SubscriptionTabNames }>()
  const { isFreeOrCommunity, edition, isExpired, expiredDays, days } = trialInfo

  useEffect(() => {
    if (isPlansPage) {
      queryTab = SubscriptionTabNames.PLANS
    } else {
      queryTab = SubscriptionTabNames.OVERVIEW
    }
    if (queryTab) {
      setSelectedSubscriptionTab(SUBSCRIPTION_TABS.find(tab => tab.name === queryTab) || SUBSCRIPTION_TABS[0])
    }
  }, [queryTab, isPlansPage])

  function getBanner(): React.ReactElement | null {
    if ((!isExpired && licenseData?.licenseType !== ModuleLicenseType.TRIAL && expiredDays > 14) || isFreeOrCommunity) {
      return null
    }

    return (
      <SubscriptionBanner
        module={selectedModule}
        edition={edition}
        days={days}
        expiredDays={expiredDays}
        isExpired={isExpired}
      />
    )
  }

  function getTabComponent(): React.ReactElement | null {
    switch (selectedSubscriptionTab.name) {
      case SubscriptionTabNames.PLANS:
        return <SubscriptionPlans module={selectedModule} />
      case SubscriptionTabNames.OVERVIEW:
      default:
        return (
          <SubscriptionOverview
            accountName={accountData?.name}
            module={selectedModule}
            licenseData={licenseData}
            trialInformation={trialInfo}
            refetchGetLicense={refetchGetLicense}
          />
        )
    }
  }

  return (
    <React.Fragment>
      {hasLicense && getBanner()}
      {getTabComponent()}
    </React.Fragment>
  )
}

export default SubscriptionTab
