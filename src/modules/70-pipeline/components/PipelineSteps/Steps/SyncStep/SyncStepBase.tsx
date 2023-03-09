/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Accordion,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Label,
  MultiSelectOption,
  MultiTypeInputType
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { memoize, pick } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useDeepCompareEffect } from '@common/hooks'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { Servicev1ApplicationQuery, useApplicationServiceListApps } from 'services/gitops'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { SyncStepProps } from './SyncStep'
import { SyncStepFormContentInterface, SyncStepData, ApplicationFilters, policyOptions } from './types'
import { useApplicationsFilter } from './useApplicationsFilter'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType
}: SyncStepFormContentInterface): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  // const { values: formValues } = formik
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  // const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [data, setData] = useState<MultiSelectOption[]>([])
  const [filters, actions] = useApplicationsFilter()

  const { mutate: getApplications, loading, cancel: cancelGetApplications } = useApplicationServiceListApps({})

  async function refetchApplicationsList(
    filtersData: ApplicationFilters &
      Pick<Servicev1ApplicationQuery, 'accountIdentifier' | 'orgIdentifier' | 'projectIdentifier'>
  ): Promise<void> {
    cancelGetApplications()

    const body: Servicev1ApplicationQuery = pick(filtersData, [
      'accountIdentifier',
      'orgIdentifier',
      'projectIdentifier'
    ])

    body.pageIndex = filters.page
    body.pageSize = filters.size
    body.searchTerm = filters.search

    if (Array.isArray(filtersData.healthStatus) && filtersData.healthStatus.length > 0) {
      if (!body.filter) body.filter = {}

      body.filter['app.status.health.status'] = { $in: filtersData.healthStatus }
    }

    if (Array.isArray(filtersData.syncStatus) && filtersData.syncStatus.length > 0) {
      if (!body.filter) body.filter = {}

      body.filter['app.status.sync.status'] = { $in: filtersData.syncStatus }
    }

    if (Array.isArray(filtersData.agents) && filtersData.agents.length > 0) {
      if (!body.filter) body.filter = {}

      body.filter['agentIdentifier'] = { $in: filtersData.agents }
    }

    if (Array.isArray(filtersData.namespaces) && filtersData.namespaces.length > 0) {
      if (!body.filter) {
        body.filter = {}
      }
      body.filter['app.spec.destination.namespace'] = { $in: filtersData.namespaces }
    }

    if (Array.isArray(filtersData.repo) && filtersData.repo.length > 0) {
      if (!body.filter) {
        body.filter = {}
      }
      body.filter['app.spec.source.repourl'] = { $in: filtersData.repo }
    }

    const response = await getApplications(body)

    setData(
      response.content?.map(app => {
        return {
          label: `${app?.name} (${app?.agentIdentifier})`,
          value: `${app?.name}/${app?.agentIdentifier}`
        }
      }) || []
    )
  }

  useDeepCompareEffect(() => {
    refetchApplicationsList({
      ...filters,
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    })
  }, [filters, accountId, orgIdentifier, projectIdentifier])

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={loading}
      // style={imagesListError ? { lineClamp: 1, width: 400, padding: 'small' } : {}}
    />
  ))

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: readonly
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={readonly}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: true,
            allowableTypes
          }}
        />
      </div>
      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="advanced-config"
          summary={getString('pipeline.advancedConfiguration')}
          details={
            <>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiSelect
                  name="spec.applicationsList"
                  label={getString('pipeline.applicationName')}
                  items={data}
                  tagInputProps={{
                    values: data,
                    placeholder: getString('pipeline.selectApplications')
                  }}
                  multiSelectProps={{
                    onQueryChange: actions.search,
                    itemRender: itemRenderer
                  }}
                />
                {getMultiTypeFromValue(formik.values?.spec?.applicationsList as string) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    style={{ marginTop: 6 }}
                    value={formik.values?.spec?.applicationsList as string}
                    type="String"
                    variableName="spec.applicationsList"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.applicationsList', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={stepCss.grid2Coloumns}>
                <div className={stepCss.md}>
                  <FormMultiTypeCheckboxField
                    name="spec.prune"
                    label={getString('pipeline.syncStep.prune')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                </div>
                <div className={stepCss.md}>
                  <FormMultiTypeCheckboxField
                    name="spec.dryRun"
                    disabled={readonly}
                    label={getString('pipeline.syncStep.dryRun')}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                </div>
                <div className={stepCss.md}>
                  <FormMultiTypeCheckboxField
                    name="spec.applyOnly"
                    label={getString('pipeline.syncStep.applyOnly')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                </div>
                <div className={stepCss.md}>
                  <FormMultiTypeCheckboxField
                    name="spec.forceApply"
                    label={getString('pipeline.syncStep.forceApply')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                </div>
              </div>
              <div className={stepCss.md}>
                <Label style={{ marginBottom: '10px' }}>{getString('pipeline.syncStep.syncOptionsLabel')}</Label>
                <div className={stepCss.grid2Coloumns}>
                  <div className={stepCss.md}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.skipSchemaValidation"
                      label={getString('pipeline.syncStep.skipSchemaValidation')}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                  </div>
                  <div className={stepCss.md}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.autoCreateNamespace"
                      label={getString('pipeline.syncStep.autoCreateNamespace')}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                  </div>
                  <div className={stepCss.md}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.pruneResourcesAtLast"
                      label={getString('pipeline.syncStep.pruneResourcesAtLast')}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                  </div>
                  <div className={stepCss.md}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.applyOutOfSyncOnly"
                      label={getString('pipeline.syncStep.applyOutOfSyncOnly')}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                  </div>
                </div>
                <FormInput.Select
                  usePortal
                  label={getString('pipeline.syncStep.prunePropagationPolicy')}
                  name="spec.syncOptions.prunePropagationPolicy"
                  tooltipProps={{ dataTooltipId: 'prunePropagationPolicy' }}
                  placeholder={getString('pipeline.syncStep.pruneProgrationPolicyPlaceholder')}
                  items={policyOptions}
                />
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeCheckboxField
                    name="spec.syncOptions.replaceResources"
                    label={getString('pipeline.syncStep.replaceResources')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeCheckboxField
                    name="spec.retry"
                    label={getString('retry')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                </div>
                {formik.values?.spec?.retry && (
                  <div className={stepCss.grid2Coloumns}>
                    <div className={stepCss.md}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.syncStep.limit')}
                        style={{ flexGrow: 1, marginBottom: 0 }}
                        name={'spec.retryStrategy.limit'}
                        multiTextInputProps={{
                          allowableTypes
                        }}
                      />
                    </div>
                    <div className={stepCss.md}>
                      <FormMultiTypeDurationField
                        name={'spec.retryStrategy.baseBackoffDuration'}
                        label={getString('pipeline.duration')}
                        disabled={readonly}
                        multiTypeDurationProps={{
                          expressions,
                          enableConfigureOptions: true,
                          allowableTypes
                        }}
                      />
                    </div>
                    <div className={stepCss.md}>
                      <FormMultiTypeDurationField
                        name={'spec.retryStrategy.maxBackoffDuration'}
                        label={getString('pipeline.syncStep.maxBackoffDuration')}
                        disabled={readonly}
                        multiTypeDurationProps={{
                          expressions,
                          enableConfigureOptions: true,
                          allowableTypes
                        }}
                      />
                    </div>
                    <div className={stepCss.md}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.syncStep.increaseBackoffByFactor')}
                        style={{ flexGrow: 1, marginBottom: 0 }}
                        name={'spec.retryStrategy.increaseBackoffByFactor'}
                        multiTextInputProps={{
                          allowableTypes
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

export function SyncStepBase(
  { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType, onChange }: SyncStepProps,
  formikRef: StepFormikFowardRef<SyncStepData>
): React.ReactElement {
  return (
    <Formik
      initialValues={initialValues}
      formName="SyncStep"
      validate={valuesToValidate => {
        onChange?.(valuesToValidate)
      }}
      onSubmit={(_values: SyncStepData) => {
        onUpdate?.(_values)
      }}
    >
      {(formik: FormikProps<SyncStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SyncStepBaseWithRef = React.forwardRef(SyncStepBase)
