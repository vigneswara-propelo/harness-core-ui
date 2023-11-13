import React from 'react'
import { render } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import type { ManifestConfigWrapper, ServiceSpec } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestSourceBaseFactory } from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  awsRegionsData,
  bucketListData
} from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ECSWithS3/__tests__/mocks'
import { connectorsData } from '@platform/connectors/pages/connectors/__tests__/mockData'

import { KubernetesManifests } from '../../../KubernetesManifests/KubernetesManifests'
import { manifests, template, path, stageIdentifier } from './mocks'

const mockBukcets = {
  resource: { bucket1: 'bucket1', testbucket: 'testbucket' }
}
const connectorData = { data: connectorsData.data.content[1] }

const fetchBuckets = jest.fn().mockReturnValue(bucketListData)
const fetchConnector = jest.fn().mockReturnValue(connectorData)

jest.mock('@common/hooks', () => ({
  ...jest.requireActual('@common/hooks'),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
  })
}))
jest.mock('services/cd-ng', () => ({
  getConnectorListV2: () => Promise.resolve(connectorsData),

  useGetBucketsInManifests: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
  }),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetGCSBucketList: jest.fn().mockImplementation(() => {
    return { data: { data: mockBukcets }, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetHelmChartVersionDetailsWithYaml: jest.fn().mockImplementation(() => {
    return {
      data: {
        data: { helmChartVersions: ['v1', 'v2'] }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegionsData, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('HelmManifestSource tests', () => {
  test('Should render HelmManifestSource', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesManifests
          template={template as ServiceSpec}
          manifests={manifests as ManifestConfigWrapper[]}
          manifestSourceBaseFactory={new ManifestSourceBaseFactory()}
          stepViewType={StepViewType.DeploymentForm}
          stageIdentifier={stageIdentifier}
          path={path}
          initialValues={{ manifests: manifests as ManifestConfigWrapper[] }}
          readonly={false}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toBeDefined()
  })
})
