/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Icon, ButtonProps } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useTestNotificationSetting, WebhookSettingDTO } from 'services/notifications'
import { TestStatus } from '@rbac/interfaces/Notifications'
import type { WebhookNotificationData } from './ConfigureWebhookNotifications'
import css from '../../ConfigureNotificationsModal.module.scss'

export const TestWebhookNotifications: React.FC<{
  data: WebhookNotificationData
  onClick?: () => Promise<boolean>
  buttonProps?: ButtonProps
}> = ({ data, onClick, buttonProps }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.INIT)
  const { mutate: testNotificationSetting } = useTestNotificationSetting({})
  const { showSuccess, showError } = useToaster()

  const handleTest = async (testData: WebhookNotificationData): Promise<void> => {
    if (onClick) {
      const success = await onClick()
      if (!success) return
    }
    try {
      setTestStatus(TestStatus.INIT)
      const resp = await testNotificationSetting({
        accountId,
        type: 'WEBHOOK',
        recipient: testData.webhookUrl,
        // this is hardcoded as this is a mandatory field in the test api, it is used for logging and in exception which comes while sending notification
        notificationId: 'webhookNotification'
      } as WebhookSettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('rbac.notifications.webhookTestSuccess'))
        setTestStatus(TestStatus.SUCCESS)
      } else {
        showError(getString('somethingWentWrong'))
        setTestStatus(TestStatus.FAILED)
      }
    } catch (err) {
      showError(getString('rbac.notifications.invalidWebhookURL'))
      setTestStatus(TestStatus.ERROR)
    }
  }
  return (
    <>
      <Button
        text={getString('test')}
        disabled={!data.webhookUrl?.length}
        tooltipProps={{ dataTooltipId: 'testWebhookConfigButton' }}
        onClick={() => handleTest(data)}
        {...buttonProps}
      />
      {testStatus === TestStatus.SUCCESS ? <Icon name="tick" className={cx(css.statusIcon, css.green)} /> : null}
      {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
        <Icon name="cross" className={cx(css.statusIcon, css.red)} />
      ) : null}
    </>
  )
}
