/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  MultiTypeInputType,
  getMultiTypeFromValue,
  AllowedTypes,
  MultiSelectOption,
  SelectOption
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { cloneDeep, defaultTo, get, isEmpty } from 'lodash-es'
import { connect, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { CustomDeploymentNGVariable } from 'services/cd-ng'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { getAllowedValuesFromTemplate, shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import {
  MultiSelectVariableAllowedValues,
  concatValuesWithQuotes,
  isFixedInput
} from './MultiSelectVariableAllowedValues/MultiSelectVariableAllowedValues'
import { NameTypeColumn, VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'
export interface CustomVariablesData {
  variables?: AllNGVariables[]
  isPropagating?: boolean
  canAddVariable?: boolean
}
export interface CustomVariableInputSetExtraProps {
  variableNamePrefix?: string
  domId?: string
  template?: CustomVariablesData
  path?: string
  allValues?: CustomVariablesData
  executionIdentifier?: string
  isDescriptionEnabled?: boolean
  allowedVarialblesTypes?: VariableType[]
  isDrawerMode?: boolean
}

export interface CustomVariableInputSetProps extends CustomVariableInputSetExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
  inputSetData?: InputSetData<CustomVariablesData>
  allowableTypes: AllowedTypes
  className?: string
}

export interface ConectedCustomVariableInputSetProps extends CustomVariableInputSetProps {
  formik: FormikProps<CustomVariablesData>
}

function CustomVariableInputSetBasic(props: ConectedCustomVariableInputSetProps): React.ReactElement {
  const {
    template,
    path,
    variableNamePrefix = '',
    domId,
    inputSetData,
    formik,
    allowableTypes,
    className,
    allValues,
    isDrawerMode
  } = props
  const basePath = path?.length ? `${path}.variables` : 'variables'
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  const formikValue = get(formik?.values, basePath)
  const formikVariables = Array.isArray(formikValue) ? formikValue : []
  const allValuesVariables = get(allValues, 'variables', [])
  // get doesn't return defaultValue if it gets null
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const multiSelectSupportForAllowedValues = useFeatureFlag(FeatureFlag.PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES)

  // this was necessary due to absence of YAML validations in run pipeline form. Add such logic here only when absolutely unavoidable
  React.useEffect(() => {
    const mergeTemplateBaseValues = defaultTo(cloneDeep(template?.variables), [])

    let isYamlDirty = false
    mergeTemplateBaseValues.forEach((variable, index) => {
      const isVariablePresentIndex = formikVariables.findIndex(
        (fVar: AllNGVariables) => fVar.name === variable.name && fVar.type === variable.type
      )
      if (isVariablePresentIndex !== -1) {
        mergeTemplateBaseValues[index].value = formikVariables[isVariablePresentIndex].value
      } else {
        isYamlDirty = true
      }
    })

    if (isYamlDirty) {
      // !path signifies pipeline variables path and the second term is used to check the presence of stage in pipeline YAML
      const isEntityPresent = !path || get(formik.values, defaultTo(path, ''))
      isEntityPresent && formik.setFieldValue(basePath, clearRuntimeInput(mergeTemplateBaseValues))
    }
  }, [])

  return (
    <div className={cx(css.customVariablesInputSets, 'customVariables', className)} id={domId}>
      {/* Show Header only when there is any template variables to show */}
      {template?.variables && template?.variables?.length > 0 && (
        <section className={css.subHeader}>
          <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.GREY_500}>
            {getString('name')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.GREY_500}>
            {getString('description')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.GREY_500}>
            {getString('valueLabel')}
          </Text>
        </section>
      )}
      {template?.variables?.map?.((variable, templateIndex) => {
        const value = defaultTo(variable.value, '')

        if (getMultiTypeFromValue(value as string) !== MultiTypeInputType.RUNTIME) {
          return
        }

        // find Index from values, not from template variables
        // because the order of the variables might not be the same
        let index = templateIndex
        const templateVariableName = defaultTo(variable.name, '')
        const formikVariableName = defaultTo(formikVariables[templateIndex]?.name, '')
        const allValuesVariableName = defaultTo(allValuesVariables[templateIndex]?.name, '')
        /*
         * Checking for the template variable name and formik variable name for performance improvement.(Some pipelines have more than 100 variables)
         * As variables name are unique, do not iterate on the array again to find the index if template and formik variable name are same.
         */
        if (templateVariableName !== formikVariableName) {
          index = formikVariables.findIndex((fVar: AllNGVariables) => variable.name === fVar.name)
        }

        let variableFromAllValues =
          templateIndex > allValuesVariables.length ? undefined : allValuesVariables[templateIndex]

        /*
         * Checking for the template variable name and allValues variable name for performance improvement.
         * As variables name are unique, do not iterate on the array again to find the index if template and allValues variable name are same.
         */
        if (templateVariableName !== allValuesVariableName) {
          variableFromAllValues = allValuesVariables.find((fVar: AllNGVariables) => variable.name === fVar.name)
        }

        const description = variableFromAllValues?.description
        const isRequiredVariable = !!variableFromAllValues?.required
        const allowMultiSelectAllowedValues =
          multiSelectSupportForAllowedValues &&
          variable.type === 'String' &&
          /*
           * Check if the field need to be rendered with allowed values.
           * Field value with runtime allowed value: <+input>.allowedValues(1,2,3)
           */
          shouldRenderRunTimeInputViewWithAllowedValues(`variables[${templateIndex}].value`, template) &&
          isFixedInput(formik, `${basePath}[${index}].value`)

        let selectOpt: SelectOption[] = []

        // Get allowed values from template only if we need to show that in the field
        if (allowMultiSelectAllowedValues) {
          // Get Dropdown Options for the allowed values runtime input field from the field value in template
          selectOpt = getAllowedValuesFromTemplate(template, `variables[${templateIndex}].value`)
        }

        return (
          <div key={`${variable.name}${index}`} className={css.variableListTable}>
            <NameTypeColumn
              name={`${variableNamePrefix}${variable.name}`}
              type={variable.type as string}
              required={isRequiredVariable}
            />
            {!isEmpty(description) ? (
              <Text
                icon="description"
                inline
                padding={'small'}
                iconProps={{ size: 32 }}
                tooltip={description}
                tooltipProps={{
                  position: Position.BOTTOM,
                  isDark: true,
                  className: css.descriptionContent
                }}
              />
            ) : (
              <Text color={Color.GREY_500} padding={'small'}>
                &nbsp;{'-'}
              </Text>
            )}
            <div className={css.inputSetValueRow}>
              {(variable.type as CustomDeploymentNGVariable['type']) === VariableType.Connector ? (
                <FormMultiTypeConnectorField
                  name={`${basePath}[${index}].value`}
                  label=""
                  placeholder={getString('common.entityPlaceholderText')}
                  disabled={inputSetData?.readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, disabled: inputSetData?.readonly, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  setRefValue
                  connectorLabelClass="connectorVariableField"
                  enableConfigureOptions={false}
                  isDrawerMode={isDrawerMode}
                  type={[]}
                  width="100%"
                />
              ) : variable.type === VariableType.Secret ? (
                <MultiTypeSecretInput
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  name={`${basePath}[${index}].value`}
                  disabled={inputSetData?.readonly}
                  label=""
                  templateProps={{
                    isTemplatizedView: true,
                    templateValue: get(template, `variables[${index}].value`)
                  }}
                />
              ) : allowMultiSelectAllowedValues ? (
                <MultiSelectVariableAllowedValues
                  name={`${basePath}[${index}].value`}
                  disabled={inputSetData?.readonly}
                  allowableTypes={allowableTypes}
                  selectOption={selectOpt}
                  onChange={val => {
                    formik?.setFieldValue(
                      `${basePath}[${index}].value`,
                      getMultiTypeFromValue(val) === MultiTypeInputType.FIXED
                        ? concatValuesWithQuotes(val as MultiSelectOption[])
                        : val
                    )
                  }}
                  label=""
                  multiTextInputProps={{
                    newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                  }}
                />
              ) : (
                <TextFieldInputSetView
                  className="variableInput"
                  name={`${basePath}[${index}].value`}
                  multiTextInputProps={{
                    textProps: { type: variable.type === 'Number' ? 'number' : 'text' },
                    allowableTypes,
                    expressions,
                    defaultValueToReset: '',
                    newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                  }}
                  label=""
                  disabled={inputSetData?.readonly}
                  template={template}
                  fieldPath={`variables[${templateIndex}].value`}
                  variableNamePath={`${basePath}[${index}].name`}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
const CustomVariableInputSet = connect<CustomVariableInputSetProps, CustomVariablesData>(CustomVariableInputSetBasic)

export { CustomVariableInputSet }
