/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { cloneDeep, isEqual } from 'lodash-es'
import { Container, Formik, FormikForm, Layout, VisualYamlSelectedView as SelectedView, Text } from '@harness/uicore'
import type { FormikErrors, FormikProps } from 'formik'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import { UIInputs } from '@modules/70-pipeline/y1/components/InputsForm/types'
import { ErrorsStrip } from '../ErrorsStrip/ErrorsStrip'
import { PipelineInputsFormY1 } from '../../y1/components/PipelineInputSetFormY1/PipelineInputSetFormY1'
import { InputSetKVPairs, InputSetMetadata } from './types'
import {
  addRemoveKeysFromInputSet,
  getInputSetFromFormikValues,
  getInputSetMetadataFromFormikValues,
  replaceEmptyWithNull
} from './utils'
import { ManageInputsY1 } from './ManageInputsY1'
import css from './InputSetForm.module.scss'

interface FormikInputSetFormProps {
  runtimeInputs: UIInputs
  inputSet: InputSetKVPairs
  inputSetMetadata: InputSetMetadata
  setLatestInputSetMetadata: React.Dispatch<React.SetStateAction<InputSetMetadata>>
  handleSubmit: (props: { inputSet: InputSetKVPairs; inputSetMetadata: InputSetMetadata }) => Promise<void>
  formErrors: Record<string, unknown>
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  formikRef: React.MutableRefObject<FormikProps<InputSetKVPairs> | undefined>
  selectedView: SelectedView
  isEdit: boolean
  yamlHandler?: YamlBuilderHandlerBinding
  setYamlHandler: React.Dispatch<React.SetStateAction<YamlBuilderHandlerBinding | undefined>>
  className?: string
  onCancel?: () => void
  handleFormDirty: (dirty: boolean) => void
  setIsSaveEnabled: (enabled: boolean) => void
  isEditable: boolean
  manageInputsActive: boolean
  setManageInputsActive: React.Dispatch<React.SetStateAction<boolean>>
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: 'input-set.yaml',
  entityType: 'InputSets',
  height: 'calc(100vh - 230px)',
  width: 'calc(100vw - 350px)',
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false,
    removeNull: false
  }
}

function useValidateValues(): {
  validateValues: (values: InputSetKVPairs) => Promise<FormikErrors<InputSetKVPairs>>
} {
  const { getString } = useStrings()

  const NameIdSchema = Yup.object({
    name: NameSchema(getString),
    identifier: IdentifierSchema(getString)
  })

  return {
    validateValues: async (values: InputSetKVPairs): Promise<FormikErrors<InputSetKVPairs>> => {
      let errors: FormikErrors<InputSetKVPairs> = {}
      try {
        await NameIdSchema.validate(values)
      } catch (err) {
        /* istanbul ignore else */ if (err.name === 'ValidationError') {
          errors = { [err.path]: err.message }
        }
      }

      return errors
    }
  }
}

export function FormikInputSetFormY1(props: FormikInputSetFormProps): React.ReactElement {
  const {
    runtimeInputs,
    inputSet,
    inputSetMetadata,
    setLatestInputSetMetadata,
    handleSubmit,
    formErrors,
    formikRef,
    selectedView,
    isEdit,
    setYamlHandler,
    className,
    handleFormDirty,
    setIsSaveEnabled,
    isEditable,
    manageInputsActive,
    setManageInputsActive
  } = props
  const { getString } = useStrings()
  const { validateValues } = useValidateValues()
  // all runtime inputs
  const [runtimeInputsAll, setRuntimeInputsAll] = useState(cloneDeep(runtimeInputs))
  // visible runtime inputs
  const [runtimeInputsVisible, setRuntimeInputsVisible] = useState<UIInputs>({ hasInputs: true, inputs: [] })
  // used to filter runtimeInputsVisible
  const [latestInputSet, setLatestInputSet] = useState<InputSetKVPairs>(getInputSetFromFormikValues(inputSet))
  // store user selection (checkboxes changes)
  const [selectedInputKeys, setSelectedInputKeys] = useState<string[]>([])

  const NameIdSchema = Yup.object({
    name: NameSchema(getString),
    identifier: IdentifierSchema(getString)
  })

  const formRefDom = React.useRef<HTMLElement | undefined>()

  useEffect(() => {
    setRuntimeInputsAll(cloneDeep(runtimeInputs))
    setRuntimeInputsVisible({
      inputs: runtimeInputs.inputs.filter(input => typeof latestInputSet[input.name] !== 'undefined'),
      hasInputs: true
    })
  }, [runtimeInputs, latestInputSet])

  return (
    <Container className={cx(css.inputSetForm, className)}>
      <Layout.Vertical
        spacing="medium"
        ref={ref => {
          formRefDom.current = ref as HTMLElement
        }}
      >
        <Formik<InputSetKVPairs>
          initialValues={{
            ...inputSet,
            ...inputSetMetadata
          }}
          formName="inputSetForm"
          validationSchema={NameIdSchema}
          enableReinitialize
          validate={values => {
            const { changed, values: newValues } = replaceEmptyWithNull(values)
            if (changed) {
              formikRef.current?.setValues(newValues, false)
            }

            validateValues(values)
            setLatestInputSetMetadata(getInputSetMetadataFromFormikValues(values))
            setLatestInputSet(getInputSetFromFormikValues(values))
          }}
          onSubmit={values => {
            handleSubmit({
              inputSet: getInputSetFromFormikValues(values),
              inputSetMetadata: getInputSetMetadataFromFormikValues(values)
            })
          }}
        >
          {formikProps => {
            formikRef.current = formikProps
            const handleChange = (): void => {
              const isFormDirty = !isEqual(getInputSetFromFormikValues(formikRef.current?.values ?? {}), inputSet)
              handleFormDirty(isFormDirty)
              setIsSaveEnabled(!isFormDirty)
            }
            return (
              <>
                {selectedView === SelectedView.VISUAL ? (
                  <div className={css.inputsetGrid}>
                    <div>
                      <ErrorsStrip formErrors={formErrors} domRef={formRefDom} />
                      <FormikForm onChange={handleChange}>
                        <Layout.Vertical className={css.content} padding="xlarge">
                          <Container className={css.metadataHolder}>
                            <NameIdDescriptionTags
                              identifierProps={{
                                inputLabel: getString('name'),
                                isIdentifierEditable: !isEdit && isEditable,
                                inputGroupProps: {
                                  disabled: !isEditable
                                }
                              }}
                              descriptionProps={{ disabled: !isEditable }}
                              tagsProps={{
                                disabled: !isEditable
                              }}
                              formikProps={formikProps}
                            />
                          </Container>
                          <Layout.Horizontal className={css.manageHolder} spacing={10}>
                            <Text className={css.manageTitle}>List of Runtime Inputs</Text>
                            <ManageInputsY1
                              active={manageInputsActive}
                              onActivate={() => {
                                setManageInputsActive(true)
                                setSelectedInputKeys(runtimeInputsVisible.inputs.map(input => input.name))
                              }}
                              onCancel={() => {
                                setManageInputsActive(false)
                                setSelectedInputKeys([])
                              }}
                              onApply={() => {
                                setManageInputsActive(false)
                                const newRuntimeInputsVisible = {
                                  hasInputs: true,
                                  inputs: runtimeInputsAll.inputs.filter(input =>
                                    selectedInputKeys.includes(input.name)
                                  )
                                }
                                setRuntimeInputsVisible(newRuntimeInputsVisible)

                                // get metadata before add/remove
                                const latestMetadata = getInputSetMetadataFromFormikValues(
                                  formikRef.current?.values ?? {}
                                )
                                const newValues = addRemoveKeysFromInputSet(
                                  formikRef.current?.values ?? {},
                                  selectedInputKeys
                                )
                                // apply selected key/value and metadata
                                formikRef.current?.setValues({ ...newValues, ...latestMetadata })
                              }}
                              inputsCounter={{
                                all: runtimeInputsAll.inputs.length,
                                selected: selectedInputKeys.length
                              }}
                            />
                          </Layout.Horizontal>
                          <PipelineInputsFormY1
                            className={css.inputsForm}
                            inputs={manageInputsActive ? runtimeInputsAll : runtimeInputsVisible}
                            readonly={!isEditable || manageInputsActive}
                            manageInputsActive={manageInputsActive}
                            selectedInputs={selectedInputKeys}
                            onSelectedInputsChange={setSelectedInputKeys}
                          />
                        </Layout.Vertical>
                      </FormikForm>
                    </div>
                  </div>
                ) : (
                  <div className={css.editor}>
                    <ErrorsStrip formErrors={formErrors} />
                    <Layout.Vertical className={css.content} padding="xlarge">
                      <YamlBuilderMemo
                        {...yamlBuilderReadOnlyModeProps}
                        existingJSON={getInputSetFromFormikValues(formikProps?.values, { escapeEmpty: true })}
                        bind={setYamlHandler}
                        isReadOnlyMode={!isEditable}
                        isEditModeSupported={isEditable}
                      />
                    </Layout.Vertical>
                  </div>
                )}
              </>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Container>
  )
}
