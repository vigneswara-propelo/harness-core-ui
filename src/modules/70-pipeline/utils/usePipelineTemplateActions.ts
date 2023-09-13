/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import produce from 'immer'
import { useCallback, useState } from 'react'
import { parse } from '@common/utils/YamlHelperMethods'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { getTemplatePromise, TemplateResponse, TemplateSummaryResponse } from 'services/template-ng'
import {
  PreSelectedTemplate,
  useTemplateSelector
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { StoreType } from '@common/constants/GitSyncTypes'

interface TemplateActionsReturnType {
  addOrUpdateTemplate: (selectedTemplate?: TemplateSummaryResponse) => Promise<void>
  switchTemplateVersion: (
    selectedVersion: string,
    selectedTemplate?: PreSelectedTemplate
  ) => Promise<TemplateResponse | void | unknown>
  removeTemplate: () => Promise<void>
  isTemplateUpdated: boolean
  setIsTemplateUpdated(isTemplateUpdated: boolean): void
}

export function usePipelineTemplateActions(): TemplateActionsReturnType {
  const {
    state: { pipeline, gitDetails, storeMetadata },
    updatePipeline
  } = usePipelineContext()
  const { getTemplate } = useTemplateSelector()

  const [isTemplateUpdated, setIsTemplateUpdated] = useState(false)

  const copyPipelineMetaData = useCallback(
    (processNode: PipelineInfoConfig) => {
      processNode.description = pipeline.description
      processNode.tags = pipeline.tags
      processNode.projectIdentifier = pipeline.projectIdentifier
      processNode.orgIdentifier = pipeline.orgIdentifier
    },
    [pipeline]
  )

  const addOrUpdateTemplate = useCallback(
    async (selectedTemplate?: TemplateSummaryResponse) => {
      try {
        const { template, isCopied } = await getTemplate({
          templateType: 'Pipeline',
          selectedTemplate,
          gitDetails,
          storeMetadata
        })
        const processNode = isCopied
          ? produce(defaultTo(parse<any>(template?.yaml || '')?.template.spec, {}) as PipelineInfoConfig, draft => {
              draft.name = defaultTo(pipeline?.name, '')
              draft.identifier = defaultTo(pipeline?.identifier, '')
            })
          : createTemplate(pipeline, template, gitDetails?.branch, gitDetails?.repoName)
        copyPipelineMetaData(processNode)
        await updatePipeline(processNode)
        setIsTemplateUpdated(true)
      } catch (_) {
        // user cancelled template selection
        if (isTemplateUpdated) {
          setIsTemplateUpdated(false)
        }
      }
    },
    [getTemplate, gitDetails, storeMetadata, pipeline, copyPipelineMetaData, updatePipeline]
  )

  const switchTemplateVersion = useCallback(
    async (selectedversion: string, selectedTemplate?: PreSelectedTemplate) => {
      return new Promise((resolve, reject) => {
        getTemplatePromise({
          templateIdentifier: selectedTemplate?.identifier || '',
          queryParams: {
            versionLabel: selectedversion,
            projectIdentifier: selectedTemplate?.projectIdentifier,
            orgIdentifier: selectedTemplate?.orgIdentifier,
            accountIdentifier: selectedTemplate?.accountId || '',
            ...(selectedTemplate?.storeType === StoreType.REMOTE
              ? { branch: selectedTemplate?.gitDetails?.branch }
              : {})
          },
          requestOptions: {
            headers:
              selectedTemplate?.storeType === StoreType.REMOTE
                ? {
                    'Load-From-Cache': 'true'
                  }
                : {}
          }
        })
          .then(async response => {
            if (response?.status === 'SUCCESS' && response?.data) {
              const processNode = createTemplate(pipeline, response?.data, gitDetails?.branch, gitDetails?.repoName)
              copyPipelineMetaData(processNode)
              await updatePipeline(processNode)
              setIsTemplateUpdated(true)
              resolve(response?.data)
            } else {
              reject()
            }
          })
          .catch(() => {
            reject()
          })
      })
    },
    [getTemplate, gitDetails, storeMetadata, pipeline, copyPipelineMetaData, updatePipeline]
  )

  const removeTemplate = useCallback(async () => {
    const node = pipeline
    const processNode = produce({} as PipelineInfoConfig, draft => {
      draft.name = defaultTo(node?.name, '')
      draft.identifier = defaultTo(node?.identifier, '')
    })
    copyPipelineMetaData(processNode)
    await updatePipeline(processNode)
  }, [pipeline, updatePipeline])

  return { addOrUpdateTemplate, removeTemplate, switchTemplateVersion, isTemplateUpdated, setIsTemplateUpdated }
}
