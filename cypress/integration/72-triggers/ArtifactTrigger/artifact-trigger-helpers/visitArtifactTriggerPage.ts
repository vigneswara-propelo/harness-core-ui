import { visitTriggerPage } from '../../triggers-helpers/visitTriggersPage'

export const visitArtifactTriggerPage = ({ identifier, yaml }: { identifier: string; yaml: string }): void => {
  visitTriggerPage({ identifier, type: 'Artifact', yaml })
}
