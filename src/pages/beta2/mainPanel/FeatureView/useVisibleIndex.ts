import { useCallback, useEffect, useRef, useState } from 'react';

// 返回可视区域第一个元素index
const useVisibleIndex = (height: number) => {
  const $container = useRef<any>(null);
  const [initIndex, setInitIndex] = useState(0);

  const scrollHandler = useCallback(() => {
    const index1 = Math.round(($container.current?.scrollTop || 0) / height);
    setInitIndex(index1);
  }, [height]);

  useEffect(() => {
    const node = $container.current;
    node.addEventListener('scroll', scrollHandler);

    return () => node.removeEventListener('scroll', scrollHandler) || null;
  }, [scrollHandler]);

  return {
    initIndex,
    $container,
  };
};

export default useVisibleIndex;
