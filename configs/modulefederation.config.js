/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const packageJSON = require('../package.json')
const { pick, mapValues } = require('lodash')

/**
 * These packages must be strictly shared with exact versions
 */
const ExactSharedPackages = [
  'react-dom',
  'react',
  'react-router-dom',
  '@harness/use-modal',
  '@blueprintjs/core',
  '@blueprintjs/select',
  '@blueprintjs/datetime',
  'restful-react',
  '@tanstack/react-query',
  'urql'
]

module.exports = () => {
  const remotes = {
    gitopsui: "gitopsui@[window.getApiBaseUrl('gitops/remoteEntry.js')]",
    governance: "governance@[window.getApiBaseUrl('pm/remoteEntry.js')]",
    idp: "idp@[window.getIDPBaseUrl('idp/remoteEntry.js')]",
    idpadmin: "idpadmin@[window.getApiBaseUrl('idp-admin/remoteEntry.js')]",
    ccmui: "ccmui@[window.getApiBaseUrl('ccmui/remoteEntry.js')]",
    sto: "sto@[window.getApiBaseUrl('sto/remoteEntry.js')]",
    stoV2: "stoV2@[window.getApiBaseUrl('sto/v2/remoteEntry.js')]",
    chaos: "chaos@[window.getApiBaseUrl('chaos/remoteEntry.js')]",
    code: "codeRemote@[window.getApiBaseUrl('code/remoteEntry.js')]",
    ffui: "ffui@[window.getApiBaseUrl('cf/web/remoteEntry.js')]",
    srmui: "srmui@[window.getApiBaseUrl('srmui/remoteEntry.js')]",
    iacm: "remoteIACM@[window.getApiBaseUrl('iacm/remoteEntry.js')]",
    cdbui: "cdbui@[window.getApiBaseUrl('cdbui/remoteEntry.js')]",
    sei: "sei@[window.getApiBaseUrl('sei/remoteEntry.js')]",
    errortracking: "errortracking@[window.getApiBaseUrl('et/remoteEntry.js')]",
    ssca: "ssca@[window.getApiBaseUrl('ssca/remoteEntry.js')]"
  }

  const shared = {
    ...mapValues(pick(packageJSON.dependencies, ExactSharedPackages), version => ({
      singleton: true,
      requiredVersion: version
    }))
  }

  return {
    name: 'nextgenui',
    remotes,
    shared
  }
}
