/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { FormikProps } from 'formik'
import { AllowedTypes, FormInput } from '@harness/uicore'
import type { SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useAgentRepositoryServiceGetHelmCharts, useAgentRepositoryServiceListRefs } from 'services/gitops'
import { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import {
  ApplicationOption,
  FIELD_KEYS,
  gitopsAllowableTypes,
  getRevisionsTransformedArr,
  RevisionType,
  isHelmSourceRepo,
  SOURCE_TYPE_UNSET,
  UpdateGitOpsAppStepData
} from './helper'
import css from './UpdateGitOpsAppStep.module.scss'

const revisionTypeArray: SelectOption[] = [
  {
    label: RevisionType.Branch,
    value: RevisionType.Branch
  },
  {
    label: RevisionType.Tags,
    value: RevisionType.Tags
  }
]

interface TargetRevisionProps {
  formik: FormikProps<UpdateGitOpsAppStepData>
  app?: ApplicationOption
  readonly?: boolean
  showAlways?: boolean
  onChange?: (targetRevision?: string) => void
  allowableTypes?: AllowedTypes
  fieldWidth?: number
}

export const TargetRevision = ({
  app,
  readonly,
  formik,
  onChange,
  fieldWidth,
  showAlways = false,
  allowableTypes = gitopsAllowableTypes
}: TargetRevisionProps): React.ReactElement | null => {
  const { getString } = useStrings()
  const [chartVersions, setChartVersions] = React.useState<SelectOption[]>([])
  const [revisionType, setRevisionType] = React.useState<string>(RevisionType.Branch)
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const isSourceTypeUnset = app ? app.sourceType === SOURCE_TYPE_UNSET : true
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const {
    data: charts,
    loading: loadingCharts,
    refetch: fetchCharts,
    error: chartsError
  } = useAgentRepositoryServiceGetHelmCharts({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    },
    identifier: app?.repoIdentifier || '',
    agentIdentifier: app?.agentId || '',
    lazy: true
  })

  const {
    data: revisions,
    loading: loadingRevisions,
    refetch: fetchRevisions
  } = useAgentRepositoryServiceListRefs({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    },
    identifier: app?.repoIdentifier || '',
    agentIdentifier: app?.agentId || '',
    // queryRepo: '',
    // 'query.revision': '',
    lazy: true
  })

  const { revisionsBranchesArr, revisionsTagsArr } = getRevisionsTransformedArr(revisions)
  const isHelm = isHelmSourceRepo(app)

  React.useEffect(() => {
    if (isSourceTypeUnset) return
    if (isHelm) {
      fetchCharts()
    } else {
      fetchRevisions()
    }
  }, [app])

  React.useEffect(() => {
    const chart = app?.chart
    /* istanbul ignore else */
    if (/* istanbul ignore next */ chartsError || loadingCharts || !isHelm || !chart) {
      setChartVersions([])
      return
    }
    const selectedChartVersions = charts?.items?.find(helmChart => helmChart.name === chart)?.versions || []
    setChartVersions(selectedChartVersions.map(item => ({ label: item, value: item })))
  }, [loadingCharts, chartsError])

  /* istanbul ignore else */
  if (/* istanbul ignore next */ isSourceTypeUnset && !showAlways) {
    return null
  }

  /* istanbul ignore else */
  if (isHelm) {
    return (
      <FormInput.MultiTypeInput
        selectItems={chartVersions}
        name={FIELD_KEYS.targetRevision}
        style={{ flex: 1 }}
        label={getString('cd.getStartedWithCD.targetRevision')}
        placeholder={loadingCharts ? getString('loading') : getString('cd.getStartedWithCD.targetRevision')}
        disabled={readonly || loadingCharts}
        multiTypeInputProps={{
          width: fieldWidth,
          // expressions,
          allowableTypes,
          onChange: item => {
            const value = /* istanbul ignore next */ (item as SelectOption)?.value
            /* istanbul ignore else */
            if (value) {
              /* istanbul ignore next */ onChange?.(value as string)
            }
          },
          selectProps: {
            allowCreatingNewItems: true,
            addClearBtn: false,
            items: chartVersions
          },
          newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
        }}
      />
    )
  }
  return (
    <div className={css.targetRevisionContainer}>
      <FormInput.MultiTypeInput
        className={css.flexUnset}
        selectItems={revisionType === RevisionType.Branch ? revisionsBranchesArr : revisionsTagsArr}
        name={FIELD_KEYS.targetRevision}
        style={{ flex: 1 }}
        label={getString('cd.getStartedWithCD.targetRevision')}
        placeholder={loadingRevisions ? getString('loading') : getString('cd.getStartedWithCD.targetRevision')}
        disabled={readonly || loadingRevisions}
        multiTypeInputProps={{
          width: fieldWidth,
          // expressions,
          allowableTypes,
          selectProps: {
            allowCreatingNewItems: true,
            addClearBtn: false,
            items: revisionType === RevisionType.Branch ? revisionsBranchesArr : revisionsTagsArr
          },
          newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
        }}
      />
      <FormInput.Select
        name="branchOrTag"
        className={css.branchTag}
        items={revisionTypeArray}
        placeholder={getString('common.resourceCenter.ticketmenu.issueType')}
        label=""
        value={revisionTypeArray.find(item => item.value === revisionType)}
        disabled={readonly || loadingRevisions}
        onChange={option => {
          const newValue = /* istanbul ignore next */ option?.value
          /* istanbul ignore else */
          if (newValue === revisionType) {
            return
          }
          setRevisionType(/* istanbul ignore next */ (option?.value as string) || RevisionType.Branch)
          formik.setFieldValue(FIELD_KEYS.targetRevision, undefined)
        }}
      />
    </div>
  )
}
