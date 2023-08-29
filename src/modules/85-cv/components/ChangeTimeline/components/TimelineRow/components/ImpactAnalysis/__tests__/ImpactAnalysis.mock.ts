/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const ImpactAnalysisProps = {
  index: 1,
  widget: {
    endTime: 1693293402000,
    startTime: 1693204200357,
    icon: { height: 16, width: 16, url: 'data:image/svg+xml;base64' },
    type: 'SrmAnalysisImpact',
    identifiers: ['OrnkQL7YRKGlSzodMWi5ng'],
    leftOffset: 0
  }
}

export const mockAPI = {
  status: 'SUCCESS',
  data: {
    type: 'SrmAnalysisImpact',
    startTime: 1693283004,
    endTime: 1693369404,
    details: {
      analysisDuration: 86400.0,
      analysisStatus: 'RUNNING'
    }
  },
  correlationId: 'e29b36aa-7cb5-4e12-9f1c-db6d3459b909'
}
