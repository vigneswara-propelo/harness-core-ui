/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { isNil, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'

import {
  AllowedTypes,
  ButtonSize,
  ButtonVariation,
  FormInput,
  Layout,
  ModalDialog,
  MultiTypeInputType,
  SelectOption,
  useToggleOpen
} from '@harness/uicore'

import { ServiceDefinition, TemplateLinkConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'

import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { isMultiTypeFixed } from '@common/utils/utils'

import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { getAllowableTypesWithoutExpression } from '@pipeline/utils/runPipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import InfrastructureModal from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureModal'

import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { DeployEnvironmentEntityFormState, InfrastructureYaml } from '../types'

import css from './DeployInfrastructure.module.scss'

interface InfrastructureSelectionProps {
  environmentIdentifier: string
  isMultiInfrastructure?: boolean
  uniquePathForInfrastructures: React.MutableRefObject<string>
  readonly: boolean
  loading: boolean
  infrastructureRefType: MultiTypeInputType
  setInfrastructureRefType: React.Dispatch<React.SetStateAction<MultiTypeInputType>>
  setSelectedInfrastructures: React.Dispatch<React.SetStateAction<string[]>>
  allowableTypes: AllowedTypes
  infrastructuresList: InfrastructureYaml[]
  prependInfrastructureToInfrastructureList(newEnvironmentInfo: InfrastructureYaml): void
  updateFormikAndLocalState(newFormValues: DeployEnvironmentEntityFormState): void
  deploymentType?: ServiceDefinition['type']
  customDeploymentRef?: TemplateLinkConfig
  lazyInfrastructure?: boolean
  environmentPermission?: ButtonProps['permission']
  canPropagateFromStage?: boolean
  isSingleEnv?: boolean
}

function getSelectedInfrastructuresFromOptions(items: SelectOption[]): string[] {
  if (Array.isArray(items)) {
    return items.map(item => item.value as string)
  }

  return []
}

export default function InfrastructureSelection({
  isMultiInfrastructure,
  uniquePathForInfrastructures,
  readonly,
  loading,
  infrastructureRefType,
  setInfrastructureRefType,
  setSelectedInfrastructures,
  allowableTypes,
  infrastructuresList,
  prependInfrastructureToInfrastructureList,
  updateFormikAndLocalState,
  environmentIdentifier,
  deploymentType,
  customDeploymentRef,
  lazyInfrastructure,
  environmentPermission,
  isSingleEnv
}: InfrastructureSelectionProps): JSX.Element {
  const { values, setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()
  const { getTemplate } = useTemplateSelector()
  const isFixed = isMultiTypeFixed(infrastructureRefType)
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

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

  const disabled = readonly || (isFixed && loading)

  let placeHolderForInfrastructures =
    values.infrastructures && Array.isArray(values.infrastructures[environmentIdentifier])
      ? getString('common.infrastructures')
      : getString('cd.pipelineSteps.environmentTab.allInfrastructures')

  if (loading) {
    placeHolderForInfrastructures = getString('loading')
  }

  const placeHolderForInfrastructure = loading
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectInfrastructure')

  const updateInfrastructuresList = (newInfrastructureInfo: InfrastructureYaml): void => {
    prependInfrastructureToInfrastructureList(newInfrastructureInfo)
    closeAddNewModal()

    const newFormValues = produce(values, draft => {
      if (draft.category === 'multi') {
        if (draft.infrastructures && Array.isArray(draft.infrastructures[environmentIdentifier])) {
          draft.infrastructures[environmentIdentifier].push({
            label: newInfrastructureInfo.name,
            value: newInfrastructureInfo.identifier
          })
        } else {
          set(draft, `infrastructures.['${environmentIdentifier}']`, [
            {
              label: newInfrastructureInfo.name,
              value: newInfrastructureInfo.identifier
            }
          ])
        }
        set(draft, uniquePathForInfrastructures.current, draft.infrastructures?.[environmentIdentifier])
      } else {
        draft.infrastructure = newInfrastructureInfo.identifier
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  return (
    <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      {isMultiInfrastructure ? (
        <FormMultiTypeMultiSelectDropDown
          label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructures')}
          tooltipProps={{ dataTooltipId: 'specifyYourInfrastructures' }}
          name={uniquePathForInfrastructures.current}
          // Form group disabled
          disabled={disabled}
          dropdownProps={{
            placeholder: placeHolderForInfrastructures,
            items: selectOptions,
            // Field disabled
            disabled,
            isAllSelectionSupported: true
          }}
          onChange={items => {
            if (items?.at(0)?.value === 'All') {
              setFieldValue(`infrastructures.['${environmentIdentifier}']`, undefined)
              setSelectedInfrastructures([])
            } else {
              setFieldValue(`infrastructures.['${environmentIdentifier}']`, items)
              setSelectedInfrastructures(getSelectedInfrastructuresFromOptions(items))
            }
          }}
          multiTypeProps={{
            width: 280,
            allowableTypes: getAllowableTypesWithoutExpression(allowableTypes),
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
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
            onTypeChange: setInfrastructureRefType,
            width: 300,
            selectProps: { items: selectOptions },
            allowableTypes,
            defaultValueToReset: '',
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
            onChange: item => {
              if (item) {
                setSelectedInfrastructures(getSelectedInfrastructuresFromOptions([item as SelectOption]))
              } else {
                setSelectedInfrastructures([])
              }
            },
            expressions
          }}
          selectItems={selectOptions}
        />
      )}
      {isFixed && !lazyInfrastructure && (
        <RbacButton
          margin={{ top: 'xlarge' }}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          disabled={readonly}
          onClick={openAddNewModal}
          permission={environmentPermission}
          text={getString('common.plusNewName', { name: getString('infrastructureText') })}
        />
      )}

      <ModalDialog
        isOpen={isAddNewModalOpen}
        onClose={closeAddNewModal}
        title={getString('common.newName', { name: getString('infrastructureText') })}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        enforceFocus={false}
        lazy
        width={1128}
        height={840}
        className={css.dialogStyles}
      >
        <InfrastructureModal
          hideModal={closeAddNewModal}
          refetch={updateInfrastructuresList}
          environmentIdentifier={environmentIdentifier}
          selectedInfrastructure={''}
          stageDeploymentType={deploymentType as ServiceDeploymentType}
          stageCustomDeploymentData={customDeploymentRef}
          getTemplate={getTemplate}
          scope={getScopeFromValue(environmentIdentifier)}
          isSingleEnv={isSingleEnv}
        />
      </ModalDialog>
    </Layout.Horizontal>
  )
}
