import Apis from "./apis";
import { post } from "./tools";

// eslint-disable-next-line import/prefer-default-export
export const getCohortByName = (params) => {
  const url = Apis.get_cohort_by_figure_names;

  return post({
    url,
    data: params,
  })
}

export const getFeatureByName = (params) => {
  const url = Apis.extract_features;

  return post({
    url,
    data: params,
  })
}

export const getEventsByPeople = (params) => {
  const url = Apis.getPersonEvents;

  return post({
    url,
    data: {
      pids: params
    },
  })
}

export const getPersonId = (id) => {
  const url = Apis.getPersonId;

  return post({
    url,
    data: {
      'person_id': id
    }
  })
}