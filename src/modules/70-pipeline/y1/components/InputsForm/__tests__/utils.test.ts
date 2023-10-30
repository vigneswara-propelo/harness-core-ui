import { generateInputsFromMetadataResponse } from '../utils'
import { pipelineInputsSchema1API, pipelineInputsSchema1UI } from './api2ui.mocks'

describe('api2ui-utils', () => {
  test('test generateInputsFromMetadataResponse - 1 input with 2 dependencies', () => {
    const uiInputs = generateInputsFromMetadataResponse(pipelineInputsSchema1API)
    expect(uiInputs).toStrictEqual(pipelineInputsSchema1UI)
  })

  test('test generateInputsFromMetadataResponse with no inputs provided', () => {
    const uiInputs = generateInputsFromMetadataResponse({
      inputs: []
    })
    expect(uiInputs).toStrictEqual({ hasInputs: false, inputs: [] })
  })
})
