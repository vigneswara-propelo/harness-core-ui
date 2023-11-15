/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const templatewithRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: '<+input>',
      sources: [
        {
          identifier: 'source1',
          type: 'DockerRegistry',
          spec: {
            tag: '<+input>'
          }
        }
      ]
    }
  }
}
export const templateWithoutRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: '<+input>',
      sources: '<+input>'
    }
  }
}

export const initialValuesWithRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: 'source1',
      sources: [
        {
          identifier: 'source1',
          type: 'DockerRegistry',
          spec: {
            tag: ''
          }
        }
      ]
    }
  }
}
export const initialValuesWithoutRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: 'source1'
    }
  }
}

export const formik = {
  initialValues: {
    identifier: 'serviceV2',
    stages: [
      {
        stage: {
          identifier: 'dev',
          type: 'Deployment',
          spec: {
            environment: {
              environmentInputs: {
                identifier: 'env',
                type: 'PreProduction',
                overrides: {
                  manifests: [
                    {
                      manifest: {
                        identifier: 'manifest',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              branch: ''
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            },
            service: {
              serviceInputs: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        primaryArtifactRef: '',
                        sources: ''
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  },
  values: {
    identifier: 'serviceV2',
    stages: [
      {
        stage: {
          identifier: 'dev',
          type: 'Deployment',
          spec: {
            environment: {
              environmentInputs: {
                identifier: 'env',
                type: 'PreProduction',
                overrides: {
                  manifests: [
                    {
                      manifest: {
                        identifier: 'manifest',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              branch: ''
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            },
            service: {
              serviceInputs: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        primaryArtifactRef: 'source1',
                        sources: [
                          {
                            identifier: 'source1',
                            type: 'DockerRegistry',
                            spec: {
                              tag: ''
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  },
  setValues: jest.fn(),
  setFieldValue: jest.fn()
}
export const stageContextValue = {
  getStageFormTemplate: jest.fn(() => '<+input>'),
  updateStageFormTemplate: jest.fn()
}

export const inputSetTemplate = {
  artifacts: {
    primary: {
      primaryArtifactRef: '<+input>',
      sources: [
        {
          identifier: 'source1',
          type: 'ArtifactoryRegistry',
          spec: {
            artifactPath: '<+input>',
            tag: '<+input>'
          }
        }
      ]
    }
  },
  manifests: [
    {
      manifest: {
        identifier: 'somemani',
        type: 'HelmChart',
        spec: {
          chartName: '<+input>'
        }
      }
    }
  ]
}

export const inputSetInitialValues = {
  manifestConfigurations: {
    primaryManifestRef: '<+input>'
  },
  artifacts: {
    primary: {
      primaryArtifactRef: 'source1',
      sources: [
        {
          identifier: 'source1',
          type: 'ArtifactoryRegistry',
          spec: {
            artifactPath: '',
            tag: ''
          }
        }
      ]
    }
  },
  manifests: [
    {
      manifest: {
        identifier: 'somemani',
        type: 'HelmChart',
        spec: {
          chartName: ''
        }
      }
    }
  ]
}

export const inputSetFormikValues = {
  name: '',
  identifier: '',
  orgIdentifier: 'default',
  projectIdentifier: 'KanikaTest',
  pipeline: {
    identifier: 'single_artifact_source_pip',
    stages: [
      {
        stage: {
          identifier: 's1',
          type: 'Deployment',
          spec: {
            service: {
              serviceInputs: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        primaryArtifactRef: 'source1',
                        sources: [
                          {
                            identifier: 'source1',
                            type: 'ArtifactoryRegistry',
                            spec: {
                              artifactPath: '',
                              tag: ''
                            }
                          }
                        ]
                      }
                    },
                    manifests: [
                      {
                        manifest: {
                          identifier: 'somemani',
                          type: 'HelmChart',
                          spec: {
                            chartName: ''
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            environment: {
              environmentInputs: {
                overrides: {
                  manifests: [
                    {
                      manifest: {
                        identifier: 'somemani',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '',
                              paths: ''
                            }
                          }
                        }
                      }
                    },
                    {
                      manifest: {
                        identifier: 'testingmani',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '',
                              paths: ''
                            }
                          }
                        }
                      }
                    }
                  ]
                },
                variables: [
                  {
                    name: 'envoverrideinput',
                    type: 'String',
                    value: ''
                  }
                ]
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    identifier: 'ShellScript_1',
                    type: 'ShellScript',
                    spec: {
                      source: {
                        type: 'Inline',
                        spec: {
                          script: ''
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
    ]
  },
  repo: '',
  branch: '',
  connectorRef: '',
  repoName: '',
  storeType: 'INLINE',
  filePath: ''
}

export const inputSetFormikInitialValues = {
  name: '',
  identifier: '',
  orgIdentifier: 'default',
  projectIdentifier: 'KanikaTest',
  pipeline: {
    identifier: 'single_artifact_source_pip',
    stages: [
      {
        stage: {
          identifier: 's1',
          type: 'Deployment',
          spec: {
            service: {
              serviceInputs: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        primaryArtifactRef: '',
                        sources: ''
                      }
                    },
                    manifests: [
                      {
                        manifest: {
                          identifier: 'somemani',
                          type: 'HelmChart',
                          spec: {
                            chartName: ''
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            environment: {
              environmentInputs: {
                overrides: {
                  manifests: [
                    {
                      manifest: {
                        identifier: 'somemani',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '',
                              paths: ''
                            }
                          }
                        }
                      }
                    },
                    {
                      manifest: {
                        identifier: 'testingmani',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '',
                              paths: ''
                            }
                          }
                        }
                      }
                    }
                  ]
                },
                variables: [
                  {
                    name: 'envoverrideinput',
                    type: 'String',
                    value: ''
                  }
                ]
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    identifier: 'ShellScript_1',
                    type: 'ShellScript',
                    spec: {
                      source: {
                        type: 'Inline',
                        spec: {
                          script: ''
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
    ]
  },
  repo: '',
  branch: '',
  connectorRef: '',
  repoName: '',
  storeType: 'INLINE',
  filePath: ''
}
