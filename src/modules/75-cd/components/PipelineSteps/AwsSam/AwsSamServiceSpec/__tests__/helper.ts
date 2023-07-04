/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { ConfigFileWrapper } from 'services/cd-ng'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'

export const updateStageArgAwsSamDirectoryCreate = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsSam,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsSamDirectory,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgAwsSamDirectoryUpdate = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsSam,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsSamDirectory,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path'],
                      branch: 'testBranch',
                      samTemplateFile: undefined
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'Values_Manifest',
                type: ManifestDataType.Values,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsSam/values.json'],
                      branch: 'values_manifest'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgAwsSamDirectoryManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsSam,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'Values_Manifest',
                type: ManifestDataType.Values,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsSam/values.json'],
                      branch: 'values_manifest'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgForPropagatedStageWithAwsSamDirectoryManifest = {
  name: 'Stage 2',
  identifier: 'Stage_2',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      useFromStage: {
        stage: 'Stage_1'
      },
      stageOverrides: {
        artifacts: { sidecars: [], primary: null },
        manifests: [
          {
            manifest: {
              identifier: 'testidentifier',
              type: ManifestDataType.AwsSamDirectory,
              spec: {
                store: {
                  spec: {
                    branch: 'testBranch',
                    connectorRef: 'Git_CTR',
                    gitFetchType: 'Branch',
                    paths: ['test-path']
                  },
                  type: 'Git'
                }
              }
            }
          }
        ]
      }
    }
  }
}

export const getYaml = (): string => `
pipeline:
    name: AwsSamPipeline 1
    identifier: AwsSamPipeline_1
    allowStageExecutions: false
    projectIdentifier: Kapil
    orgIdentifier: default
    tags: {}
    stages:
        - stage:
              name: AwsSam Stage
              identifier: AwsSam_Stage
              description: ""
              type: Deployment
              spec:
                  serviceConfig:
                      serviceRef: dascxzcsad
                      serviceDefinition:
                          type: AWS_SAM
                          spec:
                              variables: []
                              manifests:
                                  - manifest:
                                        identifier: AwsSamDirectory_1
                                        type: AwsSamDirectory
                                        spec:
                                            store:
                                                type: Git
                                                spec:
                                                    connectorRef: sdf
                                                    gitFetchType: Branch
                                                    paths:
                                                        - wce
                                                    repoName: wce
                                                    branch: wc
                  infrastructure: {}
              tags: {}`

export const initialManifestRuntimeValuesGitStore = {
  manifests: [
    {
      manifest: {
        identifier: 'manifest1',
        type: ManifestDataType.AwsSamDirectory,
        spec: {
          store: {
            type: ManifestStoreMap.Git,
            spec: {
              connectorRef: '',
              branch: '',
              commitId: '',
              paths: ''
            }
          }
        }
      }
    }
  ]
}

export const awsSamDirectoryManifestTemplateGitStore = {
  manifests: [
    {
      manifest: {
        identifier: 'manifest1',
        type: ManifestDataType.AwsSamDirectory,
        spec: {
          store: {
            type: ManifestStoreMap.Git,
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              commitId: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    }
  ]
}

export const initialConfigFilesRuntimeValues = {
  configFiles: [
    {
      configFile: {
        identifier: 'configFile1',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: '',
              secretFiles: ''
            }
          }
        }
      }
    }
  ]
}

export const configFilesTemplate: { configFiles: ConfigFileWrapper[] } = {
  configFiles: [
    {
      configFile: {
        identifier: 'configFile1',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: RUNTIME_INPUT_VALUE,
              secretFiles: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    }
  ]
}

export const initialConfigFilesRuntimeValuesMultipleFiles = {
  configFiles: [
    {
      configFile: {
        identifier: 'configFile1',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: ['abc.yaml', ''],
              secretFiles: ['abc.yaml', '']
            }
          }
        }
      }
    }
  ]
}

export const configFilesTemplateMultipleFiles: { configFiles: ConfigFileWrapper[] } = {
  configFiles: [
    {
      configFile: {
        identifier: 'configFile1',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: ['abc.yaml', RUNTIME_INPUT_VALUE],
              secretFiles: ['abc.yaml', RUNTIME_INPUT_VALUE]
            }
          }
        }
      }
    }
  ]
}
