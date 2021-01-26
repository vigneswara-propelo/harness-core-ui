import React from 'react'
import {
  render,
  waitFor,
  fireEvent,
  RenderResult,
  getByText,
  getAllByText as getAllByTextLib,
  act
} from '@testing-library/react'
import { TestWrapper, findDialogContainer, findPopoverContainer } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { projectPathProps, accountPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import CDPipelinesPage from '../PipelinesPage'
import mocks from './PipelineMocks'

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline1',
  module: 'cd'
}
const onRunPipelineClick: jest.Mock<void> = jest.fn()
const mockGetCallFunction = jest.fn()
jest.useFakeTimers()

const mockDeleteFunction = jest.fn()
const deletePipeline = (): Promise<{ status: string }> => {
  mockDeleteFunction()
  return Promise.resolve({ status: 'SUCCESS' })
}

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(mocks)), cancel: jest.fn(), loading: false }
  }),
  useSoftDeletePipeline: jest.fn().mockImplementation(() => ({ mutate: deletePipeline, loading: false }))
}))

jest.mock('@pipeline/components/RunPipelineModal/RunPipelineModal', () => ({
  // eslint-disable-next-line react/display-name
  RunPipelineModal: ({ children }: { children: JSX.Element }) => <div onClick={onRunPipelineClick}>{children}</div>
}))

const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })

describe('CD Pipeline Page List', () => {
  test('render card view', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    expect(container).toMatchSnapshot()
  })

  test('render list view', async () => {
    const { container, getByTestId, getAllByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    fireEvent.click(container.querySelector('[icon="list"')!)
    await waitFor(() => getAllByText('pipeline1'))
    expect(container).toMatchSnapshot()
    fireEvent.click(container.querySelector('[icon="grid-view"')!)
    await waitFor(() => getByTestId(params.pipelineIdentifier))
  })

  test('test run pipeline on card view', async () => {
    onRunPipelineClick.mockReset()
    const { getByTestId, getAllByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    fireEvent.click(getAllByTestId('card-run-pipeline')[0]!)
    expect(onRunPipelineClick).toHaveBeenCalled()
  })

  test('test Pipeline click on card view', async () => {
    const { getByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    fireEvent.click(getByTestId('pipeline1')!)
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location').innerHTML.endsWith(routes.toPipelineStudio(params as any))).toBeTruthy()
  })

  test('test Add Pipeline on card view', async () => {
    const { getByTestId, getAllByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    fireEvent.click(getAllByTestId('add-pipeline')[0]!)
    await waitFor(() => getByTestId('location'))
    expect(
      getByTestId('location').innerHTML.endsWith(
        routes.toPipelineStudio({ ...params, pipelineIdentifier: '-1' } as any)
      )
    ).toBeTruthy()
  })
  test('Search Pipeline', async () => {
    const { getByTestId, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    mockGetCallFunction.mockReset()
    const searchInput = container?.querySelector('[placeholder="Search"]') as HTMLInputElement
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'asd' } })
      jest.runOnlyPendingTimers()
    })

    expect(mockGetCallFunction).toBeCalledWith({
      mock: undefined,
      queryParamStringifyOptions: {
        arrayFormat: 'comma'
      },
      queryParams: {
        accountIdentifier: 'testAcc',
        module: 'cd',
        page: 0,
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        searchTerm: 'asd',
        size: 10,
        sort: ['lastUpdatedAt', 'DESC']
      }
    })
  })
})

describe('Pipeline List View Test cases', () => {
  let listView: HTMLElement
  let getByTestIdTop: RenderResult['getByTestId'] | undefined

  beforeEach(async () => {
    const { getByTestId, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    listView = container
    getByTestIdTop = getByTestId
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    fireEvent.click(container.querySelector('[icon="list"')!)
    await waitFor(() => listView.querySelectorAll("[role='row']")[1])
  })

  test('should be able to click on Row', async () => {
    // click on first row
    const row = listView.querySelectorAll("[role='row']")[1]
    fireEvent.click(row)
    await waitFor(() => getByTestIdTop?.('location'))
    expect(getByTestIdTop?.('location').innerHTML.endsWith(routes.toPipelineStudio(params as any))).toBeTruthy()
  })

  test('should be able to open menu and run pipeline', async () => {
    // click on first row
    const menu = listView.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu)
    const menuContent = findPopoverContainer()
    await waitFor(() => getByText(menuContent as HTMLElement, 'Run Pipeline'))
    const runPipelineBtn = getByText(menuContent as HTMLElement, 'Run Pipeline')
    onRunPipelineClick.mockReset()
    fireEvent.click(runPipelineBtn)
    expect(onRunPipelineClick).toHaveBeenCalled()
  })

  test('should be able to open menu and open pipeline studio ', async () => {
    // click on first row
    const menu = listView.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu)
    const menuContent = findPopoverContainer()
    await waitFor(() => getByText(menuContent as HTMLElement, 'Launch Studio'))
    const gotoStudioBtn = getByText(menuContent as HTMLElement, 'Launch Studio')
    fireEvent.click(gotoStudioBtn)
    await waitFor(() => getByTestIdTop?.('location'))
    expect(
      getByTestIdTop?.('location').innerHTML.endsWith(routes.toPipelineStudio({ ...(params as any) }))
    ).toBeTruthy()
  })

  test('should be able to open menu and delete pipeline ', async () => {
    // click on first row
    const menu = listView.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu)
    const menuContent = findPopoverContainer()
    await waitFor(() => getByText(menuContent as HTMLElement, 'Delete'))
    const deleteBtn = getByText(menuContent as HTMLElement, 'Delete')
    fireEvent.click(deleteBtn)
    await waitFor(() => getByText(document.body, 'Delete Pipeline'))
    const form = findDialogContainer()
    const confirmDelete = getByText(form as HTMLElement, 'Delete')
    mockDeleteFunction.mockReset()
    fireEvent.click(confirmDelete)
    await waitFor(() => getByText(document.body, 'Pipeline pipeline1 deleted'))
    expect(mockDeleteFunction).toBeCalled()
  })
})

describe('Pipeline Card View Test Cases', () => {
  let cardView: HTMLElement
  let getByTestIdTop: RenderResult['getByTestId'] | undefined

  beforeEach(async () => {
    const { getByTestId, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    cardView = container
    getByTestIdTop = getByTestId
    await waitFor(() => getByTestId(params.pipelineIdentifier))
  })

  test('should be able to click on Execution Link', async () => {
    // click on first row
    const cardName = getAllByTextLib(cardView, 'Executions in last 7 days')[0]
    fireEvent.click(cardName)
    await waitFor(() => getByTestIdTop?.('location'))
    expect(getByTestIdTop?.('location').innerHTML.endsWith(routes.toPipelineDeploymentList(params as any))).toBeTruthy()
  })

  test('should be able to click on card', async () => {
    // click on first row
    const cardName = getAllByTextLib(cardView, 'pipeline1')[0]
    fireEvent.click(cardName)
    await waitFor(() => getByTestIdTop?.('location'))
    expect(getByTestIdTop?.('location').innerHTML.endsWith(routes.toPipelineStudio(params as any))).toBeTruthy()
  })

  test('should be able to open menu and run pipeline', async () => {
    // click on first row
    const menu = cardView.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu)
    const menuContent = findPopoverContainer()
    await waitFor(() => getByText(menuContent as HTMLElement, 'Run Pipeline'))
    const runPipelineBtn = getByText(menuContent as HTMLElement, 'Run Pipeline')
    onRunPipelineClick.mockReset()
    fireEvent.click(runPipelineBtn)
    expect(onRunPipelineClick).toHaveBeenCalled()
  })

  test('should be able to open menu and open pipeline studio ', async () => {
    // click on first row
    const menu = cardView.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu)
    const menuContent = findPopoverContainer()
    await waitFor(() => getByText(menuContent as HTMLElement, 'Launch Studio'))
    const gotoStudioBtn = getByText(menuContent as HTMLElement, 'Launch Studio')
    fireEvent.click(gotoStudioBtn)
    await waitFor(() => getByTestIdTop?.('location'))
    expect(
      getByTestIdTop?.('location').innerHTML.endsWith(routes.toPipelineStudio({ ...(params as any) }))
    ).toBeTruthy()
  })

  test('should be able to open menu and delete pipeline ', async () => {
    // click on first row
    const menu = cardView.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu)
    const menuContent = findPopoverContainer()
    await waitFor(() => getByText(menuContent as HTMLElement, 'Delete'))
    const deleteBtn = getByText(menuContent as HTMLElement, 'Delete')
    fireEvent.click(deleteBtn)
    await waitFor(() => getByText(document.body, 'Delete Pipeline'))
    const form = findDialogContainer()
    const confirmDelete = getByText(form as HTMLElement, 'Delete')
    mockDeleteFunction.mockReset()
    fireEvent.click(confirmDelete)
    expect(mockDeleteFunction).toBeCalled()
  })
})
