/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { connect } from 'formik'
import { Container, FormInput, PageError, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { Feature, useGetAllFeatures } from 'services/cf'
import { GetEnvironmentListQueryParams, useGetEnvironmentList } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getErrorMessage } from '@cf/utils/CFUtils'
import type { FlagConfigurationStepData } from './types'
import FlagChanges from './FlagChanges/FlagChanges'
import FlagChangesRuntime from './FlagChangesV2/FlagChangesRuntime'
import { withPrefix } from './FlagChangesV2/utils/withPrefix'
import FlagChangesContextProvider from './FlagChangesContextProvider'
import { hasSetFlagSwitchRuntime } from './FlagChangesV2/subSections/SetFlagSwitch/SetFlagSwitch'
import { hasDefaultOnRuleRuntime } from './FlagChangesV2/subSections/DefaultOnRule/DefaultOnRule'
import { hasDefaultOffRuleRuntime } from './FlagChangesV2/subSections/DefaultOffRule/DefaultOffRule'
import { hasServeVariationToTargetsRuntime } from './FlagChangesV2/subSections/ServeVariationToTargets/ServeVariationToTargets'
import { hasServeVariationToTargetGroupsRuntime } from './FlagChangesV2/subSections/ServeVariationToTargetGroups/ServeVariationToTargetGroups'
import { hasServePercentageRolloutToTargetGroupRuntime } from './FlagChangesV2/subSections/ServePercentageRolloutToTargetGroup/ServePercentageRolloutToTargetGroup'

export interface FlagConfigurationInputSetStepProps {
  existingValues?: FlagConfigurationStepData
  stepViewType?: StepViewType
  readonly?: boolean
  template?: FlagConfigurationStepData
  pathPrefix: string
}

const FlagConfigurationInputSetStep = connect<FlagConfigurationInputSetStepProps, FlagConfigurationStepData>(
  ({ existingValues, template, pathPrefix, readonly, formik, stepViewType = StepViewType.InputSet }) => {
    const expressionSupportEnabled = useFeatureFlag(FeatureFlag.FFM_8261_EXPRESSIONS_IN_PIPELINE_STEP)

    const prefix = useCallback<(fieldName: string) => string>(
      fieldName => withPrefix(pathPrefix, fieldName),
      [pathPrefix]
    )

    const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
    const { getString } = useStrings()

    const queryParams = {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      pageSize: 1000
    }

    const {
      data: featuresData,
      error: errorFeatures,
      refetch: refetchFeatures
    } = useGetAllFeatures({
      queryParams: { ...queryParams, sortByField: 'name' },
      debounce: 250
    })

    const featureItems = useMemo<SelectOption[]>(
      () => featuresData?.features?.map(({ identifier: value, name: label }) => ({ value, label })) || [],
      [featuresData?.features]
    )

    const envQueryParams: GetEnvironmentListQueryParams = {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    }

    const {
      data: environmentsData,
      error: errorEnvironments,
      refetch: refetchEnvironments
    } = useGetEnvironmentList({
      queryParams: envQueryParams,
      debounce: 250
    })

    const environmentItems = useMemo<SelectOption[]>(() => {
      if (!environmentsData?.data?.content?.length) {
        return []
      }

      return environmentsData.data.content.map(({ environment }) => ({
        label: environment?.name,
        value: environment?.identifier
      })) as SelectOption[]
    }, [environmentsData?.data?.content])

    let selectedFeatureId = get(formik.values, prefix('spec.feature'))
    let selectedEnvironmentId = get(formik.values, prefix('spec.environment'))

    if (existingValues?.spec?.feature && existingValues.spec.feature !== RUNTIME_INPUT_VALUE) {
      selectedFeatureId = existingValues.spec.feature
    }

    if (existingValues?.spec?.environment && existingValues.spec.environment !== RUNTIME_INPUT_VALUE) {
      selectedEnvironmentId = existingValues.spec.environment
    }

    const selectedFeature = useMemo<Feature | undefined>(
      () => featuresData?.features?.find(({ identifier }) => identifier === selectedFeatureId),
      [featuresData?.features, selectedFeatureId]
    )

    const hasFlagChangesRuntimeInputs = useMemo<boolean>(() => {
      if (!Array.isArray(template?.spec?.instructions)) {
        return false
      }

      return !!template?.spec.instructions.some(
        instruction =>
          hasSetFlagSwitchRuntime(instruction) ||
          hasDefaultOnRuleRuntime(instruction) ||
          hasDefaultOffRuleRuntime(instruction) ||
          hasServeVariationToTargetsRuntime(instruction) ||
          hasServeVariationToTargetGroupsRuntime(instruction) ||
          hasServePercentageRolloutToTargetGroupRuntime(instruction)
      )
    }, [template?.spec.instructions])

    if (errorFeatures || errorEnvironments) {
      return (
        <Container padding={{ top: 'huge' }}>
          <PageError
            message={getErrorMessage(errorFeatures || errorEnvironments)}
            width={450}
            onClick={() => {
              refetchFeatures()
              refetchEnvironments()
            }}
          />
        </Container>
      )
    }

    return (
      <>
        {template?.spec?.environment === RUNTIME_INPUT_VALUE && (
          <FormInput.Select
            label={getString('cf.pipeline.flagConfiguration.selectEnvironment')}
            name={prefix('spec.environment')}
            items={environmentItems}
            disabled={readonly}
            onQueryChange={searchTerm => refetchEnvironments({ queryParams: { ...envQueryParams, searchTerm } })}
          />
        )}

        {template?.spec?.feature === RUNTIME_INPUT_VALUE && (
          <FormInput.Select
            label={getString('cf.pipeline.flagConfiguration.selectFlag')}
            name={prefix('spec.feature')}
            items={featureItems}
            disabled={readonly}
            onQueryChange={name => refetchFeatures({ queryParams: { ...queryParams, name } })}
          />
        )}

        {template?.spec?.instructions === RUNTIME_INPUT_VALUE && !expressionSupportEnabled && (
          <FlagChanges
            selectedFeature={selectedFeature}
            selectedEnvironmentId={selectedEnvironmentId}
            initialInstructions={existingValues?.spec?.instructions}
            clearField={fieldName => formik?.setFieldValue(prefix(fieldName), undefined)}
            setField={(fieldName, value) => formik?.setFieldValue(prefix(fieldName), value)}
            fieldValues={formik.values}
            pathPrefix={pathPrefix}
          />
        )}

        {expressionSupportEnabled &&
          (hasFlagChangesRuntimeInputs || template?.spec?.instructions === RUNTIME_INPUT_VALUE) && (
            <FlagChangesContextProvider
              flag={selectedFeature || selectedFeatureId}
              environmentIdentifier={selectedEnvironmentId}
              mode={stepViewType}
              readonly={readonly}
              initialInstructions={existingValues?.spec?.instructions}
              allRuntime={template?.spec?.instructions === RUNTIME_INPUT_VALUE}
            >
              <FlagChangesRuntime pathPrefix={pathPrefix} />
            </FlagChangesContextProvider>
          )}
      </>
    )
  }
)

export default FlagConfigurationInputSetStep
