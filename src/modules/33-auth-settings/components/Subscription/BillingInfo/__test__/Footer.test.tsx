/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { TestWrapper } from '@common/utils/testUtils'
import { SubscribeViews } from '@common/constants/SubscriptionTypes'
import { Footer } from '../../PaymentMethod/Footer'

const clientSecret = 'dummy secret'
const stripePromise = loadStripe('dummy promise')

describe('BillingInfo', () => {
  const setLoadPaymentMethodStep = jest.fn()
  const setViewMock = jest.fn()
  test('footer ,testing back click', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <Footer
            loadPaymentMethodStep={false}
            setLoadPaymentMethodStep={(value: boolean) => setLoadPaymentMethodStep(value)}
            addCard={true}
            canPay={true}
            setView={setViewMock}
            setInvoiceData={jest.fn()}
            nameOnCard={'abcd'}
            billingInfo={{
              email: 'abcd@gmail.com',
              name: 'abcd',
              billingAddress: 'adsada',
              city: 'asdsd',
              state: 'sdd',
              country: 'dsda',
              zipCode: 'sdssa',
              companyName: 'dasdsa'
            }}
            subscriptionId={'mnop'}
            setBillingContactInfo={jest.fn()}
            setPaymentMethodInfo={jest.fn()}
            paymentMethodInfo={{
              paymentMethodId: 'sdad',
              cardType: 'visa',
              expireDate: '12/24',
              last4digits: '1234',
              nameOnCard: 'abcd'
            }}
          />
        </Elements>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('footer element for card element')
    await userEvent.click(getByText('back'))
    await waitFor(() => {
      expect(setLoadPaymentMethodStep).toBeCalled()
      expect(setViewMock).toBeCalledWith(SubscribeViews.PAYMENT_METHOD)
    })
  })

  test('footer, testing back click with no add card', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <Footer
            loadPaymentMethodStep={false}
            setLoadPaymentMethodStep={(value: boolean) => setLoadPaymentMethodStep(value)}
            addCard={false}
            canPay={true}
            setView={setViewMock}
            setInvoiceData={jest.fn()}
            nameOnCard={'abcd'}
            billingInfo={{
              email: 'abcd@gmail.com',
              name: 'abcd',
              billingAddress: 'adsada',
              city: 'asdsd',
              state: 'sdd',
              country: 'dsda',
              zipCode: 'sdssa',
              companyName: 'dasdsa'
            }}
            subscriptionId={'mnop'}
            setBillingContactInfo={jest.fn()}
            setPaymentMethodInfo={jest.fn()}
            paymentMethodInfo={{
              paymentMethodId: 'sdad',
              cardType: 'visa',
              expireDate: '12/24',
              last4digits: '1234',
              nameOnCard: 'abcd'
            }}
          />
        </Elements>
      </TestWrapper>
    )

    await userEvent.click(getByText('back'))
    await waitFor(() => {
      expect(setLoadPaymentMethodStep).toBeCalled()
      expect(setViewMock).toBeCalledWith(SubscribeViews.BILLINGINFO)
    })
  })

  test('footer, testing next click with  add card true and loadPaymentMethodStep as false', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <Footer
            loadPaymentMethodStep={false}
            setLoadPaymentMethodStep={(value: boolean) => setLoadPaymentMethodStep(value)}
            addCard={true}
            canPay={true}
            setView={setViewMock}
            setInvoiceData={jest.fn()}
            nameOnCard={'abcd'}
            billingInfo={{
              email: 'abcd@gmail.com',
              name: 'abcd',
              billingAddress: 'adsada',
              city: 'asdsd',
              state: 'sdd',
              country: 'dsda',
              zipCode: 'sdssa',
              companyName: 'dasdsa'
            }}
            subscriptionId={'mnop'}
            setBillingContactInfo={jest.fn()}
            setPaymentMethodInfo={jest.fn()}
            paymentMethodInfo={{
              paymentMethodId: 'sdad',
              cardType: 'visa',
              expireDate: '12/24',
              last4digits: '1234',
              nameOnCard: 'abcd'
            }}
          />
        </Elements>
      </TestWrapper>
    )

    await userEvent.click(getByText('authSettings.billing.next'))
    await waitFor(() => {
      expect(setLoadPaymentMethodStep).toBeCalled()
      expect(setViewMock).toBeCalledWith(SubscribeViews.PAYMENT_METHOD)
    })
  })

  test('footer, testing next click with add card false and loadPaymentMethodStep as false', async () => {
    const setPaymentMethodInfo = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <Footer
            loadPaymentMethodStep={false}
            setLoadPaymentMethodStep={(value: boolean) => setLoadPaymentMethodStep(value)}
            addCard={false}
            canPay={true}
            setView={setViewMock}
            setInvoiceData={jest.fn()}
            nameOnCard={'abcd'}
            billingInfo={{
              email: 'abcd@gmail.com',
              name: 'abcd',
              billingAddress: 'adsada',
              city: 'asdsd',
              state: 'sdd',
              country: 'dsda',
              zipCode: 'sdssa',
              companyName: 'dasdsa'
            }}
            subscriptionId={'mnop'}
            setBillingContactInfo={jest.fn()}
            setPaymentMethodInfo={setPaymentMethodInfo}
            paymentMethodInfo={{
              paymentMethodId: 'sdad',
              cardType: 'visa',
              expireDate: '12/24',
              last4digits: '1234',
              nameOnCard: 'abcd'
            }}
          />
        </Elements>
      </TestWrapper>
    )

    await userEvent.click(getByText('authSettings.paymentMethod.next'))
    await waitFor(() => {
      expect(setPaymentMethodInfo).toBeCalled()
      expect(setViewMock).toBeCalledWith(SubscribeViews.FINALREVIEW)
    })
  })
})
