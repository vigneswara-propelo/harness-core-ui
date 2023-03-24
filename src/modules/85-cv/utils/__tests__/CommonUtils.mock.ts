/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseListEnvironmentResponse } from 'services/cv'

export const monitoredServiceDetails = [
  {
    monitoredServiceIdentifier: 'SRM_prod',
    monitoredServiceName: 'SRM_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'SRM',
    serviceName: 'SRM',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRESRM'
    },
    projectName: 'SRE-SRM',
    orgName: 'default'
  },
  {
    monitoredServiceIdentifier: 'C1_prod',
    monitoredServiceName: 'C1_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'C1',
    serviceName: 'C1',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRE'
    },
    projectName: 'SRE',
    orgName: 'default'
  },
  {
    monitoredServiceIdentifier: 'CD_prod',
    monitoredServiceName: 'CD_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'CD',
    serviceName: 'CD',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRE'
    },
    projectName: 'SRE',
    orgName: 'default'
  },
  {
    monitoredServiceIdentifier: 'FF_prod',
    monitoredServiceName: 'FF_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'FF',
    serviceName: 'FF',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRE'
    },
    projectName: 'SRE',
    orgName: 'default'
  }
]

export const projectLevelMonitoredServiceIdentifier = ['SRM_prod', 'C1_prod', 'CD_prod', 'FF_prod']
export const accountLevelMonitoredServiceIdentifier = [
  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRESRM.SRM_prod',
  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRE.C1_prod',

  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRE.CD_prod',
  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRE.FF_prod'
]

export const scopedEnvironmentDataList = {
  status: 'SUCCESS',
  data: [
    {
      environment: {
        accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
        orgIdentifier: 'cvng',
        projectIdentifier: 'ScopedSETesting',
        identifier: 'env',
        name: 'env',
        description: '',
        color: '#0063F7',
        type: 'Production',
        deleted: false,
        tags: {},
        yaml: ''
      },
      createdAt: 1678874671958,
      lastModifiedAt: 1678874671958
    },
    {
      environment: {
        accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
        orgIdentifier: 'cvng',
        identifier: 'env_test_scoped',
        name: 'env_test_scoped',
        color: '#0063F7',
        type: 'Production',
        deleted: false,
        tags: {},
        yaml: ''
      },
      createdAt: 1678873558460,
      lastModifiedAt: 1678873558460
    },
    {
      environment: {
        accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
        identifier: 'env_prod_IoVT',
        name: 'env_prod_IoVT',
        color: '#0063F7',
        type: 'Production',
        deleted: false,
        tags: {},
        yaml: ''
      },
      createdAt: 1665864388557,
      lastModifiedAt: 1665864388557
    }
  ],
  correlationId: '789b5f6d-2a2f-4ff6-820d-d51a50ddc555'
} as ResponseListEnvironmentResponse

export const scopedEnvOption = [
  {
    label: 'env',
    value: 'env'
  },
  {
    label: 'env_test_scoped',
    value: 'org.env_test_scoped'
  },
  {
    label: 'env_prod_IoVT',
    value: 'account.env_prod_IoVT'
  }
]
