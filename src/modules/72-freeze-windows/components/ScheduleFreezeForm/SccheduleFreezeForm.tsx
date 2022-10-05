/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'

interface ScheduleFreezeFormProps {
  onSave?: () => void
  onCancel?: () => void
}

export const ScheduleFreezeForm: FC<ScheduleFreezeFormProps> = ({ onSave, onCancel }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical margin={{ top: 'large', bottom: 'xxlarge' }}>
      <Layout.Horizontal spacing="small">
        <Button text={getString('save')} variation={ButtonVariation.PRIMARY} onClick={onSave} type="submit" />
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
