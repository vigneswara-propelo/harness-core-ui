/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Classes } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Layout, Dialog, getErrorInfoFromErrorObject, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { loadStripe } from '@stripe/stripe-js/pure'
import { Elements } from '@stripe/react-stripe-js'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Success } from '@auth-settings/components/Subscription/Success/Success'
import { Editions, SubscribeViews, SubscriptionProps, TimeType } from '@common/constants/SubscriptionTypes'
import { InvoiceDetailDTO, useCreateClientSecret } from 'services/cd-ng'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import CreditCardVerification from './CreditCardVerification'
import css from './CreditCardVerification.module.scss'

interface CreditCardWidgetReturns {
  openSubscribeModal: () => void
  closeSubscribeModal: () => void
}

interface ViewProps {
  onClose: () => void
}

/* istanbul ignore next */

const stripePromise = window.stripeApiKey ? loadStripe(window.stripeApiKey) : Promise.resolve(null)

const View: React.FC<ViewProps> = ({ onClose }) => {
  const [view, setView] = useState(SubscribeViews.CALCULATE)
  const [subscriptionProps, setSubscriptionProps] = useState<SubscriptionProps>({
    edition: Editions.FREE,
    premiumSupport: false,
    paymentFreq: TimeType.MONTHLY,
    subscriptionId: '',
    billingContactInfo: {
      name: '',
      email: '',
      billingAddress: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      companyName: ''
    },
    paymentMethodInfo: { paymentMethodId: '', cardType: '', expireDate: '', last4digits: '', nameOnCard: '' },
    productPrices: { monthly: [], yearly: [] },
    isValid: false
  })
  const [invoiceData, setInvoiceData] = useState<InvoiceDetailDTO>()
  const [clientSecret, setClientSecret] = useState<string>()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const { showError } = useToaster()
  const { email } = currentUserInfo

  const {
    mutate: createClientSecret,
    loading: loadingClientSecret,
    error
  } = useCreateClientSecret({
    queryParams: {
      accountIdentifier: accountId,
      billingEmail: email || ''
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  useEffect(() => {
    if (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }, [error])

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const response = await createClientSecret()
      setClientSecret(response?.data || '')
    }

    // call the function
    fetchData()
  }, [])

  if (view === SubscribeViews.SUCCESS) {
    return (
      <Success
        module={'cf'}
        subscriptionProps={subscriptionProps}
        invoiceData={invoiceData}
        className={css.success}
        onClose={onClose}
      />
    )
  }

  return !loadingClientSecret ? (
    <Layout.Vertical>
      <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
        <CreditCardVerification
          clientSecret={clientSecret || ''}
          setView={setView}
          subscriptionProps={subscriptionProps}
          setInvoiceData={setInvoiceData}
          setSubscriptionProps={setSubscriptionProps}
          onClose={onClose}
        />
      </Elements>
    </Layout.Vertical>
  ) : (
    <ContainerSpinner />
  )
}

export const useCreditCardWidget = ({ onClose }: { onClose?: () => void }): CreditCardWidgetReturns => {
  /* istanbul ignore next */
  const handleClose = (): void => {
    onClose?.()
    hideModal()
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={handleClose}
        isOpen
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
        isCloseButtonShown
      >
        <View onClose={handleClose} />
      </Dialog>
    ),
    []
  )
  const open = React.useCallback(() => {
    openModal()
  }, [openModal])

  return {
    openSubscribeModal: open,
    closeSubscribeModal: hideModal
  }
}
