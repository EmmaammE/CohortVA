import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from '../../../../utils/tools';

// 返回可视区域第一个元素index
const useVisibleIndex = (height: number) => {
  const $container = useRef<any>(null);
  const [initIndex, setInitIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  const scrollHandler = useCallback(() => {
    const index1 = Math.round(($container.current?.scrollTop || 0) / height);
    setInitIndex(index1);
    setOffset($container.current?.scrollTop - index1 * height);
  }, [height]);

  useEffect(() => {
    const node = $container.current;
    node?.addEventListener('scroll', scrollHandler);

    return () =>
      node?.removeEventListener('scroll', debounce(scrollHandler, 250)) || null;
  }, [scrollHandler]);

  return {
    initIndex,
    $container,
    offset,
  };
};

export default useVisibleIndex;
