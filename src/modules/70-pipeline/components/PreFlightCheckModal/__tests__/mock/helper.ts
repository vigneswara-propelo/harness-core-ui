/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { omitBy } from 'lodash-es'
import { yamlStringify } from '@modules/10-common/utils/YamlHelperMethods'
import { PipelineInfoConfig, StartPreflightCheckQueryParams } from 'services/pipeline-ng'

export const pipeline = {
  identifier: 'testIPEnhancement',
  stages: [
    {
      stage: {
        identifier: 'test',
        type: 'Custom',
        spec: {
          execution: {
            steps: [
              {
                step: {
                  identifier: 'ShellScript_2',
                  type: 'ShellScript',
                  spec: {
                    source: {
                      type: 'Inline',
                      spec: {
                        script: 'echo 1'
                      }
                    }
                  }
                }
              }
            ]
          }
        },
        variables: [
          {
            name: 'testRuntime',
            type: 'String',
            value: ''
          }
        ]
      }
    }
  ]
} as unknown as PipelineInfoConfig

export const pipelinePayloadWithInputSetSelected = {
  ...pipeline,
  stages: [
    {
      stage: {
        ...pipeline.stages?.[0].stage,
        variables: [
          {
            name: 'testRuntime',
            type: 'String',
            value: '<+input>'
          }
        ]
      }
    }
  ]
} as unknown as PipelineInfoConfig

export const getPipelinePayload = (
  finalPipeline: PipelineInfoConfig
): {
  body: string
  queryParams: StartPreflightCheckQueryParams
} => {
  return {
    body: yamlStringify({ pipeline: omitBy(finalPipeline, (_value, key) => key.startsWith('_')) }),
    queryParams: {
      accountIdentifier: 'accId',
      orgIdentifier: 'orgId',
      pipelineIdentifier: 'pipId',
      projectIdentifier: 'projId'
    }
  }
}
