/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { AllowedTypes, Button, ButtonSize, ButtonVariation, Layout, StepProps } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type {
  ConfigFileWrapper,
  ConnectorConfigDTO,
  NGServiceConfig,
  NGServiceV2InfoConfig,
  ServiceDefinition,
  ServiceResponse
} from 'services/cd-ng'
import { ConfigFilesWizard } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesWizard'
import {
  ConfigFileIconByType,
  ConfigFilesMap,
  FILE_TYPE_VALUES
} from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { HarnessConfigStep } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/HarnessConfigStep'
import type { ConfigFileType } from '@pipeline/components/ConfigFilesSelection/ConfigFilesInterface'
import ServiceConfigFileOverridesList from './ServiceConfigFileOverridesList'
import css from '../ServiceManifestOverride/ServiceManifestOverride.module.scss'

interface ConfigFileDefaultValueType {
  store: ConfigFileType
  files: string[]
  identifier: string
  fileType: FILE_TYPE_VALUES
}
interface ServiceConfigFileOverrideProps {
  fileOverrides: ConfigFileWrapper[]
  isReadonly: boolean
  allowableTypes: AllowedTypes
  handleConfigFileOverrideSubmit: (val: ConfigFileWrapper, index: number) => void
  handleServiceFileDelete: (index: number) => void
  expressions: string[]
  selectedService?: string
  serviceList?: ServiceResponse[]
}
const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}
function ServiceConfigFileOverride({
  fileOverrides,
  selectedService,
  serviceList,
  isReadonly,
  expressions,
  handleConfigFileOverrideSubmit,
  handleServiceFileDelete,
  allowableTypes
}: ServiceConfigFileOverrideProps): React.ReactElement {
  const { getString } = useStrings()
  const [fileIndex, setEditIndex] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)

  const getServiceYaml = useCallback((): NGServiceV2InfoConfig => {
    const serviceSelected = serviceList?.find(serviceObj => serviceObj.service?.identifier === selectedService)
    if (serviceSelected) {
      return yamlParse<NGServiceConfig>(defaultTo(serviceSelected?.service?.yaml, '')).service as NGServiceV2InfoConfig
    }
    return {} as NGServiceV2InfoConfig
  }, [selectedService, serviceList])

  const getServiceConfigFiles = useCallback((): ConfigFileWrapper[] => {
    if (!isEmpty(selectedService)) {
      const parsedServiceYaml = getServiceYaml()
      return defaultTo(parsedServiceYaml?.serviceDefinition?.spec?.configFiles, [])
    }
    return []
  }, [getServiceYaml, selectedService])

  const getDeploymentType = (): ServiceDefinition['type'] => {
    const parsedServiceYaml = getServiceYaml()
    return defaultTo(parsedServiceYaml?.serviceDefinition?.type, '') as ServiceDefinition['type']
  }

  const createNewFileOverride = useCallback((): void => {
    setEditIndex(fileOverrides.length)
    showModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileOverrides.length])

  const editFileOverride = useCallback(
    (index: number): void => {
      setEditIndex(index)
      setIsEditMode(true)
      showModal()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleSubmit = useCallback(
    (filesObj: ConfigFileWrapper): void => {
      hideModal()
      setIsEditMode(false)
      handleConfigFileOverrideSubmit(filesObj, fileIndex)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileIndex]
  )

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    return [
      <HarnessConfigStep
        key="harnessConfigFile"
        isEditMode={isEditMode}
        stepName={getString('pipeline.configFiles.title', { type: 'Details' })}
        name={getString('pipeline.configFiles.title', { type: 'Details' })}
        listOfConfigFiles={getServiceConfigFiles()}
        expressions={expressions}
        handleSubmit={handleSubmit}
      />
    ]
  }, [expressions, getServiceConfigFiles, getString, handleSubmit, isEditMode])

  const getInitialValues = useCallback((): ConfigFileDefaultValueType => {
    if (isEditMode) {
      const initValues = get(fileOverrides[fileIndex], 'configFile.spec.store.spec', null)
      let files, fileType
      if (get(fileOverrides[fileIndex], 'configFile.spec.store.spec.secretFiles', []).length > 0) {
        files = get(fileOverrides[fileIndex], 'configFile.spec.store.spec.secretFiles', [''])
        fileType = FILE_TYPE_VALUES.ENCRYPTED
      } else {
        files = get(fileOverrides[fileIndex], 'configFile.spec.store.spec.files', [''])
        fileType = FILE_TYPE_VALUES.FILE_STORE
      }
      return {
        ...initValues,
        store: fileOverrides?.[fileIndex]?.configFile?.spec?.store?.type,
        identifier: get(fileOverrides[fileIndex], 'configFile.identifier', ''),
        files: defaultTo(files, ['']),
        secretFiles: get(fileOverrides[fileIndex], 'configFile.spec.store.spec.secretFiles', ['']),
        fileType
      }
    }
    return {
      store: ConfigFilesMap.Harness,
      files: [''],
      identifier: '',
      fileType: FILE_TYPE_VALUES.FILE_STORE
    }
  }, [fileIndex, fileOverrides, isEditMode])

  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      hideModal()
      setEditIndex(0)
      setIsEditMode(false)
    }
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS}>
        <div className={css.createConnectorWizard}>
          <ConfigFilesWizard
            types={[ConfigFilesMap.Harness]}
            expressions={expressions}
            allowableTypes={allowableTypes}
            isReadonly={isReadonly}
            iconsProps={{
              name: ConfigFileIconByType.Harness
            }}
            configFileIndex={fileIndex}
            deploymentType={getDeploymentType()}
            initialValues={getInitialValues()}
            lastSteps={getLastSteps()}
            isNewFile={!isEditMode}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [expressions, allowableTypes, fileIndex, isEditMode, isReadonly])

  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
      <ServiceConfigFileOverridesList
        configFileOverrideList={fileOverrides}
        isReadonly={isReadonly}
        editFileOverride={editFileOverride}
        handleServiceFileDelete={handleServiceFileDelete}
      />
      <RbacButton
        text={getString('common.plusNewName', { name: getString('common.override') })}
        size={ButtonSize.SMALL}
        variation={ButtonVariation.LINK}
        permission={{
          resource: {
            resourceType: ResourceType.ENVIRONMENT
          },
          permission: PermissionIdentifier.EDIT_ENVIRONMENT
        }}
        onClick={createNewFileOverride}
      />
    </Layout.Vertical>
  )
}

export default ServiceConfigFileOverride
