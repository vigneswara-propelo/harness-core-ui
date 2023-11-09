/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { debounce, defaultTo, get, isEmpty } from 'lodash-es'
import { Formik, FieldArray, FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'
import {
  Button,
  FormInput,
  MultiTypeInputType,
  getMultiTypeFromValue,
  ButtonSize,
  ButtonVariation,
  Text,
  Layout
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import * as Yup from 'yup'

import { useParams } from 'react-router-dom'
import { Position } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { TextInputWithCopyBtn } from '@common/components/TextInputWithCopyBtn/TextInputWithCopyBtn'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { CustomDeploymentNGVariable, NGVariable } from 'services/cd-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import type { AllNGVariables } from '@pipeline/utils/types'
import { getVariablesValidationField } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/validation'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useGlobalEventListener, useQueryParams } from '@common/hooks'
import { SecretConfigureOptions } from '@secrets/components/SecretConfigureOptions/SecretConfigureOptions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { usePipelineContext } from '@modules/70-pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { CustomVariableEditableProps, CustomVariablesData } from './CustomVariableEditable'
import { VariableType, labelStringMap } from './CustomVariableUtils'
import AddEditCustomVariable, { VariableState } from './AddEditCustomVariable'
import css from './CustomVariables.module.scss'

export type VariablesCustomValidationSchemaType = (
  getString: UseStringsReturn['getString']
) => Record<string, Yup.Schema<unknown>>

const getValidationSchema = (
  getString: UseStringsReturn['getString'],
  validationSchema?: VariablesCustomValidationSchemaType
): Yup.Schema<unknown> =>
  Yup.object().shape({
    ...(validationSchema ? validationSchema(getString) : getVariablesValidationField(getString))
  })

export function CustomVariablesEditableStage(props: CustomVariableEditableProps): React.ReactElement {
  const {
    initialValues,
    onUpdate,
    domId,
    className,
    yamlProperties,
    enableValidation,
    readonly,
    formName,
    tabName = 'OVERVIEW',
    allowableTypes,
    allowedVarialblesTypes,
    validationSchema,
    isDrawerMode,
    addVariableLabel
  } = props
  const uids = React.useRef<string[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT, PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES: commasInAllowedValues } =
    useFeatureFlags()

  const [selectedVariable, setSelectedVariable] = React.useState<VariableState | null>(null)

  useGlobalEventListener('UPDATE_STAGE_VARIABLES', event => {
    if (event.detail) {
      const { stage: updatedStage } = getStageFromPipeline(selectedStageId, event.detail)
      const updatedStageVariables = get(updatedStage, 'stage.variables', []) as AllNGVariables[]
      formikRef.current?.setValues({
        variables: updatedStageVariables,
        canAddVariable: true
      })
    }
  })
  useGlobalEventListener('UPDATE_ENVIRONMENT_VARIABLES', event => {
    if (event.detail) {
      const updatedEnvironmentVariables = get(event.detail, 'variables', []) as AllNGVariables[]
      formikRef.current?.setValues({
        variables: updatedEnvironmentVariables,
        canAddVariable: true
      })
    }
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce((data: CustomVariablesData) => onUpdate?.(data), 500),
    [onUpdate]
  )

  function addNew(): void {
    setSelectedVariable({
      variable: { name: '', type: 'String', value: '', description: '', required: false },
      index: -1
    })
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    enableValidation && subscribeForm({ tab: tabName, form: formikRef })
    return () => {
      if (enableValidation) {
        unSubscribeForm({ tab: tabName, form: formikRef })
      }
    }
  }, [enableValidation, subscribeForm, unSubscribeForm, tabName])

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={data => onUpdate?.(data)}
      validate={debouncedUpdate}
      validationSchema={enableValidation ? getValidationSchema(getString, validationSchema) : undefined}
    >
      {formik => {
        const { values, setFieldValue } = formik
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: tabName }))
        formikRef.current = formik as FormikProps<unknown> | null
        return (
          <FieldArray name="variables">
            {({ remove, push, replace }) => {
              function handleAdd(variable: NGVariable): void {
                uids.current.push(uuid())
                push(variable)
              }

              function handleUpdate(index: number, variable: AllNGVariables): void {
                // variable.value = isValueRuntimeInput(variable.value) ? variable.value : ''
                replace(index, variable)
              }

              function handleRemove(index: number): void {
                uids.current.splice(index, 1)
                remove(index)
              }

              return (
                <div className={cx(css.customVariablesStage, className)} id={domId}>
                  <AddEditCustomVariable
                    selectedVariable={selectedVariable}
                    setSelectedVariable={setSelectedVariable}
                    addNewVariable={handleAdd}
                    updateVariable={handleUpdate}
                    allowableTypes={allowableTypes}
                    existingVariables={values.variables}
                    formName={formName}
                    allowedVarialblesTypes={allowedVarialblesTypes}
                  />
                  {values?.variables && values.variables?.length > 0 ? (
                    <div className={cx(css.tableRow, css.headerRow, 'variablesTableRow')}>
                      <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('name')}</Text>
                      <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('description')}</Text>
                      <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('valueLabel')}</Text>
                    </div>
                  ) : null}
                  {values?.variables?.map?.((variable, index) => {
                    // generated uuid if they are not present
                    if (!uids.current[index]) {
                      uids.current[index] = uuid()
                    }
                    const key = uids.current[index]
                    const yamlData = yamlProperties?.[index] || {}
                    if (!variable) {
                      return null
                    }

                    return (
                      <div key={key} className={cx(css.tableRow, 'variablesTableRow')}>
                        <Layout.Vertical>
                          <TextInputWithCopyBtn
                            name={`variables[${index}].name`}
                            label=""
                            disabled={true}
                            localName={yamlData.localName}
                            fullName={yamlData.fqn}
                          />
                          <String
                            className={css.valueString}
                            stringID={labelStringMap[variable.type as VariableType]}
                            data-testid={`variables[${index}].type`}
                          />
                        </Layout.Vertical>
                        {!isEmpty(variable?.description) ? (
                          <Text
                            icon="description"
                            inline
                            padding={'small'}
                            iconProps={{ size: 32 }}
                            tooltip={variable?.description}
                            tooltipProps={{
                              position: Position.BOTTOM,
                              isDark: true,
                              className: css.descriptionContent
                            }}
                          />
                        ) : (
                          <span />
                        )}
                        <Layout.Vertical>
                          <div className={css.valueColumn} data-type={getMultiTypeFromValue(variable.value as string)}>
                            {(variable.type as CustomDeploymentNGVariable['type']) === VariableType.Connector ? (
                              <FormMultiTypeConnectorField
                                name={`variables[${index}].value`}
                                label=""
                                placeholder={getString('common.entityPlaceholderText')}
                                disabled={readonly}
                                accountIdentifier={accountId}
                                multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
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
                              <MultiTypeSecretInput name={`variables[${index}].value`} label="" disabled={readonly} />
                            ) : (
                              <FormInput.MultiTextInput
                                className="variableInput"
                                name={`variables[${index}].value`}
                                label=""
                                disabled={readonly}
                                multiTextInputProps={{
                                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                                  defaultValueToReset: '',
                                  expressions,
                                  textProps: {
                                    disabled: !initialValues.canAddVariable || readonly,
                                    type: variable.type === VariableType.Number ? 'number' : 'text'
                                  },
                                  allowableTypes
                                }}
                              />
                            )}
                            {getMultiTypeFromValue(variable.value as string) === MultiTypeInputType.RUNTIME &&
                              (variable.type === VariableType.Secret ? (
                                <SecretConfigureOptions
                                  value={variable.value as string}
                                  defaultValue={variable.default}
                                  type={variable.type || /* istanbul ignore next */ 'String'}
                                  variableName={variable.name || /* istanbul ignore next */ ''}
                                  onChange={(value, defaultValue) => {
                                    setFieldValue(`variables[${index}].value`, value)
                                    setFieldValue(`variables[${index}].default`, defaultValue)
                                  }}
                                  isReadonly={readonly}
                                  secretInputProps={{
                                    disabled: readonly
                                  }}
                                />
                              ) : (
                                <ConfigureOptions
                                  value={variable.value as string}
                                  defaultValue={variable.default}
                                  type={variable.type || /* istanbul ignore next */ 'String'}
                                  variableName={variable.name || /* istanbul ignore next */ ''}
                                  onChange={(value, defaultValue) => {
                                    setFieldValue(`variables[${index}].value`, value)
                                    setFieldValue(`variables[${index}].default`, defaultValue)
                                  }}
                                  isReadonly={readonly}
                                  allowedValuesType={
                                    variable.type === VariableType.Number ? ALLOWED_VALUES_TYPE.NUMBER : undefined
                                  }
                                  tagsInputSeparator={
                                    commasInAllowedValues && variable.type === 'String' ? '/[\n\r]/' : undefined
                                  }
                                />
                              ))}
                            <div className={css.actionButtons}>
                              {initialValues.canAddVariable && !readonly ? (
                                <React.Fragment>
                                  <Button
                                    icon="Edit"
                                    tooltip={<String className={css.tooltip} stringID="common.editVariableType" />}
                                    data-testid={`edit-variable-${index}`}
                                    onClick={() => setSelectedVariable({ variable, index })}
                                    minimal
                                  />
                                  <Button
                                    icon="main-trash"
                                    data-testid={`delete-variable-${index}`}
                                    tooltip={<String className={css.tooltip} stringID="common.removeThisVariable" />}
                                    onClick={() => handleRemove(index)}
                                    minimal
                                  />
                                </React.Fragment>
                              ) : /* istanbul ignore next */ null}
                            </div>
                          </div>
                          {!!variable?.required && (
                            <Text
                              font={{ size: 'small' }}
                              color={Color.GREY_700}
                              padding={{ top: 'small' }}
                              style={{ fontWeight: 400 }}
                            >
                              {getString('pipeline.requiredFieldDuringRuntime')}
                            </Text>
                          )}
                        </Layout.Vertical>
                      </div>
                    )
                  })}
                  {values.canAddVariable && (
                    <Button
                      icon="plus"
                      className={css.addVariable}
                      disabled={readonly}
                      size={ButtonSize.SMALL}
                      variation={ButtonVariation.LINK}
                      onClick={addNew}
                      text={getString(defaultTo(addVariableLabel, 'platform.variables.newVariable'))}
                    />
                  )}
                </div>
              )
            }}
          </FieldArray>
        )
      }}
    </Formik>
  )
}
