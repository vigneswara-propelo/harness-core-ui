/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { defaultTo, set } from 'lodash-es'
import { FormikProps } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import {
  Button,
  ButtonVariation,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  ModalDialog,
  MultiTypeInputType,
  Text
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Validation } from '@modules/10-common/components/ConfigureOptions/ConfigureOptionsUtils'
import AllowedValuesFields from '@modules/10-common/components/ConfigureOptions/AllowedValuesField'
import { RuntimeInput, RuntimeInputType } from '../InputsForm/types'
import { getDefaultSchema, getValidationTypeFromValidator, getValidatorSchema } from '../RuntimeInputs/Utils'
import css from './ConfigureOptionsModal.module.scss'

interface FormValues extends Partial<RuntimeInput> {
  validator: RuntimeInput['validator'] & {
    validation: Validation
  }
}

interface ConfigureOptionsModalProps {
  isOpen: boolean
  close: () => void
  isReadonly: boolean
  inputName: string | undefined
  inputOptions?: RuntimeInput
  onApply: (name: string, options: RuntimeInput) => void
}

export function ConfigureOptionsModal(props: ConfigureOptionsModalProps): JSX.Element {
  const { isOpen, isReadonly, close, inputOptions, inputName, onApply } = props
  const { getString } = useStrings()
  const formikRef = useRef<FormikProps<FormValues>>()

  const initialValues: FormValues = {
    ...inputOptions,
    validator: {
      ...inputOptions,
      validation: getValidationTypeFromValidator(inputOptions?.validator),
      allowed: defaultTo(inputOptions?.validator?.allowed, []),
      regex: defaultTo(inputOptions?.validator?.regex, '')
    }
  }

  const showValidationAndDefaultFields = [RuntimeInputType.object, RuntimeInputType.array].every(
    t => t !== inputOptions?.type
  )

  return (
    <ModalDialog
      title={getString('pipeline.configureOptionsTitle')}
      isOpen={isOpen}
      enforceFocus={false}
      width={600}
      onClose={close}
      footer={
        <Layout.Horizontal spacing="small">
          <Button
            type="submit"
            variation={ButtonVariation.PRIMARY}
            text={getString('filters.apply')}
            onClick={() => formikRef.current?.submitForm()}
          />
          <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={close} />
        </Layout.Horizontal>
      }
    >
      <Formik
        formName="inputOptions"
        initialValues={initialValues}
        validationSchema={
          showValidationAndDefaultFields
            ? Yup.object().shape({
                validator: getValidatorSchema(getString),
                default: getDefaultSchema(getString)
              })
            : undefined
        }
        onSubmit={values => {
          if (!inputOptions || !inputName) return

          const options: RuntimeInput = {
            type: inputOptions.type,
            default: values.default,
            desc: values.desc,
            required: values.required
          }

          if (values.validator.validation === Validation.AllowedValues) {
            set(options, 'validator.allowed', values.validator.allowed)
          }
          if (values.validator.validation === Validation.Regex) {
            set(options, 'validator.regex', values.validator.regex)
          }

          onApply(inputName, options)
          close()
        }}
      >
        {formik => {
          formikRef.current = formik
          const { values, setFieldValue } = formik

          return (
            <FormikForm>
              <div className={css.labels}>
                <Text font={{ variation: FontVariation.BODY }}>{`${getString('name')}:`}</Text>
                <Text font={{ variation: FontVariation.BODY }}>{inputName}</Text>
                <Text font={{ variation: FontVariation.BODY }}>{`${getString('typeLabel')}:`}</Text>
                <Text font={{ variation: FontVariation.BODY }}>{inputOptions?.type}</Text>
              </div>

              <div className={css.divider} />

              <FormInput.TextArea
                name="desc"
                isOptional={true}
                placeholder={getString('common.descriptionPlaceholder')}
                label={getString('description')}
                disabled={isReadonly}
                textArea={{
                  growVertically: true
                }}
              />
              <FormInput.CheckBox
                name="required"
                label={getString('pipeline.validations.setInputRequiredDuringRuntime')}
                disabled={isReadonly}
              />
              {showValidationAndDefaultFields && (
                <>
                  <FormInput.RadioGroup
                    name="validator.validation"
                    label={getString('common.configureOptions.validation')}
                    items={[
                      { label: getString('none'), value: Validation.None },
                      { label: getString('allowedValues'), value: Validation.AllowedValues },
                      { label: getString('common.configureOptions.regex'), value: Validation.Regex }
                    ]}
                    disabled={isReadonly}
                    radioGroup={{ inline: true }}
                  />
                  {values?.validator?.validation === Validation.AllowedValues && (
                    <AllowedValuesFields
                      name="validator.allowed"
                      isReadonly={isReadonly}
                      variableType={defaultTo(inputOptions?.type, 'string')}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formik={formik as any}
                      onChange={value => {
                        setFieldValue('validator.allowed', value)
                      }}
                    />
                  )}
                  {values?.validator?.validation === Validation.Regex && (
                    <FormInput.TextArea
                      label={getString('common.configureOptions.regex')}
                      name="validator.regex"
                      disabled={isReadonly}
                      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setFieldValue('validator.regex', event.target.value)
                      }}
                    />
                  )}
                  <FormInput.MultiTextInput
                    name="default"
                    label={getString('common.configureOptions.defaultValue')}
                    isOptional
                    disabled={isReadonly}
                    multiTextInputProps={{
                      defaultValueToReset: '',
                      expressions: [],
                      textProps: {
                        type: values.type === RuntimeInputType.number ? 'number' : 'text'
                      },
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                    data-testid="runtime-input-default-value"
                  />
                </>
              )}
            </FormikForm>
          )
        }}
      </Formik>
    </ModalDialog>
  )
}
