/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { nanoid } from 'nanoid'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Container,
  Icon,
  Text,
  Formik,
  FormikForm,
  Layout,
  ExpandingSearchInput,
  Tabs,
  Tab
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, isEmpty, noop } from 'lodash-es'
import { FieldArray, FormikProps } from 'formik'
import EmptyStateSvg from '@common/images/EmptySearchResults.svg'
import DescriptionPopover from '@common/components/DescriptionPopover.tsx/DescriptionPopover'
import { CopyToClipBoard } from '@common/components'
import { String, useStrings } from 'framework/strings'
import { MAX_LENGTH } from '@pipeline/components/CommonPipelineStages/PipelineStage/PipelineStageOutputSection/utils'
import { illegalIdentifiers } from '@common/utils/StringUtils'
import { Validation } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import { PipelineInfoConfig } from 'services/pipeline-ng'
import { RuntimeInputField, PipelineInputs } from '../InputsForm/types'
import AddEditRuntimeInputs from './AddEditRuntimeInputs/AddEditRuntimeInputs'
import { DEFAULT_RUNTIME_INPUT } from './AddEditRuntimeInputs/utils'
import { generateInputsFromPipelineInputs, getInputDotNotations } from '../InputsForm/utils'
import References from './AddEditRuntimeInputs/References'
import css from './RuntimeInputs.module.scss'

export interface RuntimeInputsFormData {
  inputs: RuntimeInputField[]
}

interface ValidateOptionsExtended {
  options: {
    index: number
  }
}

interface RuntimeInputsListWithRefProps {
  formikRef: React.MutableRefObject<FormikProps<RuntimeInputsFormData> | undefined>
  pipeline: PipelineInfoConfig
  isReadonly: boolean
}

const SEARCH_DEBOUNCE_DELAY = 300

export enum RuntimeInputDataTab {
  Overview = 'Overview',
  Reference = 'References'
}

export function RuntimeInputList(props: RuntimeInputsListWithRefProps): JSX.Element {
  const { formikRef, pipeline, isReadonly } = props
  const { getString } = useStrings()

  const pipelineInputs = (pipeline as unknown as { spec: { inputs: PipelineInputs } })?.spec?.inputs
  const [newAddedInputIndex, setNewAddedInput] = React.useState<number>(-1)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTabId, setSelectedTabId] = React.useState<RuntimeInputDataTab>(RuntimeInputDataTab.Overview)
  const inputReferences = React.useMemo(() => getInputDotNotations(pipeline), [pipeline])

  const initialValues = useMemo(() => {
    return {
      inputs: generateInputsFromPipelineInputs(pipelineInputs).inputs.map(input => {
        const { validator } = input
        const validationType =
          validator?.allowed && validator.allowed.length > 0
            ? Validation.AllowedValues
            : validator?.regex && validator.regex.length > 0
            ? Validation.Regex
            : Validation.None

        return {
          ...input,
          selected: false,
          id: nanoid(10),
          validator: {
            validation: validationType,
            allowed: defaultTo(validator?.allowed, []),
            regex: defaultTo(validator?.regex, '')
          }
        }
      })
    }
  }, [pipelineInputs])

  const getFilteredInputs = (inputs: RuntimeInputField[]): RuntimeInputField[] => {
    const lowerCaseSearchTerm = searchTerm.trim().toLocaleLowerCase()

    return inputs.filter(input => input.selected || input.name.toLocaleLowerCase().includes(lowerCaseSearchTerm))
  }

  const getExistingRuntimeInputs = (): string[] => {
    return formikRef?.current && Array.isArray(formikRef?.current?.values?.inputs)
      ? formikRef.current.values.inputs.map(input => input?.name || '')
      : []
  }

  const nameExists = (value: string, indexToRemove: number): boolean => {
    return getExistingRuntimeInputs()
      .filter((_, index) => index !== indexToRemove)
      .includes(value)
  }

  const validationSchema = Yup.object().shape({
    inputs: Yup.array().of(
      Yup.object().shape({
        name: Yup.string()
          .trim()
          .required(getString('common.validation.nameIsRequired'))
          .max(
            MAX_LENGTH,
            getString('common.validation.fieldCannotbeLongerThanN', {
              name: getString('name'),
              n: MAX_LENGTH
            })
          )
          .matches(
            /^[a-zA-Z_][0-9a-zA-Z-_$.]*$/,
            getString('common.validation.variableNameMustBeAlphanumeric', {
              name: getString('name')
            })
          )
          .test('variableAlreadyExists', getString('pipeline.validations.inputAlreadyExists'), function (value) {
            const { createError, path } = this
            const {
              options: { index }
            } = this as Yup.TestContext & ValidateOptionsExtended

            // Return an error if the name already exists
            return nameExists(value, index) ? createError({ path, message: 'Name already exists' }) : true
          })
          .test(
            'invalidNames',
            getString('common.invalidNames', { names: illegalIdentifiers.join(', ') }),
            value => !illegalIdentifiers.includes(value)
          ),
        validator: Yup.object().shape({
          validation: Yup.string().required(),
          regex: Yup.string().when('validation', {
            is: Validation.Regex,
            then: Yup.string()
              .trim()
              .test({
                test(val: string): boolean | Yup.ValidationError {
                  if (isEmpty(val)) {
                    return this.createError({
                      message: getString('common.configureOptions.validationErrors.regExIsRequired')
                    })
                  }
                  let isValid = true
                  try {
                    val?.length > 0 && new RegExp(val)
                  } catch (_e) {
                    isValid = false
                  }
                  if (!isValid) {
                    return this.createError({
                      message: getString('common.configureOptions.validationErrors.regExNotValid')
                    })
                  }
                  return true
                }
              })
          }),
          allowed: Yup.array(Yup.string()).when('validation', {
            is: Validation.AllowedValues,
            then: Yup.array(Yup.string()).min(
              1,
              getString('common.configureOptions.validationErrors.minOneAllowedValue')
            )
          })
        }),
        default: Yup.string()
          .trim()
          .when('validator.validation', {
            is: Validation.Regex,
            then: Yup.string()
              .trim()
              .test(
                'matchesRegex',
                getString('common.configureOptions.validationErrors.defaultRegExValid'),
                function (value) {
                  try {
                    const regex = new RegExp(this.parent.validator.regex)
                    if (!regex.test(value)) {
                      return this.createError({
                        message: getString('common.configureOptions.validationErrors.defaultRegExValid')
                      })
                    }
                  } catch (_e) {
                    // Do nothing
                  }
                  return true
                }
              )
          })
          .when('validator.validation', {
            is: Validation.AllowedValues,
            then: Yup.string().test(
              'isAllowedValue',
              getString('common.configureOptions.validationErrors.defaultAllowedValid'),
              function (value) {
                return this.parent.validator.allowed.includes(value)
              }
            )
          })
      })
    )
  })

  const getDefaultRuntimeInputValue = () => ({ ...DEFAULT_RUNTIME_INPUT, id: nanoid(10), selected: true })

  const onAddNewRuntimeInput = (
    values: RuntimeInputsFormData,
    setValues: (values: React.SetStateAction<RuntimeInputsFormData>, shouldValidate?: boolean | undefined) => void
  ): void => {
    setValues(prev => {
      const modifiedValues = prev.inputs.map(pInput => ({
        ...pInput,
        selected: false
      }))
      return {
        ...prev,
        inputs: [...modifiedValues, getDefaultRuntimeInputValue() as unknown as RuntimeInputField]
      }
    })
    setNewAddedInput(values.inputs.length)
    setSelectedTabId(RuntimeInputDataTab.Overview)
  }

  return (
    <div className={css.formContainer}>
      <Formik<RuntimeInputsFormData>
        formName="addEditRuntimeInputs"
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnChange
        onSubmit={noop}
      >
        {formikProps => {
          formikRef.current = formikProps
          const { values, setValues } = formikProps
          const filteredInputs = getFilteredInputs(values.inputs)
          const selectedRuntimeInputIndex = filteredInputs.findIndex(input => input?.selected)
          const selectedInputIndex = values.inputs.findIndex(
            input => input.id === filteredInputs[selectedRuntimeInputIndex]?.id
          )
          const selectedInputReferences = inputReferences?.[filteredInputs?.[selectedRuntimeInputIndex]?.name] || []

          return (
            <FormikForm className={css.form}>
              <FieldArray name="inputs" validateOnChange={true}>
                {({ remove }) => {
                  function handleRemove(index: number): void {
                    remove(index)
                  }

                  return (
                    <Container className={css.container}>
                      <Container className={css.left}>
                        <Layout.Vertical padding={{ top: 'large', bottom: 'medium' }}>
                          <Text
                            font={{ variation: FontVariation.BODY2 }}
                            color={Color.GREY_700}
                            margin={{ bottom: 'medium' }}
                            padding={{ left: 'xlarge', right: 'xlarge' }}
                          >
                            {getString('pipeline.inputListInfo')}
                          </Text>
                          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding={{ left: 'xlarge' }}>
                            <Container className="search">
                              <ExpandingSearchInput
                                alwaysExpanded
                                autoFocus
                                defaultValue={searchTerm}
                                width={300}
                                onChange={setSearchTerm}
                                throttle={SEARCH_DEBOUNCE_DELAY}
                              />
                            </Container>
                            {!!filteredInputs.length && (
                              <Button
                                variation={ButtonVariation.LINK}
                                icon="plus"
                                onClick={() => {
                                  onAddNewRuntimeInput(values, setValues)
                                }}
                                disabled={isReadonly}
                              >
                                <String stringID={'pipeline.addRuntimeInput'} />
                              </Button>
                            )}
                          </Layout.Horizontal>
                        </Layout.Vertical>
                        {!filteredInputs.length && (
                          <div className={css.emptyState}>
                            <img className={css.img} src={EmptyStateSvg} />
                            <Text font={{ variation: FontVariation.BODY }}>
                              {!values.inputs.length
                                ? getString('pipeline.noRuntimeInputsCreated')
                                : getString('common.noSearchResultsFound', { searchTerm: searchTerm.trim() })}
                            </Text>
                            <Button
                              margin={{ top: 'large' }}
                              text={getString('pipeline.addRuntimeInput')}
                              icon="plus"
                              variation={ButtonVariation.PRIMARY}
                              onClick={() => {
                                onAddNewRuntimeInput(values, setValues)
                              }}
                            />
                          </div>
                        )}
                        {!!filteredInputs.length && (
                          <div className={css.list}>
                            <div className={cx(css.row, css.headerRow)}>
                              <Text font={{ variation: FontVariation.TABLE_HEADERS }} color={Color.GREY_500}>
                                {getString('name')}
                              </Text>
                              <Text font={{ variation: FontVariation.TABLE_HEADERS }} color={Color.GREY_500}>
                                {getString('description')}
                              </Text>
                              <Text font={{ variation: FontVariation.TABLE_HEADERS }} color={Color.GREY_500}>
                                {getString('common.configureOptions.defaultValue')}
                              </Text>
                            </div>
                            {getFilteredInputs(values.inputs).map(input => (
                              <div
                                key={input.id}
                                className={cx(css.row, css.dataRow, input.selected && css.selected)}
                                onClick={() => {
                                  formikProps?.submitForm() // Added submit form as for untouched fields, validation errors are shown on submitCount
                                  if (isEmpty(formikProps?.errors)) {
                                    setValues(prev => {
                                      return {
                                        ...prev,
                                        inputs: prev.inputs.map(pInput => ({
                                          ...pInput,
                                          selected: pInput.id === input.id ? !pInput.selected : false
                                        }))
                                      }
                                    })
                                    setNewAddedInput(-1)
                                  }
                                }}
                                role="button"
                                aria-label={input.name ?? ''}
                              >
                                <div className={cx(css.dataCell, css.nameCell)}>
                                  <div className={css.nameAndReferences}>
                                    <Text
                                      font={{ variation: FontVariation.BODY2 }}
                                      lineClamp={1}
                                      color={Color.GREY_1000}
                                    >
                                      {input.name ?? ''}
                                    </Text>
                                    <CopyToClipBoard
                                      className={css.copyIcon}
                                      content={input.name ?? ''}
                                      iconSize={18}
                                    />
                                    <Text
                                      icon="link"
                                      iconProps={{ size: 12 }}
                                      font={{ variation: FontVariation.BODY2 }}
                                      color={Color.GREY_500}
                                    >
                                      {(inputReferences?.[input.name] || []).length}
                                    </Text>
                                  </div>
                                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500} lineClamp={1}>
                                    {input.type}
                                  </Text>
                                </div>
                                <div className={css.dataCell}>
                                  {!!input.description && <DescriptionPopover text={input.description} />}
                                </div>
                                <div className={cx(css.dataCell, css.defaultCell)}>
                                  <Text font={{ variation: FontVariation.BODY2 }} lineClamp={2}>
                                    {input.default ?? ''}
                                  </Text>
                                  <Icon
                                    className={css.chevronIcon}
                                    name="chevron-right"
                                    size={24}
                                    color={Color.PRIMARY_7}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Container>
                      {selectedInputIndex !== -1 ? (
                        <div className={css.right}>
                          <Container flex={{ justifyContent: 'space-between' }}>
                            <Text font={{ variation: FontVariation.H4 }} padding={{ top: 'small', bottom: 'medium' }}>
                              {newAddedInputIndex !== -1
                                ? getString('pipeline.addRuntimeInput')
                                : getString('pipeline.editInput')}
                            </Text>
                            <Button
                              icon="main-trash"
                              iconProps={{ color: Color.PRIMARY_7 }}
                              color={Color.PRIMARY_7}
                              data-testid={`delete-variable-${selectedInputIndex}`}
                              tooltip={<String className={css.tooltip} stringID="pipeline.removeRuntimeInput" />}
                              onClick={() => handleRemove(selectedInputIndex)}
                              minimal
                            />
                          </Container>

                          <Tabs
                            id="runtimeInputPanel"
                            onChange={(nextTab: RuntimeInputDataTab) => setSelectedTabId(nextTab)}
                            selectedTabId={selectedTabId}
                            data-tabId={selectedTabId}
                          >
                            <Tab
                              id={RuntimeInputDataTab.Overview}
                              key={RuntimeInputDataTab.Overview}
                              title={RuntimeInputDataTab.Overview}
                              data-testid={RuntimeInputDataTab.Overview}
                              panel={<AddEditRuntimeInputs index={selectedInputIndex as number} />}
                              panelClassName={css.runtimePanel}
                            />

                            <Tab
                              id={RuntimeInputDataTab.Reference}
                              key={RuntimeInputDataTab.Reference}
                              title={RuntimeInputDataTab.Reference}
                              data-testid={RuntimeInputDataTab.Reference}
                              panel={<References selectedInputReferences={selectedInputReferences} />}
                              panelClassName={css.runtimePanel}
                            />
                          </Tabs>
                        </div>
                      ) : null}
                    </Container>
                  )
                }}
              </FieldArray>
            </FormikForm>
          )
        }}
      </Formik>
    </div>
  )
}
