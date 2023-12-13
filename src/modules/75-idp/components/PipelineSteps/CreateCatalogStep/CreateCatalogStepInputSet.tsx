/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FormikContextType } from 'formik'
import { get } from 'lodash-es'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { TextFieldInputSetView } from '@modules/70-pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import MultiTypeFieldSelector from '@modules/10-common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@modules/10-common/components/MonacoTextField/MonacoTextField'
import { CreateCatalogStepData, CreateCatalogStepEditProps } from './CreateCatalogStepEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function CreateCatalogStepInputSet(
  props: CreateCatalogStepEditProps & { formik?: FormikContextType<CreateCatalogStepData> }
): React.ReactElement {
  const { template, path, readonly, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {isValueRuntimeInput(get(template, 'spec.fileName')) && (
        <TextFieldInputSetView
          name={`${path}.spec.fileName`}
          label={getString('common.filename')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          placeholder={getString('common.filename')}
          fieldPath="spec.fileName"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}

      {isValueRuntimeInput(get(template, 'spec.filePath')) && (
        <TextFieldInputSetView
          name={`${path}.spec.filePath`}
          label={getString('common.path')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          fieldPath="spec.filePath"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {isValueRuntimeInput(get(template, 'spec.fileContent')) && (
        <div
          className={cx(stepCss.formGroup, stepCss.alignStart)}
          onKeyDown={
            /* istanbul ignore next */ event => {
              if (event.key === 'Enter') {
                event.stopPropagation()
              }
            }
          }
        >
          <MultiTypeFieldSelector
            name={`${path}spec.fileContent`}
            label={getString('gitsync.fileContent')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            disableTypeSelection={readonly}
            expressionRender={
              /* istanbul ignore next */ () => {
                return (
                  <MonacoTextField
                    name={`${path}spec.fileContent`}
                    expressions={expressions}
                    height={300}
                    disabled={readonly}
                    fullScreenAllowed
                    fullScreenTitle={getString('gitsync.fileContent')}
                  />
                )
              }
            }
          >
            <MonacoTextField
              name={`${path}spec.fileContent`}
              expressions={expressions}
              height={300}
              disabled={readonly}
              fullScreenAllowed
              fullScreenTitle={getString('gitsync.fileContent')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
    </>
  )
}
