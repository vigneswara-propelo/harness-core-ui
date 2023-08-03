/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const stageTransformedData = [
  {
    id: 'MockUUID',
    identifier: 'stage1',
    name: 'stage1',
    type: 'Custom',
    nodeType: 'default-node',
    icon: 'custom-stage-icon',
    iconUrl: undefined,
    data: {
      graphType: 'STAGE_GRAPH',
      stage: {
        name: 'stage1',
        identifier: 'stage1',
        description: '',
        type: 'Custom',
        spec: {
          execution: {
            steps: [
              {
                step: {
                  type: 'Wait',
                  name: 'Wait_1',
                  identifier: 'Wait_1',
                  spec: {
                    duration: '10m'
                  },
                  when: {
                    stageStatus: 'Failure'
                  },
                  strategy: {
                    parallelism: 1
                  }
                }
              },
              {
                parallel: [
                  {
                    step: {
                      type: 'Wait',
                      name: 'Wait_2',
                      identifier: 'Wait_2',
                      spec: {
                        duration: '10m'
                      },
                      when: {
                        stageStatus: 'Failure'
                      },
                      strategy: {
                        parallelism: 1
                      }
                    }
                  },
                  {
                    step: {
                      type: 'Wait',
                      name: 'Wait_3',
                      identifier: 'Wait_3',
                      spec: {
                        duration: '10m'
                      },
                      when: {
                        stageStatus: 'Failure'
                      },
                      strategy: {
                        parallelism: 1
                      }
                    }
                  }
                ]
              },
              {
                parallel: [
                  {
                    stepGroup: {
                      name: 'sg1',
                      identifier: 'sg1',
                      steps: [
                        {
                          step: {
                            type: 'Wait',
                            name: 'Wait_4',
                            identifier: 'Wait_4',
                            spec: {
                              duration: '10m'
                            },
                            when: {
                              stageStatus: 'Failure'
                            },
                            strategy: {
                              parallelism: 1
                            }
                          }
                        },
                        {
                          parallel: [
                            {
                              step: {
                                type: 'Wait',
                                name: 'Wait_5',
                                identifier: 'Wait_5',
                                spec: {
                                  duration: '10m'
                                },
                                when: {
                                  stageStatus: 'Failure'
                                },
                                strategy: {
                                  parallelism: 1
                                }
                              }
                            },
                            {
                              step: {
                                type: 'Wait',
                                name: 'Wait_6',
                                identifier: 'Wait_6',
                                spec: {
                                  duration: '10m'
                                },
                                when: {
                                  stageStatus: 'Failure'
                                },
                                strategy: {
                                  parallelism: 1
                                }
                              }
                            }
                          ]
                        },
                        {
                          stepGroup: {
                            name: 'sg5',
                            identifier: 'sg5',
                            steps: [
                              {
                                step: {
                                  type: 'Wait',
                                  name: 'Wait_7',
                                  identifier: 'Wait_7',
                                  spec: {
                                    duration: '10m'
                                  },
                                  when: {
                                    stageStatus: 'Failure'
                                  },
                                  strategy: {
                                    parallelism: 1
                                  }
                                }
                              }
                            ]
                          }
                        }
                      ],
                      when: {
                        stageStatus: 'Failure'
                      },
                      strategy: {
                        parallelism: 1
                      }
                    }
                  },
                  {
                    stepGroup: {
                      name: 'sg2',
                      identifier: 'sg2',
                      steps: [
                        {
                          step: {
                            type: 'Wait',
                            name: 'Wait_8',
                            identifier: 'Wait_8',
                            spec: {
                              duration: '10m'
                            },
                            when: {
                              stageStatus: 'Failure'
                            },
                            strategy: {
                              parallelism: 1
                            }
                          }
                        },
                        {
                          step: {
                            name: 'ShellTemplateStep',
                            identifier: 'ShellTemplateStep',
                            template: {
                              templateRef: 'shellConditional',
                              versionLabel: '1'
                            }
                          }
                        }
                      ],
                      when: {
                        stageStatus: 'Failure'
                      },
                      strategy: {
                        parallelism: 1
                      }
                    }
                  }
                ]
              },
              {
                stepGroup: {
                  name: 'sg3',
                  identifier: 'sg3',
                  steps: [
                    {
                      step: {
                        type: 'Wait',
                        name: 'Wait_9',
                        identifier: 'Wait_9',
                        spec: {
                          duration: '10m'
                        },
                        when: {
                          stageStatus: 'Failure'
                        },
                        strategy: {
                          parallelism: 1
                        }
                      }
                    }
                  ],
                  when: {
                    stageStatus: 'Failure'
                  },
                  strategy: {
                    parallelism: 1
                  }
                }
              }
            ]
          }
        },
        tags: {},
        when: {
          pipelineStatus: 'All',
          condition: 'true'
        },
        strategy: {
          parallelism: 1
        }
      },
      dotNotationPath: 'pipeline.stages.0.stage.stage1',
      isInComplete: true,
      loopingStrategyEnabled: true,
      conditionalExecutionEnabled: true,
      isTemplateNode: false
    }
  },
  {
    id: 'MockUUID',
    identifier: 'stage2',
    name: 'stage2',
    nodeType: 'default-node',
    type: 'Custom',
    icon: 'custom-stage-icon',
    iconUrl: undefined,
    data: {
      graphType: 'STAGE_GRAPH',
      parallel: [
        {
          stage: {
            name: 'stage2',
            identifier: 'stage2',
            description: '',
            type: 'Custom',
            spec: {
              execution: {
                steps: [
                  {
                    step: {
                      type: 'Wait',
                      name: 'Wait_1',
                      identifier: 'Wait_1',
                      spec: {
                        duration: '10m'
                      }
                    }
                  }
                ]
              }
            },
            tags: {},
            when: {
              pipelineStatus: 'All',
              condition: 'true'
            },
            strategy: {
              parallelism: 1
            }
          }
        },
        {
          stage: {
            name: 'stage3',
            identifier: 'stage3',
            description: '',
            type: 'Custom',
            spec: {
              execution: {
                steps: [
                  {
                    step: {
                      type: 'Wait',
                      name: 'Wait_1',
                      identifier: 'Wait_1',
                      spec: {
                        duration: '10m'
                      }
                    }
                  }
                ]
              }
            },
            tags: {},
            when: {
              pipelineStatus: 'All',
              condition: 'true'
            },
            strategy: {
              parallelism: 1
            }
          }
        }
      ],
      dotNotationPath: 'pipeline.stages.1.parallel.0.stage.stage2',
      isInComplete: false,
      loopingStrategyEnabled: true,
      conditionalExecutionEnabled: true,
      isTemplateNode: false
    },
    children: [
      {
        id: 'MockUUID',
        identifier: 'stage3',
        name: 'stage3',
        type: 'Custom',
        nodeType: 'default-node',
        icon: 'custom-stage-icon',
        iconUrl: undefined,
        data: {
          graphType: 'STAGE_GRAPH',
          stage: {
            name: 'stage3',
            identifier: 'stage3',
            description: '',
            type: 'Custom',
            spec: {
              execution: {
                steps: [
                  {
                    step: {
                      type: 'Wait',
                      name: 'Wait_1',
                      identifier: 'Wait_1',
                      spec: {
                        duration: '10m'
                      }
                    }
                  }
                ]
              }
            },
            tags: {},
            when: {
              pipelineStatus: 'All',
              condition: 'true'
            },
            strategy: {
              parallelism: 1
            }
          },
          dotNotationPath: 'pipeline.stages.1.parallel.1.stage.stage3',
          isInComplete: false,
          loopingStrategyEnabled: true,
          conditionalExecutionEnabled: true,
          isTemplateNode: false
        }
      }
    ]
  }
]

export const stepsTransformedData = [
  {
    id: 'MockUUID',
    identifier: 'Wait_1',
    name: 'Wait_1',
    type: 'Wait',
    data: {
      graphType: 'STEP_GRAPH',
      step: {
        type: 'Wait',
        name: 'Wait_1',
        identifier: 'Wait_1',
        spec: {
          duration: '10m'
        },
        when: {
          stageStatus: 'Failure'
        },
        strategy: {
          parallelism: 1
        }
      },
      nodeStateMetadata: {
        dotNotationPath: 'pipeline.stages.0.stage.spec.execution.steps.0.step.Wait_1',
        relativeBasePath: 'pipeline.stages.0.stage.spec.execution.steps.step.Wait_1',
        nodeType: 'STEP'
      },
      isInComplete: false,
      loopingStrategyEnabled: true,
      conditionalExecutionEnabled: true,
      isTemplateNode: false,
      isNestedGroup: false,
      isContainerStepGroup: false
    },
    children: []
  },
  {
    id: 'MockUUID',
    identifier: 'Wait_2',
    name: 'Wait_2',
    type: 'Wait',
    icon: undefined,
    iconUrl: undefined,
    nodeType: undefined,
    data: {
      step: {
        type: 'Wait',
        name: 'Wait_2',
        identifier: 'Wait_2',
        spec: {
          duration: '10m'
        },
        when: {
          stageStatus: 'Failure'
        },
        strategy: {
          parallelism: 1
        }
      },
      nodeStateMetadata: {
        dotNotationPath: 'pipeline.stages.0.stage.spec.execution.steps.1.parallel.0.step.Wait_2',
        relativeBasePath: 'pipeline.stages.0.stage.spec.execution.steps.step.Wait_2',
        nodeType: 'STEP'
      },
      isInComplete: false,
      loopingStrategyEnabled: true,
      conditionalExecutionEnabled: true,
      isTemplateNode: false,
      isNestedGroup: false,
      isContainerStepGroup: false,
      graphType: 'STEP_GRAPH'
    },
    children: [
      {
        id: 'MockUUID',
        identifier: 'Wait_3',
        name: 'Wait_3',
        type: 'Wait',
        data: {
          graphType: 'STEP_GRAPH',
          step: {
            type: 'Wait',
            name: 'Wait_3',
            identifier: 'Wait_3',
            spec: {
              duration: '10m'
            },
            when: {
              stageStatus: 'Failure'
            },
            strategy: {
              parallelism: 1
            }
          },
          nodeStateMetadata: {
            dotNotationPath: 'pipeline.stages.0.stage.spec.execution.steps.1.parallel.1.step.Wait_3',
            relativeBasePath: 'pipeline.stages.0.stage.spec.execution.steps.step.Wait_3',
            nodeType: 'STEP'
          },
          isInComplete: false,
          loopingStrategyEnabled: true,
          conditionalExecutionEnabled: true,
          isTemplateNode: false,
          isNestedGroup: false,
          isContainerStepGroup: false
        },
        children: []
      }
    ]
  },
  {
    id: 'MockUUID',
    identifier: 'sg1',
    icon: undefined,
    name: 'sg1',
    type: 'StepGroup',
    nodeType: 'StepGroup',
    data: {
      stepGroup: {
        name: 'sg1',
        identifier: 'sg1',
        steps: [
          {
            step: {
              type: 'Wait',
              name: 'Wait_4',
              identifier: 'Wait_4',
              spec: {
                duration: '10m'
              },
              when: {
                stageStatus: 'Failure'
              },
              strategy: {
                parallelism: 1
              }
            }
          },
          {
            parallel: [
              {
                step: {
                  type: 'Wait',
                  name: 'Wait_5',
                  identifier: 'Wait_5',
                  spec: {
                    duration: '10m'
                  },
                  when: {
                    stageStatus: 'Failure'
                  },
                  strategy: {
                    parallelism: 1
                  }
                }
              },
              {
                step: {
                  type: 'Wait',
                  name: 'Wait_6',
                  identifier: 'Wait_6',
                  spec: {
                    duration: '10m'
                  },
                  when: {
                    stageStatus: 'Failure'
                  },
                  strategy: {
                    parallelism: 1
                  }
                }
              }
            ]
          },
          {
            stepGroup: {
              name: 'sg5',
              identifier: 'sg5',
              steps: [
                {
                  step: {
                    type: 'Wait',
                    name: 'Wait_7',
                    identifier: 'Wait_7',
                    spec: {
                      duration: '10m'
                    },
                    when: {
                      stageStatus: 'Failure'
                    },
                    strategy: {
                      parallelism: 1
                    }
                  }
                }
              ]
            }
          }
        ],
        when: {
          stageStatus: 'Failure'
        },
        strategy: {
          parallelism: 1
        }
      },
      nodeStateMetadata: {
        dotNotationPath: 'pipeline.stages.0.stage.spec.execution.steps.2.parallel.0.stepGroup.sg1',
        relativeBasePath: 'pipeline.stages.0.stage.spec.execution.steps.stepGroup.sg1',
        nodeType: 'STEP_GROUP'
      },
      isNestedGroup: false,
      isContainerStepGroup: false,
      isInComplete: false,
      loopingStrategyEnabled: true,
      conditionalExecutionEnabled: true,
      graphType: 'STEP_GRAPH'
    },
    children: [
      {
        id: 'MockUUID',
        identifier: 'sg2',
        name: 'sg2',
        type: 'StepGroup',
        nodeType: 'StepGroup',
        icon: undefined,
        data: {
          stepGroup: {
            name: 'sg2',
            identifier: 'sg2',
            steps: [
              {
                step: {
                  type: 'Wait',
                  name: 'Wait_8',
                  identifier: 'Wait_8',
                  spec: {
                    duration: '10m'
                  },
                  when: {
                    stageStatus: 'Failure'
                  },
                  strategy: {
                    parallelism: 1
                  }
                }
              },
              {
                step: {
                  name: 'ShellTemplateStep',
                  identifier: 'ShellTemplateStep',
                  template: {
                    templateRef: 'shellConditional',
                    versionLabel: '1'
                  }
                }
              }
            ],
            when: {
              stageStatus: 'Failure'
            },
            strategy: {
              parallelism: 1
            }
          },
          nodeStateMetadata: {
            dotNotationPath: 'pipeline.stages.0.stage.spec.execution.steps.2.parallel.1.stepGroup.sg2',
            relativeBasePath: 'pipeline.stages.0.stage.spec.execution.steps.stepGroup.sg2',
            nodeType: 'STEP_GROUP'
          },
          isNestedGroup: false,
          isContainerStepGroup: false,
          type: 'StepGroup',
          nodeType: 'StepGroup',
          loopingStrategyEnabled: true,
          conditionalExecutionEnabled: true,
          graphType: 'STEP_GRAPH',
          isInComplete: false,
          isTemplateNode: false
        }
      }
    ]
  },
  {
    id: 'MockUUID',
    identifier: 'sg3',
    name: 'sg3',
    type: 'StepGroup',
    nodeType: 'StepGroup',
    icon: undefined,
    data: {
      stepGroup: {
        name: 'sg3',
        identifier: 'sg3',
        steps: [
          {
            step: {
              type: 'Wait',
              name: 'Wait_9',
              identifier: 'Wait_9',
              spec: {
                duration: '10m'
              },
              when: {
                stageStatus: 'Failure'
              },
              strategy: {
                parallelism: 1
              }
            }
          }
        ],
        when: {
          stageStatus: 'Failure'
        },
        strategy: {
          parallelism: 1
        }
      },
      nodeStateMetadata: {
        dotNotationPath: 'pipeline.stages.0.stage.spec.execution.steps.3.stepGroup.sg3',
        relativeBasePath: 'pipeline.stages.0.stage.spec.execution.steps.stepGroup.sg3',
        nodeType: 'STEP_GROUP'
      },
      isNestedGroup: false,
      isContainerStepGroup: false,
      type: 'StepGroup',
      nodeType: 'StepGroup',
      loopingStrategyEnabled: true,
      conditionalExecutionEnabled: true,
      graphType: 'STEP_GRAPH',
      isInComplete: true,
      icon: undefined,
      isTemplateNode: false
    }
  }
]
