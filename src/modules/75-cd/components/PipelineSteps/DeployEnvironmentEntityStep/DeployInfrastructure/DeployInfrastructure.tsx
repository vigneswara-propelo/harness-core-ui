/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { get, isEmpty, isNil, noop, set } from 'lodash-es'
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

import InfrastructureEntitiesList from '../InfrastructureEntitiesList/InfrastructureEntitiesList'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  InfrastructureWithInputs
} from '../types'
import { useGetInfrastructuresData } from './useGetInfrastructuresData'

interface DeployInfrastructureProps extends Required<Omit<DeployEnvironmentEntityCustomStepProps, 'gitOpsEnabled'>> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  environmentIdentifier: string
  isMultiInfrastructure?: boolean
  stepViewType?: StepViewType
}

export function getAllFixedInfrastructures(
  data: DeployEnvironmentEntityFormState,
  environmentIdentifier: string
): string[] {
  if (data.infrastructure && getMultiTypeFromValue(data.infrastructure) === MultiTypeInputType.FIXED) {
    return [data.infrastructure as string]
  } else if (
    data.infrastructures?.[environmentIdentifier] &&
    Array.isArray(data.infrastructures[environmentIdentifier])
  ) {
    return data.infrastructures[environmentIdentifier].map(infrastructure => infrastructure.value as string)
  }

  return []
}

export function getSelectedInfrastructuresFromOptions(items: SelectOption[]): string[] {
  if (Array.isArray(items)) {
    return items.map(item => item.value as string)
  }

  return []
}

export default function DeployInfrastructure({
  initialValues,
  readonly,
  allowableTypes,
  environmentIdentifier,
  isMultiInfrastructure,
  stageIdentifier,
  deploymentType
}: DeployInfrastructureProps): JSX.Element {
  const { values, setValues } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()

  // State
  const [selectedInfrastructures, setSelectedInfrastructures] = useState(
    getAllFixedInfrastructures(initialValues, environmentIdentifier)
  )

  // Constants
  const isFixed = isMultiInfrastructure
    ? Array.isArray(values.infrastructures?.[environmentIdentifier])
    : getMultiTypeFromValue(values.infrastructure) === MultiTypeInputType.FIXED

  // API
  const {
    infrastructuresList,
    infrastructuresData,
    loadingInfrastructuresList,
    loadingInfrastructuresData,
    // This is required only when updating the entities list
    updatingInfrastructuresData
    // refetchInfrastructuresList,
    // refetchInfrastructuresData
  } = useGetInfrastructuresData({
    environmentIdentifier,
    infrastructureIdentifiers: selectedInfrastructures,
    deploymentType
  })

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(infrastructuresList)) {
      return infrastructuresList.map(infrastructure => ({
        label: infrastructure.name,
        value: infrastructure.identifier
      }))
    }

    return []
  }, [infrastructuresList])

  const loading = loadingInfrastructuresList || loadingInfrastructuresData

  useEffect(() => {
    if (!loading) {
      // update infrastructures in formik
      /* istanbul ignore else */
      if (values && infrastructuresData.length > 0) {
        if (values.infrastructure && !values.infrastructureInputs?.[values.infrastructure]) {
          const infrastructure = infrastructuresData.find(
            infrastructureData => infrastructureData.infrastructureDefinition.identifier === values.infrastructure
          )

          setValues({
            ...values,
            // if infrastructure input is not found, add it, else use the existing one
            infrastructureInputs: {
              [values.infrastructure]: get(
                values.infrastructureInputs,
                [values.infrastructure],
                infrastructure?.infrastructureInputs
              )
            }
          })
        } else if (values.infrastructures && Array.isArray(values.infrastructures?.[environmentIdentifier])) {
          const updatedInfrastructures = values.infrastructures[environmentIdentifier].reduce<InfrastructureWithInputs>(
            (p, c) => {
              const infrastructure = infrastructuresData.find(
                infrastructureData => infrastructureData.infrastructureDefinition.identifier === c.value
              )

              if (!Array.isArray(p.infrastructures[environmentIdentifier])) {
                p.infrastructures[environmentIdentifier] = []
              }

              if (infrastructure) {
                p.infrastructures[environmentIdentifier].push({
                  label: infrastructure.infrastructureDefinition.name,
                  value: infrastructure.infrastructureDefinition.identifier
                })
                // if infrastructure input is not found, add it, else use the existing one
                const infrastructureInputs = get(
                  values.infrastructureInputs,
                  [environmentIdentifier, infrastructure.infrastructureDefinition.identifier],
                  infrastructure?.infrastructureInputs
                )

                set(
                  p.infrastructureInputs,
                  `${environmentIdentifier}.${infrastructure.infrastructureDefinition.identifier}`,
                  infrastructureInputs
                )
              } else {
                p.infrastructures[environmentIdentifier].push(c)
              }

              return p
            },
            {
              infrastructures: {},
              infrastructureInputs: {},
              deployToAllInfrastructures: values.deployToAllInfrastructures
            }
          )

          setValues({ ...values, ...updatedInfrastructures })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, infrastructuresList, infrastructuresData])

  const disabled = readonly || (isFixed && loading)

  let placeHolderForInfrastructures =
    values.infrastructures && Array.isArray(values.infrastructures[environmentIdentifier])
      ? getString('common.infrastructures')
      : getString('cd.pipelineSteps.environmentTab.selectInfrastructure')

  if (loading) {
    placeHolderForInfrastructures = getString('loading')
  }

  const placeHolderForInfrastructure = loading
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectInfrastructure')

  return (
    <>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {isMultiInfrastructure ? (
          <FormMultiTypeMultiSelectDropDown
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
            name={`infrastructures.${environmentIdentifier}`}
            // Form group disabled
            disabled={disabled}
            dropdownProps={{
              placeholder: placeHolderForInfrastructures,
              items: selectOptions,
              // Field disabled
              disabled
            }}
            onChange={items => {
              setSelectedInfrastructures(getSelectedInfrastructuresFromOptions(items))
            }}
            multiTypeProps={{
              width: 280,
              allowableTypes
            }}
          />
        ) : (
          <FormInput.MultiTypeInput
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
            name="infrastructure"
            useValue
            disabled={disabled}
            placeholder={placeHolderForInfrastructure}
            multiTypeInputProps={{
              width: 300,
              selectProps: { items: selectOptions },
              allowableTypes,
              defaultValueToReset: '',
              onChange: item => {
                setSelectedInfrastructures(getSelectedInfrastructuresFromOptions([item as SelectOption]))
              }
            }}
            selectItems={selectOptions}
          />
        )}
      </Layout.Horizontal>
      {isFixed && !isEmpty(selectedInfrastructures) && (
        <InfrastructureEntitiesList
          loading={loading || updatingInfrastructuresData}
          infrastructuresData={infrastructuresData}
          readonly={readonly}
          allowableTypes={allowableTypes}
          // onInfrastructureEntityUpdate={onInfrastructureEntityUpdate}
          // onRemoveInfrastructureFromList={removeInfrastructureFromList}
          onInfrastructureEntityUpdate={noop as any}
          onRemoveInfrastructureFromList={noop as any}
          stageIdentifier={stageIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
      )}
    </>
  )
}
