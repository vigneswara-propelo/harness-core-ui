/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Button, Page, ButtonVariation, Layout, Card, Text, useToggleOpen } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { StringKeys, useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import { ItemDTO, SubscriptionDetailDTO, useListSubscriptions } from 'services/cd-ng'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import { usePage } from '@common/pages/pageContext/PageProvider'
import { getSubscriptionByPaymentFrequency } from '@auth-settings/components/Subscription/subscriptionUtils'
import { SubmitTicketModal } from '@modules/10-common/components/ResourceCenter/SubmitTicketModal/SubmitTicketModal'
import SubscriptionTable from './SubscriptionTable'
import NoBills from './images/noBills.svg'
import BillingAdminsCard from './BillingAdminsCard'
import ActiveSubscriptionCard, { ActiveSubscriptionDetails } from './ActiveSubscriptionCard'
import PaymentMethods from './PaymentMethods'
import css from './BillingPage.module.scss'

const getActiveSubscriptionDetails = (items: SubscriptionDetailDTO[]): ActiveSubscriptionDetails => {
  const subscriptionDetails = {
    activeSubscriptionCount: 0,
    hasTeam: false,
    hasEnterprise: false,
    hasPremiumSupport: false
  }
  items?.forEach((item: SubscriptionDetailDTO) => {
    const isValid = new Date(defaultTo(item.latestInvoiceDetail?.periodEnd, 0) * 1000) < new Date()
    if (isValid) {
      subscriptionDetails.activeSubscriptionCount++
    }
    item?.latestInvoiceDetail?.items?.forEach((subs: ItemDTO) => {
      if (isValid && subs?.price?.metaData?.edition === Editions.TEAM) {
        subscriptionDetails.hasTeam = true
      }
      if (isValid && subs?.price?.metaData?.edition === Editions.ENTERPRISE) {
        subscriptionDetails.hasEnterprise = true
      }
    })
  })
  if (subscriptionDetails.hasEnterprise) {
    subscriptionDetails.hasTeam = false
  }
  return subscriptionDetails
}
export default function BillingPage(_props: { children?: JSX.Element }): JSX.Element {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { pageName } = usePage()
  const { currentUserInfo } = useAppStore()
  const { module } = useModuleInfo()
  const { trackPage, identifyUser } = useTelemetry()
  const history = useHistory()
  const [subscriptions, setsubscriptions] = useState<{ [key: string]: SubscriptionDetailDTO[] }>({})
  const { isOpen, open: openSubmitTicketModal, close: closeSubmitTicketModal } = useToggleOpen(false)

  const { data, loading } = useListSubscriptions({ queryParams: { accountIdentifier: accountId } })
  useEffect(() => {
    if (pageName) {
      identifyUser(currentUserInfo.email)
      trackPage(pageName, { module: module || '' })
    }
  }, [pageName])
  useEffect(() => {
    if (data?.data) {
      setsubscriptions(getSubscriptionByPaymentFrequency(data.data as SubscriptionDetailDTO[]))
    }
  }, [data])
  const activeSubscriptionDetails = React.useMemo(() => {
    return getActiveSubscriptionDetails(data?.data as SubscriptionDetailDTO[])
  }, [data?.data])
  const gotoSubscriptions = (): void =>
    history.push(routes.toSubscriptions({ moduleCard: module as Module, tab: 'PLANS', accountId }))
  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={getString('common.billing')}
        toolbar={
          <Button
            variation={ButtonVariation.PRIMARY}
            icon="contact-support"
            text={getString('common.contactSupport')}
            onClick={() => openSubmitTicketModal()}
          />
        }
      />
      <Page.Body>
        <Layout.Vertical spacing="xxlarge" padding="xlarge" className={css.billingPage}>
          <Layout.Horizontal flex className={css.topCards}>
            <ActiveSubscriptionCard loading={loading} activeSubscriptionDetails={activeSubscriptionDetails} />
            <PaymentMethods />
            <BillingAdminsCard />
          </Layout.Horizontal>

          {subscriptions[TimeType.YEARLY]?.length > 0 && (
            <SubscriptionTable frequency={TimeType.YEARLY} data={subscriptions[TimeType.YEARLY]} />
          )}
          {subscriptions[TimeType.MONTHLY]?.length > 0 && (
            <SubscriptionTable frequency={TimeType.MONTHLY} data={subscriptions[TimeType.MONTHLY]} />
          )}

          {!loading && isEmpty(subscriptions[TimeType.YEARLY]) && isEmpty(subscriptions[TimeType.MONTHLY]) && (
            <NoSubscriptionsCard gotoSubscriptions={gotoSubscriptions} getString={getString} />
          )}
        </Layout.Vertical>
      </Page.Body>
      <SubmitTicketModal isOpen={isOpen} close={closeSubmitTicketModal} />
    </>
  )
}

export const NoSubscriptionsCard = ({
  getString,
  gotoSubscriptions
}: {
  getString: (key: StringKeys, vars?: Record<string, any>) => string
  gotoSubscriptions: () => void
}): JSX.Element => (
  <Card className={css.billingList}>
    <img src={NoBills} width="25%" />
    <Text font={{ size: 'medium', weight: 'bold' }}>{getString('platform.authSettings.billingInfo.nobills')}</Text>
    <Text font={{ size: 'small' }}>{getString('platform.authSettings.billingInfo.firstSubscription')}</Text>
    <Button
      onClick={gotoSubscriptions}
      variation={ButtonVariation.PRIMARY}
      text={getString('platform.authSettings.billingInfo.explorePlans')}
    />
  </Card>
)
