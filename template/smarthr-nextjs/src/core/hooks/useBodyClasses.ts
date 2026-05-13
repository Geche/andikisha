import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useBodyClasses = () => {
  const dataLayout = useSelector((state: any) => state.themeSetting.dataLayout);
  const dataWidth = useSelector((state: any) => state.themeSetting.dataWidth);
  const isRtl = useSelector((state: any) => state.themeSetting.isRtl);

  useEffect(() => {
    const body = document.body;
    
    // Remove all layout-related classes first
    body.classList.remove("mini-sidebar");
    body.classList.remove("menu-horizontal");
    body.classList.remove("layout-mode-rtl");
    body.classList.remove("layout-box-mode");
    
    // Add classes based on layout
    if (dataLayout === "horizontal") {
      body.classList.add("menu-horizontal");
    } else if (dataLayout === "collapsed") {
      body.classList.add("mini-sidebar");
    }
    
    // Add box mode classes when dataWidth is "box"
    if (dataWidth === "box") {
      body.classList.add("layout-box-mode", "mini-sidebar");
    }
    
    // Add RTL class if RTL is enabled
    if (isRtl === true || isRtl === 'true') {
      body.classList.add("layout-mode-rtl");
    }

    // Cleanup function to remove classes when component unmounts
    return () => {
      body.classList.remove("mini-sidebar", "menu-horizontal", "layout-mode-rtl", "layout-box-mode");
    };
  }, [dataLayout, dataWidth, isRtl]);
};
