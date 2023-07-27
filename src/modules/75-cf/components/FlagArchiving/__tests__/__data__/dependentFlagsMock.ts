export const dependentFlagsMock = [
  {
    archived: false,
    createdAt: 1689589483514,
    defaultOffVariation: 'false',
    defaultOnVariation: 'false',
    description: '',
    evaluation: '',
    evaluationIdentifier: '',
    identifier: 'qqq_identifier',
    kind: 'boolean' as const,
    modifiedAt: 1689675169378,
    name: 'qqq',
    owner: ['crystal.fong@harness.io'],
    permanent: false,
    prerequisites: [
      {
        feature: 'q',
        variations: ['true']
      },
      {
        feature: 'qq',
        variations: ['true']
      }
    ],
    project: 'crystaltest14july',
    services: [],
    tags: [],
    variations: []
  },
  {
    archived: false,
    createdAt: 1689334024268,
    defaultOffVariation: 'false',
    defaultOnVariation: 'false',
    description: '',
    evaluation: '',
    evaluationIdentifier: '',
    identifier: 'qq_identifier',
    kind: 'boolean' as const,
    modifiedAt: 1689334036715,
    name: 'qq',
    owner: ['crystal.fong@harness.io'],
    permanent: false,
    prerequisites: [
      {
        feature: 'q',
        variations: ['true']
      }
    ],
    project: 'crystaltest14july',
    services: [],
    tags: [],
    variations: []
  }
]

export const dependentFlagsResponse = {
  itemCount: 0,
  pageCount: 0,
  pageIndex: 0,
  pageSize: 15,
  featureCounts: {
    totalActive: 0,
    totalEnabled: 0,
    totalFeatures: 2,
    totalPermanent: 2,
    totalPotentiallyStale: 0,
    totalRecentlyAccessed: 0,
    totalArchived: 2
  },
  features: dependentFlagsMock
}

export const noDependentFlagsResponse = {
  itemCount: 0,
  pageCount: 0,
  pageIndex: 0,
  pageSize: 15,
  featureCounts: {
    totalActive: 0,
    totalEnabled: 0,
    totalFeatures: 2,
    totalPermanent: 2,
    totalPotentiallyStale: 0,
    totalRecentlyAccessed: 0,
    totalArchived: 2
  },
  features: []
}
