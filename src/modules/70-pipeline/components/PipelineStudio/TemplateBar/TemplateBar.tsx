/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import {
  Container,
  Icon,
  IconName,
  Layout,
  Popover,
  SelectOption,
  Text,
  useConfirmationDialog,
  useToaster
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { Classes, Dialog, Intent, Menu, Position } from '@blueprintjs/core'
import cx from 'classnames'
import type { UseStringsReturn } from 'framework/strings'
import { VersionsDropDown } from '@pipeline/components/VersionsDropDown/VersionsDropDown'
import { String, useStrings } from 'framework/strings'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ProjectPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import {
  TemplateSummaryResponse,
  useGetTemplate,
  Error,
  GitErrorMetadataDTO,
  useGetTemplateMetadataList,
  useGetTemplateList,
  TemplateResponse
} from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { TemplateYaml } from '@pipeline/components/PipelineStudio/TemplateYaml/TemplateYaml'
import type { TemplateLinkConfig } from 'services/pipeline-ng'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { getLocationPathName } from 'framework/utils/WindowLocation'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import { PreSelectedTemplate } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './TemplateBar.module.scss'

interface TemplateMenuItem {
  icon?: IconName
  label: string
  disabled?: boolean
  onClick: () => void
}

export interface TemplateBarProps {
  templateLinkConfig: TemplateLinkConfig
  onOpenTemplateSelector?: (selectedTemplate: PreSelectedTemplate) => void
  switchTemplateVersion?: (
    selectedVersion: string,
    selectedTemplate?: PreSelectedTemplate
  ) => Promise<TemplateResponse | void | unknown>
  onRemoveTemplate?: () => Promise<void>
  className?: string
  isReadonly?: boolean
  storeMetadata?: StoreMetadata
  supportVersionChange?: boolean
  setFetchedTemplateDetails?: (templateData: TemplateSummaryResponse) => void
}

export const getVersionLabelText = (
  template: TemplateSummaryResponse,
  getString: UseStringsReturn['getString']
): string | undefined => {
  return isEmpty(template.versionLabel)
    ? getString('pipeline.templatesLibrary.alwaysUseStableVersion')
    : template.stableTemplate
    ? getString('pipeline.templatesLibrary.stableVersion', { entity: template.versionLabel })
    : template.versionLabel
}

export function TemplateBar(props: TemplateBarProps): JSX.Element {
  const {
    templateLinkConfig,
    onOpenTemplateSelector,
    switchTemplateVersion,
    onRemoveTemplate,
    className = '',
    isReadonly,
    storeMetadata,
    supportVersionChange = false,
    setFetchedTemplateDetails
  } = props
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingTemplatesGitx
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { module, ...params } = useParams<PipelineType<ProjectPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const scope = getScopeFromValue(templateLinkConfig.templateRef)
  const templateGitBranch = defaultTo(templateLinkConfig?.gitBranch, branch)
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { enabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.TEMPLATE_SERVICE
    }
  })
  const history = useHistory()

  const readyOnly = isReadonly || !enabled

  const { data, loading, error } = useGetTemplate({
    templateIdentifier: getIdentifierFromValue(templateLinkConfig.templateRef),
    queryParams: {
      ...getScopeBasedProjectPathParams(params, scope),
      versionLabel: defaultTo(templateLinkConfig.versionLabel, ''),
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params,
        repoIdentifier,
        branch: templateGitBranch,
        sendParentEntityDetails: templateLinkConfig?.gitBranch ? false : true
      })
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    lazy: storeMetadata?.storeType === StoreType.REMOTE && isEmpty(storeMetadata?.connectorRef)
  })

  const {
    data: templateMetadata,
    loading: loadingMetadata,
    error: templatesError
  } = useMutateAsGet(supportingTemplatesGitx ? useGetTemplateMetadataList : useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateIdentifiers: [getIdentifierFromValue(templateLinkConfig.templateRef)]
    },
    queryParams: {
      ...getScopeBasedProjectPathParams(params, scope),
      module,
      templateListType: 'All',
      size: 100,
      ...(isGitSyncEnabled ? { repoIdentifier, branch: templateGitBranch } : {})
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const stableVersion = React.useMemo(() => {
    return (templateMetadata?.data?.content as TemplateSummaryResponse[])?.find(
      item => item.stableTemplate && !isEmpty(item.versionLabel)
    )?.versionLabel
  }, [templateMetadata?.data?.content])

  React.useEffect(() => {
    if (!loadingMetadata) {
      if (templateMetadata?.status === 'SUCCESS' && templateMetadata?.data?.content?.length) {
        const newVersionOptions: SelectOption[] = templateMetadata.data.content.map(item => {
          return {
            label: getVersionLabelText(item, getString),
            value: defaultTo(item.versionLabel, '')
          } as SelectOption
        })
        setVersionOptions(newVersionOptions)
      } else if (templatesError) {
        showError(getString('pipeline.templatesLibrary.getVersionsError'))
      }
    }
  }, [loadingMetadata, templateMetadata, templatesError])

  const onTemplateVersionChangeClick = React.useCallback(
    version => {
      if (templateLinkConfig.versionLabel !== version.value) {
        switchTemplateVersion?.(version?.value, data?.data as PreSelectedTemplate)
          .then(() => {
            showSuccess(getString('pipeline.templatesLibrary.versionSelectSuccess', { version: version?.value || '' }))
          })
          .catch(() => {
            showError(getString('pipeline.templatesLibrary.versionSelectError', { version: version?.value || '' }))
          })
      }
    },
    [templateLinkConfig.versionLabel, data?.data]
  )

  const errorMetaData = (error?.data as Error)?.metadata as GitErrorMetadataDTO
  const remoteFetchError = React.useMemo(() => {
    return errorMetaData ? error : undefined
  }, [errorMetaData, error])

  const selectedTemplate = React.useMemo(
    () =>
      data?.data
        ? {
            ...data.data,
            versionLabel: templateLinkConfig.versionLabel,
            gitDetails: {
              ...data.data?.gitDetails,
              branch: templateLinkConfig.gitBranch ? templateLinkConfig.gitBranch : data.data?.gitDetails?.branch
            }
          }
        : undefined,
    [data?.data]
  )

  React.useEffect(() => {
    if (!isEmpty(selectedTemplate) && setFetchedTemplateDetails) {
      setFetchedTemplateDetails(selectedTemplate as TemplateSummaryResponse)
    }
  }, [selectedTemplate])

  const onChangeTemplate = (): void => {
    if (selectedTemplate || remoteFetchError) {
      onOpenTemplateSelector?.(
        remoteFetchError
          ? {
              identifier: getIdentifierFromValue(templateLinkConfig.templateRef),
              ...getScopeBasedProjectPathParams(params, scope),
              childType: templateLinkConfig?.templateInputs?.type,
              gitDetails: { branch: templateLinkConfig.gitBranch },
              storeType: StoreType.REMOTE,
              remoteFetchError: true
            }
          : (selectedTemplate as TemplateSummaryResponse)
      )
    }
  }

  const selectedTemplateDataWithRemoteFetchFailHandled = remoteFetchError
    ? { name: templateLinkConfig?.templateRef, versionLabel: templateLinkConfig?.versionLabel }
    : selectedTemplate

  const { openDialog: openRemoveTemplateDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    cancelButtonText: getString('cancel'),
    contentText: (
      <String
        stringID="pipeline.removeTemplate"
        vars={{
          name: getTemplateNameWithLabel(selectedTemplateDataWithRemoteFetchFailHandled),
          entity: selectedTemplate?.templateEntityType?.toLowerCase()
        }}
        useRichText={true}
      />
    ),
    titleText: `${getString('pipeline.removeTemplateLabel')}?`,
    confirmButtonText: getString('confirm'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        await onRemoveTemplate?.()
      }
    }
  })

  const openTemplate = (newTab?: boolean) => {
    if (selectedTemplate) {
      const templateStudioPath = routes.toTemplateStudio({
        projectIdentifier: selectedTemplate.projectIdentifier,
        orgIdentifier: selectedTemplate.orgIdentifier,
        accountId: defaultTo(selectedTemplate.accountId, ''),
        module,
        templateType: selectedTemplate.templateEntityType,
        templateIdentifier: selectedTemplate.identifier,
        versionLabel: selectedTemplate.versionLabel,
        repoIdentifier: selectedTemplate.gitDetails?.repoIdentifier,
        branch: selectedTemplate.gitDetails?.branch
      })

      if (newTab) {
        window.open(`${window.location.origin}${getLocationPathName()}#${templateStudioPath}`, '_blank')
      } else {
        history.push(templateStudioPath)
      }
    }
  }

  const [showTemplateYAMLPreviewModal, hideTemplateYAMLPreviewModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={hideTemplateYAMLPreviewModal}
        title={'template.yaml'}
        isCloseButtonShown
        className={cx(Classes.DIALOG, css.templateYamlPreviewDialog)}
        usePortal
        backdropClassName={css.templateYamlPreviewDialogBackdrop}
      >
        <Container className={css.templateYamlPreviewContainer}>
          <TemplateYaml
            templateYaml={defaultTo(selectedTemplate?.yaml, '')}
            withoutHeader
            overrideEditorOptions={{
              scrollbar: {
                useShadows: false,
                handleMouseWheel: true
              },
              scrollBeyondLastLine: true
            }}
          />
        </Container>
      </Dialog>
    ),
    [selectedTemplate?.yaml]
  )

  const menuItems = [
    ...(onOpenTemplateSelector
      ? [
          {
            icon: 'command-switch',
            label: getString('pipeline.changeTemplateLabel'),
            onClick: onChangeTemplate
          }
        ]
      : []),
    ...(onRemoveTemplate
      ? [
          {
            icon: 'main-trash',
            label: getString('pipeline.removeTemplateLabel'),
            onClick: openRemoveTemplateDialog
          }
        ]
      : [])
  ]

  const getItems = (): TemplateMenuItem[] => {
    return [
      ...(!readyOnly ? (menuItems as TemplateMenuItem[]) : []),
      ...(remoteFetchError
        ? []
        : ([
            {
              icon: 'main-share',
              label: getString('pipeline.openTemplateInNewTabLabel'),
              onClick: () => openTemplate(true)
            },
            {
              icon: 'main-view',
              label: getString('platform.connectors.ceAws.crossAccountRoleExtention.step1.p2'),
              onClick: openTemplate
            },
            {
              icon: 'main-view',
              label: getString('pipeline.previewTemplateLabel'),
              onClick: showTemplateYAMLPreviewModal
            }
          ] as TemplateMenuItem[]))
    ]
  }

  return (
    <Container
      padding={{ top: 'small', right: 'medium', bottom: 'small', left: 'medium' }}
      background={Color.PRIMARY_6}
      border={{ radius: 4 }}
      className={cx(css.container, className)}
    >
      <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon size={11} color={Color.WHITE} name={'template-library'} />
        {loading && (
          <Text font={{ size: 'small' }} color={Color.WHITE}>
            {getString('loading')}
          </Text>
        )}
        {!loading && (!isEmpty(selectedTemplate) || remoteFetchError) && (
          <Text font={{ size: 'small' }} color={Color.WHITE} lineClamp={1}>
            {`Using Template: ${
              supportVersionChange
                ? selectedTemplateDataWithRemoteFetchFailHandled?.name || ''
                : getTemplateNameWithLabel(selectedTemplateDataWithRemoteFetchFailHandled)
            }`}
          </Text>
        )}

        {!loading && supportVersionChange && (!isEmpty(selectedTemplate) || remoteFetchError) && (
          <VersionsDropDown
            items={versionOptions}
            value={templateLinkConfig?.versionLabel}
            onChange={onTemplateVersionChangeClick}
            width={120}
            stableVersion={stableVersion}
          />
        )}
        {(selectedTemplate?.storeType === StoreType.REMOTE || remoteFetchError) && (
          <div className={css.gitRemoteDetailsWrapper}>
            <GitRemoteDetails
              repoName={remoteFetchError ? errorMetaData?.repo : selectedTemplate?.gitDetails?.repoName}
              branch={remoteFetchError ? errorMetaData?.branch : selectedTemplate?.gitDetails?.branch}
              flags={{ readOnly: true, normalInputStyle: true }}
              branchCustomClassName={css.gitRemoteDetails}
              customClassName={css.gitRemoteDetails}
            />
          </div>
        )}
        <Popover // Disabling popover menu if selectedTemplate is not present without remoteFetchError
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          position={Position.BOTTOM_RIGHT}
          className={css.main}
          disabled={!remoteFetchError && isEmpty(selectedTemplate)}
          portalClassName={css.popover}
        >
          <Icon
            name={'more'}
            color={Color.WHITE}
            className={css.actionButton}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
            {getItems().map(item => {
              return (
                <li
                  key={item.label}
                  className={cx(css.menuItem, { [css.disabled]: item.disabled })}
                  onClick={e => {
                    e.stopPropagation()
                    if (!item.disabled) {
                      item.onClick()
                      setMenuOpen(false)
                    }
                  }}
                >
                  {item.icon && <Icon name={item.icon} size={12} />}
                  <Text lineClamp={1}>{item.label}</Text>
                </li>
              )
            })}
          </Menu>
        </Popover>
      </Layout.Horizontal>
    </Container>
  )
}
