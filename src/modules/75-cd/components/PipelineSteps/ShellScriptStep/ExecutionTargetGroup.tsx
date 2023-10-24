/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikContextType } from 'formik'
import {
  FormikTooltipContext,
  DataTooltipInterface,
  MultiTypeInputType,
  HarnessDocTooltip,
  Container,
  AllowedTypes
} from '@harness/uicore'
import { FormGroup, IFormGroupProps, Intent, RadioGroup, Radio } from '@blueprintjs/core'
import { defaultTo, get } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { errorCheck } from '@common/utils/formikHelpers'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ShellScriptFormData } from './shellScriptTypes'

import css from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector.module.scss'

export interface MultiTypeExecTargetProps extends IFormGroupProps {
  name: string
  label?: string
  expressions?: string[]
  allowableTypes?: AllowedTypes
  tooltipProps?: DataTooltipInterface
  disableTypeSelection?: boolean
  readonly?: boolean
  initialValues?: ShellScriptFormData
}

export interface ConnecteExecutionTargetGrpProps extends MultiTypeExecTargetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContextType<any>
}

export function MultiTypeExecutionTargetGroup(props: ConnecteExecutionTargetGrpProps): React.ReactElement {
  const {
    formik,
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
    label,
    name,
    readonly,
    // inputProps,
    disableTypeSelection = false,
    initialValues,
    ...restProps
  } = props

  const hasError = errorCheck(name, formik)

  const { getString } = useStrings()

  const { intent = hasError ? Intent.DANGER : Intent.NONE, disabled, ...rest } = restProps
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    defaultTo(get(props, 'tooltipProps.dataTooltipId'), '') ||
    defaultTo(`${get(tooltipContext, 'formName')}_${name}`, '')

  const selectedValue = get(formik.values, name) ? 'delegate' : 'targethost'

  return (
    <FormGroup
      {...rest}
      labelFor={name}
      /* istanbul ignore next */
      label={label ? <HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} /> : label}
      intent={intent}
    >
      <Container className={cx(css.fieldSelectorContainer)}>
        <MultiTypeFieldSelector
          name={name}
          label={getString('pipeline.execTargetLabel')}
          defaultValueToReset={false}
          skipRenderValueInExpressionLabel
          allowedTypes={allowableTypes}
          supportListOfExpressions={true}
          disableMultiSelectBtn={disabled}
          disableTypeSelection={disableTypeSelection}
          style={{ flexGrow: 1, marginBottom: 0 }}
        >
          <RadioGroup
            data-tooltip-id="executionTargetTooltip"
            selectedValue={selectedValue}
            disabled={readonly}
            inline={true}
            onChange={e => {
              formik.setFieldValue(name, e.currentTarget.value !== 'targethost')
            }}
          >
            <Radio value={'targethost'} label={getString('cd.specifyTargetHost')} />
            <Radio value={'delegate'} label={getString('pipeline.delegateLabel')} />
          </RadioGroup>
        </MultiTypeFieldSelector>
      </Container>
    </FormGroup>
  )
}

export default connect<MultiTypeExecTargetProps>(MultiTypeExecutionTargetGroup)
