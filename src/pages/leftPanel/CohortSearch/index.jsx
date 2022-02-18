import React, { useCallback, useEffect, useState } from 'react';
import Apis from '../../../api/apis';
import { post } from '../../../api/tools';
import { fetchCohortsAsync } from '../../../reducer/cohortsSlice';
import { useAppDispatch } from '../../../store/hooks';
import CohortSearcherPanel from './CohortSearchPanel';

const SearchPanel = () => {
  const dispatch = useAppDispatch();
  const [searcherOptions, setSearcherOptions] = useState({});

  const onSubmitCondition = useCallback((condition)=> {
    dispatch(fetchCohortsAsync(condition))
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
    />
  )
};

export default SearchPanel;