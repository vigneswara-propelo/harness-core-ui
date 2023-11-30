/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FailedStagesInfoProps } from '../FailureInfoPopover'

export const failureInfo: FailedStagesInfoProps[] = [
  {
    nodeIdentifier: 'activeInstance',
    name: 'activeInstance',
    failureInfo: {
      message: 'Kubernetes API call failed with message: Forbidden'
    },
    nodeGroup: 'STRATEGY',
    nodeIcon: undefined
  },
  {
    nodeIdentifier: 'activeInstance_2',
    name: 'activeInstance_2',
    failureInfo: {
      message: 'Kubernetes API call failed with message: Forbidden'
    },
    nodeIcon: 'cd-main',
    nodeGroup: 'STAGE'
  },
  {
    nodeIdentifier: 'activeInstance_1',
    name: 'activeInstance_1',
    failureInfo: {
      message: 'Kubernetes API call failed with message: Forbidden'
    },
    nodeIcon: 'cd-main',
    nodeGroup: 'STAGE'
  },
  {
    failureInfo: {},
    name: 'activeInstance_3',
    nodeGroup: 'STAGE',
    nodeIcon: 'cd-main',
    nodeIdentifier: 'activeInstance_3'
  }
]

export const rowData = {
  pipelineIdentifier: 'activeInstance',
  orgIdentifier: 'default',
  projectIdentifier: 'CD_Dashboards',
  planExecutionId: 'ybs0NP0LSyy0jqaudg6Xww',
  name: 'activeInstance',
  yamlVersion: '0',
  status: 'Failed',
  layoutNodeMap: {
    MGAUTu8YR2yn5E2io7MIkQ: {
      nodeType: 'PipelineRollback',
      nodeGroup: 'STAGE',
      nodeIdentifier: 'prb-ItXCzivIQu27iNOc9eRTkQ',
      name: 'Pipeline Rollback',
      nodeUuid: 'MGAUTu8YR2yn5E2io7MIkQ',
      status: 'NotStarted',
      module: 'pms',
      moduleInfo: {
        pms: {}
      }
    },
    '44JQt5CEQ3-7CyzD6owVLw': {
      nodeType: 'MATRIX',
      nodeGroup: 'STRATEGY',
      nodeIdentifier: 'activeInstance',
      name: 'activeInstance',
      nodeUuid: '44JQt5CEQ3-7CyzD6owVLw',
      status: 'Failed',
      failureInfo: {
        message: 'Kubernetes API call failed with message: Forbidden'
      }
    },
    '1Qtv_FndSPq_nPet4q8o4Q': {
      nodeType: 'Deployment',
      nodeGroup: 'STAGE',
      nodeIdentifier: 'activeInstance_2',
      name: 'activeInstance_2',
      nodeUuid: '2mLikIKhQnCNGXbqnTuiIw',
      status: 'Failed',
      failureInfo: {
        message: 'Kubernetes API call failed with message: Forbidden'
      }
    },
    HgvdaNqgRFWrfQ97blszeA: {
      nodeType: 'Deployment',
      nodeGroup: 'STAGE',
      nodeIdentifier: 'activeInstance_1',
      name: 'activeInstance_1',
      nodeUuid: '2mLikIKhQnCNGXbqnTuiIw',
      status: 'Failed',
      failureInfo: {
        message: 'Kubernetes API call failed with message: Forbidden'
      }
    },
    auievbnrwiouvnbreovine: {
      nodeType: 'Deployment',
      nodeGroup: 'STAGE',
      nodeIdentifier: 'activeInstance_3',
      name: 'activeInstance_3',
      nodeUuid: 'soivneriovnerviooewvrin',
      status: 'Failed',
      failureInfo: {}
    }
  }
}

export const pathParams = {
  accountId: 'px7xd_BFRCi-pfWPYXVjvw',
  module: 'cd',
  orgIdentifier: 'default',
  projectIdentifier: 'CD_Dashboards'
}

export const queryParams = {
  page: 0,
  size: 100,
  sort: ['startTs', 'DESC']
}
