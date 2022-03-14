import React, { useCallback, useEffect, useState } from 'react';
import Apis from '../../../api/apis';
import { post } from '../../../api/tools';
import { fetchCohortByRegexAsync, fetchCohortsAsync, fetchCohortByNameAsync, fetchCohortByNamesAsync} from '../../../reducer/cohortsSlice';
import { useAppDispatch } from '../../../store/hooks';
import CohortSearcherPanel from './CohortSearchPanel';

const SearchPanel = () => {
  const dispatch = useAppDispatch();
  const [searcherOptions, setSearcherOptions] = useState({});

  const onSubmitCondition = useCallback((condition)=> {
    dispatch(fetchCohortsAsync(condition))
  }, [dispatch])

  const onSubmitRegex = useCallback((regex)=> {
    dispatch(fetchCohortByRegexAsync(regex))
  }, [dispatch])

  const onSubmitName = useCallback((name)=> {
    dispatch(fetchCohortByNameAsync(name))
  }, [dispatch])

  const onSubmitFigureNames = useCallback((figureNames)=> {
    dispatch(fetchCohortByNamesAsync(figureNames))
  }, [dispatch])
  
  useEffect(()=> {
    post({
      url: Apis.init_ranges,
      data: {}
    }).then(res => {
      if(res.data && res.data.is_success) {
        setSearcherOptions(res.data);
      }
    })
    
  }, []);

  return (
    <CohortSearcherPanel 
      searcherOptions={searcherOptions}
      onSubmitCondition={onSubmitCondition}
      onSubmitRegex={onSubmitRegex}
      onSubmitName={onSubmitName}
      onSubmitFigureNames={onSubmitFigureNames}
    />
  )
};

export default SearchPanel;