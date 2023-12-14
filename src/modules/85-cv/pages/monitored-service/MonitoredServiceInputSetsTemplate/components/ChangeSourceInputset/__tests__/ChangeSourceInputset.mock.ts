/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ResponseTemplateResponse } from 'services/template-ng'
import { TemplateDataInterface } from '../../../MonitoredServiceInputSetsTemplate.types'

export const msTemplateResponse = {
  status: 'SUCCESS',
  data: {
    accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
    orgIdentifier: 'cvng',
    projectIdentifier: 'templatetesting2',
    identifier: 'MS_1_Reconcile',
    name: 'MS 1 Reconcile',
    description: '',
    tags: {},
    yaml: 'template:\n  name: MS 1 Reconcile\n  identifier: MS_1_Reconcile\n  versionLabel: "1"\n  type: MonitoredService\n  projectIdentifier: templatetesting2\n  orgIdentifier: cvng\n  tags: {}\n  spec:\n    serviceRef: <+input>\n    environmentRef: <+input>\n    type: Application\n    sources:\n      healthSources: []\n      changeSources:\n        - category: Alert\n          type: PagerDuty\n          spec:\n            connectorRef: <+input>\n            pagerDutyServiceId: <+input>\n          name: PD\n          identifier: PD\n          enabled: true\n',
    versionLabel: '1',
    templateEntityType: 'MonitoredService',
    childType: 'Application',
    templateScope: 'project',
    version: 4,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null,
      repoUrl: null,
      parentEntityConnectorRef: null,
      parentEntityRepoName: null
    },
    entityValidityDetails: {
      valid: true,
      invalidYaml: null
    },
    lastUpdatedAt: 1702486580825,
    storeType: 'INLINE',
    yamlVersion: '0',
    stableTemplate: true
  },
  metaData: null,
  correlationId: '0de67f66-d2b4-40fa-8654-fe1e30a5ea22'
} as unknown as ResponseTemplateResponse

export const templateRefData = {
  accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
  identifier: 'MS_1_Reconcile',
  orgIdentifier: 'cvng',
  projectIdentifier: 'templatetesting2',
  versionLabel: '1',
  templateScope: 'project',
  gitDetails: {
    objectId: null,
    branch: null,
    repoIdentifier: null,
    rootFolder: null,
    filePath: null,
    repoName: null,
    commitId: null,
    fileUrl: null,
    repoUrl: null,
    parentEntityConnectorRef: null,
    parentEntityRepoName: null
  }
} as unknown as TemplateDataInterface
