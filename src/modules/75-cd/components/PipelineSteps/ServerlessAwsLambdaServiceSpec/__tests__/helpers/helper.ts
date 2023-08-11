/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ServiceSpec } from 'services/cd-ng'

export const initialValuesServerlessLambdaManifestS3Store = {
  manifests: [
    {
      manifest: {
        identifier: 'Serverless_Manifest_S3',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              connectorRef: '',
              region: '',
              bucketName: '',
              paths: ''
            }
          },
          configOverridePath: ''
        }
      }
    }
  ]
}

export const serverlessLambdaManifestTemplateS3Store = {
  manifests: [
    {
      manifest: {
        identifier: 'Serverless_Manifest_S3',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              region: RUNTIME_INPUT_VALUE,
              bucketName: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          },
          configOverridePath: RUNTIME_INPUT_VALUE
        }
      }
    }
  ]
}

export const initialValuesServerlessLambdaServiceRuntimeValidation: ServiceSpec = {
  manifests: [
    {
      manifest: {
        identifier: 'Serverless_Manifest_S3',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              connectorRef: '',
              region: '',
              bucketName: '',
              paths: ''
            }
          },
          configOverridePath: ''
        }
      }
    },
    {
      manifest: {
        identifier: 'Serverless_Manifest_Github',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.Github,
            spec: {
              connectorRef: '',
              repoName: '',
              branch: '',
              commitId: '',
              folderPath: ''
            }
          },
          configOverridePath: ''
        }
      }
    }
  ],
  artifacts: {
    primary: {
      primaryArtifactRef: '',
      type: 'Ecr',
      sources: [
        {
          identifier: 'Artifactory_1',
          type: 'ArtifactoryRegistry',
          spec: {
            connectorRef: '',
            repository: '',
            artifactDirectory: '',
            artifactPath: ''
          }
        }
      ],
      spec: {
        connectorRef: '',
        imagePath: '',
        region: '',
        tag: ''
      }
    },
    sidecars: [
      {
        sidecar: {
          identifier: 'AmazonS3_1',
          type: 'AmazonS3',
          spec: {
            connectorRef: '',
            bucketName: '',
            filePath: ''
          }
        }
      }
    ]
  },
  configFiles: [
    {
      configFile: {
        identifier: 'config_file_1',
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
    },
    {
      configFile: {
        identifier: 'config_file_2',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: [''],
              secretFiles: ['']
            }
          }
        }
      }
    }
  ]
}

export const templateServerlessLambdaServiceRuntimeValidation: ServiceSpec = {
  manifests: [
    {
      manifest: {
        identifier: 'Serverless_Manifest_S3',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              region: RUNTIME_INPUT_VALUE,
              bucketName: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          },
          configOverridePath: RUNTIME_INPUT_VALUE
        }
      }
    },
    {
      manifest: {
        identifier: 'Serverless_Manifest_Github',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.Github,
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              repoName: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              commitId: RUNTIME_INPUT_VALUE,
              folderPath: RUNTIME_INPUT_VALUE
            }
          },
          configOverridePath: RUNTIME_INPUT_VALUE
        }
      }
    }
  ],
  artifacts: {
    primary: {
      primaryArtifactRef: RUNTIME_INPUT_VALUE,
      type: 'Ecr',
      sources: [
        {
          identifier: 'Artifactory_1',
          type: 'ArtifactoryRegistry',
          spec: {
            connectorRef: RUNTIME_INPUT_VALUE,
            repository: RUNTIME_INPUT_VALUE,
            artifactDirectory: RUNTIME_INPUT_VALUE,
            artifactPath: RUNTIME_INPUT_VALUE
          }
        }
      ],
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        imagePath: RUNTIME_INPUT_VALUE,
        region: RUNTIME_INPUT_VALUE,
        tag: RUNTIME_INPUT_VALUE
      }
    },
    sidecars: [
      {
        sidecar: {
          identifier: 'AmazonS3_1',
          type: 'AmazonS3',
          spec: {
            connectorRef: RUNTIME_INPUT_VALUE,
            bucketName: RUNTIME_INPUT_VALUE,
            filePath: RUNTIME_INPUT_VALUE
          }
        }
      }
    ]
  },
  configFiles: [
    {
      configFile: {
        identifier: 'config_file_1',
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
    },
    {
      configFile: {
        identifier: 'config_file_2',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: [RUNTIME_INPUT_VALUE],
              secretFiles: [RUNTIME_INPUT_VALUE]
            }
          }
        }
      }
    }
  ]
}
