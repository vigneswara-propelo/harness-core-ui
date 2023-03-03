/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isNil } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import { Color, FontVariation } from '@harness/design-system'
import { Icon, ModalDialog, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { RevalidateFooter } from './RevalidateFooter'
import css from '../ValidationBadge.module.scss'

interface ValidationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  endTs?: number
  onRevalidate: () => Promise<void>
}

export function ValidationSuccessModal({
  isOpen,
  endTs,
  onClose,
  onRevalidate
}: ValidationSuccessModalProps): JSX.Element {
  const { getString } = useStrings()

  return (
    <ModalDialog
      isOpen={isOpen}
      enforceFocus={false}
      width={416}
      onClose={onClose}
      className={css.validationSuccessModal}
      title={
        <div className={css.title}>
          <Icon name="tick" color={Color.PRIMARY_6} size={32} />
          <div>
            <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
              {getString('pipeline.validation.pipelineValidated')}
            </Text>
            {!isNil(endTs) && Number.isFinite(endTs) && (
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
                <ReactTimeago date={endTs} live />
              </Text>
            )}
          </div>
        </div>
      }
      footer={<RevalidateFooter onClose={onClose} onRevalidate={onRevalidate} />}
    >
      <Text
        icon="success-tick"
        iconProps={{ size: 12 }}
        font={{
          variation: FontVariation.SMALL_SEMI
        }}
      >
        {getString('pipeline.validation.evaluatingPolicySets')}
      </Text>
    </ModalDialog>
  )
}
