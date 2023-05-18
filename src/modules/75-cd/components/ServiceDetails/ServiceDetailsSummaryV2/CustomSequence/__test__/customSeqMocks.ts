import type { EnvAndEnvGroupCard, ResponseCustomSequenceDTO, ResponseServiceSequence } from 'services/cd-ng'

export const getCustomSeqData: ResponseCustomSequenceDTO = {
  status: 'SUCCESS',
  data: {
    envAndEnvGroupCardList: [
      {
        name: 'envGroup',
        identifier: 'envGroup',
        environmentTypes: ['PreProduction', 'Production'],
        new: true,
        envGroup: true
      },
      {
        name: 'TestEnv-PreProd',
        identifier: 'TestEnvPreProd',
        environmentTypes: ['PreProduction'],
        new: false,
        envGroup: false
      },
      {
        name: 'env4-prod',
        identifier: 'env4prod',
        environmentTypes: ['Production'],
        new: false,
        envGroup: false
      },
      {
        name: 'driftedGroup',
        identifier: 'driftedGroup',
        environmentTypes: ['Production'],
        new: false,
        envGroup: true
      },
      {
        name: undefined,
        identifier: undefined,
        environmentTypes: undefined,
        new: false,
        envGroup: false
      }
    ]
  },
  metaData: undefined,
  correlationId: 'testid'
}

export const defaultSequenceData: ResponseCustomSequenceDTO = {
  status: 'SUCCESS',
  data: {
    envAndEnvGroupCardList: [
      {
        name: 'TestEnv-PreProd',
        identifier: 'TestEnvPreProd',
        environmentTypes: ['PreProduction'],
        new: false,
        envGroup: false
      },
      {
        name: 'env4-prod',
        identifier: 'env4prod',
        environmentTypes: ['Production'],
        new: false,
        envGroup: false
      },
      {
        name: 'envGroup',
        identifier: 'envGroup',
        environmentTypes: ['PreProduction', 'Production'],
        new: true,
        envGroup: true
      },
      {
        name: 'driftedGroup',
        identifier: 'driftedGroup',
        environmentTypes: ['Production'],
        new: false,
        envGroup: true
      },
      {
        name: undefined,
        identifier: undefined,
        environmentTypes: undefined,
        new: false,
        envGroup: false
      }
    ]
  },
  metaData: undefined,
  correlationId: 'testid'
}

export const saveCustomSequencePromiseData: ResponseServiceSequence = {
  status: 'SUCCESS',
  data: {
    uuid: 'testuuid',
    accountId: 'accountid',
    orgIdentifier: 'default',
    projectIdentifier: 'testlocalproject',
    serviceIdentifier: 'K8s',
    shouldUseCustomSequence: true,
    customSequence: {
      envAndEnvGroupCardList: [
        {
          name: 'envGroup',
          identifier: 'envGroup',
          environmentTypes: ['PreProduction', 'Production'],
          new: false,
          envGroup: true
        },
        {
          name: 'TestEnv-PreProd',
          identifier: 'TestEnvPreProd',
          environmentTypes: ['PreProduction'],
          new: false,
          envGroup: false
        },
        {
          name: 'env4-prod',
          identifier: 'env4prod',
          environmentTypes: ['Production'],
          new: false,
          envGroup: false
        },
        {
          name: 'driftedGroup',
          identifier: 'driftedGroup',
          environmentTypes: ['Production'],
          new: false,
          envGroup: true
        },
        {
          name: undefined,
          identifier: undefined,
          environmentTypes: undefined,
          new: false,
          envGroup: false
        }
      ]
    },
    createdAt: 1683749262822,
    lastModifiedAt: 1684239923256
  },
  metaData: undefined,
  correlationId: 'testid'
}

export const entityDetailsMock: EnvAndEnvGroupCard[] = [
  {
    name: 'envGroup',
    identifier: 'envGroup',
    environmentTypes: ['PreProduction', 'Production'],
    new: false,
    envGroup: true
  },
  {
    name: 'testEnv-Prod',
    identifier: 'testEnvProd',
    environmentTypes: ['Production'],
    new: true,
    envGroup: false
  },
  {
    name: undefined,
    identifier: undefined,
    environmentTypes: undefined,
    new: false,
    envGroup: false
  }
]
