/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ChangeSourceCategoryName } from '../ChangeSourceDrawer.constants'

export const changeSourceDrawerData = {
  name: 'Harness CD',
  identifier: 'harness_cd',
  type: 'HarnessCD' as any,
  desc: 'Deployments from Harness CD',
  enabled: true,
  category: 'Deployment' as any,
  spec: {
    harnessApplicationId: { value: '6wJB5Y17TNKycUFBJTOKuQ' },
    harnessEnvironmentId: { value: 'vvQoe7mHQZiO5_78ldj12A' },
    harnessServiceId: { value: 'R8bdUf9dR1yV8fOcXzpKZA' }
  }
}

export const pagerDutyChangeSourceDrawerDataWithoutService = {
  name: 'PagerDuty 101',
  identifier: 'pagerduty',
  type: 'PagerDuty' as any,
  desc: 'Alert from PagerDuty',
  enabled: true,
  category: 'Alert' as any,
  spec: {
    connectorRef: 'PagerDutyConnector'
  }
}

export const pagerDutyChangeSourceDrawerData = {
  name: 'PagerDuty 101',
  identifier: 'pagerduty',
  type: 'PagerDuty' as any,
  desc: 'Alert from PagerDuty',
  enabled: true,
  category: 'Alert' as any,
  spec: {
    connectorRef: 'PagerDutyConnector',
    pagerDutyServiceId: 'pagerDutyServiceId101'
  }
}

export const k8sChangeSourceDrawerData = {
  category: 'Infrastructure' as any,
  enabled: true,
  identifier: 'hjhjh',
  name: 'hjhjh',
  spec: {
    connectorRef: 'account.k8sqatargetng'
  },
  type: 'K8sCluster' as any
}

export const customDeployData = {
  name: 'Custom Deploy 101',
  identifier: 'Custom_Deploy_101',
  type: 'CustomDeploy' as any,
  enabled: true,
  spec: {
    name: 'Custom Deploy 101',
    webhookUrl: 'dummy url',
    webhookCurlCommand: 'dummy cURL',
    type: 'Deployment'
  },
  category: 'Deployment' as any
}

export const changeSourceTableData = [
  {
    name: 'Harness CD',
    identifier: 'harness_cd',
    type: 'HarnessCD' as any,
    desc: 'Deployments from Harness CD',
    enabled: true,
    category: 'Deployment' as any,
    spec: {
      harnessApplicationId: '6wJB5Y17TNKycUFBJTOKuQ',
      harnessEnvironmentId: 'vvQoe7mHQZiO5_78ldj12A',
      harnessServiceId: 'R8bdUf9dR1yV8fOcXzpKZA'
    }
  }
]

export const onSuccessHarnessCD = [
  {
    category: 'Deployment',
    desc: 'Deployments from Harness CD',
    enabled: true,
    identifier: 'harness_cd',
    name: 'Updated Change Source',
    spec: {
      harnessApplicationId: '6wJB5Y17TNKycUFBJTOKuQ',
      harnessEnvironmentId: 'vvQoe7mHQZiO5_78ldj12A',
      harnessServiceId: 'R8bdUf9dR1yV8fOcXzpKZA'
    },
    type: 'HarnessCD'
  }
]

export const onSuccessPagerDuty = [
  {
    category: 'Alert',
    desc: 'Alert from PagerDuty',
    enabled: true,
    identifier: 'pagerduty',
    name: 'PagerDuty 101',
    spec: {
      connectorRef: 'PagerDutyConnector',
      pagerDutyServiceId: 'pagerDutyServiceId101'
    },
    type: 'PagerDuty'
  }
]

export const allFieldsEmpty = {
  category: 'Select change source provider',
  name: 'Select change source name',
  spec: {
    connectorRef: 'Connector Selection is required'
  },
  type: 'Select change source type'
}

export const emptyPagerDutyConnectorAndService = {
  spec: {
    connectorRef: 'Connector Selection is required',
    pagerDutyServiceId: ''
  }
}

export const changeSourceCategorySelectOptions = {
  Deployment: { label: 'deploymentsText', value: ChangeSourceCategoryName.DEPLOYMENT },
  Alert: { label: 'cv.changeSource.incident', value: ChangeSourceCategoryName.ALERT },
  FeatureFlag: { label: 'common.purpose.cf.continuous', value: ChangeSourceCategoryName.FEATURE_FLAG },
  Infrastructure: { label: 'infrastructureText', value: ChangeSourceCategoryName.INFRASTRUCTURE }
}
