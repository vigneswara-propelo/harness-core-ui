import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import * as PipelineContext from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import * as PipelineNgServices from 'services/pipeline-ng'
import { ExecutionGraphAddStepEvent } from '@modules/70-pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { StageType } from '@modules/70-pipeline/utils/stageHelpers'
import { useAddStepTemplate } from '../useAddStepTemplate'

function TestComponent(): JSX.Element {
  const { addTemplate } = useAddStepTemplate({ executionRef: null })

  return <button onClick={async () => await addTemplate({} as ExecutionGraphAddStepEvent)}>Add Template</button>
}

describe('useAddStepTemplate', () => {
  test('Should include Deployment as a child type when selected stage type is Custom', async () => {
    const user = userEvent.setup()
    jest.spyOn(PipelineContext, 'usePipelineContext').mockImplementation(
      () =>
        ({
          state: {
            selectionState: {
              selectedStageId: 's1',
              selectedSectionId: 'EXECUTION'
            }
          },
          updateStage: jest.fn(),
          updatePipelineView: jest.fn(),
          getStageFromPipeline: jest.fn().mockReturnValue({
            stage: {
              stage: {
                name: 's1',
                identifier: 's1',
                type: 'Custom',
                spec: {
                  execution: {
                    steps: [
                      {
                        step: {
                          type: 'Wait',
                          name: 'Wait_1',
                          identifier: 'Wait_1',
                          spec: {
                            duration: '10m'
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          })
        } as unknown as PipelineContext.PipelineContextInterface)
    )

    jest.spyOn(PipelineNgServices, 'useGetStepsV2').mockImplementation(() => ({
      loading: false,
      cancel: jest.fn(),
      mutate: jest.fn().mockResolvedValue({ data: { stepCategories: [] } } as PipelineNgServices.ResponseStepCategory),
      error: null
    }))

    const openTemplateSelector = jest.fn()

    render(
      <TestWrapper defaultTemplateSelectorValues={{ openTemplateSelector }}>
        <TestComponent />
      </TestWrapper>
    )

    await user.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(openTemplateSelector).toHaveBeenCalledWith(
        expect.objectContaining({
          templateType: 'Step',
          filterProperties: {
            childTypes: [StageType.CUSTOM, StageType.DEPLOY]
          }
        })
      )
    )
  })
})
