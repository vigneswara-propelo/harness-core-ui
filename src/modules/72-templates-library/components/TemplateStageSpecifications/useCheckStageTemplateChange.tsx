import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash-es'
import { compareStageTemplateAndStage } from '@pipeline/utils/pipelineReconcileUtils'
import { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { StageElementConfig } from 'services/pipeline-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineRequiredAction } from '@pipeline/components/PipelineUpdateRequiredWarning/PipelineUpdateRequiredWarningHelper'

export interface UseCheckStageTemplateChangeReturnType {
  requiredAction: PipelineRequiredAction | null
  disableForm: boolean
  checkStageTemplateChange: (
    templateInputs: StageElementConfig,
    stage: StageElementWrapper<StageElementConfig>,
    reconcile?: boolean
  ) => void
}

export function useCheckStageTemplateChange(): UseCheckStageTemplateChangeReturnType {
  const {
    state: { isUpdated },
    reconcile: { outOfSync, reconcilePipeline, isFetchingReconcileData }
  } = usePipelineContext()

  const [templateInputsChanged, setTemplateInputsChanged] = useState<boolean>(false)
  const [requiredAction, setRequiredAction] = useState<PipelineRequiredAction | null>(null)

  const checkStageTemplateChange = (
    templateInputs: StageElementConfig,
    stage: StageElementWrapper<StageElementConfig>,
    reconcile = true
  ): void => {
    const { hasDifference } = compareStageTemplateAndStage(templateInputs, stage ?? {}, isUpdated)
    setTemplateInputsChanged(hasDifference)
    if (reconcile && !outOfSync && hasDifference) {
      reconcilePipeline(false)
    }
  }

  const setRequiredActionDebounce = useCallback(debounce(setRequiredAction, 100), [])

  useEffect(() => {
    if (templateInputsChanged && !isFetchingReconcileData) {
      setRequiredActionDebounce(outOfSync ? PipelineRequiredAction.RECONCILE : PipelineRequiredAction.UPDATE_TEMPLATE)
    } else {
      setRequiredActionDebounce(null)
    }

    return () => {
      setRequiredActionDebounce.cancel()
    }
  }, [outOfSync, templateInputsChanged, isFetchingReconcileData, setRequiredActionDebounce])

  const disableForm = !!requiredAction

  return { requiredAction, disableForm, checkStageTemplateChange }
}
