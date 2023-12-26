/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  Popover,
  Text,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@harness/uicore'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'

import useDiffDialog from '@common/hooks/useDiffDialog'
import { stringify } from '@common/utils/YamlHelperMethods'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { StoreType } from '@common/constants/GitSyncTypes'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

import { isNewTemplate } from '@templates-library/components/TemplateStudio/TemplateStudioUtils'
import { TemplateMetadata_Tmp } from '@modules/72-templates-library/y1/components/TemplateContext/types'
import {
  TemplateStudioSubHeaderLeftViewHandleY1,
  TemplateStudioSubHeaderLeftViewY1WithRef
} from './views/TemplateStudioSubHeaderLeftView/TemplateStudioSubHeaderLeftViewY1'
import { TemplateContextY1 } from '../TemplateContext/TemplateContextY1'
import {
  GetErrorResponse,
  SaveTemplateHandleY1,
  SaveTemplatePopoverY1WithRef
} from '../SaveTemplatePopover/SaveTemplatePopoverY1'
import css from './TemplateStudioSubHeaderY1.module.scss'

export interface TemplateStudioSubHeaderProps {
  onViewChange: (view: SelectedView) => boolean
  getErrors: () => Promise<GetErrorResponse>
  onGitBranchChange: (selectedFilter: GitFilterScope) => void
  onReconcile(): void
}

export type TemplateStudioSubHeaderHandle = {
  updateTemplate: (templateYaml: string, templateMetadata: TemplateMetadata_Tmp) => Promise<void>
}

function TemplateStudioSubHeaderY1(
  props: TemplateStudioSubHeaderProps,
  ref: React.ForwardedRef<TemplateStudioSubHeaderHandle>
): React.ReactElement {
  const { onViewChange, getErrors, onGitBranchChange, onReconcile } = props
  const { state, fetchTemplate, /*view,*/ isReadonly } = React.useContext(TemplateContextY1)
  const {
    template,
    templateMetadata,
    originalTemplate,
    isUpdated,
    /*entityValidityDetails, */ templateYamlError,
    storeMetadata
  } = state
  const { getString } = useStrings()
  const { templateIdentifier, accountId, projectIdentifier, orgIdentifier } = useParams<TemplateStudioPathProps>()
  //todo
  // const isYaml = view === SelectedView.YAML
  // const isVisualViewDisabled = React.useMemo(() => entityValidityDetails.valid === false, [entityValidityDetails.valid])
  const saveTemplateHandleRef = React.useRef<SaveTemplateHandleY1 | null>(null)
  const templateStudioSubHeaderLeftViewHandleRef = React.useRef<TemplateStudioSubHeaderLeftViewHandleY1 | null>(null)
  const { supportingGitSimplification } = useAppStore()
  const isPipelineRemote = supportingGitSimplification && storeMetadata?.storeType === StoreType.REMOTE

  React.useImperativeHandle(
    ref,
    () => ({
      updateTemplate: async (templateYaml: string, updatedTemplateMetadata: TemplateMetadata_Tmp) => {
        await saveTemplateHandleRef.current?.updateTemplate(templateYaml, updatedTemplateMetadata)
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saveTemplateHandleRef.current]
  )

  const { open: openDiffModal } = useDiffDialog({
    originalYaml: stringify(originalTemplate),
    updatedYaml: stringify(template),
    title: getString('templatesLibrary.diffTitle')
  })

  function handleReloadFromGitClick(): void {
    templateStudioSubHeaderLeftViewHandleRef.current?.openReconcileConfirmation()
  }

  return (
    <Container
      className={css.subHeader}
      height={49}
      padding={{ right: 'medium', left: 'xlarge' }}
      border={{ bottom: true, color: Color.GREY_200 }}
      background={Color.WHITE}
    >
      <Layout.Horizontal height={'100%'} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <TemplateStudioSubHeaderLeftViewY1WithRef
          ref={templateStudioSubHeaderLeftViewHandleRef}
          onGitBranchChange={onGitBranchChange}
        />
        {!templateYamlError && (
          <Container>
            <VisualYamlToggle
              className={css.visualYamlToggle}
              //TODO
              //selectedView={isYaml || isVisualViewDisabled ? SelectedView.YAML : SelectedView.VISUAL}
              selectedView={SelectedView.YAML}
              onChange={nextMode => {
                onViewChange(nextMode)
              }}
              //disableToggle={isVisualViewDisabled}
              disableToggle={true}
            />
          </Container>
        )}
        <Container>
          <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center' }}>
            {!templateYamlError && (
              <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center' }}>
                {isReadonly && (
                  <Container>
                    <Layout.Horizontal spacing={'small'}>
                      <Icon name="eye-open" size={16} color={Color.ORANGE_800} />
                      <Text color={Color.ORANGE_800} font={{ size: 'small' }}>
                        {getString('common.readonlyPermissions')}
                      </Text>
                    </Layout.Horizontal>
                  </Container>
                )}
                {isUpdated && !isReadonly && (
                  <Button variation={ButtonVariation.LINK} className={css.tagRender} onClick={openDiffModal}>
                    {getString('unsavedChanges')}
                  </Button>
                )}
                <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
                  {!isReadonly && <SaveTemplatePopoverY1WithRef getErrors={getErrors} ref={saveTemplateHandleRef} />}
                  {isNewTemplate(templateIdentifier) ? null : (
                    <React.Fragment>
                      {isReadonly ? null : (
                        <Button
                          disabled={!isUpdated}
                          onClick={() => {
                            fetchTemplate({ forceFetch: true, forceUpdate: true })
                          }}
                          variation={ButtonVariation.SECONDARY}
                          text={getString('common.discard')}
                        />
                      )}
                      <Popover className={Classes.DARK} position={Position.LEFT}>
                        <Button variation={ButtonVariation.ICON} icon="Options" aria-label="pipeline menu actions" />
                        <Menu style={{ backgroundColor: 'unset' }}>
                          {isPipelineRemote ? (
                            <RbacMenuItem
                              icon="repeat"
                              text={getString('common.reloadFromGit')}
                              onClick={handleReloadFromGitClick}
                              permission={{
                                resourceScope: {
                                  accountIdentifier: accountId,
                                  orgIdentifier,
                                  projectIdentifier
                                },
                                resource: {
                                  resourceType: ResourceType.TEMPLATE,
                                  resourceIdentifier: templateMetadata?.identifier
                                },
                                permission: PermissionIdentifier.VIEW_TEMPLATE
                              }}
                            />
                          ) : null}
                          <RbacMenuItem
                            icon="refresh"
                            text={getString('pipeline.outOfSyncErrorStrip.reconcile')}
                            onClick={onReconcile}
                            disabled={isReadonly}
                            permission={{
                              resourceScope: {
                                accountIdentifier: accountId,
                                orgIdentifier,
                                projectIdentifier
                              },
                              resource: {
                                resourceType: ResourceType.TEMPLATE,
                                resourceIdentifier: templateMetadata?.identifier
                              },
                              permission: PermissionIdentifier.EDIT_TEMPLATE
                            }}
                          />
                        </Menu>
                      </Popover>
                    </React.Fragment>
                  )}
                </Layout.Horizontal>
              </Layout.Horizontal>
            )}
          </Layout.Horizontal>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export const TemplateStudioSubHeaderY1WithRef = React.forwardRef(TemplateStudioSubHeaderY1)
