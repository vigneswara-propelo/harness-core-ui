/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEmpty } from 'lodash-es'

import type {
  CIVolume,
  ContainerInfraYamlSpec,
  ExecutionWrapperConfig,
  K8sDirectInfra,
  NGVariable,
  StepGroupElementConfig
} from 'services/cd-ng'
import type { SecurityContext, Toleration } from 'services/ci'
import type { ListUIType } from '@pipeline/components/List/List'
import type { MultiTypeListUIType } from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import type { MapUIType } from '@common/components/Map/Map'
import type { ConnectorSelectedValue } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { ConnectorRef } from '../StepsTypes'

interface K8sDirectInfraSpec extends Omit<ContainerInfraYamlSpec, 'resources' | 'volumes'> {
  volumes?: string | CIVolume[]
}
export interface K8sDirectInfraStepGroupElementConfig extends StepGroupElementConfig {
  sharedPaths?: any
  stepGroupInfra?: {
    type: K8sDirectInfra['type']
    spec: K8sDirectInfraSpec
  }
  variables?: NGVariable[]
}

export interface TolerationFormik extends Toleration {
  id: string
}

export interface StepGroupFormikValues extends ContainerStepGroupFormikValues {
  identifier: string
  name: string
  variables?: NGVariable[]
  steps?: ExecutionWrapperConfig[]
}

export interface ContainerStepGroupFormikValues {
  type?: 'KubernetesDirect'
  sharedPaths?: ListUIType | string
  connectorRef?: ConnectorRef
  namespace?: string
  volumes?: string | CIVolume[]
  annotations?: MapUIType
  labels?: MapUIType
  nodeSelector?: MapUIType
  serviceAccountName?: string
  automountServiceAccountToken?: boolean
  priorityClassName?: string
  addCapabilities?: MultiTypeListUIType
  dropCapabilities?: MultiTypeListUIType
  privileged?: boolean
  allowPrivilegeEscalation?: boolean
  runAsNonRoot?: boolean
  readOnlyRootFilesystem?: boolean
  runAsUser?: number
  tolerations?: TolerationFormik[]
  hostNames?: MultiTypeListUIType
  initTimeout?: string
  harnessImageConnectorRef?: ConnectorRef
  os?: 'Linux' | 'MacOS' | 'Windows'
}

export const getModifiedFormikValues = (
  values: StepGroupFormikValues,
  isContainerBasedExecutionEnabled: boolean
): K8sDirectInfraStepGroupElementConfig => {
  if (isContainerBasedExecutionEnabled) {
    let addCapabilities
    if (values.addCapabilities && !isEmpty(values.addCapabilities)) {
      addCapabilities =
        typeof values.addCapabilities === 'string'
          ? (values.addCapabilities as any)
          : (values.addCapabilities as ListUIType)?.map((capability: { id: string; value: string }) => capability.value)
    }

    let dropCapabilities
    if (values.dropCapabilities && !isEmpty(values.dropCapabilities)) {
      dropCapabilities =
        typeof values.dropCapabilities === 'string'
          ? (values.dropCapabilities as any)
          : (values.dropCapabilities as ListUIType)?.map(
              (capability: { id: string; value: string }) => capability.value
            )
    }

    const containerSecurityContext: SecurityContext = {
      capabilities:
        addCapabilities || dropCapabilities
          ? {
              add: addCapabilities,
              drop: dropCapabilities
            }
          : undefined,
      privileged: values.privileged,
      allowPrivilegeEscalation: values.allowPrivilegeEscalation,
      runAsNonRoot: values.runAsNonRoot,
      readOnlyRootFilesystem: values.readOnlyRootFilesystem,
      runAsUser: values.runAsUser
    }

    const isContainerSecurityContextDefined =
      containerSecurityContext &&
      !isEmpty(containerSecurityContext) &&
      Object.keys(containerSecurityContext).filter(
        currKey => !!containerSecurityContext[currKey as keyof SecurityContext]
      ).length

    let sharedPaths
    if (values.sharedPaths && !isEmpty(values.sharedPaths)) {
      sharedPaths =
        typeof values.sharedPaths === 'string'
          ? values.sharedPaths
          : values.sharedPaths.map((listValue: { id: string; value: string }) => listValue.value)
    }

    let labels
    if (values.labels && !isEmpty(values.labels)) {
      labels = values.labels.reduce(
        (agg: { [key: string]: string }, listValue: { key: string; value: string }) => ({
          ...agg,
          [listValue.key]: listValue.value
        }),
        {}
      )
    }

    let annotations
    if (values.annotations && !isEmpty(values.annotations)) {
      annotations = values.annotations.reduce(
        (agg: { [key: string]: string }, listValue: { key: string; value: string }) => ({
          ...agg,
          [listValue.key]: listValue.value
        }),
        {}
      )
    }

    let nodeSelector
    if (values.nodeSelector && !isEmpty(values.nodeSelector)) {
      nodeSelector = values.nodeSelector.reduce(
        (agg: { [key: string]: string }, listValue: { key: string; value: string }) => ({
          ...agg,
          [listValue.key]: listValue.value
        }),
        {}
      )
    }

    let tolerations
    if (values.tolerations && !isEmpty(values.tolerations)) {
      tolerations =
        typeof values.tolerations === 'string'
          ? values.tolerations
          : values.tolerations.map(({ id, ...rest }) => ({
              ...rest
            }))
    }

    let hostNames
    if (values.hostNames && !isEmpty(values.hostNames)) {
      hostNames =
        typeof values.hostNames === 'string'
          ? (values.hostNames as any)
          : values.hostNames?.map((hostName: { id: string; value: string }) => hostName.value)
    }

    return {
      ...values,
      sharedPaths,
      stepGroupInfra: {
        type: 'KubernetesDirect',
        spec: {
          connectorRef: ((values.connectorRef as ConnectorSelectedValue)?.value || values?.connectorRef) as string,
          namespace: defaultTo(values.namespace, ''),
          volumes: values.volumes as any,
          serviceAccountName: values.serviceAccountName,
          initTimeout: values.initTimeout,
          labels: labels as any,
          annotations: annotations as any,
          nodeSelector: nodeSelector as any,
          automountServiceAccountToken: values.automountServiceAccountToken,
          priorityClassName: values.priorityClassName,
          tolerations,
          containerSecurityContext: isContainerSecurityContextDefined ? containerSecurityContext : undefined,
          harnessImageConnectorRef: ((values.harnessImageConnectorRef as ConnectorSelectedValue)?.value ||
            values?.harnessImageConnectorRef) as string,
          hostNames: hostNames
        }
      }
    }
  }

  return values
}

// Object to extract ContainerStepGroupFormik keys
export const dummyContainerSGValue: ContainerStepGroupFormikValues = {
  type: 'KubernetesDirect',
  sharedPaths: '',
  connectorRef: '',
  namespace: '',
  volumes: '',
  annotations: [],
  labels: [],
  nodeSelector: [],
  serviceAccountName: '',
  automountServiceAccountToken: false,
  priorityClassName: '',
  addCapabilities: '',
  dropCapabilities: '',
  privileged: false,
  allowPrivilegeEscalation: false,
  runAsNonRoot: false,
  readOnlyRootFilesystem: false,
  runAsUser: 0,
  tolerations: [],
  hostNames: '',
  initTimeout: '',
  harnessImageConnectorRef: '',
  os: 'Linux'
}
