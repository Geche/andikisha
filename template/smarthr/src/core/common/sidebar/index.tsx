"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  setExpandMenu,
  setMobileSidebar,
} from "@/core/data/redux/sidebarSlice";
import { SidebarDataTest } from "@/core/data/json/sidebarMenu";
import { AppDispatch, useAppSelector } from "@/core/data/redux/store";
import { all_routes } from "@/routes/all_routes";
import ImageWithBasePath from "../imageWithBasePath";
import { useDispatch } from "react-redux";
import { setDataLayout } from "@/core/data/redux/themeSettingSlice";

// Define flexible types for sidebar data
interface SidebarMenuItem {
  label: string;
  link: string;
  submenu?: boolean;
  showSubRoute?: boolean;
  icon: string;
  base?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  materialicons?: string;
  dot?: boolean;
  submenuItems?: SidebarMenuItem[];
  links?: string[];
  relatedRoutes?: string[];
  themeSetting?: boolean;
  changeLogVersion?: boolean;
  customSubmenuTwo?: boolean;
  newBadge?: boolean;
  target?: string;
}

interface SidebarMainMenu {
  tittle: string;
  icon: string;
  showAsTab: boolean;
  separateRoute: boolean;
  submenuItems: SidebarMenuItem[];
}

const Sidebar = React.memo(() => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const [subOpen, setSubopen] = useState<string>("");
  const [subsidebar, setSubsidebar] = useState<string>("");
  const [subThree, setSubThree] = useState<string>("");

  // Helper function to check if item matches current path (link or any base)
  const isItemMatchingPath = useCallback(
    (item: SidebarMenuItem): boolean => {
      if (item.link === pathname) return true;
      if (item.base === pathname) return true;
      if (item.base2 === pathname) return true;
      if (item.base3 === pathname) return true;
      if (item.base4 === pathname) return true;
      if (item.base5 === pathname) return true;
      if (item.base6 === pathname) return true;
      // Also check if pathname starts with base (for nested routes)
      if (item.base && pathname.startsWith(item.base)) return true;
      return false;
    },
    [pathname],
  );

  // Helper function to recursively check if any child link is active
  const isChildActive = useCallback(
    (items: SidebarMenuItem[] | undefined): boolean => {
      if (!items) return false;
      return items.some((item) => {
        if (isItemMatchingPath(item)) return true;
        if (item.submenuItems) {
          return isChildActive(item.submenuItems);
        }
        return false;
      });
    },
    [pathname, isItemMatchingPath],
  );

  // Helper function to find the parent menu label for active child
  const findActiveParent = useCallback(
    (menuData: SidebarMainMenu[]): string => {
      for (const mainMenu of menuData) {
        for (const item of mainMenu.submenuItems || []) {
          if (isItemMatchingPath(item)) return item.label;
          if (item.submenuItems && isChildActive(item.submenuItems)) {
            return item.label;
          }
        }
      }
      return "";
    },
    [isItemMatchingPath, isChildActive],
  );

  // Helper function to find the second level submenu label for active child
  const findActiveSubsidebar = useCallback(
    (menuData: SidebarMainMenu[]): string => {
      for (const mainMenu of menuData) {
        for (const item of mainMenu.submenuItems || []) {
          if (item.submenuItems) {
            for (const subItem of item.submenuItems) {
              if (isItemMatchingPath(subItem)) return subItem.label;
              if (subItem.submenuItems && isChildActive(subItem.submenuItems)) {
                return subItem.label;
              }
            }
          }
        }
      }
      return "";
    },
    [isItemMatchingPath, isChildActive],
  );

  // Helper function to find the third level submenu label for active child
  const findActiveSubThree = useCallback(
    (menuData: SidebarMainMenu[]): string => {
      for (const mainMenu of menuData) {
        for (const item of mainMenu.submenuItems || []) {
          if (item.submenuItems) {
            for (const subItem of item.submenuItems) {
              if (subItem.submenuItems) {
                for (const subSubItem of subItem.submenuItems) {
                  if (isItemMatchingPath(subSubItem)) return subSubItem.label;
                  if (
                    subSubItem.submenuItems &&
                    isChildActive(subSubItem.submenuItems)
                  ) {
                    return subSubItem.label;
                  }
                }
              }
            }
          }
        }
      }
      return "";
    },
    [isItemMatchingPath, isChildActive],
  );

  // Toggle first level menu
  const toggleSidebar = useCallback((title: string) => {
    setSubopen((prev) => (prev === title ? "" : title));
  }, []);

  // Toggle second level menu
  const toggleSubsidebar = useCallback((subitem: string) => {
    setSubsidebar((prev) => (prev === subitem ? "" : subitem));
  }, []);

  // Toggle third level menu
  const toggleSubThree = useCallback((subitem: string) => {
    setSubThree((prev) => (prev === subitem ? "" : subitem));
  }, []);

  // Memoize the layout change handler
  const handleLayoutChange = useCallback(
    (layout: string) => {
      dispatch(setDataLayout(layout));
    },
    [dispatch],
  );

  // Memoize the layout class getter
  const getLayoutClass = useCallback((label: string): string => {
    switch (label) {
      case "Default":
        return "default";
      case "Mini":
        return "mini";
      case "Boxed":
        return "boxed";
      case "Dark":
        return "dark";
      case "RTL":
        return "rtl";
      case "Horizontal":
        return "horizontal";
      case "Modern":
        return "modern";
      case "Two Column":
        return "twocolumn";
      case "Hovered":
        return "hovered";
      case "Horizontal Single":
        return "horizontal-single";
      case "Horizontal Overlay":
        return "horizontal-overlay";
      case "Horizontal Box":
        return "horizontal-box";
      case "Menu Aside":
        return "horizontal-sidemenu";
      case "Transparent":
        return "transparent";
      case "Without Header":
        return "without-header";
      case "Detached":
        return "detached";
      default:
        return "";
    }
  }, []);

  // Get mobile sidebar state from Redux
  const mobileSidebar = useAppSelector(
    (state) => state.sidebarSlice.mobileSidebar,
  );

  // Handle mouse events for mini sidebar and box layout mode
  const handleMouseEnter = useCallback(() => {
    const body = document.body;
    const isMiniOrBoxMode =
      body.classList.contains("mini-sidebar") ||
      body.classList.contains("layout-box-mode");
    if (isMiniOrBoxMode && !mobileSidebar) {
      body.classList.add("expand-menu");
      dispatch(setExpandMenu(true));
    }
  }, [dispatch, mobileSidebar]);

  const handleMouseLeave = useCallback(() => {
    const body = document.body;
    const isMiniOrBoxMode =
      body.classList.contains("mini-sidebar") ||
      body.classList.contains("layout-box-mode");
    if (isMiniOrBoxMode && !mobileSidebar) {
      body.classList.remove("expand-menu");
      dispatch(setExpandMenu(false));
    }
  }, [dispatch, mobileSidebar]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const mobileBtn = document.querySelector(".mobile_btn");

      if (
        mobileSidebar &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        !mobileBtn?.contains(event.target as Node)
      ) {
        dispatch(setMobileSidebar(false));
      }
    };

    if (mobileSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.classList.add("slide-nav");
    } else {
      document.body.classList.remove("slide-nav");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("slide-nav");
    };
  }, [mobileSidebar, dispatch]);

  // Initialize mini-sidebar state from localStorage
  useEffect(() => {
    const miniSidebar = localStorage.getItem("miniSidebar") === "true";
    const body = document.body;

    if (miniSidebar) {
      body.classList.add("mini-sidebar");
    } else {
      body.classList.remove("mini-sidebar");
    }
  }, []);

  // Auto-expand menus when child is active on route change
  useEffect(() => {
    const activeParent = findActiveParent(SidebarDataTest as SidebarMainMenu[]);
    const activeSubsidebar = findActiveSubsidebar(
      SidebarDataTest as SidebarMainMenu[],
    );
    const activeSubThree = findActiveSubThree(
      SidebarDataTest as SidebarMainMenu[],
    );

    if (activeParent) {
      setSubopen(activeParent);
    }
    if (activeSubsidebar) {
      setSubsidebar(activeSubsidebar);
    }
    if (activeSubThree) {
      setSubThree(activeSubThree);
    }
  }, [pathname, findActiveParent, findActiveSubsidebar, findActiveSubThree]);

  return (
    <>
      <div
        className={`sidebar ${mobileSidebar ? "show" : ""}`}
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
        <div className="modern-profile p-3 pb-0">
          <div className="text-center rounded bg-light p-3 mb-4 user-profile">
            <div className="avatar avatar-lg online mb-3">
              <ImageWithBasePath
                src="assets/img/profiles/avatar-02.jpg"
                alt="Img"
                className="img-fluid rounded-circle"
              />
            </div>
            <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
            <p className="fs-10">System Admin</p>
          </div>
          <div className="sidebar-nav mb-3">
            <ul
              className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified bg-transparent"
              role="tablist"
            >
              <li className="nav-item">
                <Link className="nav-link active border-0" href="#">
                  Menu
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link border-0" href="#">
                  Chats
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link border-0" href="#">
                  Inbox
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="sidebar-header p-3 pb-0 pt-2">
          <div className="text-center rounded bg-light p-2 mb-4 sidebar-profile d-flex align-items-center">
            <div className="avatar avatar-md onlin">
              <ImageWithBasePath
                src="assets/img/profiles/avatar-02.jpg"
                alt="Img"
                className="img-fluid rounded-circle"
              />
            </div>
            <div className="text-start sidebar-profile-info ms-2">
              <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
              <p className="fs-10">System Admin</p>
            </div>
          </div>
          <div className="input-group input-group-flat d-inline-flex mb-4">
            <span className="input-icon-addon">
              <i className="ti ti-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search in HRMS"
            />
            <span className="input-group-text">
              <kbd>CTRL + / </kbd>
            </span>
          </div>
          <div className="d-flex align-items-center justify-content-between menu-item mb-3">
            <div className="me-3">
              <Link href="#" className="btn btn-menubar position-relative">
                <i className="ti ti-shopping-bag"></i>
                <span className="badge bg-success rounded-pill d-flex align-items-center justify-content-center header-badge">
                  5
                </span>
              </Link>
            </div>
            <div className="me-3">
              <Link href="#" className="btn btn-menubar">
                <i className="ti ti-layout-grid-remove"></i>
              </Link>
            </div>
            <div className="me-3">
              <Link href="#" className="btn btn-menubar position-relative">
                <i className="ti ti-brand-hipchat"></i>
                <span className="badge bg-info rounded-pill d-flex align-items-center justify-content-center header-badge">
                  5
                </span>
              </Link>
            </div>
            <div className="me-3 notification-item">
              <Link href="#" className="btn btn-menubar position-relative me-1">
                <i className="ti ti-bell"></i>
                <span className="notification-status-dot"></span>
              </Link>
            </div>
            <div className="me-0">
              <Link href="#" className="btn btn-menubar">
                <i className="ti ti-settings"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="slimScrollDiv">
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {(SidebarDataTest as SidebarMainMenu[])?.map(
                  (mainMenu: SidebarMainMenu, index: number) => (
                    <React.Fragment key={`main-${index}`}>
                      <li className="menu-title">
                        <span>{mainMenu?.tittle}</span>
                      </li>
                      <li>
                        <ul>
                          {mainMenu?.submenuItems?.map(
                            (data: SidebarMenuItem, i: number) => {
                              const hasSubmenu =
                                data?.submenu &&
                                data?.submenuItems &&
                                data.submenuItems.length > 0;
                              const isActive =
                                isItemMatchingPath(data) ||
                                isChildActive(data?.submenuItems);
                              const isOpen = subOpen === data?.label;

                              // Active class logic:
                              // - Add 'active' to <a> when has submenu and has active child
                              // - Add 'active' to <li> when NO submenu and link is active
                              return (
                                <li
                                  className={`${hasSubmenu ? "submenu" : ""} ${!hasSubmenu && isItemMatchingPath(data) ? "active" : ""}`}
                                  key={`title-${i}`}
                                >
                                  {data?.target ? (
                                    <a
                                      href={hasSubmenu ? "#" : data?.link || "#"}
                                      target={data.target}
                                      onClick={(e) => {
                                        if (hasSubmenu) {
                                          e.preventDefault();
                                          toggleSidebar(data?.label);
                                        }
                                        if (data?.themeSetting) {
                                          handleLayoutChange(
                                            getLayoutClass(data?.label),
                                          );
                                        }
                                      }}
                                      className={`${hasSubmenu && isOpen ? "subdrop" : ""} ${hasSubmenu && isActive ? "active" : ""}`}
                                    >
                                      <i className={`ti ti-${data.icon}`}></i>
                                      <span>{data?.label}</span>
                                      {data?.dot && (
                                        <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                          Hot
                                        </span>
                                      )}
                                      {data?.newBadge && (
                                        <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                          New
                                        </span>
                                      )}
                                      {data?.changeLogVersion && (
                                        <span className="badge bg-pink badge-xs text-white fs-10 ms-s">
                                          v1.6.2
                                        </span>
                                      )}
                                      {hasSubmenu && (
                                        <span className="menu-arrow" />
                                      )}
                                    </a>
                                  ) : (
                                    <Link
                                      href={hasSubmenu ? "#" : data?.link || "#"}
                                      onClick={(e:any) => {
                                        if (hasSubmenu) {
                                          e.preventDefault();
                                          toggleSidebar(data?.label);
                                        }
                                        if (data?.themeSetting) {
                                          handleLayoutChange(
                                            getLayoutClass(data?.label),
                                          );
                                        }
                                      }}
                                      className={`${hasSubmenu && isOpen ? "subdrop" : ""} ${hasSubmenu && isActive ? "active" : ""}`}
                                    >
                                      <i className={`ti ti-${data.icon}`}></i>
                                      <span>{data?.label}</span>
                                      {data?.dot && (
                                        <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                          Hot
                                        </span>
                                      )}
                                      {data?.newBadge && (
                                        <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                          New
                                        </span>
                                      )}
                                      {data?.changeLogVersion && (
                                        <span className="badge bg-pink badge-xs text-white fs-10 ms-s">
                                          v1.6.2
                                        </span>
                                      )}
                                      {hasSubmenu && (
                                        <span className="menu-arrow" />
                                      )}
                                    </Link>
                                  )}
                                  {hasSubmenu && (
                                    <ul
                                      style={{
                                        display: isOpen ? "block" : "none",
                                      }}
                                    >
                                      {data?.submenuItems?.map(
                                        (item: SidebarMenuItem, j: number) => {
                                          const hasSubSubmenu =
                                            item?.submenu &&
                                            item?.submenuItems &&
                                            item.submenuItems.length > 0;
                                          const isItemActive =
                                            isItemMatchingPath(item) ||
                                            isChildActive(item?.submenuItems);
                                          const isSubOpen =
                                            subsidebar === item?.label;

                                          return (
                                            <li
                                              className={
                                                hasSubSubmenu
                                                  ? "submenu submenu-two"
                                                  : ""
                                              }
                                              key={`item-${j}`}
                                            >
                                              {item?.target ? (
                                                <a
                                                  href={
                                                    hasSubSubmenu
                                                      ? "#"
                                                      : item?.link || "#"
                                                  }
                                                  target={item.target}
                                                  onClick={(e) => {
                                                    if (hasSubSubmenu) {
                                                      e.preventDefault();
                                                      toggleSubsidebar(
                                                        item?.label,
                                                      );
                                                    }
                                                  }}
                                                  className={`${hasSubSubmenu && isSubOpen ? "subdrop" : ""} ${isItemActive ? "active" : ""}`}
                                                >
                                                  {item.icon && (
                                                    <i
                                                      className={`ti ti-${item.icon}`}
                                                    ></i>
                                                  )}
                                                  {item?.label}
                                                  {item?.dot && (
                                                    <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                                      Hot
                                                    </span>
                                                  )}
                                                  {item.newBadge && (
                                                    <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                                      New
                                                    </span>
                                                  )}
                                                  {hasSubSubmenu && (
                                                    <span className="menu-arrow inside-submenu" />
                                                  )}
                                                </a>
                                              ) : (
                                                <Link
                                                  href={
                                                    hasSubSubmenu
                                                      ? "#"
                                                      : item?.link || "#"
                                                  }
                                                  onClick={(e:any) => {
                                                    if (hasSubSubmenu) {
                                                      e.preventDefault();
                                                      toggleSubsidebar(
                                                        item?.label,
                                                      );
                                                    }
                                                  }}
                                                  className={`${hasSubSubmenu && isSubOpen ? "subdrop" : ""} ${isItemActive ? "active" : ""}`}
                                                >
                                                  {item.icon && (
                                                    <i
                                                      className={`ti ti-${item.icon}`}
                                                    ></i>
                                                  )}
                                                  {item?.label}
                                                  {item?.dot && (
                                                    <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                                      Hot
                                                    </span>
                                                  )}
                                                  {item.newBadge && (
                                                    <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                                                      New
                                                    </span>
                                                  )}
                                                  {hasSubSubmenu && (
                                                    <span className="menu-arrow inside-submenu" />
                                                  )}
                                                </Link>
                                              )}
                                              {hasSubSubmenu && (
                                                <ul
                                                  style={{
                                                    display: isSubOpen
                                                      ? "block"
                                                      : "none",
                                                  }}
                                                >
                                                  {item?.submenuItems?.map(
                                                    (
                                                      subItem: SidebarMenuItem,
                                                      k: number,
                                                    ) => {
                                                      const hasSubSubSubmenu =
                                                        subItem?.submenu &&
                                                        subItem?.submenuItems &&
                                                        subItem.submenuItems
                                                          .length > 0;
                                                      const isSubItemActive =
                                                        isItemMatchingPath(
                                                          subItem,
                                                        ) ||
                                                        isChildActive(
                                                          subItem?.submenuItems,
                                                        );
                                                      const isSubThreeOpen =
                                                        subThree ===
                                                        subItem?.label;

                                                      return (
                                                        <li
                                                          className={
                                                            hasSubSubSubmenu
                                                              ? "submenu submenu-two submenu-three"
                                                              : ""
                                                          }
                                                          key={`subitem-${k}`}
                                                        >
                                                          {subItem?.target ? (
                                                            <a
                                                              href={
                                                                hasSubSubSubmenu
                                                                  ? "#"
                                                                  : subItem?.link ||
                                                                    "#"
                                                              }
                                                              target={subItem.target}
                                                              onClick={(e) => {
                                                                if (
                                                                  hasSubSubSubmenu
                                                                ) {
                                                                  e.preventDefault();
                                                                  toggleSubThree(
                                                                    subItem?.label,
                                                                  );
                                                                }
                                                              }}
                                                              className={`${hasSubSubSubmenu && isSubThreeOpen ? "subdrop" : ""} ${isSubItemActive ? "active" : ""}`}
                                                            >
                                                              {subItem.icon && (
                                                                <i
                                                                  className={`ti ti-${subItem.icon}`}
                                                                ></i>
                                                              )}
                                                              <span>
                                                                {subItem?.label}
                                                              </span>
                                                              {hasSubSubSubmenu && (
                                                                <span className="menu-arrow inside-submenu inside-submenu-two" />
                                                              )}
                                                            </a>
                                                          ) : (
                                                            <Link
                                                              href={
                                                                hasSubSubSubmenu
                                                                  ? "#"
                                                                  : subItem?.link ||
                                                                    "#"
                                                              }
                                                              onClick={(e:any) => {
                                                                if (
                                                                  hasSubSubSubmenu
                                                                ) {
                                                                  e.preventDefault();
                                                                  toggleSubThree(
                                                                    subItem?.label,
                                                                  );
                                                                }
                                                              }}
                                                              className={`${hasSubSubSubmenu && isSubThreeOpen ? "subdrop" : ""} ${isSubItemActive ? "active" : ""}`}
                                                            >
                                                              {subItem.icon && (
                                                                <i
                                                                  className={`ti ti-${subItem.icon}`}
                                                                ></i>
                                                              )}
                                                              <span>
                                                                {subItem?.label}
                                                              </span>
                                                              {hasSubSubSubmenu && (
                                                                <span className="menu-arrow inside-submenu inside-submenu-two" />
                                                              )}
                                                            </Link>
                                                          )}
                                                          {hasSubSubSubmenu && (
                                                            <ul
                                                              style={{
                                                                display:
                                                                  isSubThreeOpen
                                                                    ? "block"
                                                                    : "none",
                                                              }}
                                                            >
                                                              {subItem?.submenuItems?.map(
                                                                (
                                                                  subSubItem: SidebarMenuItem,
                                                                  l: number,
                                                                ) => {
                                                                  const isSubSubItemActive =
                                                                    isItemMatchingPath(
                                                                      subSubItem,
                                                                    );
                                                                  return (
                                                                    <li
                                                                      key={`subsubitem-${l}`}
                                                                    >
                                                                      <Link
                                                                        href={
                                                                          subSubItem?.link ||
                                                                          "#"
                                                                        }
                                                                        className={
                                                                          isSubSubItemActive
                                                                            ? "active"
                                                                            : ""
                                                                        }
                                                                      >
                                                                        {subSubItem.icon && (
                                                                          <i
                                                                            className={`ti ti-${subSubItem.icon}`}
                                                                          ></i>
                                                                        )}
                                                                        <span>
                                                                          {
                                                                            subSubItem?.label
                                                                          }
                                                                        </span>
                                                                      </Link>
                                                                    </li>
                                                                  );
                                                                },
                                                              )}
                                                            </ul>
                                                          )}
                                                        </li>
                                                      );
                                                    },
                                                  )}
                                                </ul>
                                              )}
                                            </li>
                                          );
                                        },
                                      )}
                                    </ul>
                                  )}
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </li>
                    </React.Fragment>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
