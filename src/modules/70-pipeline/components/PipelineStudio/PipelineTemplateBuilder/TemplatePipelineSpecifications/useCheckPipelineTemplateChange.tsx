import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash-es'
import { comparePipelineTemplateAndPipeline } from '@pipeline/utils/pipelineReconcileUtils'
import { PipelineInfoConfig } from 'services/pipeline-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineRequiredAction } from '@pipeline/components/PipelineUpdateRequiredWarning/PipelineUpdateRequiredWarningHelper'

export interface UseCheckPipelineTemplateChangeReturnType {
  requiredAction: PipelineRequiredAction | null
  disableForm: boolean
  checkPipelineTemplateChange: (
    templateInputs: PipelineInfoConfig,
    stage: PipelineInfoConfig,
    reconcile?: boolean
  ) => void
}

export function useCheckTemplateChange(): UseCheckPipelineTemplateChangeReturnType {
  const {
    state: { isUpdated },
    reconcile: { outOfSync, reconcilePipeline, isFetchingReconcileData }
  } = usePipelineContext()

  const [templateInputsChanged, setTemplateInputsChanged] = useState<boolean>(false)
  const [requiredAction, setRequiredAction] = useState<PipelineRequiredAction | null>(null)

  const checkPipelineTemplateChange = (
    templateInputs: PipelineInfoConfig,
    pipeline: PipelineInfoConfig,
    reconcile = true
  ): void => {
    const { hasDifference } = comparePipelineTemplateAndPipeline(templateInputs, pipeline ?? {}, isUpdated)
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

  return { requiredAction, disableForm, checkPipelineTemplateChange }
}
