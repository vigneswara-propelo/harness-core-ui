/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { get, set } from 'lodash-es'
import produce from 'immer'
import { ExpressionAndRuntimeTypeProps, MultiTypeInputType, MultiTypeInputValue } from '@harness/uicore'
import { RuntimeInputSelect, RuntimeInputSelectOption } from '../components/RuntimeInputSelect/RuntimeInputSelect'
import { usePipelineContextY1 } from '../components/PipelineContext/PipelineContextY1'
import { PipelineInputs, RuntimeInput, RuntimeInputType } from '../components/InputsForm/types'
import { ConfigureOptionsModal } from '../components/RuntimeInputSelect/ConfigureOptionsModal'

const getRuntimeValueFromName = (name: string): string => {
  return `<+inputs.${name}>`
}

export interface UseRuntimeInputProps {
  type: RuntimeInputType
  standalone?: boolean
}

interface UseRuntimeInputReturn {
  renderRuntimeInput: ExpressionAndRuntimeTypeProps['renderRuntimeInput']
}

export const useRuntimeInput = (props: UseRuntimeInputProps): UseRuntimeInputReturn => {
  const { type, standalone = false } = props
  const [selectedInput, setSelectedInput] = useState<string | undefined>()

  const {
    state: { pipeline, yamlHandler },
    isReadonly
  } = usePipelineContextY1()

  const updateInput = (inputName: string, options: RuntimeInput): void => {
    yamlHandler?.setLatestYaml?.(
      produce(pipeline, draft => {
        set(draft, `spec.inputs.${inputName}`, options)
      })
    )
  }

  const inputs = get(pipeline, 'spec.inputs') as PipelineInputs | undefined

  const items = useMemo<RuntimeInputSelectOption[]>(() => {
    if (!inputs) return []

    return Object.keys(inputs)
      .filter(input => inputs[input]?.type === type)
      .map(input => ({
        value: getRuntimeValueFromName(input),
        label: input,
        desc: inputs[input]?.desc
      }))
  }, [type, inputs])

  const createNewItemFromQuery = (query: string): RuntimeInputSelectOption => {
    const inputName = query.trim()
    return {
      label: inputName,
      value: getRuntimeValueFromName(inputName)
    }
  }

  return {
    renderRuntimeInput: ({ value, disabled, onChange }) => (
      <>
        <RuntimeInputSelect
          items={items}
          createNewItemFromQuery={createNewItemFromQuery}
          value={items.find(item => item.value === value)}
          disabled={disabled}
          onChange={item => {
            const inputName = item.label as string
            const isNew = items.every(i => i.label !== inputName)

            if (isNew) {
              updateInput(inputName, { type })
            }
            onChange?.(getRuntimeValueFromName(inputName), MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)
          }}
          onSettingsClick={() => {
            setSelectedInput(items.find(item => item.value === value)?.label as string)
          }}
          standalone={standalone}
        />
        <ConfigureOptionsModal
          isOpen={!!selectedInput}
          close={() => setSelectedInput(undefined)}
          isReadonly={isReadonly}
          inputName={selectedInput}
          inputOptions={selectedInput ? inputs?.[selectedInput] : undefined}
          onApply={updateInput}
        />
      </>
    )
  }
}
