/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { UseMutateAsyncFunction } from '@tanstack/react-query'
import {
  CreateInputSetOkResponse,
  CreateInputSetProps,
  GetInputSetOkResponse,
  UpdateInputSetOkResponse,
  UpdateInputSetProps
} from '@harnessio/react-pipeline-service-client'
import type { CreateUpdateInputSetsReturnType } from '@pipeline/utils/types'
import { getFormattedErrorsOpenAPI } from '@pipeline/utils/runPipelineUtils'
import type { InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { InputSetKVPairs, InputSetMetadata } from './types'
import { getInputSetFromFormikValues } from './utils'

interface UseSaveInputSetReturnType {
  handleSubmit: (props: { inputSet: InputSetKVPairs; inputSetMetadata: InputSetMetadata }) => Promise<void>
}

interface UseSaveInputSetY1Props {
  createInputSet: UseMutateAsyncFunction<CreateInputSetOkResponse, unknown, CreateInputSetProps, unknown>
  updateInputSet: UseMutateAsyncFunction<UpdateInputSetOkResponse, unknown, UpdateInputSetProps, unknown>
  inputSetResponse: GetInputSetOkResponse | UpdateInputSetOkResponse | undefined
  isEdit: boolean
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  onCreateUpdateSuccess: (response?: CreateInputSetOkResponse | UpdateInputSetOkResponse) => void
}

export function useSaveInputSetY1(props: UseSaveInputSetY1Props): UseSaveInputSetReturnType {
  const { createInputSet, updateInputSet, isEdit, setFormErrors, onCreateUpdateSuccess } = props
  const { projectIdentifier, orgIdentifier, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { getString } = useStrings()

  const createUpdateInputSet = React.useCallback(
    async ({
      inputSet,
      inputSetMetadata,
      onCreateUpdateInputSetSuccess
    }: {
      inputSet: InputSetKVPairs
      inputSetMetadata: InputSetMetadata
      onCreateUpdateInputSetSuccess: (response?: CreateInputSetOkResponse | UpdateInputSetOkResponse) => void
    }): CreateUpdateInputSetsReturnType => {
      let response: CreateInputSetOkResponse | undefined = undefined

      try {
        if (isEdit) {
          if (inputSetMetadata.identifier) {
            response = await updateInputSet({
              body: {
                identifier: inputSetMetadata.identifier,
                name: inputSetMetadata.name ?? '',
                description: inputSetMetadata.description,
                tags: inputSetMetadata.tags,
                input_set_yaml: yamlStringify({
                  inputSet: inputSet
                })
              },
              'input-set': inputSetMetadata.identifier,
              queryParams: { pipeline: pipelineIdentifier },
              org: orgIdentifier,
              project: projectIdentifier
            })
          } else {
            throw new Error(getString('common.validation.identifierIsRequired'))
          }
        } else {
          response = await createInputSet({
            body: {
              identifier: inputSetMetadata.identifier ?? '',
              name: inputSetMetadata.name ?? '',
              description: inputSetMetadata.description,
              tags: inputSetMetadata.tags,
              input_set_yaml: yamlStringify({
                inputSet: inputSet
              })
            },
            queryParams: { pipeline: pipelineIdentifier },
            org: orgIdentifier,
            project: projectIdentifier
          })
        }

        onCreateUpdateInputSetSuccess(response)
      } catch (e) {
        const errors = getFormattedErrorsOpenAPI(e?.errors)
        if (!isEmpty(errors)) {
          setFormErrors(errors)
        }

        throw e
      }

      return {
        nextCallback: () => onCreateUpdateInputSetSuccess(response)
      }
    },
    [
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      createInputSet,
      updateInputSet,
      getString,
      isEdit,
      setFormErrors
    ]
  )

  const handleSubmit = React.useCallback(
    async ({ inputSet, inputSetMetadata }: { inputSet: InputSetKVPairs; inputSetMetadata: InputSetMetadata }) => {
      createUpdateInputSet({
        inputSet: getInputSetFromFormikValues(inputSet, { escapeEmpty: true }),
        inputSetMetadata,
        onCreateUpdateInputSetSuccess: onCreateUpdateSuccess
      })
    },
    [createUpdateInputSet, onCreateUpdateSuccess]
  )

  return {
    handleSubmit
  }
}
