import { UseGetMockData, UseMutateMockData } from '@modules/10-common/utils/testUtils'
import { ResponseOrganizationResponse, ResponseProjectResponse } from 'services/cd-ng'

export const projectMockData: UseGetMockData<ResponseProjectResponse> = {
  data: {
    status: 'SUCCESS',
    data: {
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test modified',
        color: '#0063F7',
        modules: ['CD', 'CV'],
        description: 'refetch returns new data',
        tags: {}
      },
      isFavorite: false
    },
    metaData: undefined,
    correlationId: '88124a30-e021-4890-8466-c2345e1d42d6'
  }
}

export const editOrgMockData: UseGetMockData<ResponseOrganizationResponse> = {
  data: {
    status: 'SUCCESS',
    data: {
      organization: {
        identifier: 'testOrg',
        name: 'Org Name',
        description: 'Description',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '9f77f74d-c4ab-44a2-bfea-b4545c6a4a39'
  }
}

export const createMockData: UseMutateMockData<ResponseProjectResponse> = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        project: {
          orgIdentifier: 'default',
          identifier: 'dummy_name',
          name: 'dummy name',
          color: '#0063F7',
          modules: [],
          description: '',
          tags: {}
        },
        isFavorite: false
      },
      metaData: undefined,
      correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
    }
  },
  loading: false
}

export const editMockData: UseMutateMockData<ResponseProjectResponse> = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        project: {
          orgIdentifier: 'testOrg',
          identifier: 'test',
          name: 'dummy name',
          color: '#e6b800',
          modules: ['CD'],
          description: 'test',
          tags: { tag1: '', tag2: 'tag3' }
        },
        isFavorite: false
      },
      metaData: undefined,
      correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
    }
  },
  loading: false
}
