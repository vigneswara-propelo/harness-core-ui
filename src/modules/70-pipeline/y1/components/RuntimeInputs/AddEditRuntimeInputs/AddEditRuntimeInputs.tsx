/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, Container, FormInput, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import OptionalConfiguration from './OptionalConfiguration'
import { RuntimeInputType } from '../../InputsForm/types'
import css from './AddEditRuntimeInputs.module.scss'

interface AddEditRuntimeInputsProps {
  index: number
}

export default function AddEditRuntimeInputs({ index }: AddEditRuntimeInputsProps): React.ReactElement {
  const { getString } = useStrings()

  const allowedInputTypes = [
    RuntimeInputType.string,
    RuntimeInputType.number,
    RuntimeInputType.boolean,
    RuntimeInputType.object,
    RuntimeInputType.array,
    RuntimeInputType.secret
  ]

  return (
    <Container className={css.container} key={index} padding={{ top: 'large' }}>
      <Layout.Horizontal spacing="medium">
        <FormInput.Text
          name={`inputs[${index}].name`}
          style={{ flex: 1 }}
          label={getString('name')}
          placeholder={getString('pipeline.inputs.inputNamePlaceholder')}
        />
        <FormInput.Select
          name={`inputs[${index}].type`}
          items={allowedInputTypes.map(type => ({
            label: type,
            value: type
          }))}
          label={getString('typeLabel')}
          style={{ width: 150 }}
          placeholder={getString('pipeline.variable.typePlaceholder')}
          selectProps={{
            usePortal: true
          }}
        />
      </Layout.Horizontal>

      <FormInput.TextArea
        name={`inputs[${index}].description`}
        isOptional={true}
        placeholder={getString('common.descriptionPlaceholder')}
        label={getString('description')}
        textArea={{
          growVertically: true
        }}
      />
      <FormInput.CheckBox
        name={`inputs[${index}].required`}
        label={getString('pipeline.validations.setInputRequiredDuringRuntime')}
      />
      <Accordion panelClassName={css.panelContainer}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={<OptionalConfiguration index={index} />}
        />
      </Accordion>
    </Container>
  )
}
