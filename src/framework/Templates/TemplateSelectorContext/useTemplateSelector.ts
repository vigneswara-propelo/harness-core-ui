/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { EntityGitDetails, TemplateSummaryResponse } from 'services/template-ng'
import { TemplateSelectorContext } from 'framework/Templates/TemplateSelectorContext/TemplateSelectorContext'
import type { TemplateType } from '@common/interfaces/RouteInterfaces'
import type { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { TemplateUsage } from '@templates-library/utils/templatesUtils'
import type { TemplateDetailsResponseWrapper } from '@pipeline/utils/templateUtils'

export interface GetTemplateResponse {
  template: TemplateDetailsResponseWrapper
  isCopied: boolean
}

export interface PreSelectedTemplate extends TemplateSummaryResponse {
  remoteFetchError?: boolean
  storeType?: StoreType
}

export interface GetTemplateProps {
  templateType: TemplateType
  filterProperties?: {
    childTypes?: string[]
    templateIdentifiers?: string[]
  }
  disableVersionChange?: boolean
  hideTemplatesView?: boolean
  showChangeTemplateDialog?: boolean
  /** disables "Use Template" button if the template selected inside the drawer is same as the one sent as `GetTemplateProps.selectedTemplate`
   * @default true
   */
  disableUseTemplateIfUnchanged?: boolean
  allowedUsages?: TemplateUsage[]
  selectedTemplate?: PreSelectedTemplate
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
}

interface TemplateActionsReturnType {
  getTemplate: (data: GetTemplateProps) => Promise<GetTemplateResponse>
}

export function useTemplateSelector(): TemplateActionsReturnType {
  const { openTemplateSelector, closeTemplateSelector } = React.useContext(TemplateSelectorContext)

  const getTemplate = React.useCallback(
    (selectorData: GetTemplateProps): Promise<GetTemplateResponse> => {
      return new Promise((resolve, reject) => {
        openTemplateSelector({
          ...selectorData,
          onSubmit: (template: TemplateSummaryResponse, isCopied: boolean) => {
            closeTemplateSelector()
            resolve({ template, isCopied })
          },
          onCancel: () => {
            closeTemplateSelector()
            reject()
          }
        })
      })
    },
    [openTemplateSelector, closeTemplateSelector]
  )

  return { getTemplate }
}
