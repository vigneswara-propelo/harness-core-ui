/* eslint-disable @typescript-eslint/explicit-function-return-type */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, MultiSelectOption, SelectOption, useToaster } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { defaultTo, isEmpty, toLower } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import {
  usePostFilter,
  useUpdateFilter,
  useDeleteFilter,
  FilterDTO,
  PipelineExecutionFilterProperties,
  useGetTriggerListForTarget,
  GetFilterListQueryParams,
  getFilterListPromise
} from 'services/pipeline-ng'
import { useGetEnvironmentListV2, useGetServiceDefinitionTypes } from 'services/cd-ng'
import { Servicev1Application, useApplicationServiceListApps } from 'services/gitops'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import FilterSelector, {
  customRenderersForInfiniteScroll
} from '@common/components/Filter/FilterSelector/FilterSelector'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import { useBooleanStatus, useMutateAsGet, useUpdateQueryParams } from '@common/hooks'
import type { PipelineType, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import {
  PipelineExecutionFormType,
  getMultiSelectFormOptions,
  BUILD_TYPE,
  getFilterByIdentifier,
  getBuildType,
  getValidFilterArguments,
  createRequestBodyPayload,
  getExecutorTriggerTypeOption,
  ExecutorTriggerType
} from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import { isObjectEmpty, UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { deploymentTypeLabel } from '@pipeline/utils/DeploymentTypeUtils'
import { killEvent } from '@common/utils/eventUtils'
import {
  useExecutionListFilterFieldToLabelMapping,
  useFilterWithValidFieldsWithMetaInfo
} from '@pipeline/pages/utils/Filters/filters'
import { StringUtils } from '@common/exports'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDActions, Category } from '@common/constants/TrackingConstants'
import { useInfiniteScroll } from '@modules/10-common/hooks/useInfiniteScroll'
import type { ExecutionListPageQueryParams } from '../types'
import { ExecutionListFilterForm } from '../ExecutionListFilterForm/ExecutionListFilterForm'
import { useExecutionListQueryParams } from '../utils/executionListUtil'
export interface ExecutionFilterQueryParams {
  filter?: string
}

const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)

export function ExecutionListFilter(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<ExecutionListPageQueryParams>>()
  const [gitOpsAppNameOptions, setGitOpsAppNameOptions] = React.useState<SelectOption[] | undefined>([])
  const queryParams = useExecutionListQueryParams()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const filterDrawerOpenedRef = useRef(false)
  const { showError } = useToaster()
  const { selectedProject } = useAppStore()
  const isCDEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CD') > -1) || false
  const isCIEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CI') > -1) || false

  /**Start Data hooks */

  const { data: deploymentTypeResponse, loading: isDeploymentTypesLoading } = useGetServiceDefinitionTypes({
    queryParams: { accountId },
    lazy: !filterDrawerOpenedRef.current
  })

  const { data: environmentsResponse, loading: isEnvironmentsLoading } = useMutateAsGet(useGetEnvironmentListV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      includeAllAccessibleAtScope: true
    },
    body: {
      filterType: 'Environment'
    },
    lazy: !filterDrawerOpenedRef.current
  })

  const { mutate: getApplications } = useApplicationServiceListApps({})

  const { data: triggerListResponse } = useGetTriggerListForTarget({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: defaultTo(pipelineIdentifier, '')
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' }
  })

  React.useEffect(() => {
    const fetchData = async () => {
      if (!filterDrawerOpenedRef.current) {
        return
      }

      const { content } = await getApplications({
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        metadataOnly: true,
        pageIndex: 0,
        pageSize: 1000
      })

      const options = content?.map((item: Servicev1Application) => ({
        label: `${item?.name} (${item?.agentIdentifier})`,
        value: toLower(`${item?.agentIdentifier || ''}:${item?.name || ''}`) // scope.agentId:appName
      }))

      setGitOpsAppNameOptions(options)
    }

    // Comment this line, if this breaks on local, if GitOps MFE is not enabled
    fetchData()
  }, [filterDrawerOpenedRef.current])

  const { mutate: createFilter, loading: isCreateFilterLoading } = usePostFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateFilter, loading: isUpdateFilterLoading } = useUpdateFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: deleteFilter, loading: isDeleteFilterLoading } = useDeleteFilter({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      type: 'PipelineExecution'
    }
  })

  const loadMoreRef = useRef(null)
  const pageSize = useRef(100)
  const [isFetchingFilterListNextTime, setIsFetchingFilterListNextTime] = useState(true)

  const filterListQueryParams: GetFilterListQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'PipelineExecution'
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )

  const {
    items: filterList,
    fetching: isFilterListLoading,
    error: filterListError,
    attachRefToLastElement,
    offsetToFetch,
    reset: resetList
  } = useInfiniteScroll({
    getItems: options => {
      return getFilterListPromise({
        queryParams: { ...filterListQueryParams, pageSize: options.limit, pageIndex: options.offset }
      })
    },
    limit: pageSize.current,
    loadMoreRef
  })
  /**End Data hooks */

  const refetchFilterList = async () => resetList()

  useEffect(() => {
    setIsFetchingFilterListNextTime(isFilterListLoading && offsetToFetch.current > 0)
  }, [isFilterListLoading, offsetToFetch.current])

  const isEmptyContent = useMemo(() => {
    return !isFilterListLoading && !filterListError && isEmpty(filterList)
  }, [isFilterListLoading, filterListError, filterList])

  const { itemRenderer, itemListRenderer } = customRenderersForInfiniteScroll({
    attachRefToLastElement,
    isEmptyContent,
    isFetchingFilterListNextTime,
    isFilterListLoading,
    loadMoreRef,
    offsetToFetch,
    getString
  })

  const deploymentTypeSelectOptions = useMemo(() => {
    const options: SelectOption[] =
      deploymentTypeResponse?.data
        ?.filter(deploymentType => deploymentType in deploymentTypeLabel)
        .map(type => ({
          label: getString(deploymentTypeLabel[type]),
          value: type as string
        })) || ([] as SelectOption[])

    return options
  }, [deploymentTypeResponse?.data])

  const isMetaDataLoading = isDeploymentTypesLoading || isEnvironmentsLoading
  const isFilterCrudLoading =
    isCreateFilterLoading || isUpdateFilterLoading || isDeleteFilterLoading || isFilterListLoading
  const appliedFilter =
    queryParams.filterIdentifier && queryParams.filterIdentifier !== UNSAVED_FILTER_IDENTIFIER
      ? getFilterByIdentifier(queryParams.filterIdentifier, filterList)
      : !isEmpty(queryParams.filters)
      ? ({
          name: UNSAVED_FILTER,
          identifier: UNSAVED_FILTER_IDENTIFIER,
          filterProperties: queryParams.filters,
          filterVisibility: undefined
        } as FilterDTO)
      : null
  const { name = '', filterVisibility, identifier = '', filterProperties } = appliedFilter || {}
  const {
    pipelineName,
    status,
    triggerTypes,
    triggerIdentifiers,
    moduleProperties,
    timeRange,
    pipelineTags,
    executionModeFilter
  } = (filterProperties as PipelineExecutionFilterProperties) || {}
  const { ci, cd } = moduleProperties || {}
  const {
    serviceDefinitionTypes,
    infrastructureType,
    serviceIdentifiers,
    envIdentifiers,
    gitOpsAppIdentifiers,
    artifactDisplayNames
  } = cd || {}
  const { branch, tag, ciExecutionInfoDTO, repoName: repositoryName } = ci || {}
  const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}
  const buildType = getBuildType(moduleProperties || {})

  const fieldToLabelMapping = useExecutionListFilterFieldToLabelMapping()
  const filterWithValidFieldsWithMetaInfo = useFilterWithValidFieldsWithMetaInfo(
    appliedFilter?.filterProperties,
    fieldToLabelMapping
  )

  /**Start Handlers */
  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => {
    killEvent(event)
    updateQueryParams(
      {
        filterIdentifier: option.value ? option.value.toString() : undefined,
        filters: undefined
      },
      { skipNulls: false, strictNullHandling: true }
    )
    option?.value &&
      trackEvent(CDActions.ApplyAdvancedFilter, {
        category: Category.PIPELINE_EXECUTION
      })
  }

  const handleFilterClick = (filterIdentifier: string) => {
    if (filterIdentifier !== UNSAVED_FILTER_IDENTIFIER) {
      updateQueryParams(
        {
          filterIdentifier,
          filters: undefined
        },
        { skipNulls: false, strictNullHandling: true }
      )
    }
  }

  const onApply = (inputFormData: FormikProps<PipelineExecutionFormType>['values']) => {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = getValidFilterArguments({ ...inputFormData }, 'PipelineExecution')
      updateQueryParams(
        { page: undefined, filterIdentifier: undefined, filters: filterFromFormData || {} },
        { strictNullHandling: true, skipNulls: false }
      )
      hideFilterDrawer()
      trackEvent(CDActions.ApplyAdvancedFilter, {
        category: Category.PIPELINE_EXECUTION
      })
    } else {
      showError(getString('filters.invalidCriteria'))
    }
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<PipelineExecutionFormType, FilterInterface>
  ) => {
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (typeof saveOrUpdateHandler === 'function') {
      const requestBodyPayload = createRequestBodyPayload({
        isUpdate,
        data,
        projectIdentifier,
        orgIdentifier
      })
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
      updateQueryParams(
        { filters: updatedFilter?.filterProperties || {} },
        { skipNulls: false, strictNullHandling: true }
      )
      refetchFilterList()
      trackEvent(CDActions.ApplyAdvancedFilter, {
        category: Category.PIPELINE_EXECUTION
      })
    }
  }

  const handleDelete = async (deleteIdentifier: string) => {
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (typeof deleteHandler === 'function') {
      await deleteHandler(deleteIdentifier)
      reset()
      refetchFilterList()
    }
  }

  const reset = () => replaceQueryParams({})

  const triggerOptions: MultiSelectOption[] = defaultTo(
    triggerListResponse?.data?.content?.map(item => ({
      label: item.name || '',
      value: item.identifier || ''
    })),
    []
  )

  const triggerIdentifiersOptions = triggerIdentifiers?.map((triggerIdentifier: string) =>
    defaultTo(
      triggerOptions.find(triggerOption => triggerOption.value === triggerIdentifier),
      { label: triggerIdentifier, value: triggerIdentifier } as MultiSelectOption
    )
  )

  /**End Handlers */

  return (
    <Layout.Horizontal>
      <FilterSelector
        appliedFilter={appliedFilter}
        filters={filterList}
        refetchFilters={refetchFilterList}
        onFilterBtnClick={() => {
          filterDrawerOpenedRef.current = true
          openFilterDrawer()
        }}
        onFilterSelect={handleFilterSelection}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={filterWithValidFieldsWithMetaInfo}
        itemListRenderer={itemListRenderer}
        itemRenderer={itemRenderer}
      />
      <Filter<PipelineExecutionFormType, FilterDTO>
        isOpen={isFiltersDrawerOpen}
        formFields={
          <ExecutionListFilterForm<PipelineExecutionFormType>
            isCDEnabled={isCDEnabled}
            isCIEnabled={isCIEnabled}
            initialValues={{
              environments: getMultiSelectFormOptions(environmentsResponse?.data?.content, 'environment'),
              triggers: triggerOptions,
              deploymentType: deploymentTypeSelectOptions,
              gitOpsAppIdentifiers: gitOpsAppNameOptions
            }}
            type="PipelineExecution"
          />
        }
        initialFilter={{
          formValues: {
            pipelineName,
            pipelineTags,
            repositoryName,
            status: getMultiSelectFormOptions(status),
            triggerTypes: triggerTypes?.map(triggerType =>
              getExecutorTriggerTypeOption(triggerType as ExecutorTriggerType)
            ),
            triggerIdentifiers: triggerIdentifiersOptions,
            executionModeFilter,
            branch,
            tag,
            timeRange,
            sourceBranch,
            targetBranch,
            buildType,
            deploymentType: serviceDefinitionTypes,
            infrastructureType,
            services: getMultiSelectFormOptions(serviceIdentifiers, 'service'),
            environments: getMultiSelectFormOptions(envIdentifiers, 'environment'),
            artifacts: artifactDisplayNames?.join(', '),
            gitOpsAppIdentifiers: getMultiSelectFormOptions(gitOpsAppIdentifiers)
          },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filterList}
        isRefreshingFilters={isFilterCrudLoading || isMetaDataLoading}
        onApply={onApply}
        onClose={hideFilterDrawer}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        onClear={reset}
        ref={filterRef}
        dataSvcConfig={
          new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={refetchFilterList}
        validationSchema={Yup.object().shape({
          branch: Yup.string().when('buildType', {
            is: BUILD_TYPE.BRANCH,
            then: Yup.string()
          }),
          tag: Yup.string().when('buildType', {
            is: BUILD_TYPE.TAG,
            then: Yup.string()
          }),
          services: Yup.string().when('artifacts', {
            is: val => !isEmpty(val),
            then: Yup.string().required(getString('pipeline.validation.serviceProvideArtifacts'))
          })
        })}
      />
    </Layout.Horizontal>
  )
}
