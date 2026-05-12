"use client";
import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { setExpandMenu } from "../../data/redux/sidebarSlice";
import { all_routes } from "@/routes/all_routes";
import ImageWithBasePath from "../imageWithBasePath";

interface SidebarMenuItem {
  label: string;
  link: string;
  submenu?: boolean;
  icon: string;
  submenuItems?: SidebarMenuItem[];
  themeSetting?: boolean;
}

interface SidebarMainMenu {
  tittle: string;
  icon: string;
  showAsTab: boolean;
  separateRoute: boolean;
  submenuItems: SidebarMenuItem[];
}

const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [subOpen, setSubopen] = useState<string>("");

  // Toggle sidebar menu
  const toggleSidebar = useCallback((title: string) => {
    setSubopen(prev => prev === title ? "" : title);
    localStorage.setItem("menuOpened", title);
  }, []);

  // Handle mouse enter for mini sidebar
  const handleMouseEnter = useCallback(() => {
    const body = document.body;
    if (body.classList.contains('mini-sidebar')) {
      body.classList.add('expand-menu');
    }
    dispatch(setExpandMenu(true));
  }, [dispatch]);

  // Handle mouse leave for mini sidebar
  const handleMouseLeave = useCallback(() => {
    const body = document.body;
    if (body.classList.contains('mini-sidebar')) {
      body.classList.remove('expand-menu');
    }
    dispatch(setExpandMenu(false));
  }, [dispatch]);

  // Initialize mini-sidebar state from localStorage
  useEffect(() => {
    const miniSidebar = localStorage.getItem('miniSidebar') === 'true';
    const body = document.body;
    
    if (miniSidebar) {
      body.classList.add('mini-sidebar');
    } else {
      body.classList.remove('mini-sidebar');
    }
  }, []);

  // Set active menu based on current route
  useEffect(() => {
    const currentMenu = localStorage.getItem("menuOpened") || "";
    setSubopen(currentMenu);
  }, [pathname]);

  return (
    <div 
      className="sidebar" 
      id="sidebar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-logo">
        <Link href={all_routes.adminDashboard} className="logo logo-normal">
          <ImageWithBasePath src="assets/img/logo.svg" alt="Logo" />
        </Link>
        <Link href={all_routes.adminDashboard} className="logo-small">
          <ImageWithBasePath src="assets/img/logo-small.svg" alt="Logo" />
        </Link>
        <Link href={all_routes.adminDashboard} className="dark-logo">
          <ImageWithBasePath src="assets/img/logo-white.svg" alt="Logo" />
        </Link>
      </div>
      
      {/* Rest of your sidebar content */}
      
    </div>
  );
};

export default React.memo(Sidebar);
