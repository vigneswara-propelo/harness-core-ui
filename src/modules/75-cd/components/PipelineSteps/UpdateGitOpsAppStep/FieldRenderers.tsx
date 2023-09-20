/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { FieldArray } from 'formik'
import type { FormikValues } from 'formik'
import cx from 'classnames'
import { Button, ButtonVariation, FormInput } from '@harness/uicore'
import type { AllowedTypes } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { Variable } from './helper'
import css from '@cd/components/UpdateReleaseRepo/OptionalConfig.module.scss'

interface RenderFieldArrayProps {
  fieldKey: string
  labelKey: keyof StringsMap
  buttonLabel: keyof StringsMap
  getString: UseStringsReturn['getString']
  readonly?: boolean
  allowableTypes: AllowedTypes
  expressions: string[]
  formValues: FormikValues
  valueLabel: keyof StringsMap
}

export const renderFieldArray = ({
  fieldKey,
  labelKey,
  buttonLabel,
  getString,
  readonly,
  // allowableTypes,
  // expressions,
  formValues,
  valueLabel
}: RenderFieldArrayProps): React.ReactElement => {
  return (
    <MultiTypeFieldSelector name={fieldKey} label={getString(labelKey)} defaultValueToReset={[]} disableTypeSelection>
      <FieldArray
        name={fieldKey}
        render={({ push, remove }) => {
          return (
            <div className={css.panel}>
              <div className={cx(css.environmentVarHeader, css.equalSizeVariableRow)}>
                <span className={css.label}>Name</span>
                <span className={css.label}>{getString(valueLabel)}</span>
              </div>

              {get(formValues, fieldKey, []).map(({ id }: Variable, i: number) => {
                return (
                  <div className={cx(css.environmentVarHeader, css.equalSizeVariableRow)} key={id}>
                    <FormInput.Text
                      name={`${fieldKey}[${i}].name`}
                      placeholder={getString('name')}
                      disabled={readonly}
                    />
                    <FormInput.MultiTextInput
                      name={`${fieldKey}[${i}].value`}
                      placeholder={getString(valueLabel)}
                      multiTextInputProps={{
                        allowableTypes: [],
                        // expressions,
                        disabled: readonly
                      }}
                      label=""
                      disabled={readonly}
                    />
                    <Button
                      variation={ButtonVariation.ICON}
                      icon="main-trash"
                      onClick={() => remove(i)}
                      disabled={readonly}
                    />
                  </div>
                )
              })}
              <Button
                icon="plus"
                variation={ButtonVariation.LINK}
                disabled={readonly}
                onClick={() => push({ name: '', value: '', id: uuid() })}
                className={css.addButton}
              >
                {getString(buttonLabel)}
              </Button>
            </div>
          )
        }}
      />
    </MultiTypeFieldSelector>
  )
}
