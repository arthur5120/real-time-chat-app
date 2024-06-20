import { useState, useEffect } from 'react';

export const useMountEffect = (effect : Function) => {

  const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   if (!mounted) {
  //     effect()
  //     setMounted(true)
  //   }
  // }, [mounted])

  return
}