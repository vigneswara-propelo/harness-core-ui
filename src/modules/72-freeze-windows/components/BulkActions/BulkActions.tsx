/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonSize, ButtonVariation, Layout } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import React, { FC } from 'react'
import { useStrings } from 'framework/strings'
import { useFreezeWindowListContext } from '@freeze-windows/context/FreezeWindowListContext'
import type { FreezeWindowListColumnActions } from '../FreezeWindowList/FreezeWindowListCells'

interface BulkActionsProps {
  onDelete: FreezeWindowListColumnActions['onDeleteRow']
  onToggleFreeze: FreezeWindowListColumnActions['onToggleFreezeRow']
}

export const BulkActions: FC<BulkActionsProps> = ({ onDelete, onToggleFreeze }) => {
  const { getString } = useStrings()
  const { selectedItems } = useFreezeWindowListContext()

  return selectedItems.length > 0 ? (
    <Layout.Horizontal spacing={'small'} flex={{ align: 'center-center' }}>
      <Button
        variation={ButtonVariation.SECONDARY}
        onClick={() => onToggleFreeze({ status: 'Enabled' })}
        text={getString('enable')}
        size={ButtonSize.SMALL}
      />
      <Button
        variation={ButtonVariation.SECONDARY}
        onClick={() => onToggleFreeze({ status: 'Disabled' })}
        text={getString('common.disable')}
        size={ButtonSize.SMALL}
      />
      <Button
        variation={ButtonVariation.SECONDARY}
        onClick={() => onDelete()}
        text={getString('delete')}
        size={ButtonSize.SMALL}
        intent={Intent.DANGER}
      />
    </Layout.Horizontal>
  ) : null
}
