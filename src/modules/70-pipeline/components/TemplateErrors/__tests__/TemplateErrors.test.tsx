/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { StringsMap } from 'stringTypes'
import TemplateErrors, { getFieldsLabel } from '../TemplateErrors'
import {
  PIPELINE_TEMPLATE_ERROR_1,
  STAGE_1_ERROR_1,
  STAGE_1_ERROR_2,
  STAGE_1_INFO,
  STAGE_2_INFO,
  STEP_1_INFO,
  STEP_ERROR_1,
  STEP_ERROR_2
} from './templateErrorsUtils'

describe('Template Errors', () => {
  test('should render null, when errors are empty', () => {
    render(<TemplateErrors errors={[]} gotoViewWithDetails={jest.fn()} onClose={jest.fn()} />)
    expect(document.body).toMatchInlineSnapshot(`
      <body>
        <div />
        <div />
      </body>
    `)
  })

  /*** Pipeline Template Errors ***/
  test('should render single pipeline template error', () => {
    const fn = jest.fn()
    render(
      <TestWrapper>
        <TemplateErrors
          errors={[PIPELINE_TEMPLATE_ERROR_1]}
          gotoViewWithDetails={fn}
          onClose={jest.fn()}
          template={{ type: 'Pipeline' } as any}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Pipeline Template Error 1')).toBeDefined()
    const fixButton = getByText(document.body, 'pipeline.errorFramework.fixErrors')
    act(() => {
      fireEvent.click(fixButton)
    })
    expect(fn).toBeCalled()
  })

  test('should render Stage error inside Pipeline Template', () => {
    const fn = jest.fn()
    render(
      <TestWrapper>
        <TemplateErrors
          errors={[STAGE_1_ERROR_1]}
          gotoViewWithDetails={fn}
          onClose={fn}
          template={
            {
              type: 'Pipeline',
              spec: {
                stages: {
                  stage: {
                    identifier: '1approval',
                    type: 'Approval'
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    const fixButton = getByText(document.body, 'pipeline.errorFramework.fixStage')
    act(() => {
      fireEvent.click(fixButton)
    })
    expect(fn).toBeCalled()
  })

  test('should render both stage and step errors inside Pipeline Template', () => {
    render(
      <TestWrapper>
        <TemplateErrors
          errors={[
            {
              fqn: '$.template.spec.spec.execution.steps[0].step.spec.shell',
              message: 'Step Error inside Pipeline Template',
              stageInfo: STAGE_1_INFO,
              stepInfo: STEP_1_INFO
            },
            {
              fqn: '$.template.spec.stages[0].stage',
              message: 'Stage Error inside Pipeline Template',
              stageInfo: STAGE_1_INFO,
              stepInfo: undefined
            }
          ]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
          template={
            {
              identifier: 'PipelineTemplate',
              type: 'Pipeline',
              spec: {
                stages: {
                  stage: {
                    identifier: 'stage1Name',
                    type: 'Approval',
                    spec: {
                      execution: {
                        steps: {
                          step: {
                            type: 'ShellScript',
                            identifier: 'step1Name'
                          }
                        }
                      }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getByText(document.body, 'Stage Error inside Pipeline Template')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toBeDefined()
    expect(getByText(document.body, 'Step Error inside Pipeline Template')).toBeDefined()
  })

  /**Stage Template Errors */
  test('should render  single Stage Template Error', () => {
    render(
      <TestWrapper>
        <TemplateErrors
          errors={[{ message: 'Stage 1 Error 1', stageInfo: undefined, fqn: '$.template.spec.spec.execution.steps' }]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
          template={{ type: 'Stage', identifier: 'stgTemplate1', spec: { type: 'Approval' } } as any}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stgTemplate1')).toBeDefined()
  })

  test('should render multiple step errors in stage template', () => {
    render(
      <TestWrapper>
        <TemplateErrors
          errors={[STEP_ERROR_1, STEP_ERROR_2]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
          template={
            {
              identifier: 'StageTemplate',
              type: 'Stage',
              spec: {
                type: 'Custom',
                spec: {
                  execution: {
                    steps: [
                      {
                        step: {
                          type: 'ShellScript',
                          identifier: 'step1Name'
                        }
                      },
                      {
                        step: {
                          type: 'CustomApproval',
                          identifier: 'step2Name'
                        }
                      }
                    ]
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix StageTemplate')).toBeDefined()
    expect(getByText(document.body, 'Step Error 1')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toBeDefined()
    expect(getByText(document.body, 'Step Error 2')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step2Name')).toBeDefined()
  })

  /**StepGroup Template Errors */
  test('should render single step group template error', () => {
    const fn = jest.fn()
    render(
      <TestWrapper>
        <TemplateErrors
          errors={[
            {
              message: 'StepGroup 1 Error 1',
              stageInfo: undefined,
              stepInfo: {
                identifier: 'step1Name',
                type: 'ShellScript',
                name: 'step1Name',
                fqn: '$.template.spec.steps[0].step'
              },
              fqn: '$.template.spec.steps[0].step'
            }
          ]}
          gotoViewWithDetails={fn}
          onClose={fn}
          template={
            {
              type: 'StepGroup',
              identifier: 'stepGroupTemplate1',
              spec: {
                steps: {
                  step: {
                    type: 'ShellScript',
                    identifier: 'step1Name'
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'pipeline.execution.stepGroupTitlePrefix stepGroupTemplate1')).toBeDefined()
    expect(getByText(document.body, 'StepGroup 1 Error 1')).toBeDefined()
    const fixButton = getByText(document.body, 'pipeline.errorFramework.fixStep')
    act(() => {
      fireEvent.click(fixButton)
    })
    expect(fn).toBeCalled()
  })

  /*** Step Template Errors ***/
  test('should render single step template error', () => {
    const fn = jest.fn()
    render(
      <TestWrapper>
        <TemplateErrors
          errors={[
            {
              fqn: '$.template.spec.spec.configuration.configFiles',
              message: 'StepTemplate Error1',
              stageInfo: undefined,
              stepInfo: undefined
            }
          ]}
          gotoViewWithDetails={fn}
          onClose={jest.fn()}
          template={
            {
              type: 'Step',
              identifier: 'stepTemplate',
              spec: {
                type: 'TerraformPlan'
              }
            } as any
          }
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'StepTemplate Error1')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix stepTemplate')).toBeDefined()
    const fixButton = getByText(document.body, 'pipeline.errorFramework.fixErrors')
    act(() => {
      fireEvent.click(fixButton)
    })
    expect(fn).toBeCalled()
  })
})

describe('getFieldsLabel()', () => {
  const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined) =>
    vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
  test('only pipeline errors', () => {
    // it needs
    expect(getFieldsLabel([PIPELINE_TEMPLATE_ERROR_1], [], {}, getString)).toBe('pipeline.errorFramework.header12')
  })
  test('pipeline, single stage and step errors', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_TEMPLATE_ERROR_1],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // 'pipeline, stage and steps need'
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header1')
  })
  test('pipeline, multiple stages and step errors', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_TEMPLATE_ERROR_1],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // pipeline, some stages and steps need
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header2')
  })
  test('pipeline, single stage error', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_TEMPLATE_ERROR_1],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // pipeline and stage need
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header3')
  })
  test('pipeline, multiple stages error', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_TEMPLATE_ERROR_1],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // 'pipeline and some stages need'
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header4')
  })
  test('pipeline, and steps error', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_TEMPLATE_ERROR_1],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // pipeline and steps need
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header5')
  })

  test('single stage and step errors', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // 'stage and steps need'
    ).toBe('pipeline.errorFramework.header7')
  })
  test('multiple stages and step errors', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // some stages and steps need
    ).toBe('pipeline.errorFramework.header8')
  })
  test('single stage error', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // stage needs
    ).toBe('pipeline.errorFramework.header9')
  })
  test('multiple stages error', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // some stages need
    ).toBe('pipeline.errorFramework.header10')
  })
  test('steps error', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // some steps need
    ).toBe('pipeline.errorFramework.header11')
  })
})
