import React from 'react'
import { Icon } from '@harness/icons'
import { Button, ButtonSize, ButtonVariation, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './RuntimeInputs.module.scss'

export interface RuntimeInputsHeaderProps {
  isReadonly: boolean
  onApply: () => void
  onDiscard: () => void
}

export function RuntimeInputsHeader({ isReadonly, onApply, onDiscard }: RuntimeInputsHeaderProps): JSX.Element {
  const { getString } = useStrings()

  return (
    <div className={css.header}>
      <div className={css.title}>
        <Icon name="pipeline-variables" size={24} color={Color.GREY_400} />
        <Text font={{ variation: FontVariation.H5 }} tooltipProps={{ dataTooltipId: 'runtimeInputs' }}>
          {getString('pipeline.runtimeInputs')}
        </Text>
      </div>

      <div className={css.btns}>
        <Button
          disabled={isReadonly}
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getString('applyChanges')}
          onClick={onApply}
        />
        <Button minimal size={ButtonSize.SMALL} text={getString('pipeline.discard')} onClick={onDiscard} />
      </div>
    </div>
  )
}
