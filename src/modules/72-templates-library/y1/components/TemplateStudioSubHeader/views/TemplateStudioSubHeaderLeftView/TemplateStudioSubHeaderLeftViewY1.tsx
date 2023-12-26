/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  SelectOption,
  Text,
  useConfirmationDialog,
  VisualYamlSelectedView as SelectedView
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { defaultTo, isEmpty, isNil, noop } from 'lodash-es'
import { Dialog, Spinner } from '@blueprintjs/core'
import classNames from 'classnames'
import produce from 'immer'
import { GetDataError } from 'restful-react'
import {
  Fields,
  ModalProps,
  PromiseExtraArgs,
  Intent,
  TemplateConfigModalWithRef
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TagsPopover, useToaster } from '@common/components'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams,
  TemplateType
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { Failure, NGTemplateInfoConfig, useUpdateStableTemplate } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import StudioGitPopover from '@pipeline/components/PipelineStudio/StudioGitPopover'
import { VersionsDropDown } from '@pipeline/components/VersionsDropDown/VersionsDropDown'
import { GitPopoverV2 } from '@common/components/GitPopoverV2/GitPopoverV2'
import {
  EntityCachedCopy,
  EntityCachedCopyHandle
} from '@pipeline/components/PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import { StoreType } from '@common/constants/GitSyncTypes'
import { TemplateTypesUIToY1Map, isNewTemplate } from '@templates-library/components/TemplateStudio/TemplateStudioUtils'
import { TemplateContextY1 } from '@templates-library/y1/components/TemplateContext/TemplateContextY1'
import { TemplateMetadataForRouter } from '@templates-library/pages/TemplatesPage/views/NewTemplatePopover/useCreateTemplateModalY1'
import { useTemplateLoaderContext } from '@templates-library/common/components/TemplateStudio/TemplateLoaderContext/TemplateLoaderContext'
import { YamlVersionBadge } from '@pipeline/common/components/YamlVersionBadge/YamlVersionBadge'
import { NGTemplateInfoConfigY1_Tmp } from '@modules/72-templates-library/y1/components/TemplateContext/types'
import css from './TemplateStudioSubHeaderLeftViewY1.module.scss'

/**
 * While creating no field should be disabled.
 * Without permission, all fields should be disabled.
 * With edit  permission, only Identifier and VersionLabel should be disabled.
 */
const getDisabledFields = (templateIdentifier: string, isReadonly: boolean): Array<Fields> => {
  if (isNewTemplate(templateIdentifier)) {
    return []
  } else if (isReadonly) {
    return [Fields.VersionLabel, Fields.Identifier, Fields.Name, Fields.Description, Fields.Tags]
  } else {
    return [Fields.VersionLabel, Fields.Identifier]
  }
}

export interface TemplateStudioSubHeaderLeftViewY1Props {
  onGitBranchChange?: (selectedFilter: GitFilterScope) => void
}

export interface TemplateStudioSubHeaderLeftViewHandleY1 {
  openReconcileConfirmation(): void
}

export function TemplateStudioSubHeaderLeftViewY1(
  props: TemplateStudioSubHeaderLeftViewY1Props,
  ref: React.ForwardedRef<TemplateStudioSubHeaderLeftViewHandleY1>
): React.ReactElement {
  const { onGitBranchChange } = props
  const {
    state,
    updateTemplate,
    updateTemplateMetadata,
    deleteTemplateCache,
    fetchTemplate,
    view,
    isReadonly,
    updateGitDetails,
    updateStoreMetadata,
    updateTemplateView
  } = React.useContext(TemplateContextY1)
  const {
    template,
    templateMetadata,
    versions,
    stableVersion,
    isUpdated,
    isUpdatedMetadata,
    gitDetails,
    storeMetadata,
    templateYamlError,
    templateView,
    cacheResponseMetadata: cacheResponse
  } = state
  const { accountId, projectIdentifier, orgIdentifier, module, templateIdentifier } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { updateQueryParams } = useUpdateQueryParams<TemplateStudioQueryParams>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingTemplatesGitx
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const isYaml = view === SelectedView.YAML
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const pipelineCachedCopyRef = React.useRef<EntityCachedCopyHandle | null>(null)
  const { state: routerState } = useLocation<Optional<TemplateMetadataForRouter>>()
  const { yamlVersion } = useTemplateLoaderContext()

  const { mutate: updateStableTemplate, loading: updateStableTemplateLoading } = useUpdateStableTemplate({
    templateIdentifier: templateMetadata.identifier,
    versionLabel: templateMetadata.versionLabel,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch
    },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  React.useImperativeHandle(ref, () => ({
    openReconcileConfirmation() {
      pipelineCachedCopyRef.current?.showConfirmationModal()
    }
  }))

  const reloadFromCache = React.useCallback((): void => {
    updateTemplateView({ ...templateView, isYamlEditable: false })
    fetchTemplate({ forceFetch: true, forceUpdate: true, loadFromCache: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateView])

  const navigateToTemplatesListPage = React.useCallback(() => {
    history.push(routes.toTemplates({ orgIdentifier, projectIdentifier, accountId, module }))
  }, [history, routes.toTemplates, orgIdentifier, projectIdentifier, accountId, module])

  const [showConfigModal, hideConfigModal] = useModalHook(() => {
    const onCloseCreate = (): void => {
      if (templateMetadata.identifier === DefaultNewTemplateId) {
        navigateToTemplatesListPage()
      }
      hideConfigModal()
    }

    return (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        className={classNames(css.createTemplateDialog, {
          [css.gitCreateTemplateDialog]: supportingTemplatesGitx
        })}
      >
        {modalProps && <TemplateConfigModalWithRef {...modalProps} onClose={onCloseCreate} />}
      </Dialog>
    )
  }, [templateMetadata.identifier, navigateToTemplatesListPage, modalProps])

  const onSubmit = React.useCallback(
    // TODO: data: NGTemplateInfoConfig this has to be UI model
    async (data: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs): Promise<UseSaveSuccessResponse> => {
      const { updatedGitDetails } = extraInfo
      const newTemplate: NGTemplateInfoConfigY1_Tmp = produce(template, draft => {
        draft.spec.type = TemplateTypesUIToY1Map[data.type]
      })

      const newTemplateMetadata = produce(templateMetadata, draft => {
        draft.name = data.name
        draft.description = data.description
        draft.identifier = data.identifier
        draft.tags = data.tags ?? {}
        draft.versionLabel = data.versionLabel
        draft.orgIdentifier = data.orgIdentifier
        draft.projectIdentifier = data.projectIdentifier
        draft.icon = data.icon
      })

      try {
        await updateTemplate(newTemplate)
        await updateTemplateMetadata(newTemplateMetadata)

        if (extraInfo.storeMetadata) {
          updateStoreMetadata(extraInfo.storeMetadata, updatedGitDetails)
        } else {
          updateGitDetails(isEmpty(updatedGitDetails) ? {} : { ...gitDetails, ...updatedGitDetails }).then(() => {
            updateQueryParams(
              { repoIdentifier: updatedGitDetails?.repoIdentifier, branch: updatedGitDetails?.branch },
              { skipNulls: true }
            )
          })
        }

        return { status: 'SUCCESS' }
      } catch (error) {
        return { status: 'ERROR' }
      }
    },
    [template, gitDetails]
  )

  const goToTemplateVersion = async (versionLabel: string): Promise<void> => {
    if (versionLabel !== DefaultNewVersionLabel && versionLabel !== templateMetadata.versionLabel) {
      await deleteTemplateCache()
      history.replace(
        routes.toTemplateStudioNew({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType: template.spec.type as TemplateType,
          templateIdentifier: templateMetadata.identifier,
          versionLabel: versionLabel,
          repoIdentifier,
          branch
        })
      )
    }
  }

  const { openDialog: openConfirmationDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('templatesLibrary.setAsStableText', { version: templateMetadata.versionLabel }),
    titleText: getString('templatesLibrary.setAsStableTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        updateStableLabel()
      }
    }
  })

  const updateStableLabel = async (): Promise<void> => {
    try {
      await updateStableTemplate()
      showSuccess(getString('common.template.updateTemplate.templateUpdated'))
      await fetchTemplate({ forceFetch: true, forceUpdate: true })
    } catch (error) {
      showError(
        getRBACErrorMessage(error as RBACError) || getString('common.template.updateTemplate.errorWhileUpdating'),
        undefined,
        'template.save.template.error'
      )
    }
  }

  React.useEffect(() => {
    const newVersionOption: SelectOption[] = versions.map(item => {
      return {
        label: item === stableVersion ? item + ' (Stable)' : item,
        value: item
      }
    })
    newVersionOption.sort((a, b) => a.label.localeCompare(b.label))
    setVersionOptions(newVersionOption)
  }, [versions])

  React.useEffect(() => {
    if (
      templateMetadata.identifier === DefaultNewTemplateId &&
      !isEmpty(template.spec.type) &&
      isEmpty(routerState?.data)
    ) {
      hideConfigModal()
      setModalProps({
        initialValues: {
          type: template.spec.type as NGTemplateInfoConfig['type'], // TODO: check/update type
          ...templateMetadata
        },
        promise: onSubmit,
        title: getString('templatesLibrary.createNewModal.heading', {
          entity: templateFactory.getTemplateLabel(template.spec.type as NGTemplateInfoConfig['type']) // TODO: check/update type
        }),
        intent: Intent.START,
        allowScopeChange: true,
        storeMetadata,
        gitDetails
      })
      showConfigModal()
    }
  }, [templateMetadata.identifier, showConfigModal, template.spec.type, onSubmit])

  React.useEffect(() => {
    if (routerState?.data && routerState?.extraInfo) {
      onSubmit(routerState.data, routerState.extraInfo)
    }
  }, [])

  return (
    <Container className={css.subHeaderLeftView}>
      <Layout.Horizontal spacing={'medium'} padding={{ right: 'medium' }} flex={{ alignItems: 'center' }}>
        <Container>
          <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
            <YamlVersionBadge version={yamlVersion} minimal border className={css.yamlVersionBadge} />
            <Icon name="template-library" size={20} />
            <Text
              className={classNames(css.templateName, {
                [css.shortened]: storeMetadata?.storeType === StoreType.REMOTE
              })}
              color={Color.GREY_700}
              font={{ weight: 'bold' }}
              tooltip={templateMetadata?.name}
            >
              {templateMetadata.name}
            </Text>
            {!isNil(templateMetadata?.tags) && !isEmpty(templateMetadata?.tags) && (
              <TagsPopover tags={templateMetadata.tags} />
            )}
            {isGitSyncEnabled && onGitBranchChange && (
              <StudioGitPopover
                connectorRef={storeMetadata?.connectorRef}
                gitDetails={gitDetails}
                identifier={templateIdentifier}
                isReadonly={isReadonly}
                // entityData={template}
                onGitBranchChange={onGitBranchChange}
                entityType={getString('common.template.label')}
              />
            )}
            {!isYaml && (
              <Button
                variation={ButtonVariation.ICON}
                icon="Edit"
                iconProps={{
                  color: Color.GREY_800
                }}
                withoutCurrentColor
                onClick={() => {
                  setModalProps({
                    initialValues: {
                      type: template.spec.type as NGTemplateInfoConfig['type'], // TODO: check/update type
                      ...templateMetadata
                    },
                    promise: onSubmit,
                    ...(!isNewTemplate(templateIdentifier) && { gitDetails }),
                    title: getString('templatesLibrary.createNewModal.editHeading', {
                      entity: templateFactory.getTemplateLabel(template.spec.type as NGTemplateInfoConfig['type']) // TODO: check/update type
                    }),
                    intent: isNewTemplate(templateIdentifier) ? Intent.START : Intent.EDIT,
                    disabledFields: getDisabledFields(templateIdentifier, isReadonly),
                    allowScopeChange: isNewTemplate(templateIdentifier),
                    storeMetadata,
                    gitDetails
                  })
                  showConfigModal()
                }}
              />
            )}
          </Layout.Horizontal>
        </Container>
        {!isNewTemplate(templateIdentifier) && (
          <VersionsDropDown
            onChange={item => goToTemplateVersion(item.value.toString())}
            items={versionOptions}
            value={templateMetadata.versionLabel}
            className={css.versionDropDown}
            stableVersion={stableVersion}
            popoverClassName={css.dropdown}
          />
        )}
        {updateStableTemplateLoading ? (
          <Container padding={{ right: 'large', left: 'large' }}>
            <Spinner size={Spinner.SIZE_SMALL} />
          </Container>
        ) : (
          templateMetadata.versionLabel !== stableVersion &&
          !isUpdated &&
          !isUpdatedMetadata &&
          !templateYamlError && (
            <Button
              onClick={openConfirmationDialog}
              variation={ButtonVariation.LINK}
              size={ButtonSize.SMALL}
              disabled={isReadonly}
              text={getString('common.setAsStable')}
            />
          )
        )}
        {storeMetadata?.storeType === StoreType.REMOTE && (
          <>
            <span className={css.separator}></span>
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <GitPopoverV2
                storeMetadata={storeMetadata}
                gitDetails={gitDetails}
                branchChangeDisabled={isNewTemplate(templateIdentifier)}
                onGitBranchChange={defaultTo(onGitBranchChange, noop)}
                btnClassName={css.gitBtn}
                customIcon={
                  !isEmpty(cacheResponse) ? (
                    <EntityCachedCopy
                      ref={pipelineCachedCopyRef}
                      reloadContent={getString('common.template.label')}
                      cacheResponse={cacheResponse}
                      reloadFromCache={reloadFromCache}
                      fetchError={templateYamlError as GetDataError<Error | Failure> | null | undefined}
                      className={css.cacheIcon}
                    />
                  ) : undefined
                }
              />
            </Layout.Horizontal>
          </>
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export const TemplateStudioSubHeaderLeftViewY1WithRef = React.forwardRef(TemplateStudioSubHeaderLeftViewY1)
