/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import {
  Button,
  Card,
  FormInput,
  getMultiTypeFromValue,
  Icon,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text,
  Checkbox,
  Container
} from '@harness/uicore'
import { Collapse } from '@blueprintjs/core'
import { defaultTo, get, isEmpty } from 'lodash-es'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { listenerRulesPromise, ResponseListString, useElasticLoadBalancers, useListeners } from 'services/cd-ng'
import { extractPort } from '@cd/components/PipelineSteps/ElastigroupBGStageSetupStep/ElastigroupBGStageSetupLoadbalancers'
import { shouldFetchFieldData } from '../../PipelineStepsUtil'
import { AsgBlueGreenDeployStepInitialValues } from '../AsgBlueGreenDeployStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AsgBlueGreenDeployLoadBalancers.module.scss'

export default function AsgBGStageSetupLoadBalancer(props: {
  formik: FormikProps<AsgBlueGreenDeployStepInitialValues>
  readonly?: boolean
  remove: <T>(index: number) => T | undefined
  index: number
  envId: string
  infraId: string
  path?: string
  trafficShift?: boolean
}): React.ReactElement {
  const { formik, readonly, index, remove, envId, infraId, path } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { CDS_ASG_SHIFT_TRAFFIC_STEP_NG, NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const loadBalancersErrors = isEmpty(path)
    ? defaultTo(formik.errors?.spec?.loadBalancers, [])
    : defaultTo(get(formik?.errors, `${path}spec.loadBalancers`), [])

  const [showInputs, setShow] = useState(isEmpty(loadBalancersErrors?.[index]))

  //this is for opening the card when the error is there -- for better user exp.
  useEffect(() => {
    if (!isEmpty(loadBalancersErrors?.[index])) {
      setShow(true)
    }
  }, [loadBalancersErrors, index])

  const [listenerList, setListenerList] = useState<SelectOption[]>([])
  const [prodListenerRules, setProdListenerRules] = useState<SelectOption[]>([])
  const [prodListenerRulesLoading, setProdListenerRulesLoading] = useState<boolean>(false)
  const [stageListenerRules, setStageListenerRules] = useState<SelectOption[]>([])
  const [stageListenerRulesLoading, setStageListenerRulesLoading] = useState<boolean>(false)

  const loadBalancersValue = isEmpty(path)
    ? defaultTo(formik.values?.spec?.loadBalancers, [])
    : defaultTo(get(formik?.values, `${path}spec.loadBalancers`), [])

  const shouldFetchLoadBalancers = shouldFetchFieldData([envId, infraId])

  const reverseMapListener = useRef<Map<string, string>>(new Map<string, string>())

  const shouldFetchListeners = shouldFetchFieldData([
    defaultTo(loadBalancersValue[index]?.loadBalancer, ''),
    envId,
    infraId
  ])

  const {
    data: loadBalancers,
    loading: loadingLoadBalancers,
    refetch: refetchLoadBalancers
  } = useElasticLoadBalancers({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      envId: defaultTo(envId, ''),
      infraDefinitionId: defaultTo(infraId, '')
    },
    lazy: !shouldFetchLoadBalancers
  })
  const loadBalancerOptions: SelectOption[] = React.useMemo(() => {
    return defaultTo(loadBalancers?.data, []).map(loadBalancer => ({
      value: loadBalancer,
      label: loadBalancer
    }))
  }, [loadBalancers?.data])

  const {
    data: listeners,
    loading: loadingListeners,
    refetch: refetchListeners
  } = useListeners({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      envId: defaultTo(envId, ''),
      infraDefinitionId: defaultTo(infraId, ''),
      elasticLoadBalancer: defaultTo(loadBalancersValue[index].loadBalancer, '')
    },
    lazy: !shouldFetchListeners
  })

  React.useEffect(() => {
    const listenerData = defaultTo(listeners?.data, {})
    const listenerOptions = Object.keys(listenerData).map(listenerKey => ({
      value: listenerData[listenerKey],
      label: extractPort(listenerKey)
    }))

    reverseMapListener.current.clear()
    Object.keys(listenerData).map(listenerKey => {
      reverseMapListener.current.set(extractPort(listenerKey), listenerData[listenerKey])
    })

    setListenerList(listenerOptions)
  }, [listeners?.data])

  React.useEffect(() => {
    if (
      shouldFetchFieldData([
        defaultTo(loadBalancersValue[index]?.loadBalancer, ''),
        defaultTo(loadBalancersValue[index]?.prodListener, '')
      ])
    ) {
      fetchProdListenerRules(
        defaultTo(loadBalancersValue[index]?.loadBalancer, ''),
        defaultTo(loadBalancersValue[index]?.prodListener, ''),
        undefined,
        true
      )
    }
    if (
      shouldFetchFieldData([
        defaultTo(loadBalancersValue[index]?.loadBalancer, ''),
        defaultTo(loadBalancersValue[index]?.stageListener, '')
      ])
    ) {
      fetchStageListenerRules(
        defaultTo(loadBalancersValue[index]?.loadBalancer, ''),
        defaultTo(loadBalancersValue[index]?.prodListener, ''),
        undefined,
        true
      )
    }
  }, [
    loadBalancersValue[index]?.loadBalancer,
    loadBalancersValue[index]?.prodListener,
    loadBalancersValue[index]?.stageListener
  ])

  const fetchLoadBalancers = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    if (!loadingLoadBalancers) {
      if (envId && infraId) {
        refetchLoadBalancers()
      }
    }
  }

  const fetchListeners = (e: React.FocusEvent<HTMLInputElement>, selectedLoadBalancer: string): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    if (!loadingListeners) {
      if (shouldFetchFieldData([envId, infraId, selectedLoadBalancer])) {
        refetchListeners({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            elasticLoadBalancer: selectedLoadBalancer,
            envId: defaultTo(envId, ''),
            infraDefinitionId: defaultTo(infraId, '')
          }
        })
      }
    }
  }

  const getFieldName = React.useCallback(
    (field: string) => {
      return isEmpty(path) ? `spec.loadBalancers[${index}].${field}` : `${path}spec.loadBalancers[${index}].${field}`
    },
    [index, path]
  )

  const fetchProdListenerRules = (
    selectedLoadBalancer: string,
    selectedProdListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ): void => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (shouldFetchFieldData([envId, infraId, selectedLoadBalancer])) {
      setProdListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedProdListener,
          envId: defaultTo(envId, ''),
          infraDefinitionId: defaultTo(infraId, '')
        }
      })
        .then((response: ResponseListString) => {
          setProdListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setProdListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setProdListenerRulesLoading(false)
          setProdListenerRules([])
        })
    }
  }

  const fetchStageListenerRules = (
    selectedLoadBalancer: string,
    selectedStageListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ): void => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (shouldFetchFieldData([envId, infraId, selectedLoadBalancer, selectedStageListener])) {
      setStageListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedStageListener,
          envId: defaultTo(envId, ''),
          infraDefinitionId: defaultTo(infraId, '')
        }
      })
        .then((response: ResponseListString) => {
          setStageListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setStageListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setStageListenerRulesLoading(false)
          setStageListenerRules([])
        })
    }
  }

  const onLoadBalancerChange = (selectedLoadBalancer: string, idx: number): void => {
    const updatedValues = produce(formik.values, draft => {
      draft.spec.loadBalancers[idx].loadBalancer = selectedLoadBalancer
      if (draft?.spec?.loadBalancers[idx]) {
        if (getMultiTypeFromValue(loadBalancersValue[idx]?.prodListener) === MultiTypeInputType.FIXED) {
          draft.spec.loadBalancers[idx].prodListener = ''
        }
        if (getMultiTypeFromValue(loadBalancersValue[idx]?.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
          draft.spec.loadBalancers[idx].prodListenerRuleArn = ''
        }
        if (getMultiTypeFromValue(loadBalancersValue[idx]?.stageListener) === MultiTypeInputType.FIXED) {
          draft.spec.loadBalancers[idx].stageListener = ''
        }
        if (getMultiTypeFromValue(loadBalancersValue[idx]?.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
          draft.spec.loadBalancers[idx].stageListenerRuleArn = ''
        }
      }
    })
    formik.setValues(updatedValues)
  }

  const loadBalancerSummaryView = (type: string, idx: number, portPath: string, rulePath: string): JSX.Element => {
    const port = isEmpty(path)
      ? get(formik.values, `spec.loadBalancers[${idx}].${portPath}`)
      : get(formik.values, `${path}spec.loadBalancers[${idx}].${portPath}`)
    const rule = isEmpty(path)
      ? get(formik.values, `spec.loadBalancers[${idx}].${rulePath}`)
      : get(formik.values, `${path}spec.loadBalancers[${idx}].${rulePath}`)
    return (
      <Layout.Horizontal className={css.summaryStyle}>
        <Text className={css.loadBalancerTitles} color={Color.GREY_900}>
          {type}
        </Text>
        <Text>{getString('cd.ElastigroupBGStageSetup.listenerColon')}</Text>
        <Text lineClamp={1} className={css.loadBalancerTitles} color={Color.GREY_900}>
          {port ? port : ' - '}
        </Text>
        <Text>{getString('cd.ElastigroupBGStageSetup.ruleColon')}</Text>
        <Text lineClamp={1} className={css.loadBalancerTitles} color={Color.GREY_900}>
          {rule ? rule : ' - '}
        </Text>
      </Layout.Horizontal>
    )
  }

  const onLoadingText = (loadingBool: boolean): string => {
    return loadingBool ? getString('loading') : getString('select')
  }

  return (
    <Card key={index} className={css.cardStyle}>
      <Layout.Horizontal className={css.collapseHeader}>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Icon
            onClick={() => {
              setShow(show => !show)
            }}
            name={showInputs ? 'chevron-up' : 'chevron-down'}
            style={{ marginRight: 6 }}
            color={Color.PRIMARY_7}
          />
          <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900} style={{ marginRight: 12 }}>
            {getString('cd.asgLoadBalancer')}
          </Text>
          {!showInputs ? (
            <Text lineClamp={1} width="230px">
              {loadBalancersValue[index]?.loadBalancer}
            </Text>
          ) : null}
        </Layout.Horizontal>
        <Layout.Horizontal>
          {!showInputs ? (
            <Button
              minimal
              icon="edit"
              disabled={readonly}
              onClick={() => {
                setShow(true)
              }}
            />
          ) : null}
          {loadBalancersValue.length > 1 ? (
            <Button
              minimal
              icon="main-trash"
              onClick={() => {
                setListenerList([])
                setProdListenerRules([])
                setStageListenerRules([])
                remove(index)
              }}
              disabled={readonly}
            />
          ) : null}
        </Layout.Horizontal>
      </Layout.Horizontal>
      <div className={css.divider} />
      <Collapse keepChildrenMounted={true} isOpen={true} className={css.collapseCardStyle}>
        {showInputs ? (
          <>
            {CDS_ASG_SHIFT_TRAFFIC_STEP_NG && (
              <Container margin={{ bottom: 'medium' }} className={cx(stepCss.formGroup, stepCss.lg)}>
                <Checkbox
                  disabled={false}
                  label={getString('cd.ElastigroupBGStageSetup.useTrafficShift')}
                  checked={get(formik?.values, getFieldName('isTrafficShift'))}
                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                    formik.setFieldValue(getFieldName('isTrafficShift'), event.currentTarget.checked)
                    formik.setFieldValue(getFieldName('stageListener'), '')
                    formik.setFieldValue(getFieldName('stageListenerRuleArn'), '')
                  }}
                />
              </Container>
            )}
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={getFieldName('loadBalancer')}
                selectItems={loadBalancerOptions}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: loadBalancerOptions,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: loadingLoadBalancers
                  },
                  width: 400,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onChange: selectedValue => {
                    const selectedValueString =
                      typeof selectedValue === 'string'
                        ? selectedValue
                        : ((selectedValue as SelectOption)?.value as string)
                    onLoadBalancerChange(selectedValueString, index)
                  },
                  onFocus: fetchLoadBalancers
                }}
                label={getString('cd.ElastigroupBGStageSetup.awsLoadBalancer')}
                placeholder={onLoadingText(loadingLoadBalancers)}
                disabled={readonly}
              />
            </div>

            <div className={css.loadBalancerTitles} color={Color.GREY_900}>
              {getString('cd.ElastigroupBGStageSetup.configureProductionListener')}
            </div>

            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={getFieldName('prodListener')}
                selectItems={listenerList}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: listenerList,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: loadingListeners
                  },
                  width: 400,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onChange: selectedValue => {
                    const selectedValueString =
                      typeof selectedValue === 'string'
                        ? selectedValue
                        : ((selectedValue as SelectOption)?.value as string)
                    const updatedValues = produce(formik.values, draft => {
                      draft.spec.loadBalancers[index].prodListener = selectedValueString
                      if (
                        getMultiTypeFromValue(draft.spec.loadBalancers[index].prodListenerRuleArn) ===
                        MultiTypeInputType.FIXED
                      ) {
                        draft.spec.loadBalancers[index].prodListenerRuleArn = ''
                      }
                    })
                    formik.setValues(updatedValues)
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    fetchListeners(e, defaultTo(loadBalancersValue[index]?.loadBalancer, ''))
                  }
                }}
                label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
                placeholder={onLoadingText(loadingListeners)}
                disabled={readonly}
              />
            </div>

            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={getFieldName('prodListenerRuleArn')}
                selectItems={prodListenerRules}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: prodListenerRules,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: prodListenerRulesLoading
                  },
                  width: 400,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    const listener = defaultTo(loadBalancersValue[index]?.prodListener, '')
                    fetchProdListenerRules(
                      defaultTo(loadBalancersValue[index]?.loadBalancer, ''),
                      defaultTo(listener, ''),
                      e
                    )
                  }
                }}
                label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
                placeholder={onLoadingText(prodListenerRulesLoading)}
                disabled={readonly}
              />
            </div>

            {!get(formik?.values, getFieldName('isTrafficShift')) && (
              <>
                <div className={css.loadBalancerTitles} color={Color.GREY_900}>
                  {getString('cd.ElastigroupBGStageSetup.configureStageListener')}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTypeInput
                    name={getFieldName('stageListener')}
                    selectItems={listenerList}
                    useValue
                    multiTypeInputProps={{
                      expressions,
                      selectProps: {
                        items: listenerList,
                        popoverClassName: css.dropdownMenu,
                        allowCreatingNewItems: true,
                        loadingItems: loadingListeners
                      },
                      width: 400,
                      newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                      onChange: selectedValue => {
                        const selectedValueString =
                          typeof selectedValue === 'string'
                            ? selectedValue
                            : ((selectedValue as SelectOption)?.value as string)
                        const updatedValues = produce(formik.values, draft => {
                          draft.spec.loadBalancers[index].stageListener = selectedValueString
                          if (
                            getMultiTypeFromValue(draft.spec.loadBalancers[index]?.stageListenerRuleArn) ===
                            MultiTypeInputType.FIXED
                          ) {
                            draft.spec.loadBalancers[index].stageListenerRuleArn = ''
                          }
                        })
                        formik.setValues(updatedValues)
                      },
                      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                        fetchListeners(e, defaultTo(loadBalancersValue[index]?.loadBalancer, ''))
                      }
                    }}
                    label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
                    placeholder={onLoadingText(loadingListeners)}
                    disabled={readonly}
                  />
                </div>

                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTypeInput
                    name={getFieldName('stageListenerRuleArn')}
                    selectItems={stageListenerRules}
                    useValue
                    multiTypeInputProps={{
                      expressions,
                      selectProps: {
                        items: stageListenerRules,
                        popoverClassName: css.dropdownMenu,
                        allowCreatingNewItems: true,
                        loadingItems: stageListenerRulesLoading
                      },
                      width: 400,
                      newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                        fetchStageListenerRules(
                          defaultTo(loadBalancersValue[index]?.loadBalancer, ''),
                          defaultTo(loadBalancersValue[index]?.stageListener, ''),
                          e
                        )
                      }
                    }}
                    label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
                    placeholder={onLoadingText(stageListenerRulesLoading)}
                    disabled={readonly}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <Layout.Vertical>
            {loadBalancerSummaryView(getString('production'), index, 'prodListener', 'prodListenerRuleArn')}
            {loadBalancerSummaryView(getString('common.stage'), index, 'stageListener', 'stageListenerRuleArn')}
          </Layout.Vertical>
        )}
      </Collapse>
    </Card>
  )
}
