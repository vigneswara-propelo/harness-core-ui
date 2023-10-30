/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { VisualYamlSelectedView } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import type { YamlSchemaErrorDTO } from 'services/pipeline-ng'
import { usePipelineContextY1 } from '@pipeline/y1/components/PipelineContext/PipelineContextY1'
import { SplitViewTypesY1 } from '@pipeline/y1/components/PipelineContext/PipelineActionsY1'
// TODO: move this to common
import PipelineErrors from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineErrors/PipelineErrors'

interface UsePipelineErrorsY1ReturnType {
  openPipelineErrorsModal: (response: YamlSchemaErrorDTO[]) => void
  closePipelineErrorsModal: () => void
}

export default function usePipelineErrorsY1(): UsePipelineErrorsY1ReturnType {
  const {
    state: { pipelineView },
    view,
    setSelection,
    updatePipelineView
  } = usePipelineContextY1()
  const isYaml = view === VisualYamlSelectedView.YAML
  const [schemaErrors, setSchemaErrors] = React.useState<YamlSchemaErrorDTO[]>()

  const gotoViewWithDetails = React.useCallback(
    ({ stageId, stepId, sectionId }: { stageId?: string; stepId?: string; sectionId?: string } = {}): void => {
      hideErrorModal()
      // If Yaml mode, or if pipeline error - stay on yaml mode
      if (isYaml || (!stageId && !stepId)) {
        return
      }
      setSelection(sectionId ? { stageId, stepId, sectionId } : { stageId, stepId })
      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: true,
        splitViewData: { type: SplitViewTypesY1.StageView }
      })
    },
    [isYaml, pipelineView]
  )

  const [showErrorModal, hideErrorModal] = useModalHook(
    () => (
      <PipelineErrors
        errors={schemaErrors as YamlSchemaErrorDTO[]}
        gotoViewWithDetails={gotoViewWithDetails}
        onClose={hideErrorModal}
      />
    ),
    [schemaErrors]
  )

  const openPipelineErrorsModal = (schemaErrorsToShow: YamlSchemaErrorDTO[]): void => {
    if (schemaErrorsToShow?.length) {
      setSchemaErrors(schemaErrorsToShow)
      showErrorModal()
    }
  }

  const closePipelineErrorsModal = (): void => {
    hideErrorModal()
  }

  return {
    openPipelineErrorsModal,
    closePipelineErrorsModal
  }
}
