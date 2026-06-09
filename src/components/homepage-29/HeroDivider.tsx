'use client';

import { useDividerExpand } from '@/hooks/useDividerExpand';

const HeroDivider = () => {
  const dividerRef = useDividerExpand();
  return <div className="h-[1px] bg-stroke-1 dark:bg-stroke-5 w-0" ref={dividerRef} />;
};

export default HeroDivider;
