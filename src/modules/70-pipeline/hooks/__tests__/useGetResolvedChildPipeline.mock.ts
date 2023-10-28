export const childPipeline = {
  pipeline: {
    name: 'child pl',
    identifier: 'child_pl',
    projectIdentifier: 'project',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'Custom',
          spec: {
            execution: {
              steps: [
                {
                  step: {
                    type: 'ShellScript',
                    name: 'ShellScript_1',
                    identifier: 'ShellScript_1',
                    spec: {
                      shell: 'Bash',
                      onDelegate: true,
                      source: {
                        type: 'Inline',
                        spec: {
                          script: 'echo 1'
                        }
                      },
                      environmentVariables: [],
                      outputVariables: []
                    },
                    timeout: '10m'
                  }
                }
              ]
            }
          },
          tags: {}
        }
      }
    ]
  }
}

export const pipelineWithChildPipelines = {
  pipeline: {
    name: 'multiple child pipelines',
    identifier: 'multiple_child_pipelines',
    projectIdentifier: 'project',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'Pipeline',
          spec: {
            org: 'default',
            pipeline: 'child_pl',
            project: 'project'
          }
        }
      },
      {
        stage: {
          name: 's2',
          identifier: 's2',
          description: '',
          type: 'Pipeline',
          spec: {
            org: 'default',
            pipeline: 'child_pl',
            project: 'project'
          }
        }
      },
      {
        parallel: [
          {
            stage: {
              name: 's3',
              identifier: 's3',
              description: '',
              type: 'Pipeline',
              spec: {
                org: 'default',
                pipeline: 'child_pl',
                project: 'project'
              }
            }
          },
          {
            stage: {
              name: 's4',
              identifier: 's4',
              description: '',
              type: 'Pipeline',
              spec: {
                org: 'default',
                pipeline: 'child_pl',
                project: 'project'
              }
            }
          }
        ]
      }
    ]
  }
}

export const resolvedPipelineWithChildPipelines = {
  pipeline: {
    name: 'multiple child pipelines',
    identifier: 'multiple_child_pipelines',
    projectIdentifier: 'project',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'Pipeline',
          spec: {
            org: 'default',
            pipeline: 'child_pl',
            project: 'project',
            inputs: { ...childPipeline.pipeline }
          }
        }
      },
      {
        stage: {
          name: 's2',
          identifier: 's2',
          description: '',
          type: 'Pipeline',
          spec: {
            org: 'default',
            pipeline: 'child_pl',
            project: 'project',
            inputs: { ...childPipeline.pipeline }
          }
        }
      },
      {
        parallel: [
          {
            stage: {
              name: 's3',
              identifier: 's3',
              description: '',
              type: 'Pipeline',
              spec: {
                org: 'default',
                pipeline: 'child_pl',
                project: 'project',
                inputs: { ...childPipeline.pipeline }
              }
            }
          },
          {
            stage: {
              name: 's4',
              identifier: 's4',
              description: '',
              type: 'Pipeline',
              spec: {
                org: 'default',
                pipeline: 'child_pl',
                project: 'project',
                inputs: { ...childPipeline.pipeline }
              }
            }
          }
        ]
      }
    ]
  }
}

export const simplePipeline = {
  pipeline: {
    name: 'simple pl',
    identifier: 'simple_pl',
    projectIdentifier: 'project',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'Custom',
          spec: {
            execution: {
              steps: [
                {
                  step: {
                    type: 'ShellScript',
                    name: 'ShellScript_1',
                    identifier: 'ShellScript_1',
                    spec: {
                      shell: 'Bash',
                      onDelegate: true,
                      source: {
                        type: 'Inline',
                        spec: {
                          script: 'echo 1'
                        }
                      },
                      environmentVariables: [],
                      outputVariables: []
                    },
                    timeout: '10m'
                  }
                }
              ]
            }
          },
          tags: {}
        }
      }
    ]
  }
}
