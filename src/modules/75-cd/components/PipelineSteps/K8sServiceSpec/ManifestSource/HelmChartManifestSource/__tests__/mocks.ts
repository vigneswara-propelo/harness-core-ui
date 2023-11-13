export const manifests = [
  {
    manifest: {
      identifier: 'dd',
      type: 'HelmChart',
      spec: {
        store: {
          type: 'OciHelmChart',
          spec: {
            config: {
              type: 'ECR',
              spec: {
                region: '<+input>',
                registryId: '<+input>',
                connectorRef: '<+input>'
              }
            }
          }
        },
        chartVersion: '<+input>'
      }
    }
  },
  {
    manifest: {
      identifier: 'dd2',
      type: 'HelmChart',
      spec: {
        store: {
          type: 'S3',
          spec: {}
        },
        chartVersion: '<+input>'
      }
    }
  }
]

export const template = {
  manifests: [
    {
      manifest: {
        identifier: 'dd',
        type: 'HelmChart',
        spec: {
          store: {
            type: 'OciHelmChart',
            spec: {
              config: {
                type: 'ECR',
                spec: {
                  region: '<+input>',
                  registryId: '<+input>',
                  connectorRef: '<+input>'
                }
              }
            }
          },
          chartVersion: '<+input>',
          commandFlags: [
            {
              commandType: 'Pull',
              flag: '<+input>'
            },
            {
              commandType: 'Version',
              flag: '<+input>'
            }
          ]
        }
      }
    },
    {
      manifest: {
        identifier: 'helmgcsid',
        type: 'HelmChart',
        spec: {
          store: {
            type: 'Gcs',
            spec: {
              connectorRef: '<+input>',
              bucketName: '<+input>',
              folderPath: '<+input>',
              commitId: '<+input>',
              branch: '<+input>'
            }
          },
          chartName: '<+input>',
          chartVersion: '<+input>',
          skipResourceVersioning: '<+input>',
          commandFlags: [
            {
              commandType: 'Pull',
              flag: '<+input>'
            },
            {
              commandType: 'Version',
              flag: '<+input>'
            }
          ]
        }
      }
    },
    {
      manifest: {
        identifier: 'helmgcsid2',
        type: 'HelmChart',
        spec: {
          store: {
            type: 'S3',
            spec: {
              connectorRef: '<+input>',
              bucketName: '<+input>',
              folderPath: '<+input>',
              commitId: '<+input>',
              branch: '<+input>'
            }
          }
        }
      }
    }
  ]
}

export const path = 'stages[0].stage.spec.serviceConfig.serviceDefinition.spec'

export const stageIdentifier = 'STG1'
