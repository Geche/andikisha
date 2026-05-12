"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDataLayout } from "@/core/data/redux/themeSettingSlice";
import { setMiniSidebar, setMobileSidebar } from "@/core/data/redux/sidebarSlice";

const ThemeInitializer: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  
  // Get all theme settings from Redux
  const {
    dataTheme,
    dataLayout,
    dataWidth,
    dataCard,
    dataSidebar,
    dataTopBar,
    dataTopBarColor,
    dataColor,
    dataLoader,
    dataSidebarBg,
    dataTopbarBg,
    isRtl,
    dataSize,
  } = useSelector((state: any) => state.themeSetting);

  // Handle mini sidebar toggle from header
  const handleMiniSidebar = useCallback(() => {
    const newLayout = (dataLayout === 'mini' || dataLayout === 'collapsed' || dataLayout === 'mini_layout') ? 'default' : 'mini';
    dispatch(setDataLayout(newLayout));
  }, [dataLayout, dispatch]);

  // Set isClient to true on component mount and set up event listeners
  useEffect(() => {
    setIsClient(true);
    
    // Initialize layout from localStorage if available
    const savedLayout = localStorage.getItem('dataLayout');
    if (savedLayout) {
      dispatch(setDataLayout(savedLayout));
    }
    
    // Initialize mobile sidebar state
    const handleResize = () => {
      dispatch(setMobileSidebar(window.innerWidth < 992));
    };
    
    // Set initial state and add event listener
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Expose the function to window for header toggles
    (window as any).handleMiniSidebar = handleMiniSidebar;
    
    return () => {
      window.removeEventListener('resize', handleResize);
      delete (window as any).handleMiniSidebar;
    };
  }, [dispatch, handleMiniSidebar]);

  // Handle theme and layout changes
  useEffect(() => {
    if (!isClient) return; // Don't run on server-side

    console.log('ThemeInitializer: dataLayout changed to:', dataLayout);
    const doc = document.documentElement;
    const body = document.body;
    
    // Set document element attributes
    doc.setAttribute("data-theme", dataTheme === "dark" ? "dark" : "light");
    doc.setAttribute("data-layout", dataLayout);
    doc.setAttribute("data-width", dataWidth);
    doc.setAttribute("data-card", dataCard);
    doc.setAttribute("data-sidebar", dataSidebar);
    doc.setAttribute("data-topbar", dataTopBar);
    doc.setAttribute("data-topbarcolor", dataTopBarColor);
    doc.setAttribute("data-color", dataColor);
    doc.setAttribute("data-loader", dataLoader);
    doc.setAttribute("data-size", dataSize);
    
    // Handle body classes - remove all layout-related classes first
    body.classList.remove("menu-horizontal", "layout-mode-rtl", "mini-sidebar", "layout-box-mode");
    
    // Handle layout-specific body classes
    if (dataLayout === "mini") {
      console.log('ThemeInitializer: Adding mini-sidebar class for data-layout:', dataLayout);
      body.classList.add("mini-sidebar");
      console.log('ThemeInitializer: mini-sidebar class added, current body classes:', body.className);
      dispatch(setMiniSidebar(true));
    } else if (dataLayout === "horizontal") {
      console.log('ThemeInitializer: Adding horizontal layout');
      body.classList.add("menu-horizontal");
      dispatch(setMiniSidebar(false));
    } else {
      console.log('ThemeInitializer: Default layout - mini-sidebar class removed');
      dispatch(setMiniSidebar(false));
    }
    
    // Handle box width mode - add layout-box-mode and mini-sidebar classes
    if (dataWidth === "box") {
      console.log('ThemeInitializer: Adding layout-box-mode and mini-sidebar for data-width: box');
      body.classList.add("layout-box-mode", "mini-sidebar");
      dispatch(setMiniSidebar(true));
    }

    // Handle dataSize-specific classes (separate from layout)
    if (dataSize === 'compact') {
      body.classList.add('mini-sidebar');
      dispatch(setMiniSidebar(true));
    }
    if (dataSize === 'hoverview') {
      body.classList.add('expand-menu');
    } else {
      body.classList.remove('expand-menu');
    }
    
    // Handle RTL
    if (isRtl === true || isRtl === 'true') {
      body.classList.add("layout-mode-rtl");
      doc.dir = 'rtl';
    } else {
      doc.dir = 'ltr';
    }
    
    // Set background attributes
    if (dataSidebarBg) {
      body.setAttribute("data-sidebarbg", dataSidebarBg);
    } else {
      body.removeAttribute("data-sidebarbg");
    }
    
    if (dataTopbarBg) {
      body.setAttribute("data-topbarbg", dataTopbarBg);
    } else {
      body.removeAttribute("data-topbarbg");
    }
    
    // Save layout to localStorage
    if (dataLayout) {
      localStorage.setItem('dataLayout', dataLayout);
    }
  }, [dataLayout, dataTheme, dataWidth, dataCard, dataSidebar, dataTopBar, 
      dataTopBarColor, dataColor, dataLoader, dataSidebarBg, dataTopbarBg, 
      isRtl, isClient, dispatch, dataSize]);

  return null; // This component doesn't render anything
};

export default ThemeInitializer;