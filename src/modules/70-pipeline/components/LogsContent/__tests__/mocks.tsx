/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { State, UnitLoadingStatus } from '../LogsState/types'

export const testReducerState: State = {
  units: [],
  logKeys: ['xyz'],
  selectedStage: '',
  selectedStep: '',
  dataMap: {
    xyz: {
      title: 'Section 1',
      data: [
        {
          text: {
            level: 'INFO',
            time: '14/04/2022 13:56:24',
            out: '\u001b[0;91m\u001b[40mFailed to complete service step\u001b[0m'
          }
        }
      ],
      isOpen: true,
      manuallyToggled: false,
      status: 'FAILED' as UnitLoadingStatus,
      unitStatus: 'FAILED' as UnitLoadingStatus,
      dataSource: 'blob'
    }
  },
  searchData: {
    text: '',
    currentIndex: 0,
    linesWithResults: []
  }
}

export const nodeIdShowAIDA = 'QMKWPZwsRzKkNdLoQEamMA'
export const allNodeMapShowAIDA = {
  'H4YMN5-1TxytgyWpm1Bi-w': {
    uuid: 'H4YMN5-1TxytgyWpm1Bi-w',
    setupId: 'QMKWPZwsRzKkNdLoQEamMA',
    name: 'stage',
    identifier: 'stage',
    baseFqn: null
  }
}
export const pipelineExecDetailShowAIDA = {
  executionGraph: {
    rootNodeId: 'H4YMN5-1TxytgyWpm1Bi-w',
    nodeAdjacencyListMap: {
      'H4YMN5-1TxytgyWpm1Bi-w': {
        children: [],
        nextIds: []
      }
    },
    representationStrategy: 'camelCase'
  }
}

export const nodeIdHideAIDA = 'lUGjJckkQaWkEzn0waYY9g'
export const pipelineExecDetailHideAIDA = {
  executionGraph: {
    rootNodeId: 'Pu6ivHZMR-2p2BlwbUd33Q',
    nodeAdjacencyListMap: {
      lPsWLgMqQ8C2MCfIkXFFIw: {
        children: [],
        nextIds: []
      },
      aCZVa8AWRM2BtXNuV2kyIA: {
        children: [],
        nextIds: ['lPsWLgMqQ8C2MCfIkXFFIw']
      },
      QlVPGkPbTI6Sk1K4uS7Z5Q: {
        children: [],
        nextIds: ['aCZVa8AWRM2BtXNuV2kyIA']
      },
      '7MDpHf3CStG_SSfhlcyZrw': {
        children: ['QlVPGkPbTI6Sk1K4uS7Z5Q'],
        nextIds: []
      },
      'Pu6ivHZMR-2p2BlwbUd33Q': {
        children: ['7MDpHf3CStG_SSfhlcyZrw'],
        nextIds: []
      }
    },
    executionMetadata: {
      accountId: 'vpCkHKsDSxK9_KYfjCTMKA',
      pipelineIdentifier: 'test324',
      orgIdentifier: 'default',
      projectIdentifier: 'CI_Sanity',
      planExecutionId: 'Sm92MbAQRpyZ5vVsUp1wbg'
    },
    representationStrategy: 'camelCase'
  }
}
export const allNodeMapHideAIDA = {
  lPsWLgMqQ8C2MCfIkXFFIw: {
    uuid: 'lPsWLgMqQ8C2MCfIkXFFIw',
    setupId: 'uGSFCMW3QdWaAcb-rPrxZQ',
    name: 'Run_1',
    identifier: 'Run_1',
    baseFqn: null,
    outcomes: {}
  },
  aCZVa8AWRM2BtXNuV2kyIA: {
    uuid: 'aCZVa8AWRM2BtXNuV2kyIA',
    setupId: '52ixyeb9SbGli42Z-9S_sA',
    name: 'Clone codebase',
    identifier: 'harness-git-clone',
    baseFqn: null,
    outcomes: {
      'artifact_harness-git-clone': {
        stepArtifacts: {
          publishedFileArtifacts: [],
          publishedImageArtifacts: [],
          publishedSbomArtifacts: []
        }
      }
    }
  },
  QlVPGkPbTI6Sk1K4uS7Z5Q: {
    uuid: 'QlVPGkPbTI6Sk1K4uS7Z5Q',
    setupId: 't9rjQfvDT0a8SZLeUHZtMg',
    name: 'Initialize',
    identifier: 'liteEngineTask',
    baseFqn: null,
    outcomes: {
      vmDetailsOutcome: {
        ipAddress: '10.108.224.52',
        delegateId: 'YZAksHIER0W-6I-uunkPnw'
      },
      dependencies: {
        serviceDependencyList: []
      }
    }
  },
  '7MDpHf3CStG_SSfhlcyZrw': {
    uuid: '7MDpHf3CStG_SSfhlcyZrw',
    setupId: 'KKeFfSzuTPGBfZepjNVzOA',
    name: 'Execution',
    identifier: 'execution',
    baseFqn: null,
    outcomes: {}
  },
  'Pu6ivHZMR-2p2BlwbUd33Q': {
    uuid: 'Pu6ivHZMR-2p2BlwbUd33Q',
    setupId: 'lUGjJckkQaWkEzn0waYY9g',
    name: 'stage',
    identifier: 'stage',
    baseFqn: null,
    outcomes: {
      integrationStageOutcome: {
        imageArtifacts: [],
        fileArtifacts: [],
        sbomArtifacts: []
      }
    }
  }
}
