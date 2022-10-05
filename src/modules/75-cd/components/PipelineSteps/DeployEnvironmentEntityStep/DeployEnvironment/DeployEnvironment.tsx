/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { defaultTo, get, isEmpty, isNil, noop } from 'lodash-es'
import { useFormikContext } from 'formik'

import {
  AllowedTypes,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import EnvironmentEntitiesList from '../EnvironmentEntitiesList/EnvironmentEntitiesList'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentWithInputs
} from '../types'
import { useGetEnvironmentsData } from './useGetEnvironmentsData'

interface DeployEnvironmentProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  isMultiEnvironment: boolean
  stepViewType?: StepViewType
  identifiersToLoad?: string[]
}

export function getAllFixedEnvironments(data: DeployEnvironmentEntityFormState): string[] {
  if (data.environment && getMultiTypeFromValue(data.environment) === MultiTypeInputType.FIXED) {
    return [data.environment as string]
  } else if (data.environments && Array.isArray(data.environments)) {
    return data.environments.map(environment => environment.value as string)
  }

  return []
}

export function getSelectedEnvironmentsFromOptions(items: SelectOption[]): string[] {
  if (Array.isArray(items)) {
    return items.map(item => item.value as string)
  }

  return []
}

export default function DeployEnvironment({
  initialValues,
  readonly,
  allowableTypes,
  isMultiEnvironment,
  identifiersToLoad,
  stageIdentifier,
  deploymentType,
  gitOpsEnabled
}: DeployEnvironmentProps): JSX.Element {
  const { values, setValues } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()

  // State
  const [selectedEnvironments, setSelectedEnvironments] = useState(getAllFixedEnvironments(initialValues))

  // Constants
  const isFixed = isMultiEnvironment
    ? Array.isArray(values.environments)
    : getMultiTypeFromValue(values.environment) === MultiTypeInputType.FIXED

  // API
  const {
    environmentsList,
    environmentsData,
    loadingEnvironmentsList,
    loadingEnvironmentsData,
    // This is required only when updating the entities list
    updatingEnvironmentsData
    // refetchEnvironmentsList,
    // refetchEnvironmentsData
  } = useGetEnvironmentsData({
    envIdentifiers: defaultTo(identifiersToLoad, selectedEnvironments),
    loadSpecificIdentifiers: !isEmpty(identifiersToLoad)
  })

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(environmentsList)) {
      return environmentsList.map(environment => ({ label: environment.name, value: environment.identifier }))
    }

    return []
  }, [environmentsList])

  const loading = loadingEnvironmentsList || loadingEnvironmentsData

  useEffect(() => {
    // This condition is required to clear the list when switching from multi environment to single environment
    if (!isMultiEnvironment && !values.environment && selectedEnvironments.length) {
      setSelectedEnvironments([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiEnvironment])

  useEffect(() => {
    if (!loading) {
      // update environments in formik
      /* istanbul ignore else */
      if (values && environmentsData.length > 0) {
        if (values.environment && !values.environmentInputs?.[values.environment]) {
          const environment = environmentsData.find(
            environmentData => environmentData.environment.identifier === values.environment
          )

          setValues({
            ...values,
            // if environment input is not found, add it, else use the existing one
            environmentInputs: {
              [values.environment]: get(values.environmentInputs, [values.environment], environment?.environmentInputs)
            }
          })
        } else if (Array.isArray(values.environments)) {
          const updatedEnvironments = values.environments.reduce<EnvironmentWithInputs>(
            (p, c) => {
              const environment = environmentsData.find(
                environmentData => environmentData.environment.identifier === c.value
              )

              if (environment) {
                p.environments.push({ label: environment.environment.name, value: environment.environment.identifier })
                // if environment input is not found, add it, else use the existing one
                const environmentInputs = get(
                  values.environmentInputs,
                  [environment.environment.identifier],
                  environment?.environmentInputs
                )

                p.environmentInputs[environment.environment.identifier] = environmentInputs
              } else {
                p.environments.push(c)
              }

              return p
            },
            { environments: [], environmentInputs: {}, parallel: values.parallel }
          )

          setValues(updatedEnvironments)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, environmentsList, environmentsData])

  const disabled = readonly || (isFixed && loading)

  let placeHolderForEnvironments =
    Array.isArray(values.environments) && values.environments
      ? getString('environments')
      : getString('cd.pipelineSteps.environmentTab.selectEnvironment')

  if (loading) {
    placeHolderForEnvironments = getString('loading')
  }

  const placeHolderForEnvironment = loading
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectEnvironment')

  return (
    <>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {isMultiEnvironment ? (
          <FormMultiTypeMultiSelectDropDown
            label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
            name={'environments'}
            // Form group disabled
            disabled={disabled}
            dropdownProps={{
              placeholder: placeHolderForEnvironments,
              items: selectOptions,
              // Field disabled
              disabled
            }}
            onChange={items => {
              setSelectedEnvironments(getSelectedEnvironmentsFromOptions(items))
            }}
            multiTypeProps={{
              width: 280,
              allowableTypes
            }}
          />
        ) : (
          <FormInput.MultiTypeInput
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
            name="environment"
            useValue
            disabled={disabled}
            placeholder={placeHolderForEnvironment}
            multiTypeInputProps={{
              width: 300,
              selectProps: { items: selectOptions },
              allowableTypes,
              defaultValueToReset: '',
              onChange: item => {
                setSelectedEnvironments(getSelectedEnvironmentsFromOptions([item as SelectOption]))
              }
            }}
            selectItems={selectOptions}
          />
        )}
        {/* {!isTemplateView && isFixed && (
          <RbacButton
            margin={{ top: 'xlarge' }}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            disabled={readonly}
            onClick={showEnvironmentModal}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
            text={
              isEditEnvironment(selectedEnvironment)
                ? getString('edit')
                : getString('common.plusNewName', { name: getString('environment') })
            }
            id={isEditEnvironment(selectedEnvironment) ? 'edit-environment' : 'add-new-environment'}
          />
        )} */}
      </Layout.Horizontal>
      {isMultiEnvironment ? (
        <FormInput.CheckBox
          label={getString('cd.pipelineSteps.environmentTab.multiEnvironmentsParallelDeployLabel')}
          name="parallel"
        />
      ) : null}
      {isFixed && !isEmpty(selectedEnvironments) && (
        <EnvironmentEntitiesList
          loading={loading || updatingEnvironmentsData}
          environmentsData={environmentsData}
          readonly={readonly}
          allowableTypes={allowableTypes}
          // onEnvironmentEntityUpdate={onEnvironmentEntityUpdate}
          // onRemoveEnvironmentFromList={removeEnvironmentFromList}
          onEnvironmentEntityUpdate={noop as any}
          onRemoveEnvironmentFromList={noop as any}
          initialValues={initialValues}
          stageIdentifier={stageIdentifier}
          deploymentType={deploymentType}
          gitOpsEnabled={gitOpsEnabled}
        />
      )}
    </>
  )
}
