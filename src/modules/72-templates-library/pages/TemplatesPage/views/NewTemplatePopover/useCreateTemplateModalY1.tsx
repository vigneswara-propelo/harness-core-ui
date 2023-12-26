/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { YamlVersion } from '@pipeline/common/hooks/useYamlVersion'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { NGTemplateInfoConfig } from 'services/template-ng'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import {
  Intent,
  ModalProps,
  PromiseExtraArgs,
  TemplateConfigModalWithRef
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import css from './NewTemplatePopover.module.scss'

export interface TemplateMetadataForRouter {
  data: NGTemplateInfoConfig
  extraInfo: PromiseExtraArgs
  yamlSyntax?: YamlVersion
}

export interface UseCreatePipelineModalY1Return {
  openCreateTemplateModal: ({ type }: { type: TemplateType }) => void
}

const useCreateTemplateModalY1 = (): UseCreatePipelineModalY1Return => {
  const { getString } = useStrings()
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const typeRef = useRef<TemplateType>(TemplateType.Stage)

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        <TemplateConfigModalWithRef {...getModalProps()} onClose={hideModal} canSelectVersion={true} />
      </Dialog>
    )
  }, [])

  const onSubmit = React.useCallback(
    async (data: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs): Promise<UseSaveSuccessResponse> => {
      hideModal()

      history.push(
        routes.toTemplateStudioNew({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType: data.type,
          templateIdentifier: DefaultNewTemplateId,
          versionLabel: data.versionLabel,
          repoIdentifier: extraInfo.updatedGitDetails?.repoIdentifier,
          branch: extraInfo.updatedGitDetails?.branch
        }),
        { data, extraInfo, yamlSyntax: extraInfo.yamlSyntax }
      )

      return { status: 'SUCCESS' }
    },
    [accountId, projectIdentifier, orgIdentifier, module, history, hideModal]
  )

  const getModalProps = (): ModalProps => ({
    initialValues: {
      identifier: '',
      name: '',
      type: typeRef.current,
      versionLabel: '',
      projectIdentifier,
      orgIdentifier
    },
    promise: onSubmit,
    //...(!isNewTemplate(templateIdentifier) && { gitDetails }), // todo
    title: getString('templatesLibrary.createNewModal.heading', {
      entity: templateFactory.getTemplateLabel(typeRef.current)
    }),
    intent: Intent.START, // todo isNewTemplate(templateIdentifier) ? Intent.START : Intent.EDIT,
    disabledFields: [], // todo getDisabledFields(templateIdentifier, isReadonly),
    allowScopeChange: true, // todo isNewTemplate(templateIdentifier),
    storeMetadata: undefined, //todo
    gitDetails: undefined //todo
  })

  const openCreateTemplateModal = useCallback(
    ({ type }: { type: TemplateType }) => {
      typeRef.current = type
      showModal()
    },
    [showModal]
  )

  return { openCreateTemplateModal }
}

export default useCreateTemplateModalY1
