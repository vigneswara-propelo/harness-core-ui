import { EntityGitDetails } from 'services/cd-ng'

export const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  pipelineIdentifier: string,
  repoIdentifier = '',
  branch = ''
): string =>
  `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${pipelineIdentifier}_${repoIdentifier}_${branch}`

export const getRepoIdentifierName = (gitDetails?: EntityGitDetails): string => {
  return gitDetails?.repoIdentifier || gitDetails?.repoName || ''
}
