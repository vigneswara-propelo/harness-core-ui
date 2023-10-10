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
import { Button, ButtonVariation, FormInput, SelectOption } from '@harness/uicore'
import type { AllowedTypes } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FIELD_KEYS, Variable } from './helper'
import css from '@cd/components/UpdateReleaseRepo/OptionalConfig.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import ownCSS from './UpdateGitOpsAppStep.module.scss'

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

interface RenderFormByTypeProps {
  getString: UseStringsReturn['getString']
  formValues: FormikValues
  type?: string
  readonly?: boolean
  allowableTypes: AllowedTypes
  expressions: string[]
  valueFiles: SelectOption[]
  loadingValueFileOptions?: boolean
}

export const renderFormByType = ({
  getString,
  formValues,
  type,
  readonly,
  allowableTypes,
  expressions,
  valueFiles,
  loadingValueFileOptions
}: RenderFormByTypeProps): JSX.Element | null => {
  if (type === 'Helm') {
    return (
      <div>
        <div className={ownCSS.header}>Helm</div>
        <div className={stepCss.formGroup}>
          <FormInput.MultiSelect
            name={FIELD_KEYS.valueFiles}
            items={valueFiles || []}
            label={getString('cd.valueFiles')}
            disabled={readonly || loadingValueFileOptions}
            placeholder={loadingValueFileOptions ? getString('loading') : undefined}
          />
        </div>
        <div className={stepCss.formGroup}>
          {renderFieldArray({
            getString,
            readonly,
            allowableTypes,
            expressions,
            formValues,
            fieldKey: FIELD_KEYS.parameters,
            labelKey: 'platform.connectors.parameters',
            buttonLabel: 'platform.connectors.addParameter',
            valueLabel: 'valueLabel'
          })}
        </div>
        <div className={stepCss.formGroup}>
          {renderFieldArray({
            getString,
            readonly,
            allowableTypes,
            expressions,
            formValues,
            fieldKey: FIELD_KEYS.fileParameters,
            labelKey: 'cd.fileParameters',
            buttonLabel: 'platform.connectors.addParameter',
            valueLabel: 'cd.pathValue'
          })}
        </div>
      </div>
    )
  }
  return null
}
