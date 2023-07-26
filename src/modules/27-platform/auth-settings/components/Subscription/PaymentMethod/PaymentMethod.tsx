/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Text, TextInput, Card, Checkbox } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { CardElement } from '@stripe/react-stripe-js'
import { useStrings } from 'framework/strings'
import { killEvent } from '@common/utils/eventUtils'
import PowerByStripe from './img/powered_by_stripe.svg'
import css from '../BillingInfo/BillingInfo.module.scss'

interface PaymentMethodProps {
  nameOnCard: string
  setNameOnCard: (value: string) => void
  setValidCard: (value: boolean) => void
  setSaveChecked: (value: boolean) => void
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ nameOnCard, setNameOnCard, setValidCard, setSaveChecked }) => {
  const { getString } = useStrings()
  const [saveCardChecked, setsaveCardChecked] = useState<boolean>()
  const setValid = (data: { complete: boolean }): void => {
    setValidCard(data.complete)
  }
  return (
    <Card className={css.paymentCard}>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ alignItems: 'start', justifyContent: 'space-between' }}>
          <Layout.Vertical width={'55%'}>
            <Text padding={{ bottom: 'large' }} font={{ variation: FontVariation.H5 }}>
              {getString('platform.authSettings.billingInfo.paymentMethod')}
            </Text>
          </Layout.Vertical>
          <img src={PowerByStripe} alt="" aria-hidden className={css.powerByStripe} />
        </Layout.Horizontal>
        <Layout.Horizontal className={css.paymentgrid}>
          <Layout.Vertical width={'35%'}>
            <Text padding={{ bottom: 'small' }}>{getString('common.nameOnCard')}</Text>
            <TextInput
              data-testid="nameOnCard"
              value={nameOnCard}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNameOnCard(e.target.value)
              }}
            />
          </Layout.Vertical>
          <Layout.Vertical width={'55%'}>
            <Text padding={{ bottom: 'small' }}>{getString('common.cardNumber')}</Text>
            <div className={css.creditCard}>
              <CardElement
                options={{ hidePostalCode: true }}
                onReady={() => setValid({ complete: false })}
                onChange={setValid}
              />
            </div>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Horizontal>
          <Checkbox
            checked={saveCardChecked}
            data-testid="row-checkbox"
            onClick={e => {
              killEvent(e)
              setsaveCardChecked(!saveCardChecked)
              setSaveChecked(!saveCardChecked)
            }}
          ></Checkbox>
          <Text
            font={{ size: 'small', weight: 'bold' }}
            iconProps={{ color: Color.PRIMARY_7 }}
            padding="small"
            className={css.warning}
          >
            {getString('platform.authSettings.billingInfo.saveCardWarning')}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}

export default PaymentMethod
