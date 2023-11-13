import { FailureStrategyConfig, FailureStrategyConfigY1, toFailureStrategies, toFailureStrategiesY1 } from '../utils'

describe('toFailureStrategiesY1', () => {
  test('should convert FailureStrategyConfig[] to FailureStrategyConfigY1[]', () => {
    const input: (FailureStrategyConfig | undefined)[] = [
      undefined,
      {},
      {
        onFailure: {
          errors: undefined,
          action: {
            type: 'Ignore'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'Abort'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'StageRollback'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'MarkAsSuccess'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'MarkAsFailure'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'PipelineRollback'
          }
        }
      },
      {
        onFailure: {
          errors: ['DelegateProvisioning'],
          action: {
            type: 'ManualIntervention',
            spec: {
              timeout: '69m',
              onTimeout: {
                action: {
                  type: 'Abort'
                }
              }
            }
          }
        }
      },
      {
        onFailure: {
          errors: ['Connectivity'],
          action: {
            type: 'Retry',
            spec: {
              retryCount: 2,
              retryIntervals: ['1m', '2m'],
              onRetryFailure: {
                action: {
                  type: 'MarkAsFailure'
                }
              }
            }
          }
        }
      },
      {
        onFailure: {
          errors: ['AllErrors'],
          action: {
            type: 'RetryStepGroup',
            spec: {
              retryCount: 2,
              retryIntervals: ['1m', '2m']
            }
          }
        }
      }
    ]

    const output = toFailureStrategiesY1(input)

    expect(output).toEqual([
      { action: undefined, errors: [] },
      { action: undefined, errors: [] },
      { errors: [], action: { type: 'ignore' } },
      { errors: ['authentication'], action: { type: 'abort' } },
      { errors: ['authentication'], action: { type: 'stage-rollback' } },
      { errors: ['authentication'], action: { type: 'success' } },
      { errors: ['authentication'], action: { type: 'fail' } },
      { errors: ['authentication'], action: { type: 'pipeline-rollback' } },
      {
        errors: ['delegate-provisioning'],
        action: { type: 'manual-intervention', spec: { timeout: '69m', timeout_action: { type: 'abort' } } }
      },
      {
        errors: ['connectivity'],
        action: { type: 'retry', spec: { attempts: 2, interval: ['1m', '2m'], failure: { action: { type: 'fail' } } } }
      },
      { errors: ['all'], action: { type: 'retry-step-group', spec: { attempts: 2, interval: ['1m', '2m'] } } }
    ])
  })

  test('should handle undefined/string input', () => {
    expect(toFailureStrategiesY1('<+input>')).toEqual('<+input>')
    expect(toFailureStrategiesY1(undefined)).toEqual(undefined)
  })
})

describe('toFailureStrategies', () => {
  test('should convert FailureStrategyConfigY1[] to FailureStrategyConfig[]', () => {
    const input: (FailureStrategyConfigY1 | undefined)[] = [
      undefined,
      { action: undefined, errors: undefined },
      { errors: [], action: { type: 'ignore' } },
      { errors: ['authentication'], action: { type: 'abort' } },
      { errors: ['authentication'], action: { type: 'stage-rollback' } },
      { errors: ['authentication'], action: { type: 'success' } },
      { errors: ['authentication'], action: { type: 'fail' } },
      { errors: ['authentication'], action: { type: 'pipeline-rollback' } },
      {
        errors: ['delegate-provisioning'],
        action: { type: 'manual-intervention', spec: { timeout: '69m', timeout_action: { type: 'abort' } } }
      },
      {
        errors: ['connectivity'],
        action: { type: 'retry', spec: { attempts: 2, interval: ['1m', '2m'], failure: { action: { type: 'fail' } } } }
      },
      { errors: ['all'], action: { type: 'retry-step-group', spec: { attempts: 2, interval: ['1m', '2m'] } } }
    ]

    expect(toFailureStrategies(input)).toEqual([
      {
        onFailure: {
          action: undefined,
          errors: []
        }
      },
      {
        onFailure: {
          action: undefined,
          errors: []
        }
      },
      {
        onFailure: {
          errors: [],
          action: {
            type: 'Ignore'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'Abort'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'StageRollback'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'MarkAsSuccess'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'MarkAsFailure'
          }
        }
      },
      {
        onFailure: {
          errors: ['Authentication'],
          action: {
            type: 'PipelineRollback'
          }
        }
      },
      {
        onFailure: {
          errors: ['DelegateProvisioning'],
          action: {
            type: 'ManualIntervention',
            spec: {
              timeout: '69m',
              onTimeout: {
                action: {
                  type: 'Abort'
                }
              }
            }
          }
        }
      },
      {
        onFailure: {
          errors: ['Connectivity'],
          action: {
            type: 'Retry',
            spec: {
              retryCount: 2,
              retryIntervals: ['1m', '2m'],
              onRetryFailure: {
                action: {
                  type: 'MarkAsFailure'
                }
              }
            }
          }
        }
      },
      {
        onFailure: {
          errors: ['AllErrors'],
          action: {
            type: 'RetryStepGroup',
            spec: {
              retryCount: 2,
              retryIntervals: ['1m', '2m']
            }
          }
        }
      }
    ])
  })

  test('should handle undefined/string input', () => {
    expect(toFailureStrategies('<+input>')).toEqual('<+input>')
    expect(toFailureStrategies(undefined)).toEqual(undefined)
  })
})
