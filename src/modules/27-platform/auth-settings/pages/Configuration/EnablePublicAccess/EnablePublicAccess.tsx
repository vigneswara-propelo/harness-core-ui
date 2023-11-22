/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useState } from 'react'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Intent } from '@blueprintjs/core'

import { Container, Card, Switch, Text, HarnessDocTooltip, useConfirmationDialog } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components'
import { setPublicAccessPromise } from 'services/cd-ng'
import css from './EnablePublicAccess.module.scss'

interface EnablePublicAccessProps {
  enabled?: boolean
  refetchAuthSettings: () => void
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const EnablePublicAccess: React.FC<EnablePublicAccessProps> = ({
  enabled,
  refetchAuthSettings,
  canEdit,
  setUpdating
}) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [loading, setLoading] = useState(false)
  const { accountId } = useParams<AccountPathProps>()

  const { openDialog: openEnablePublicAccessDialog } = useConfirmationDialog({
    contentText: enabled
      ? getString('platform.authSettings.publicAccess.resourcesNoLongerAccessible')
      : getString('platform.authSettings.publicAccess.resourcesWillBeAccessible'),
    titleText: enabled
      ? getString('platform.authSettings.publicAccess.modalTitleDisable')
      : getString('platform.authSettings.publicAccess.modalTitleEnable'),
    confirmButtonText: enabled ? getString('common.disable') : getString('enable'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async didConfirm => {
      if (didConfirm) {
        const newEnableValue = !enabled

        try {
          setLoading(true)
          setUpdating(true)
          const res = await setPublicAccessPromise({
            queryParams: {
              accountIdentifier: accountId
            },
            body: newEnableValue
          })
          if (res.resource) {
            // res.resource is expected as "true" if operation is successful—in both "enable" or "disable" cases
            showSuccess(getString('platform.authSettings.publicAccess.updatedPublicAccess'))
            refetchAuthSettings()
          } else {
            showError(defaultTo(res.responseMessages?.[0]?.message, getString('somethingWentWrong')))
          }
        } catch (error) {
          showError(defaultTo(get(error, 'data.message'), get(error, 'message')))
        } finally {
          setLoading(false)
          setUpdating(false)
        }
      }
    }
  })

  const onChange = (): void => {
    openEnablePublicAccessDialog()
  }

  return (
    <Container margin="xlarge">
      <Card className={css.card}>
        <Switch
          labelElement={
            <Text inline color={Color.BLACK} font={{ weight: 'bold', size: 'normal' }}>
              {getString('platform.authSettings.publicAccess.allowPublicResources')}
              <HarnessDocTooltip useStandAlone tooltipId="allowPublicResources" />
            </Text>
          }
          checked={enabled}
          onChange={onChange}
          disabled={!canEdit || loading}
          data-testid="toggle-enable-public-access"
        />
      </Card>
    </Container>
  )
}

export default EnablePublicAccess
