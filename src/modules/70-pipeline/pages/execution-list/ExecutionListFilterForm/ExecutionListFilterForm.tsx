/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FormikProps, useFormikContext } from 'formik'
import { Container, FormInput, Layout, SelectOption, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { IItemRendererProps, ItemListRenderer } from '@blueprintjs/select'
import { defaultTo, get, isEmpty, isNil, isUndefined } from 'lodash-es'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { FilterProperties } from 'services/pipeline-ng'
import {
  getExecutionStatusOptions,
  BUILD_TYPE,
  DeploymentTypeContext,
  BuildTypeContext,
  getMultiSelectFormOptions,
  ExecutorTriggerType,
  getExecutorTriggerTypeOption
} from '@pipeline/utils/PipelineExecutionFilterRequestUtils'

import type { ModulePathParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import InputDatePicker from '@common/components/InputDatePicker/InputDatePicker'
import { getServiceListPromise } from 'services/cd-ng'
import { useInfiniteScroll } from '@common/hooks/useInfiniteScroll'
import css from './ExecutionListFilterForm.module.scss'

export type FormView = 'PIPELINE-META'

const executorTriggerTypes: ExecutorTriggerType[] = [
  'MANUAL',
  'WEBHOOK',
  'WEBHOOK_CUSTOM',
  'SCHEDULER_CRON',
  'ARTIFACT',
  'MANIFEST'
]
interface ExecutionListFilterFormProps<T> {
  formikProps?: FormikProps<T>
  type: FilterProperties['filterType']
  isCDEnabled: boolean
  isCIEnabled: boolean
  initialValues: FormikProps<T>['initialValues']
}

const NO_SELECTION = { label: '', value: '' }

type KVAccumulator = { [key: string]: string | undefined | null }

const convertToKVAccumulator = (values: string[]): KVAccumulator => {
  const filteredValues = values.filter(val => !isNil(val))
  const tagValues =
    filteredValues?.reduce((acc, tag) => {
      const parts = tag.split(':')
      acc[parts[0]] = !isUndefined(parts[1]) ? parts[1]?.trim() || '' : null
      return acc
    }, {} as KVAccumulator) || {}
  return tagValues
}

const convertToKeyValueString = (tagValues: KVAccumulator): string[] => {
  return Object.keys(tagValues || {}).map(key => {
    const value = tagValues[key]
    if (!isNil(value)) {
      if (isEmpty(value)) {
        return `${key}:`
      } else {
        return `${key}:${value}`
      }
    } else {
      return key
    }
  })
}

export function ExecutionListFilterForm<
  T extends {
    buildType?: BuildTypeContext['buildType']
    deploymentType?: DeploymentTypeContext['deploymentType']
    infrastructureType?: DeploymentTypeContext['infrastructureType']
  }
>(props: ExecutionListFilterFormProps<T>): React.ReactElement {
  const { getString } = useStrings()
  const { module } = useParams<ModulePathParams>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelineType<PipelinePathProps>>()
  const { type, formikProps, isCDEnabled, isCIEnabled, initialValues } = props
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const loadMoreRef = useRef(null)
  const formikFromContext = useFormikContext<T>()
  const pageSize = useRef(20)
  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size: pageSize.current,
      searchTerm
    }),
    [accountId, orgIdentifier, projectIdentifier, searchTerm]
  )

  const [isFetchingServiceNextTime, setIsFetchingServiceNextTime] = useState(true)

  const {
    items: servicesResponse,
    error: fetchServicesError,
    fetching: fetchingServices,
    attachRefToLastElement,
    offsetToFetch
  } = useInfiniteScroll({
    getItems: options => {
      return getServiceListPromise({
        queryParams: { ...queryParams, size: options.limit, page: options.offset }
      })
    },
    limit: pageSize.current,
    loadMoreRef,
    searchTerm
  })

  useEffect(() => {
    setIsFetchingServiceNextTime(fetchingServices && offsetToFetch.current > 0)
  }, [fetchingServices, offsetToFetch.current])

  const isEmptyContent = useMemo(() => {
    return !fetchingServices && !fetchServicesError && isEmpty(servicesResponse)
  }, [fetchingServices, fetchServicesError, servicesResponse])

  const getBuildTypeOptions = (): React.ReactElement => {
    let buildTypeField: JSX.Element = <></>
    const buildType = formikProps?.values?.buildType as BuildTypeContext['buildType']
    const buildTypeOptions = [
      { label: getString('filters.executions.pullOrMergeRequest'), value: BUILD_TYPE.PULL_OR_MERGE_REQUEST },
      { label: getString('pipelineSteps.deploy.inputSet.branch'), value: BUILD_TYPE.BRANCH },
      { label: getString('tagLabel'), value: BUILD_TYPE.TAG }
    ]
    switch (buildType) {
      case BUILD_TYPE.PULL_OR_MERGE_REQUEST:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'sourceBranch'}
              label={getString('common.sourceBranch')}
              key={'sourceBranch'}
              placeholder={getString('common.sourceBranchPlaceholder')}
            />
            <FormInput.Text
              name={'targetBranch'}
              label={getString('common.targetBranch')}
              key={'targetBranch'}
              placeholder={getString('common.targetBranchPlaceholder')}
            />
          </div>
        )
        break
      case BUILD_TYPE.BRANCH:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'branch'}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
              key={'branch'}
              placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            />
          </div>
        )
        break
      case BUILD_TYPE.TAG:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'tag'}
              label={getString('tagLabel')}
              key={'tag'}
              placeholder={getString('filters.executions.tagPlaceholder')}
            />
          </div>
        )
        break
      default:
        break
    }
    return (
      <>
        <>
          <span className={css.separator} key="buildsSeparator">
            <Text>{getString('buildsText').toUpperCase()}</Text>
          </span>
          {(type === 'PipelineExecution' && module === 'ci') || type === 'PipelineSetup' ? (
            <FormInput.Text
              name={'repositoryName'}
              label={getString('common.repositoryName')}
              key={'repositoryName'}
              placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            />
          ) : null}
          <FormInput.Select
            selectProps={{
              addClearBtn: true
            }}
            items={buildTypeOptions}
            name="buildType"
            label={getString('filters.executions.buildType')}
            placeholder={getString('pipeline.filters.builtTypePlaceholder')}
            key="buildType"
            value={
              buildType ? buildTypeOptions.find((option: SelectOption) => option.value === buildType) : NO_SELECTION
            }
          />
        </>
        {buildTypeField}
      </>
    )
  }

  const getDeploymentTypeOptions = (): React.ReactElement => {
    const {
      environments,
      gitOpsAppIdentifiers,
      deploymentType: deploymentTypeSelectOptions
    } = initialValues as DeploymentTypeContext
    const services = getMultiSelectFormOptions(servicesResponse, 'service')
    const deploymentTypeValue = formikProps?.values?.deploymentType
    const serviceItemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => {
      const { handleClick, index } = itemProps
      return (
        <div ref={attachRefToLastElement(defaultTo(index, 0)) ? loadMoreRef : undefined} key={item.label.toString()}>
          <Menu.Item
            text={
              <Layout.Horizontal spacing="small">
                <Text>{item.label}</Text>
              </Layout.Horizontal>
            }
            onClick={handleClick}
          />
        </div>
      )
    }

    const itemListRenderer: ItemListRenderer<SelectOption> = itemListProps => (
      <Menu>
        {isEmptyContent ? (
          <Layout.Vertical flex={{ align: 'center-center' }} width={'100%'} height={'100%'}>
            {getString('pipeline.noServiceAvailable')}
          </Layout.Vertical>
        ) : (
          itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))
        )}
        {isFetchingServiceNextTime && (
          <Container padding={'large'}>
            <Text icon="loading" iconProps={{ size: 20 }} font={{ align: 'center' }}>
              {getString('pipeline.fetchNextServices')}
            </Text>
          </Container>
        )}
      </Menu>
    )

    // const infrastructureTypeLabel = { label: getString('kubernetesDirectText'), value: 'Kubernetes Direct' }
    return (
      <>
        <span className={css.separator} key="deploymentSeparator">
          <Text>{getString('deploymentsText').toUpperCase()}</Text>
        </span>

        <FormInput.Select
          items={deploymentTypeSelectOptions || []}
          name="deploymentType"
          label={getString('deploymentTypeText')}
          placeholder={getString('pipeline.filters.deploymentTypePlaceholder')}
          key="deploymentType"
          value={
            deploymentTypeValue
              ? deploymentTypeSelectOptions?.find(
                  (option: SelectOption) => option.value === deploymentTypeValue[0].value
                )
              : NO_SELECTION
          }
        />
        {/* <FormInput.Select
          items={[infrastructureTypeLabel]}
          name="infrastructureType"
          label={getString('infrastructureTypeText')}
          key="infrastructureType"
          value={
            (formikProps?.values?.infrastructureType as DeploymentTypeContext['infrastructureType'])
              ? infrastructureTypeLabel
              : NO_SELECTION
          }
        /> */}

        <FormInput.MultiSelect
          items={services || []}
          name="services"
          label={getString('services')}
          key="services"
          placeholder={getString('pipeline.filters.servicePlaceholder')}
          multiSelectProps={{
            allowCreatingNewItems: false,
            itemListRenderer,
            itemRender: serviceItemRenderer,
            onQueryChange: query => setSearchTerm(query)
          }}
        />

        <FormInput.MultiSelect
          items={environments || []}
          name="environments"
          label={getString('environments')}
          placeholder={getString('pipeline.filters.environmentPlaceholder')}
          key="environments"
          multiSelectProps={{
            allowCreatingNewItems: false
          }}
        />

        <FormInput.TextArea
          name="artifacts"
          label={getString('artifacts')}
          placeholder={getString('pipeline.filters.artifactPlaceholder')}
          className={css.artifactFilterTextArea}
          key="artifacts"
          textArea={{
            growVertically: true
          }}
        />

        {type === 'PipelineExecution' && module === 'cd' ? (
          <FormInput.MultiSelect
            items={gitOpsAppIdentifiers || []}
            name="gitOpsAppIdentifiers"
            label={getString('applications')}
            placeholder={getString('pipeline.selectApplications')}
            key="gitOpsAppIdentifiers"
            multiSelectProps={{
              allowCreatingNewItems: false
            }}
          />
        ) : null}
      </>
    )
  }

  const getPipelineFormCommonFields = (): React.ReactElement => {
    const isPipeSetupType = type === 'PipelineSetup'

    const { triggers = [] } = initialValues as DeploymentTypeContext

    return (
      <>
        <FormInput.Text
          name={isPipeSetupType ? 'name' : 'pipelineName'}
          label={isPipeSetupType ? getString('name') : getString('filters.executions.pipelineName')}
          key={isPipeSetupType ? 'name' : 'pipelineName'}
          placeholder={getString('pipeline.filters.pipelineNamePlaceholder')}
        />
        {isPipeSetupType ? (
          <FormInput.Text
            name={'description'}
            label={getString('description')}
            placeholder={getString('common.descriptionPlaceholder')}
            key={'description'}
          />
        ) : null}
        <FormInput.KVTagInput
          name="pipelineTags"
          label={getString('tagsLabel')}
          key="pipelineTags"
          onChange={changed => {
            const values: string[] = changed as string[]
            formikFromContext?.setFieldTouched('pipelineTags', true, false)
            formikFromContext?.setFieldValue('pipelineTags', convertToKVAccumulator(values))
          }}
          tagsProps={{
            values: convertToKeyValueString(get(formikFromContext?.values, 'pipelineTags') as KVAccumulator)
          }}
        />

        {type === 'PipelineExecution' && (
          <>
            <FormInput.MultiSelect
              items={getExecutionStatusOptions()}
              name="status"
              label={getString('status')}
              placeholder={getString('pipeline.jiraUpdateStep.selectStatus')}
              key="status"
              multiSelectProps={{
                allowCreatingNewItems: false
              }}
            />
            <FormInput.MultiSelect
              key="triggerTypes"
              name="triggerTypes"
              label={getString('pipeline.filters.triggerType')}
              placeholder={getString('common.selectName', { name: getString('pipeline.filters.triggerType') })}
              items={executorTriggerTypes.map(triggerType => getExecutorTriggerTypeOption(triggerType))}
              multiSelectProps={{
                allowCreatingNewItems: false
              }}
            />
            <FormInput.MultiSelect
              key="triggerIdentifiers"
              name="triggerIdentifiers"
              label={getString('pipeline.filters.triggerIdentifier')}
              placeholder={getString('common.selectName', { name: getString('pipeline.filters.triggerIdentifier') })}
              items={triggers}
              multiSelectProps={{
                allowCreatingNewItems: false
              }}
            />
            <InputDatePicker formikProps={formikProps} />
          </>
        )}
      </>
    )
  }

  if (isCDEnabled && isCIEnabled) {
    return (
      <>
        <>{getPipelineFormCommonFields()}</>
        <>{getDeploymentTypeOptions()}</>
        <>{getBuildTypeOptions()}</>
      </>
    )
  } else if (isCDEnabled) {
    return (
      <>
        <>{getPipelineFormCommonFields()}</>
        <>{getDeploymentTypeOptions()}</>
      </>
    )
  } else if (isCIEnabled) {
    return (
      <>
        <>{getPipelineFormCommonFields()}</>
        <>{getBuildTypeOptions()}</>
      </>
    )
  }
  return <></>
}
