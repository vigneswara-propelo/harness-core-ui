/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize, isEmpty } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { Text, Card, Layout, OverlaySpinner, ButtonVariation, Button } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetDefaultCard } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import amex from './images/amex.svg'
import visa from './images/visa.svg'
import discover from './images/discover.svg'
import mastercard from './images/mastercard.svg'
import { useCreditCardWidget } from './CreditCardWidget'
import css from './BillingPage.module.scss'

const cardByImageMap: { [key: string]: string } = {
  amex,
  discover,
  mastercard,
  visa
}
function PaymentMethods(): JSX.Element {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const {
    data,
    loading,
    refetch: refetchCards
  } = useGetDefaultCard({
    queryParams: { accountIdentifier: accountId }
  })
  const history = useHistory()
  const { openSubscribeModal } = useCreditCardWidget({
    onClose: () => {
      history.push(routes.toBilling({ accountId }))
      refetchCards()
    }
  })

  return (
    <OverlaySpinner show={loading}>
      <Card className={css.card}>
        <div className={css.adminAdd}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString('platform.authSettings.billingInfo.paymentMethods')}
          </Text>
          {
            /* istanbul ignore next */
            !isEmpty(data?.data) ? (
              <Button
                onClick={() => {
                  openSubscribeModal()
                }}
                variation={ButtonVariation.LINK}
                text={getString('platform.authSettings.updateCard')}
              />
            ) : (
              <Button
                variation={ButtonVariation.LINK}
                text={getString('platform.authSettings.addCard')}
                onClick={() => {
                  openSubscribeModal()
                }}
              />
            )
          }
        </div>

        {
          /* istanbul ignore next */
          !isEmpty(data?.data) && (
            <Layout.Horizontal
              className={css.paymentMethodBody}
              padding={{ top: 'medium', right: 'medium', bottom: 'medium' }}
            >
              <div className={css.brandImage}>
                <img
                  src={cardByImageMap[data?.data?.brand as string]}
                  alt={cardByImageMap[data?.data?.brand as string]}
                />
              </div>
              <Layout.Vertical>
                <Text color={Color.BLACK} padding={{ bottom: 'xsmall' }}>
                  {`${capitalize(data?.data?.brand)}
            ${getString('platform.authSettings.billingInfo.endingIn')} ${data?.data?.last4}
            `}
                </Text>
                <Text color={Color.GREY_700} font={{ size: 'xsmall' }}>
                  {`${getString('platform.authSettings.billingInfo.expires')} ${data?.data?.expireMonth}/${
                    data?.data?.expireYear
                  }`}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          )
        }
        {/* add card experience to be enabled later */}
        {/* <div className={css.centerText}>
        <Text font={{ variation: FontVariation.BODY }}>{getString('platform.authSettings.billingInfo.addCC')}</Text>
      </div> */}
      </Card>
    </OverlaySpinner>
  )
}

export default PaymentMethods
