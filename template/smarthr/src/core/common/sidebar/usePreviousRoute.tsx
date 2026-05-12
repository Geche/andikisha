import { useEffect, useRef } from 'react';
import { usePathname } from "next/navigation";

const usePreviousRoute = () => {
  const location = usePathname();
  const previousLocation = useRef(location);

  useEffect(() => {
    previousLocation.current = location;
  }, [location]);

  return previousLocation.current;
};

export default usePreviousRoute;