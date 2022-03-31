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
    if ($container.current) {
      const node = $container.current;
      const handler = debounce(scrollHandler, 50);
      node.addEventListener('scroll', handler);
      // return () => node?.removeEventListener('scroll', handler) || null;
    }
    // return () => null;
  }, [scrollHandler, $container]);

  return {
    initIndex,
    $container,
    offset,
  };
};

export default useVisibleIndex;
