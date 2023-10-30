import { DefaultNewPipelineId, RouteState } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { EntityGitDetails } from 'services/cd-ng'
import { getId, getRepoIdentifierName } from '@pipeline/components/PipelineStudio/PipelineContext/utils'
import { IDB } from '@modules/10-common/components/IDBContext/IDBContext'

export const deletePipelineFromIDB = async <T = unknown>({
  routeState,
  identifier,
  gitDetails,
  idb
}: {
  routeState: RouteState
  identifier: string
  gitDetails?: EntityGitDetails
  idb: IDB<T>
}): Promise<void> => {
  const id = getId(
    routeState.accountIdentifier,
    routeState.orgIdentifier || '',
    routeState.projectIdentifier || '',
    identifier,
    getRepoIdentifierName(gitDetails),
    gitDetails?.branch || ''
  )
  await idb.del(id)

  const defaultId = getId(
    routeState.accountIdentifier,
    routeState.orgIdentifier || '',
    routeState.projectIdentifier || '',
    DefaultNewPipelineId,
    getRepoIdentifierName(gitDetails),
    gitDetails?.branch || ''
  )
  await idb.del(defaultId)
}
