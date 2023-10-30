/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import { FormikProps } from 'formik'
import { PipelineInfoConfig } from 'services/pipeline-ng'
import { RuntimeInputsHeader } from './RuntimeInputsHeader'
import { RuntimeInputList, RuntimeInputsFormData } from './RuntimeInputList'
import { transformDataToUIInput } from '../InputsForm/utils'
import { PipelineInputs } from '../InputsForm/types'

interface RuntimeInputsProps {
  isReadonly: boolean
  pipeline: PipelineInfoConfig
  onClose: () => void
  onUpdateInputs: (updatedInputs: PipelineInputs) => Promise<void>
}

export function RuntimeInputs(props: RuntimeInputsProps): JSX.Element {
  const { isReadonly, pipeline, onClose, onUpdateInputs } = props

  const formikRef = React.useRef<FormikProps<RuntimeInputsFormData>>()

  const onApply = async (): Promise<void> => {
    if (isEmpty(formikRef?.current?.errors)) {
      const updatedInputs = transformDataToUIInput(formikRef?.current?.values?.inputs)
      await onUpdateInputs(updatedInputs)
      onClose()
    }
  }

  const onDiscard = (): void => {
    onClose()
  }

  return (
    <>
      <RuntimeInputsHeader isReadonly={isReadonly} onApply={onApply} onDiscard={onDiscard} />
      <RuntimeInputList formikRef={formikRef} pipeline={pipeline} isReadonly={isReadonly} />
    </>
  )
}
