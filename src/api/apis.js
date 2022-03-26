const Apis = {
  init_ranges: '/init_ranges/',
  get_cohort_by_ranges: '/search_person_by_ranges/',
  get_cohort_by_regex: '/search_by_regex/',
  extract_features: '/extract_features/',
  get_cohort_by_name: '/search_relation_person_by_name/',
  get_cohort_by_figure_names:'/search_cohort_by_people_name/',
  findPersonInfo: 'find_person_info/',
  getPersonEvents: 'getEventsByPeople/',
  // 根据图数据库的id, 获取cbdb的id
  getPersonId: 'find_person_id_in_cbdb/'
}
  
export default Apis;