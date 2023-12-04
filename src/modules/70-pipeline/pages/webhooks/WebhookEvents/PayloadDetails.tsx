/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer } from '@blueprintjs/core'
import { Container, Text, Layout, useToaster } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { drawerStates } from '@audit-trail/components/EventSummary/EventSummary'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useStrings } from 'framework/strings'
import { getReadableDateTime } from '@common/utils/dateUtils'
import type { PayloadDetails } from './WebhooksEventsList'
import css from './WebhooksEvents.module.scss'

interface PayloadDetailsInterface {
  onClose: () => void
  payloadDetails: PayloadDetails
}

export default function PayloadDetails(props: PayloadDetailsInterface): JSX.Element {
  const { onClose, payloadDetails } = props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const time = getReadableDateTime(payloadDetails.timestamp, 'hh:mm a')
  const date = getReadableDateTime(payloadDetails.timestamp, 'MMM DD, YYYY')

  const parsedPayload = React.useMemo(() => {
    let _parsedPaylod
    try {
      _parsedPaylod = JSON.parse(payloadDetails.payloadJSON)
    } catch (e) {
      // if the parsing fails show toaster and render empty payload in the YAML builder
      showError(e)
      _parsedPaylod = {}
    }
    return _parsedPaylod
  }, [payloadDetails.payloadJSON, showError])

  return (
    <Drawer className={css.drawer} {...drawerStates} onClose={onClose} isCloseButtonShown>
      <Container height="100%" padding="xlarge">
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.webhookEvents.payloadDetails')}</Text>
          <Layout.Horizontal flex padding="large">
            <Layout.Vertical>
              <Text className={css.marginBottom} color={Color.BLACK}>
                {getString('common.secret.timestamp')}
              </Text>
              <Text data-testid="payload-details-timestamp">{`${time} ${date}`}</Text>
            </Layout.Vertical>
            <Layout.Vertical>
              <Text className={css.marginBottom} color={Color.BLACK}>
                {getString('pipeline.webhookEvents.eventId')}
              </Text>
              <Text data-testid="payload-details-event-id">{payloadDetails.eventId}</Text>
            </Layout.Vertical>
            <Layout.Vertical></Layout.Vertical>
          </Layout.Horizontal>
          <YamlBuilder
            fileName={'Payload Details'}
            isReadOnlyMode={true}
            isEditModeSupported={false}
            hideErrorMesageOnReadOnlyMode={true}
            showCopyIcon={false}
            existingJSON={parsedPayload}
            customCss={css.builder}
            height={'calc(100vh - 210px'}
          />
        </Layout.Vertical>
      </Container>
    </Drawer>
  )
}
