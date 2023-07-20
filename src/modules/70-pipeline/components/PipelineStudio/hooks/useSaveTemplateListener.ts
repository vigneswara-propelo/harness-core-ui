/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useConfirmationDialog } from '@harness/uicore'
import { Intent } from '@blueprintjs/core'
import { defaultTo, set } from 'lodash-es'
import produce from 'immer'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { useGlobalEventListener } from '@common/hooks'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getNodeAndParent,
  getStepsPathWithoutStagePath
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import type { TemplateStepNode } from 'services/pipeline-ng'
import {
  NodeWrapperEntity,
  getBaseDotNotationWithoutEntityIdentifier
} from '@pipeline/components/PipelineDiagram/Nodes/utils'
import { findDotNotationByRelativePath, generateCombinedPaths } from '../PipelineContext/helpers'

export function useSaveTemplateListener(): void {
  const [savedTemplate, setSavedTemplate] = React.useState<TemplateSummaryResponse>()
  const { getString } = useStrings()
  const {
    state,
    state: {
      selectionState: { selectedStageId = '' },
      pipelineView: { drawerData }
    },
    updatePipeline,
    updateStage,
    updatePipelineView,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage: selectedStage } = getStageFromPipeline(selectedStageId)
  const { pipeline, pipelineView } = state

  const updatePipelineTemplate = async (): Promise<void> => {
    const processNode = createTemplate(pipeline, savedTemplate)
    processNode.description = pipeline.description
    processNode.tags = pipeline.tags
    processNode.projectIdentifier = pipeline.projectIdentifier
    processNode.orgIdentifier = pipeline.orgIdentifier
    await updatePipeline(processNode)
  }

  const updateStageTemplate = async (): Promise<void> => {
    if (selectedStage?.stage) {
      const processNode = createTemplate(selectedStage.stage, savedTemplate)
      await updateStage(processNode)
    }
  }

  const updateStepTemplate = async (): Promise<void> => {
    const selectedStepId = defaultTo(drawerData.data?.stepConfig?.node.identifier, '')
    const nodeDotNotationPath = drawerData.data?.stepConfig?.nodeStateMetadata?.dotNotationPath
    const stepNodePath = getBaseDotNotationWithoutEntityIdentifier(getStepsPathWithoutStagePath(nodeDotNotationPath))
    const selectedStep = getNodeAndParent(selectedStage?.stage?.spec?.execution, stepNodePath)

    if (selectedStep?.node) {
      const processNode = createTemplate(selectedStep.node as TemplateStepNode, savedTemplate)
      const newPipelineView = produce(pipelineView, draft => {
        set(draft, 'drawerData.data.stepConfig.node', processNode)
      })
      updatePipelineView(newPipelineView)

      // Construct relative path - update step/stepGroup
      const relativePath = getBaseDotNotationWithoutEntityIdentifier(drawerData.data?.stepConfig?.relativeBasePath)
      const fullPath = getBaseDotNotationWithoutEntityIdentifier(
        drawerData.data?.stepConfig?.nodeStateMetadata?.dotNotationPath
      )
      const isStepGroup = drawerData.data?.stepConfig?.isStepGroup
      const stepRelativePath = `${relativePath}.${
        isStepGroup ? NodeWrapperEntity.stepGroup : NodeWrapperEntity.step
      }.${selectedStepId}`
      const stepFullPath = `${getBaseDotNotationWithoutEntityIdentifier(fullPath)}.${
        isStepGroup ? NodeWrapperEntity.stepGroup : NodeWrapperEntity.step
      }.${selectedStepId}`

      const stageData = produce(selectedStage, draft => {
        if (draft?.stage?.spec?.execution) {
          const dotNotationObjects = generateCombinedPaths(draft.stage.spec.execution)

          const completeNodePathFqn = findDotNotationByRelativePath(
            dotNotationObjects,
            getStepsPathWithoutStagePath(stepRelativePath),
            getStepsPathWithoutStagePath(stepFullPath)
          )
          set(draft.stage.spec.execution, getBaseDotNotationWithoutEntityIdentifier(completeNodePathFqn), processNode)
        }
      })
      if (stageData?.stage) {
        await updateStage(stageData.stage)
      }
    }
  }

  const onUseTemplateConfirm = async (): Promise<void> => {
    switch (savedTemplate?.templateEntityType) {
      case 'Pipeline':
        await updatePipelineTemplate()
        break
      case 'Stage':
        await updateStageTemplate()
        break
      case 'Step':
      case 'StepGroup':
        await updateStepTemplate()
        break
      default:
        break
    }
  }

  const { openDialog: openUseTemplateDialog } = useConfirmationDialog({
    intent: Intent.WARNING,
    cancelButtonText: getString('no'),
    contentText: getString('pipeline.templateSaved', {
      name: savedTemplate?.name,
      entity: savedTemplate?.templateEntityType?.toLowerCase()
    }),
    titleText: `Use Template ${defaultTo(savedTemplate?.name, '')}?`,
    confirmButtonText: getString('yes'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        onUseTemplateConfirm()
      }
    }
  })

  useGlobalEventListener('TEMPLATE_SAVED', event => {
    const { detail: newTemplate } = event
    if (newTemplate) {
      setSavedTemplate(newTemplate)
      setTimeout(() => {
        openUseTemplateDialog()
      }, 0)
    }
  })
}
