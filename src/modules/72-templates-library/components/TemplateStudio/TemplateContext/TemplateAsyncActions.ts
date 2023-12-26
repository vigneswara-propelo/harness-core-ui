import { cloneDeep, defaultTo, maxBy } from 'lodash-es'
import { parse } from 'yaml'
import {
  NGTemplateInfoConfig,
  TemplateMetadataSummaryResponse,
  TemplateResponse,
  TemplateSummaryResponse
} from 'services/template-ng'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { DefaultNewTemplateId, DefaultNewVersionLabel, DefaultTemplate } from 'framework/Templates/templates'
import type { EntityGitDetails, Error, GetTemplateQueryParams } from 'services/template-ng'

import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { StoreMetadata } from '@common/constants/GitSyncTypes'
import {
  getTemplateMetadata,
  getTemplateYaml,
  getTemplatesByIdentifier
} from '@templates-library/common/components/TemplateStudio/TemplateLoaderContext/helpers'
import { getId } from '@templates-library/common/components/TemplateStudio/TemplateLoaderContext/utils'
import { IDB } from '@modules/10-common/components/IDBContext/IDBContext'
import { DispatchFunc } from '@modules/10-common/hooks/useThunkReducer'
import { ActionReturnType, TemplateContextActions, compareTemplates } from './TemplateActions'
import { TemplateReducerState } from './TemplateReducer'
import { isNewTemplate } from '../TemplateStudioUtils'
import { TemplatePayload } from './types'

const logger = loggerFor(ModuleName.TEMPLATES)

export interface FetchTemplateUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  signal?: AbortSignal
  repoIdentifier?: string
  repoName?: string
  branch?: string
  loadFromCache?: boolean
}

export interface FetchTemplateBoundProps {
  queryParams: GetTemplateQueryParams
  templateIdentifier: string
  versionLabel?: string
  gitDetails: EntityGitDetails
  templateType: string
  isGitCacheEnabled?: boolean
  isDBInitializationFailed?: boolean
}

export const fetchTemplateV1Action = (
  args: FetchTemplateBoundProps,
  fetchProps: FetchTemplateUnboundProps,
  { idb }: { idb: IDB<TemplatePayload> }
): ((
  dispatch: DispatchFunc<TemplateReducerState, ActionReturnType>,
  getState: () => TemplateReducerState
) => Promise<void>) => {
  return async (dispatch, _getState) => {
    const { queryParams, templateIdentifier, versionLabel = '', gitDetails, templateType } = args
    const { forceFetch = false, forceUpdate = false, signal, repoIdentifier, branch } = fetchProps

    let id = getId(
      queryParams.accountIdentifier,
      defaultTo(queryParams.orgIdentifier, ''),
      defaultTo(queryParams.projectIdentifier, ''),
      templateIdentifier,
      versionLabel,
      defaultTo(gitDetails.repoIdentifier, ''),
      defaultTo(gitDetails.branch, '')
    )
    if (idb.idb) {
      dispatch(TemplateContextActions.fetching())

      let data = await idb.get(id)

      if ((!data || forceFetch) && !isNewTemplate(templateIdentifier)) {
        try {
          const templatesList: TemplateSummaryResponse[] = await getTemplatesByIdentifier(
            {
              ...queryParams,
              templateListType: TemplateListType.All,
              ...(repoIdentifier && branch ? { repoIdentifier, branch } : {})
            },
            templateIdentifier,
            signal
          )

          const versions: string[] = templatesList.map(item => defaultTo(item.versionLabel, ''))
          const defaultVersion = defaultTo(templatesList.find(item => item.stableTemplate)?.versionLabel, '')
          const selectedVersion = versions.includes(versionLabel) ? versionLabel : defaultVersion
          const stableVersion = templatesList.find(item => item.stableTemplate)?.versionLabel
          const lastPublishedVersion = maxBy(templatesList, 'createdAt')?.versionLabel
          const templateWithGitDetails = templatesList.find(item => item.versionLabel === selectedVersion)
          id = getId(
            queryParams.accountIdentifier,
            defaultTo(queryParams.orgIdentifier, ''),
            defaultTo(queryParams.projectIdentifier, ''),
            templateIdentifier,
            versionLabel,
            defaultTo(gitDetails.repoIdentifier, templateWithGitDetails?.gitDetails?.repoIdentifier ?? ''),
            defaultTo(gitDetails.branch, templateWithGitDetails?.gitDetails?.branch ?? '')
          )

          data = await idb.get(id)

          let template: NGTemplateInfoConfig
          const templateYamlStr = defaultTo(templateWithGitDetails?.yaml, '')
          try {
            template = defaultTo(parse(templateYamlStr)?.template, {})
          } catch (e) {
            // It is assumed that execution will come here, if there are only syntatical errors in yaml string
            /* istanbul ignore next */
            template = {
              name: defaultTo(templateWithGitDetails?.name, ''),
              identifier: defaultTo(templateWithGitDetails?.identifier, ''),
              type: defaultTo(templateWithGitDetails?.childType, 'Step') as 'Step' | 'Stage',
              versionLabel: defaultTo(templateWithGitDetails?.versionLabel, ''),
              spec: {}
            }
          }

          dispatchTemplateSuccess({
            dispatch,
            data,
            forceUpdate,
            id,
            stableVersion,
            lastPublishedVersion,
            template,
            templateWithGitDetails,
            templateYamlStr,
            versions,
            idb
          })
        } catch (_) {
          logger.info('Failed to fetch template list')
        }
      } else {
        dispatch(
          TemplateContextActions.success({
            error: '',
            template: defaultTo(data?.template, {
              ...DefaultTemplate,
              type: templateType as NGTemplateInfoConfig['type'],
              projectIdentifier: queryParams.projectIdentifier,
              orgIdentifier: queryParams.orgIdentifier
            }),
            originalTemplate: defaultTo(
              cloneDeep(data?.template),
              cloneDeep({
                ...DefaultTemplate,
                type: templateType as NGTemplateInfoConfig['type'],
                projectIdentifier: queryParams.projectIdentifier,
                orgIdentifier: queryParams.orgIdentifier
              })
            ),
            isUpdated: true,
            isBETemplateUpdated: false,
            versions: [DefaultNewVersionLabel],
            stableVersion: DefaultNewVersionLabel,
            gitDetails: defaultTo(data?.gitDetails, {}),
            entityValidityDetails: defaultTo(data?.entityValidityDetails, {}),
            cacheResponseMetadata: data?.cacheResponseMetadata,
            templateYaml: defaultTo(data?.templateYaml, '')
          })
        )
        dispatch(TemplateContextActions.initialized())
      }
    } else {
      dispatch(TemplateContextActions.success({ error: 'DB is not initialized' }))
    }
  }
}

export const fetchTemplateV2Action = (
  args: FetchTemplateBoundProps,
  fetchProps: FetchTemplateUnboundProps,
  { idb }: { idb: IDB<TemplatePayload> }
): ((
  dispatch: DispatchFunc<TemplateReducerState, ActionReturnType>,
  getState: () => TemplateReducerState
) => Promise<void>) => {
  return async (dispatch, _getState) => {
    const { queryParams, templateIdentifier, versionLabel = '', gitDetails, templateType, isGitCacheEnabled } = args
    const { forceFetch = false, forceUpdate = false, signal, repoName, branch, loadFromCache = true } = fetchProps

    let id = getId(
      queryParams.accountIdentifier,
      defaultTo(queryParams.orgIdentifier, ''),
      defaultTo(queryParams.projectIdentifier, ''),
      templateIdentifier,
      versionLabel,
      defaultTo(repoName, ''),
      defaultTo(gitDetails.branch, '')
    )
    if (idb.idb) {
      dispatch(TemplateContextActions.fetching())

      let data = await idb.get(id)

      let templateMetadata: TemplateMetadataSummaryResponse[] = []
      if ((!data || forceFetch) && !isNewTemplate(templateIdentifier)) {
        try {
          templateMetadata = await getTemplateMetadata(
            {
              ...queryParams,
              templateListType: TemplateListType.All,
              size: 100,
              ...(repoName && branch ? { repoName, branch } : {})
            },
            templateIdentifier,
            signal
          )

          const versions: string[] = templateMetadata.map(item => defaultTo(item.versionLabel, ''))
          const stableVersion = templateMetadata.find(item => item.stableTemplate)?.versionLabel
          const lastPublishedVersion = maxBy(templateMetadata, 'createdAt')?.versionLabel
          const storeType = templateMetadata.at(0)?.storeType
          const loadFromFallbackBranch = !branch && !queryParams.branch && storeType === 'REMOTE'

          const templateWithGitDetails = await getTemplateYaml(
            {
              ...queryParams,
              versionLabel,
              ...(repoName && branch ? { repoName, branch } : {}),
              ...(loadFromFallbackBranch && { loadFromFallbackBranch: true })
            },
            templateIdentifier,
            !!isGitCacheEnabled,
            loadFromCache,
            signal
          )

          id = getId(
            queryParams.accountIdentifier,
            defaultTo(queryParams.orgIdentifier, ''),
            defaultTo(queryParams.projectIdentifier, ''),
            templateIdentifier,
            versionLabel,
            defaultTo(repoName, templateWithGitDetails?.gitDetails?.repoName ?? ''),
            defaultTo(gitDetails.branch, templateWithGitDetails?.gitDetails?.branch ?? '')
          )

          data = await idb.get(id)

          let template: NGTemplateInfoConfig
          const templateYamlStr = defaultTo(templateWithGitDetails?.yaml, '')
          try {
            template = defaultTo(parse(templateYamlStr)?.template, {})
          } catch (e) {
            // It is assumed that execution will come here, if there are only syntatical errors in yaml string
            /* istanbul ignore next */
            template = {
              name: defaultTo(templateWithGitDetails?.name, ''),
              identifier: defaultTo(templateWithGitDetails?.identifier, ''),
              type: defaultTo(templateWithGitDetails?.childType, 'Step') as 'Step' | 'Stage',
              versionLabel: defaultTo(templateWithGitDetails?.versionLabel, ''),
              spec: {}
            }
          }

          dispatchTemplateSuccess({
            dispatch,
            data,
            forceUpdate: forceUpdate || !!templateWithGitDetails.cacheResponseMetadata?.isSyncEnabled,
            id,
            stableVersion,
            lastPublishedVersion,
            template,
            templateWithGitDetails,
            templateYamlStr,
            versions,
            idb
          })
        } catch (error) {
          if (
            (error as Error).code === 'INVALID_REQUEST' ||
            (error as Error).code === 'HINT' ||
            (error as Error).code === 'EXPLANATION' ||
            (error as Error).code === 'SCM_BAD_REQUEST'
          ) {
            const template = templateMetadata.find(item => item.versionLabel === versionLabel)
            const versions: string[] = templateMetadata.map(item => defaultTo(item.versionLabel, ''))
            const stableVersion = templateMetadata.find(item => item.stableTemplate)?.versionLabel
            const lastPublishedVersion = maxBy(templateMetadata, 'createdAt')?.versionLabel
            const storeMetadata = {
              connectorRef: (template as TemplateResponse)?.connectorRef,
              storeType: (template as TemplateResponse)?.storeType,
              repoName: template?.gitDetails?.repoName,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              branch: (error as any)?.metadata?.branch ?? gitDetails?.branch,
              filePath: template?.gitDetails?.filePath
            }

            if (template?.templateEntityType)
              dispatch(
                TemplateContextActions.error({
                  template: {
                    ...(template as NGTemplateInfoConfig),
                    type: template?.templateEntityType
                  },
                  stableVersion,
                  lastPublishedVersion,
                  storeMetadata,
                  gitDetails: {
                    repoName: storeMetadata.repoName,
                    filePath: storeMetadata.filePath,
                    branch: storeMetadata.branch,
                    fileUrl: template.gitDetails?.fileUrl
                  },
                  versions,
                  templateYamlError: error as Error,
                  cacheResponseMetadata: undefined
                })
              )
          } else if ((error as Error).code === 'RESOURCE_NOT_FOUND_EXCEPTION') {
            dispatch(
              TemplateContextActions.error({
                templateYamlError: error as Error
              })
            )
          }
          dispatch(TemplateContextActions.initialized())
          logger.info('Failed to fetch template')
        }
      } else {
        dispatch(
          TemplateContextActions.success({
            error: '',
            template: defaultTo(data?.template, {
              ...DefaultTemplate,
              type: templateType as NGTemplateInfoConfig['type'],
              projectIdentifier: queryParams.projectIdentifier,
              orgIdentifier: queryParams.orgIdentifier
            }),
            originalTemplate: defaultTo(
              cloneDeep(data?.template),
              cloneDeep({
                ...DefaultTemplate,
                type: templateType as NGTemplateInfoConfig['type'],
                projectIdentifier: queryParams.projectIdentifier,
                orgIdentifier: queryParams.orgIdentifier
              })
            ),
            isUpdated: true,
            isBETemplateUpdated: false,
            versions: [DefaultNewVersionLabel],
            stableVersion: DefaultNewVersionLabel,
            gitDetails: defaultTo(data?.gitDetails, {}),
            storeMetadata: {
              connectorRef: data?.connectorRef,
              storeType: data?.storeType,
              repoName: data?.gitDetails?.repoName,
              branch: data?.gitDetails?.branch,
              filePath: data?.gitDetails?.filePath
            },
            entityValidityDetails: defaultTo(data?.entityValidityDetails, {}),
            cacheResponseMetadata: data?.cacheResponseMetadata,
            templateYaml: defaultTo(data?.templateYaml, '')
          })
        )
        dispatch(TemplateContextActions.initialized())
      }
    } else {
      dispatch(TemplateContextActions.success({ error: 'DB is not initialized' }))
    }
  }
}

interface UpdateTemplateArgs {
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
}
export const updateTemplateAction = ({
  templateArg,
  params,
  utils: { idb }
}: {
  templateArg: NGTemplateInfoConfig | ((p: NGTemplateInfoConfig) => NGTemplateInfoConfig)
  params: UpdateTemplateArgs
  utils: { idb: IDB<TemplatePayload> }
}): ((
  dispatch: DispatchFunc<TemplateReducerState, ActionReturnType>,
  getState: () => TemplateReducerState
) => Promise<void>) => {
  return async (dispatch, getState) => {
    const { queryParams, identifier, versionLabel = '' } = params
    const { originalTemplate, versions, stableVersion, gitDetails, template: latestTemplate } = getState()

    const id = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      identifier,
      versionLabel,
      defaultTo(gitDetails?.repoName, gitDetails?.repoIdentifier ?? ''),
      defaultTo(gitDetails?.branch, '')
    )

    let template = templateArg

    if (typeof templateArg === 'function') {
      const dbTemplate = await idb.get(id)
      if (dbTemplate?.template) {
        template = templateArg(dbTemplate.template)
      } else {
        // Template does not exist in the db
        template = templateArg(latestTemplate)
      }
    }

    const isUpdated = compareTemplates(originalTemplate, template as NGTemplateInfoConfig)

    const payload: TemplatePayload = {
      identifier: id,
      template: template as NGTemplateInfoConfig,
      originalTemplate,
      versions,
      stableVersion,
      isUpdated,
      gitDetails
    }
    await idb.put(payload)

    dispatch(TemplateContextActions.success({ error: '', template: template as NGTemplateInfoConfig, isUpdated }))
  }
}

interface UpdateTemplateArgs {
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
}

interface UpdateGitDetailsArgs {
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
}

export const updateGitDetailsAction = ({
  gitDetails,
  params,
  utils: { idb }
}: {
  gitDetails: EntityGitDetails
  params: UpdateGitDetailsArgs
  utils: { idb: IDB<TemplatePayload> }
}): ((
  dispatch: DispatchFunc<TemplateReducerState, ActionReturnType>,
  getState: () => TemplateReducerState
) => Promise<void>) => {
  return async (dispatch, getState) => {
    const { queryParams, identifier, versionLabel } = params
    const { originalTemplate, template } = getState()

    await deleteTemplateCache({ queryParams, identifier, versionLabel, utils: { idb } })

    const id = getId(
      queryParams.accountIdentifier,
      defaultTo(queryParams.orgIdentifier, ''),
      defaultTo(queryParams.projectIdentifier, ''),
      identifier,
      defaultTo(versionLabel, ''),
      defaultTo(gitDetails.repoIdentifier, ''),
      defaultTo(gitDetails.branch, '')
    )

    const isUpdated = compareTemplates(originalTemplate, template)

    const payload: TemplatePayload = {
      identifier: id,
      template,
      originalTemplate,
      isUpdated,
      gitDetails
    }
    await idb.put(payload)

    dispatch(TemplateContextActions.success({ error: '', template, isUpdated, gitDetails }))
  }
}

interface UpdateGitDetailsArgs {
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
}

export const updateStoreMetadataAction = ({
  args,
  storeMetadata,
  gitDetails,
  utils: { idb }
}: {
  args: UpdateGitDetailsArgs
  storeMetadata: StoreMetadata
  gitDetails?: EntityGitDetails
  utils: { idb: IDB<TemplatePayload> }
}): ((
  dispatch: DispatchFunc<TemplateReducerState, ActionReturnType>,
  getState: () => TemplateReducerState
) => Promise<void>) => {
  return async (dispatch, getState) => {
    const { queryParams, identifier, versionLabel } = args
    const { originalTemplate, template } = getState()

    await deleteTemplateCache({ queryParams, identifier, versionLabel, utils: { idb } })

    const id = getId(
      queryParams.accountIdentifier,
      defaultTo(queryParams.orgIdentifier, ''),
      defaultTo(queryParams.projectIdentifier, ''),
      identifier,
      defaultTo(versionLabel, ''),
      defaultTo(gitDetails?.repoName, ''),
      defaultTo(gitDetails?.branch, '')
    )

    const isUpdated = compareTemplates(originalTemplate, template)

    const payload: TemplatePayload = {
      identifier: id,
      template,
      originalTemplate,
      isUpdated,
      storeMetadata,
      gitDetails
    }
    await idb.put(payload)

    dispatch(TemplateContextActions.success({ error: '', template, isUpdated, storeMetadata, gitDetails }))
  }
}

export const deleteTemplateCacheAction = ({
  queryParams,
  identifier,
  versionLabel,
  utils: { idb }
}: {
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
  utils: { idb: IDB<TemplatePayload> }
}): ((
  dispatch: DispatchFunc<TemplateReducerState, ActionReturnType>,
  getState: () => TemplateReducerState
) => Promise<void>) => {
  return async (_dispatch, getState) => {
    const { gitDetails } = getState()

    await deleteTemplateCache({ queryParams, identifier, versionLabel, gitDetails, utils: { idb } })
  }
}

const deleteTemplateCache = async ({
  queryParams,
  identifier,
  versionLabel,
  gitDetails = {},
  utils: { idb }
}: {
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
  gitDetails?: EntityGitDetails
  utils: { idb: IDB<TemplatePayload> }
}): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || /* istanbul ignore next */ '',
    queryParams.projectIdentifier || /* istanbul ignore next */ '',
    identifier,
    defaultTo(versionLabel, ''),
    defaultTo(gitDetails?.repoName, gitDetails?.repoIdentifier ?? ''),
    defaultTo(gitDetails?.branch, '')
  )
  await idb.del(id)

  const defaultId = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || /* istanbul ignore next */ '',
    queryParams.projectIdentifier || /* istanbul ignore next */ '',
    DefaultNewTemplateId,
    DefaultNewVersionLabel,
    defaultTo(gitDetails?.repoName, gitDetails?.repoIdentifier ?? ''),
    defaultTo(gitDetails?.branch, '')
  )
  await idb.del(defaultId)
}

interface DispatchTemplateSuccessArgs {
  dispatch: React.Dispatch<ActionReturnType>
  data: TemplatePayload | undefined
  forceUpdate: boolean
  template: NGTemplateInfoConfig
  templateYamlStr: string
  versions: string[]
  templateWithGitDetails: TemplateSummaryResponse | TemplateResponse | undefined
  id: string
  stableVersion: string | undefined
  lastPublishedVersion: string | undefined
  idb: IDB<TemplatePayload>
}
export const dispatchTemplateSuccess = async (args: DispatchTemplateSuccessArgs): Promise<void> => {
  const {
    dispatch,
    data,
    forceUpdate,
    template,
    templateYamlStr,
    versions,
    templateWithGitDetails,
    id,
    stableVersion,
    lastPublishedVersion,
    idb
  } = args
  const storeMetadata = {
    connectorRef: (templateWithGitDetails as TemplateResponse)?.connectorRef,
    storeType: (templateWithGitDetails as TemplateResponse)?.storeType,
    repoName: templateWithGitDetails?.gitDetails?.repoName,
    branch: templateWithGitDetails?.gitDetails?.branch,
    filePath: templateWithGitDetails?.gitDetails?.filePath
  }
  if (data && !forceUpdate) {
    dispatch(
      TemplateContextActions.success({
        error: '',
        template: data.template,
        originalTemplate: cloneDeep(template),
        isBETemplateUpdated: data.cacheResponseMetadata?.isSyncEnabled
          ? false
          : compareTemplates(template, data.originalTemplate),
        isUpdated: compareTemplates(template, data.template),
        versions: versions,
        lastPublishedVersion,
        stableVersion: data.stableVersion,
        gitDetails: templateWithGitDetails?.gitDetails ?? defaultTo(data?.gitDetails, {}),
        entityValidityDetails: defaultTo(
          templateWithGitDetails?.entityValidityDetails,
          defaultTo(data?.entityValidityDetails, {})
        ),
        cacheResponseMetadata: (templateWithGitDetails as TemplateResponse)?.cacheResponseMetadata,
        storeMetadata,
        templateYaml: data?.templateYaml,
        templateYamlError: undefined
      })
    )
    dispatch(TemplateContextActions.initialized())
  } else if (idb.idb) {
    const payload: TemplatePayload = {
      identifier: id,
      template: template,
      originalTemplate: cloneDeep(template),
      isUpdated: false,
      versions: versions,
      lastPublishedVersion,
      stableVersion: stableVersion,
      gitDetails: templateWithGitDetails?.gitDetails ?? defaultTo(data?.gitDetails, {}),
      storeMetadata,
      entityValidityDetails: defaultTo(
        templateWithGitDetails?.entityValidityDetails,
        defaultTo(data?.entityValidityDetails, {})
      ),
      cacheResponseMetadata: (templateWithGitDetails as TemplateResponse)?.cacheResponseMetadata,
      templateYaml: templateYamlStr
    }
    await idb.put(payload)
    dispatch(
      TemplateContextActions.success({
        error: '',
        template: template,
        originalTemplate: cloneDeep(template),
        isBETemplateUpdated: false,
        isUpdated: false,
        versions: versions,
        lastPublishedVersion,
        stableVersion: stableVersion,
        gitDetails: payload.gitDetails,
        storeMetadata: payload.storeMetadata,
        entityValidityDetails: payload.entityValidityDetails,
        cacheResponseMetadata: payload.cacheResponseMetadata,
        templateYaml: payload.templateYaml,
        templateYamlError: undefined
      })
    )
    dispatch(TemplateContextActions.initialized())
  } else {
    dispatch(
      TemplateContextActions.success({
        error: '',
        template: template,
        originalTemplate: cloneDeep(template),
        isBETemplateUpdated: false,
        isUpdated: false,
        versions: versions,
        lastPublishedVersion,
        stableVersion: stableVersion,
        gitDetails: templateWithGitDetails?.gitDetails ?? {},
        storeMetadata,
        entityValidityDetails: defaultTo(templateWithGitDetails?.entityValidityDetails, {}),
        cacheResponseMetadata: (templateWithGitDetails as TemplateResponse)?.cacheResponseMetadata,
        templateYaml: templateYamlStr,
        templateYamlError: undefined
      })
    )
    dispatch(TemplateContextActions.initialized())
  }
}
