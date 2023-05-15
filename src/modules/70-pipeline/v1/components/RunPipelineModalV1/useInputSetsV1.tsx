/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { isEmpty } from 'lodash-es'
import { useGetPipelineInputsQuery } from '@harnessio/react-pipeline-service-client'

export interface useInputSetsProps {
  projectIdentifier: string
  orgIdentifier: string
  pipelineIdentifier: string
  accountId: string
  branch?: string
  repoIdentifier?: string
  connectorRef?: string
}

export type pipelineInputsV1 = { [key: string]: string }
export interface InputsYaml {
  inputs?: pipelineInputsV1
  options: {
    clone?: {
      ref: { [key: string]: any }
    }
  }
}

export function useInputSetsV1(props: useInputSetsProps) {
  const { branch, repoIdentifier, orgIdentifier, connectorRef, projectIdentifier, pipelineIdentifier } = props

  const {
    data,
    error: error,
    isLoading
  } = useGetPipelineInputsQuery({
    org: orgIdentifier,
    project: projectIdentifier,
    pipeline: pipelineIdentifier,
    queryParams: {
      repo_name: repoIdentifier,
      branch_name: branch,
      connector_ref: connectorRef
    }
  })

  const pipelineInputs = data?.content

  const hasRuntimeInputs = !isEmpty(pipelineInputs?.inputs)
  const hasCodebaseInputs = !isEmpty(pipelineInputs?.options?.clone)

  const inputSetYaml: InputsYaml = { options: {}, inputs: {} }

  if (!isEmpty(pipelineInputs?.inputs)) {
    inputSetYaml.inputs = {}
    for (const key in pipelineInputs?.inputs) {
      inputSetYaml.inputs[key] = ''
      if (pipelineInputs?.inputs[key].default) {
        inputSetYaml.inputs[key] = pipelineInputs?.inputs[key].default
      }
    }
  }
  if (!isEmpty(pipelineInputs?.options?.clone)) {
    inputSetYaml.options.clone = {
      ref: {}
    }
    for (const key in pipelineInputs?.options?.clone?.ref) {
      inputSetYaml.options.clone.ref[key] = ''
    }
  }

  return {
    inputSets: pipelineInputs,
    inputSetYaml,
    hasRuntimeInputs,
    isLoading,
    hasCodebaseInputs,
    inputSetsError: (error as any)?.data?.message || (error as any)?.message
  }
}
