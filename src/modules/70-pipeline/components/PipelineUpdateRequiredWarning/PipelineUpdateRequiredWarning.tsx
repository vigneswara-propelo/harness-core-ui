import { Button, ButtonSize, ButtonVariation, Icon } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import React from 'react'
import { useStrings } from 'framework/strings'
import { PipelineRequiredAction, PipelineRequiredActionType } from './PipelineUpdateRequiredWarningHelper'
import css from './PipelineUpdateRequiredWarning.module.scss'

export interface PipelineUpdateRequiredWarningProps {
  requiredAction: PipelineRequiredAction
  type: PipelineRequiredActionType
  onUpdate: () => void
}

export function PipelineUpdateRequiredWarning(props: PipelineUpdateRequiredWarningProps): React.ReactElement {
  const { requiredAction, type, onUpdate } = props

  const { getString } = useStrings()

  const getMessage = (): string => {
    switch (type) {
      case PipelineRequiredActionType.PIPELINE:
        return getString('pipeline.templatePipelineUpdatedWarning')
      case PipelineRequiredActionType.STAGE:
        return getString('pipeline.templateStageUpdatedWarning')
    }
  }

  const getButtonLabel = (): string => {
    switch (type) {
      case PipelineRequiredActionType.PIPELINE:
        return getString('pipeline.updatePipeline')
      case PipelineRequiredActionType.STAGE:
        return getString('pipeline.updateStage')
    }
  }

  return (
    <div className={css.templateChangedWarning}>
      <Icon name="warning-sign" intent={Intent.DANGER} margin={{ right: 'small' }} />
      <span>
        {requiredAction === PipelineRequiredAction.RECONCILE && getString('pipeline.templateReconcileWarning')}
        {requiredAction === PipelineRequiredAction.UPDATE_TEMPLATE && getMessage()}
      </span>
      {requiredAction === PipelineRequiredAction.UPDATE_TEMPLATE && (
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getButtonLabel()}
          onClick={onUpdate}
        />
      )}
    </div>
  )
}
