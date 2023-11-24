/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Container, Formik, FormikForm, Layout, Tag, useConfirmationDialog } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import React, { FC, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import FlagToggleSwitch from '@cf/components/EditFlagTabs/FlagToggleSwitch'
import {
  Feature,
  GetAllSegmentsQueryParams,
  GetAllTargetsQueryParams,
  useGetAllSegments,
  useGetAllTargets,
  Variation
} from 'services/cf'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { String, useStrings } from 'framework/strings'
import useFeatureEnabled from '@cf/hooks/useFeatureEnabled'
import usePatchFeatureFlag from './hooks/usePatchFeatureFlag'
import TargetingRulesTabFooter from './components/tab-targeting-footer/TargetingRulesTabFooter'
import FlagEnabledRulesCard from './components/flag-enabled-rules-card/FlagEnabledRulesCard'
import {
  FormVariationMap,
  VariationPercentageRollout,
  TargetingRuleItemType,
  TargetingRuleItemStatus,
  TargetingRulesFormValues
} from './types'
import DefaultRules from './components/default-rules/DefaultRules'
import useTargetingRulesFormValidation from './hooks/useTargetingRulesFormValidation'
import useTargetingRulesFormData from './hooks/useTargetingRulesFormData'
import css from './TargetingRulesTab.module.scss'

export interface TargetingRulesTabProps {
  featureFlagData: Feature
  refetchFlag: () => Promise<unknown>
  refetchFlagLoading: boolean
}

const TargetingRulesTab: FC<TargetingRulesTabProps> = ({ featureFlagData, refetchFlag, refetchFlagLoading }) => {
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { getString } = useStrings()
  const [newValues, setNewValues] = useState<TargetingRulesFormValues>()
  const [variationValue, setVariationValue] = useState<string>()

  const flagTags = useMemo(() => featureFlagData.tags?.map(tag => tag.identifier), [featureFlagData.tags])

  const debounce = 500

  const queryParams = {
    environmentIdentifier,
    projectIdentifier,
    accountIdentifier,
    orgIdentifier,
    pageSize: 100
  }

  const { data: targetsData, refetch: refetchTargets } = useGetAllTargets({
    queryParams: queryParams as GetAllTargetsQueryParams,
    debounce
  })

  const { data: segmentsData } = useGetAllSegments({
    queryParams: { ...(queryParams as GetAllSegmentsQueryParams), pageSize: 500 },
    debounce
  })

  const segments = segmentsData?.segments || []
  const targets = targetsData?.targets || []

  const { initialValues, getNextPriority, variationColorMap } = useTargetingRulesFormData({ featureFlagData, segments })
  const { validate } = useTargetingRulesFormValidation()
  const { saveChanges, loading: patchFeatureLoading } = usePatchFeatureFlag({
    initialValues,
    variations: featureFlagData.variations,
    featureFlagIdentifier: featureFlagData.identifier,
    featureFlagName: featureFlagData.name,
    refetchFlag
  })

  const { featureEnabled, canEdit, canToggle } = useFeatureEnabled(flagTags)
  const disabled = patchFeatureLoading || refetchFlagLoading || !featureEnabled || !!featureFlagData?.archived
  // const handleRefetchSegments = async (searchTerm: string): Promise<void> => {
  //   await refetchSegments({
  //     queryParams: searchTerm.trim()
  //       ? { ...queryParams, identifier: searchTerm.trim(), name: searchTerm.trim() }
  //       : queryParams,
  //     debounce
  //   })

  const handleRefetchSegments = async (): Promise<void> => void 0

  const handleRefetchTargets = async (searchTerm: string): Promise<void> =>
    await refetchTargets({
      queryParams: searchTerm.trim()
        ? { ...queryParams, targetIdentifier: searchTerm.trim(), targetName: searchTerm.trim() }
        : queryParams,
      debounce
    })

  const handleAddVariation = (
    newVariation: Variation,
    targetingRuleItems: (FormVariationMap | VariationPercentageRollout)[],
    arrayHelpers: FieldArrayRenderProps
  ): void => {
    const priority = getNextPriority(targetingRuleItems)
    const variation: FormVariationMap = {
      status: TargetingRuleItemStatus.ADDED,
      priority: priority,
      type: TargetingRuleItemType.VARIATION,
      variationIdentifier: newVariation.identifier,
      variationName: newVariation.name as string,
      targets: [],
      targetGroups: []
    }

    arrayHelpers.push(variation)
  }

  const handleRemoveVariation = (
    removedVariationIndex: number,
    targetingRuleItems: (FormVariationMap | VariationPercentageRollout)[],
    arrayHelpers: FieldArrayRenderProps
  ): void => {
    const item = targetingRuleItems[removedVariationIndex] as FormVariationMap
    const variation: FormVariationMap = {
      ...item,
      status: TargetingRuleItemStatus.DELETED
    }
    arrayHelpers.replace(removedVariationIndex, variation)
  }

  const handleAddPercentageRollout = (
    targetingRuleItems: (FormVariationMap | VariationPercentageRollout)[],
    arrayHelpers: FieldArrayRenderProps
  ): void => {
    // need to add with empty fields so the validation messages appear correctly
    const priority = getNextPriority(targetingRuleItems)
    const newPercentageRollout: VariationPercentageRollout = {
      status: TargetingRuleItemStatus.ADDED,
      ruleId: uuid(),
      priority: priority,
      type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
      bucketBy: 'identifier',
      clauses: [
        {
          attribute: '',
          id: '',
          negate: false,
          op: '',
          values: ['']
        }
      ],
      variations: featureFlagData.variations.map(variation => ({
        variation: variation.identifier,
        weight: 0
      }))
    }
    arrayHelpers.push(newPercentageRollout)
  }

  const handleRemovePercentageRollout = (
    removedPercentageRolloutIndex: number,
    targetingRuleItems: (FormVariationMap | VariationPercentageRollout)[],
    arrayHelpers: FieldArrayRenderProps
  ): void => {
    const item = targetingRuleItems[removedPercentageRolloutIndex] as VariationPercentageRollout

    const variation: VariationPercentageRollout = {
      ...item,
      status: TargetingRuleItemStatus.DELETED
    }
    arrayHelpers.replace(removedPercentageRolloutIndex, variation)
  }

  const capitalizeFirstChar = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const valStateOn = initialValues.state === 'on'

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: (
      <String
        className={css.modalDescription}
        stringID={
          valStateOn
            ? 'cf.featureFlags.rules.ruleChangeModalDescriptionEnabled'
            : 'cf.featureFlags.rules.ruleChangeModalDescriptionDisabled'
        }
        vars={{ variationValue: variationValue ? capitalizeFirstChar(variationValue) : '' }}
        useRichText
      />
    ),
    titleText: getString('cf.featureFlags.rules.ruleChangeModalTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed && newValues) {
        saveChanges(newValues)
      }
    }
  })

  const onSubmit = useCallback(
    async (values: TargetingRulesFormValues) => {
      if (valStateOn) {
        if (initialValues.onVariation !== values.onVariation) {
          setNewValues(values)
          setVariationValue(values.onVariation)
          openDialog()
        } else {
          saveChanges(values)
        }
      } else {
        if (initialValues.offVariation !== values.offVariation) {
          setNewValues(values)
          setVariationValue(values.offVariation)
          openDialog()
        } else {
          saveChanges(values)
        }
      }
    },
    [initialValues.offVariation, initialValues.onVariation, openDialog, saveChanges, valStateOn]
  )

  return (
    <Formik
      enableReinitialize
      validateOnChange
      validateOnBlur={false}
      formName="targeting-rules-form"
      initialValues={initialValues}
      validate={validate}
      onSubmit={onSubmit}
    >
      {formikProps => (
        <FormikForm data-testid="targeting-rules-tab-form" disabled={disabled}>
          <Container className={css.tabContainer} data-tab-container>
            <Layout.Vertical
              spacing="small"
              padding={{ left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}
              className={css.flagRulesSection}
            >
              <Card elevation={0}>
                <Layout.Horizontal spacing="small">
                  <FlagToggleSwitch
                    disabled={disabled || !canToggle}
                    currentState={formikProps.values.state}
                    currentEnvironmentState={featureFlagData.envProperties?.state}
                    handleToggle={() =>
                      formikProps.setFieldValue(
                        'state',
                        formikProps.values.state === FeatureFlagActivationStatus.OFF
                          ? FeatureFlagActivationStatus.ON
                          : FeatureFlagActivationStatus.OFF
                      )
                    }
                  />
                  {featureFlagData.archived && <Tag minimal>{getString('cf.shared.archived').toUpperCase()}</Tag>}
                </Layout.Horizontal>
              </Card>
              <FieldArray
                name="targetingRuleItems"
                render={arrayHelpers => (
                  <FlagEnabledRulesCard
                    variationColorMap={variationColorMap}
                    targetingRuleItems={formikProps.values.targetingRuleItems}
                    targets={targets}
                    segments={segments}
                    featureFlagVariations={featureFlagData.variations}
                    disabled={disabled || !canEdit}
                    refetchSegments={handleRefetchSegments}
                    refetchTargets={handleRefetchTargets}
                    addVariation={newVariation =>
                      handleAddVariation(newVariation, formikProps.values.targetingRuleItems, arrayHelpers)
                    }
                    removeVariation={removedVariationIndex =>
                      handleRemoveVariation(removedVariationIndex, formikProps.values.targetingRuleItems, arrayHelpers)
                    }
                    addPercentageRollout={() =>
                      handleAddPercentageRollout(formikProps.values.targetingRuleItems, arrayHelpers)
                    }
                    removePercentageRollout={removedPercentageRolloutIndex =>
                      handleRemovePercentageRollout(
                        removedPercentageRolloutIndex,
                        formikProps.values.targetingRuleItems,
                        arrayHelpers
                      )
                    }
                  />
                )}
              />

              <Card>
                <DefaultRules
                  hideSubheading
                  featureFlagVariations={featureFlagData.variations}
                  titleStringId="cf.featureFlags.rules.whenFlagDisabled"
                  inputName="offVariation"
                  disabled={disabled || !canEdit}
                />
              </Card>
            </Layout.Vertical>

            {formikProps.dirty && (
              <TargetingRulesTabFooter
                isLoading={disabled}
                handleSubmit={formikProps.handleSubmit}
                handleCancel={formikProps.handleReset}
              />
            )}
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}

export default TargetingRulesTab
