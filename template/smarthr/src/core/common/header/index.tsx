"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/core/data/redux/store";
import {
  setDataLayout,
  setHeaderCollapse,
} from "@/core/data/redux/themeSettingSlice";
import {
  setMobileSidebar,
  setExpandMenu,
  toggleMiniSidebar,
} from "../../data/redux/sidebarSlice";
import { HorizontalSidebarData } from "../../data/json/horizontalSidebar";
import React from "react";
import type {
  HorizontalMainMenu,
  HorizontalMenuItem,
  HorizontalSubMenu,
} from "../../data/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";
import ImageWithBasePath from "../imageWithBasePath";

const Header = React.memo(() => {
  const routes = all_routes;
  const dispatch = useAppDispatch();
  const dataLayout = useAppSelector((state) => state.themeSetting.dataLayout);
  const headerCollapse = useAppSelector(
    (state) => state.themeSetting.headerCollapse,
  );
  const Location = usePathname();

  const [subOpen, setSubopen] = useState<string>("");
  const [subsidebar, setSubsidebar] = useState<string>("");

  // Toggle sidebar function with localStorage persistence
  const toggleSidebar = useCallback(
    (title: string) => {
      const newSubOpen = title === subOpen ? "" : title;
      setSubopen(newSubOpen);
      localStorage.setItem("menuOpened", newSubOpen);
    },
    [subOpen],
  );

  // Memoize the toggle subsidebar function
  const toggleSubsidebar = useCallback(
    (subitem: string) => {
      if (subitem === subsidebar) {
        setSubsidebar("");
      } else {
        setSubsidebar(subitem);
      }
    },
    [subsidebar],
  );

  const mobileSidebar = useAppSelector(
    (state) => state.sidebarSlice.mobileSidebar,
  );

  // Toggle mobile sidebar function with body class toggling
  const toggleMobileSidebar = useCallback(() => {
    const newMobileSidebar = !mobileSidebar;
    dispatch(setMobileSidebar(newMobileSidebar));
    if (newMobileSidebar) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [dispatch, mobileSidebar]);

  // Separate toggle button logic - independent of theme settings
  const [isMiniSidebarActive, setIsMiniSidebarActive] = useState(false);

  const handleToggleMiniSidebar = useCallback(() => {
    const body = document.body;
    const newMiniState = !isMiniSidebarActive;

    console.log("Header Toggle: Switching mini-sidebar to:", newMiniState);

    if (newMiniState) {
      body.classList.add("mini-sidebar");
      console.log("Header Toggle: mini-sidebar class added");
    } else {
      body.classList.remove("mini-sidebar");
      console.log("Header Toggle: mini-sidebar class removed");
    }

    setIsMiniSidebarActive(newMiniState);

    // Close mobile sidebar when toggling to mini sidebar
    if (newMiniState && mobileSidebar) {
      dispatch(setMobileSidebar(false));
    }
  }, [isMiniSidebarActive, mobileSidebar, dispatch]);

  // Toggle header collapse function - separate from mini sidebar
  const handleToggleHeaderCollapse = useCallback(() => {
    const newHeaderCollapse =
      headerCollapse === "collapsed" ? "default" : "collapsed";
    dispatch(setHeaderCollapse(newHeaderCollapse));

    if (newHeaderCollapse === "collapsed") {
      document.body.classList.add("header-collapse");
    } else {
      document.body.classList.remove("header-collapse");
    }
  }, [headerCollapse, dispatch]);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Add event listeners for fullscreen and resize events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleResize = () => {
      // Close mobile menu on larger screens
      if (window.innerWidth > 991 && mobileSidebar) {
        dispatch(setMobileSidebar(false));
        document.body.classList.remove("sidebar-open");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", handleResize);

    // Let ThemeInitializer handle body classes and data-layout attributes

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch, mobileSidebar, dataLayout]);

  // Toggle fullscreen function with error handling
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) =>
          console.error("Error attempting to enable fullscreen:", err),
        );
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) =>
          console.error("Error attempting to exit fullscreen:", err),
        );
    }
  }, []);

  // Memoize the menu items rendering
  const menuItems = useMemo(
    () =>
      HorizontalSidebarData?.map(
        (mainMenu: HorizontalMainMenu, index: number) => (
          <React.Fragment key={`main-${index}`}>
            {mainMenu?.menu?.map((data: HorizontalMenuItem, i: number) => (
              <li className="submenu" key={`menu-${i}`}>
                <Link
                  href="#"
                  className={`
                ${
                  data?.subMenus
                    ?.map((link: HorizontalSubMenu) => link?.route)
                    .includes(Location)
                    ? "active"
                    : ""
                } ${subOpen === data.menuValue ? "subdrop" : ""}`}
                  onClick={() => toggleSidebar(data.menuValue)}
                >
                  <i className={`ti ti-${data.icon}`}></i>
                  <span>{data.menuValue}</span>
                  <span className="menu-arrow"></span>
                </Link>

                {/* First-level Submenus */}
                <ul
                  style={{
                    display: subOpen === data.menuValue ? "block" : "none",
                  }}
                >
                  {data?.subMenus?.map(
                    (subMenu: HorizontalSubMenu, j: number) => (
                      <li
                        key={`submenu-${j}`}
                        className={subMenu?.customSubmenuTwo ? "submenu" : ""}
                      >
                        <Link
                          href={subMenu?.route || "#"}
                          className={`${
                            subMenu?.subMenusTwo
                              ?.map((link: HorizontalSubMenu) => link?.route)
                              .includes(Location) || subMenu?.route === Location
                              ? "active"
                              : ""
                          } ${
                            subsidebar === subMenu.menuValue ? "subdrop" : ""
                          }`}
                          onClick={() =>
                            toggleSubsidebar(subMenu.menuValue || "")
                          }
                        >
                          <span>{subMenu?.menuValue}</span>
                          {subMenu?.customSubmenuTwo && (
                            <span className="menu-arrow"></span>
                          )}
                        </Link>

                        {/* Check if `customSubmenuTwo` exists */}
                        {subMenu?.customSubmenuTwo && subMenu?.subMenusTwo && (
                          <ul
                            style={{
                              display:
                                subsidebar === subMenu.menuValue
                                  ? "block"
                                  : "none",
                            }}
                          >
                            {subMenu.subMenusTwo.map(
                              (subMenuTwo: HorizontalSubMenu, k: number) => (
                                <li
                                  key={`submenu-two-${k}-${
                                    subMenuTwo.menuValue ||
                                    subMenuTwo.label ||
                                    k
                                  }`}
                                >
                                  <Link
                                    className={
                                      subMenuTwo.route === Location
                                        ? "active"
                                        : ""
                                    }
                                    href={subMenuTwo.route || "#"}
                                  >
                                    {subMenuTwo.menuValue ||
                                      subMenuTwo.label ||
                                      ""}
                                  </Link>
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              </li>
            ))}
          </React.Fragment>
        ),
      ),
    [
      HorizontalSidebarData,
      Location,
      subOpen,
      subsidebar,
      toggleSidebar,
      toggleSubsidebar,
    ],
  );

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="main-header">
          <div className="header-left">
            <Link href={routes.adminDashboard} className="logo">
              <ImageWithBasePath src="assets/img/logo.svg" alt="Logo" />
            </Link>
            <Link href={routes.adminDashboard} className="dark-logo">
              <ImageWithBasePath src="assets/img/logo-white.svg" alt="Logo" />
            </Link>
          </div>

          <Link
            id="mobile_btn"
            onClick={toggleMobileSidebar}
            className="mobile_btn"
            href="#sidebar"
          >
            <span className="bar-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </Link>

          <div className="header-user">
            <div className="nav user-menu nav-list">
              <div
                className="me-auto d-flex align-items-center"
                id="header-search"
              >
                <Link
                  id="toggle_btn"
                  href="#"
                  onClick={handleToggleMiniSidebar}
                  className="btn btn-menubar me-1"
                >
                  <i className="ti ti-arrow-bar-to-left"></i>
                </Link>

                {/* Search */}
                <div className="input-group input-group-flat d-inline-flex me-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search in HRMS"
                  />
                  <span className="input-group-text">
                    <kbd>CTRL + / </kbd>
                  </span>
                </div>
                {/* /Search */}

                <div className="dropdown crm-dropdown">
                  <Link
                    href="#"
                    className="btn btn-menubar me-2"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-layout-grid" />
                  </Link>
                  <div className="dropdown-menu dropdown-lg dropdown-menu-start">
                    <div className="card mb-0 border-0 shadow-none">
                      <div className="card-header">
                        <h4>CRM</h4>
                      </div>
                      <div className="card-body pb-1">
                        <div className="row">
                          <div className="col-sm-6">
                            <Link
                              href={all_routes.contactGrid}
                              className="d-flex align-items-center justify-content-between p-2 crm-link mb-3"
                            >
                              <span className="d-flex align-items-center me-3">
                                <i className="ti ti-user-shield text-default me-2" />
                                Contacts
                              </span>
                              <i className="ti ti-arrow-right" />
                            </Link>
                            <Link
                              href={all_routes.dealsGrid}
                              className="d-flex align-items-center justify-content-between p-2 crm-link mb-3"
                            >
                              <span className="d-flex align-items-center me-3">
                                <i className="ti ti-heart-handshake text-default me-2" />
                                Deals
                              </span>
                              <i className="ti ti-arrow-right" />
                            </Link>
                            <Link
                              href={all_routes.pipeline}
                              className="d-flex align-items-center justify-content-between p-2 crm-link mb-3"
                            >
                              <span className="d-flex align-items-center me-3">
                                <i className="ti ti-timeline-event-text text-default me-2" />
                                Pipeline
                              </span>
                              <i className="ti ti-arrow-right" />
                            </Link>
                          </div>
                          <div className="col-sm-6">
                            <Link
                              href={all_routes.companiesGrid}
                              className="d-flex align-items-center justify-content-between p-2 crm-link mb-3"
                            >
                              <span className="d-flex align-items-center me-3">
                                <i className="ti ti-building text-default me-2" />
                                Companies
                              </span>
                              <i className="ti ti-arrow-right" />
                            </Link>
                            <Link
                              href={all_routes.leadsGrid}
                              className="d-flex align-items-center justify-content-between p-2 crm-link mb-3"
                            >
                              <span className="d-flex align-items-center me-3">
                                <i className="ti ti-user-check text-default me-2" />
                                Leads
                              </span>
                              <i className="ti ti-arrow-right" />
                            </Link>
                            <Link
                              href={all_routes.activities}
                              className="d-flex align-items-center justify-content-between p-2 crm-link mb-3"
                            >
                              <span className="d-flex align-items-center me-3">
                                <i className="ti ti-activity text-default me-2" />
                                Activities
                              </span>
                              <i className="ti ti-arrow-right" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  href={all_routes.profilesettings}
                  className="btn btn-menubar"
                >
                  <i className="ti ti-settings-cog" />
                </Link>
              </div>

              <div
                className="sidebar sidebar-horizontal"
                id="horizontal-single"
              >
                <div className="sidebar-menu">
                  <div className="main-menu">
                    <ul className="nav-menu">
                      <li className="menu-title">
                        <span>Main</span>
                      </li>
                      {menuItems}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="me-2">
                  <Link
                    href="#"
                    onClick={toggleFullscreen}
                    className="btn btn-menubar btnFullscreen"
                  >
                    <i className="ti ti-maximize"></i>
                  </Link>
                </div>
                <div className="dropdown me-2">
                  <Link
                    href="#"
                    className="btn btn-menubar"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-layout-grid-remove" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-end">
                    <div className="card mb-0 border-0 shadow-none">
                      <div className="card-header">
                        <h4>Applications</h4>
                      </div>
                      <div className="card-body">
                        <Link href={all_routes.calendar} className="d-block pb-2">
                          <span className="avatar avatar-md bg-transparent-dark me-2">
                            <i className="ti ti-calendar text-gray-9" />
                          </span>
                          Calendar
                        </Link>
                        <Link href={all_routes.todo} className="d-block py-2">
                          <span className="avatar avatar-md bg-transparent-dark me-2">
                            <i className="ti ti-subtask text-gray-9" />
                          </span>
                          To Do
                        </Link>
                        <Link href={all_routes.notes} className="d-block py-2">
                          <span className="avatar avatar-md bg-transparent-dark me-2">
                            <i className="ti ti-notes text-gray-9" />
                          </span>
                          Notes
                        </Link>
                        <Link href={all_routes.fileManager} className="d-block py-2">
                          <span className="avatar avatar-md bg-transparent-dark me-2">
                            <i className="ti ti-folder text-gray-9" />
                          </span>
                          File Manager
                        </Link>
                        <Link href={all_routes.kanbanView} className="d-block py-2">
                          <span className="avatar avatar-md bg-transparent-dark me-2">
                            <i className="ti ti-layout-kanban text-gray-9" />
                          </span>
                          Kanban
                        </Link>
                        <Link
                          href={all_routes.applicationinvoices}
                          className="d-block py-2 pb-0"
                        >
                          <span className="avatar avatar-md bg-transparent-dark me-2">
                            <i className="ti ti-file-invoice text-gray-9" />
                          </span>
                          Invoices
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="me-2">
                  <Link
                    href={all_routes.chart}
                    className="btn btn-menubar position-relative"
                  >
                    <i className="ti ti-message" />
                    <span className="msg-status-dot" />
                  </Link>
                </div>
                <div className="me-2">
                  <Link href={all_routes.email} className="btn btn-menubar">
                    <i className="ti ti-mail" />
                  </Link>
                </div>
                <div className="me-2 notification_item">
                  <Link
                    href="#"
                    className="btn btn-menubar position-relative me-1"
                    id="notification_popup"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-bell" />
                    <span className="notification-status-dot" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-end notification-dropdown p-4">
                    <div className="d-flex align-items-center justify-content-between border-bottom p-0 pb-3 mb-3">
                      <h4 className="notification-title">Notifications (2)</h4>
                      <div className="d-flex align-items-center">
                        <Link href="#" className="text-primary fs-15 me-3 lh-1">
                          Mark all as read
                        </Link>
                        <div className="dropdown">
                          <Link
                            href="#"
                            className="bg-white dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            <i className="ti ti-calendar-due me-1" />
                            Today
                          </Link>
                          <ul className="dropdown-menu mt-2 p-3">
                            <li>
                              <Link
                                href="#"
                                className="dropdown-item rounded-1"
                              >
                                This Week
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="#"
                                className="dropdown-item rounded-1"
                              >
                                Last Week
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="#"
                                className="dropdown-item rounded-1"
                              >
                                Last Month
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="noti-content">
                      <div className="d-flex flex-column">
                        <div className="border-bottom mb-3 pb-3">
                          <Link href={all_routes.activity}>
                            <div className="d-flex">
                              <span className="avatar avatar-lg me-2 flex-shrink-0">
                                <ImageWithBasePath
                                  src="assets/img/profiles/avatar-27.jpg"
                                  alt="Profile"
                                />
                              </span>
                              <div className="flex-grow-1">
                                <p className="mb-1">
                                  <span className="text-dark fw-semibold">
                                    Shawn
                                  </span>
                                  performance in Math is below the threshold.
                                </p>
                                <span>Just Now</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="border-bottom mb-3 pb-3">
                          <Link href={all_routes.activity} className="pb-0">
                            <div className="d-flex">
                              <span className="avatar avatar-lg me-2 flex-shrink-0">
                                <ImageWithBasePath
                                  src="assets/img/profiles/avatar-23.jpg"
                                  alt="Profile"
                                />
                              </span>
                              <div className="flex-grow-1">
                                <p className="mb-1">
                                  <span className="text-dark fw-semibold">
                                    Sylvia
                                  </span>{" "}
                                  added appointment on 02:00 PM
                                </p>
                                <span>10 mins ago</span>
                                <div className="d-flex justify-content-start align-items-center mt-1">
                                  <span className="btn btn-light btn-sm me-2">
                                    Deny
                                  </span>
                                  <span className="btn btn-primary btn-sm">
                                    Approve
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="border-bottom mb-3 pb-3">
                          <Link href={all_routes.activity}>
                            <div className="d-flex">
                              <span className="avatar avatar-lg me-2 flex-shrink-0">
                                <ImageWithBasePath
                                  src="assets/img/profiles/avatar-25.jpg"
                                  alt="Profile"
                                />
                              </span>
                              <div className="flex-grow-1">
                                <p className="mb-1">
                                  New student record{" "}
                                  <span className="text-dark fw-semibold">
                                    {" "}
                                    George
                                  </span>{" "}
                                  is created by{" "}
                                  <span className="text-dark fw-semibold">
                                    Teressa
                                  </span>
                                </p>
                                <span>2 hrs ago</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="border-0 mb-3 pb-0">
                          <Link href={all_routes.activity}>
                            <div className="d-flex">
                              <span className="avatar avatar-lg me-2 flex-shrink-0">
                                <ImageWithBasePath
                                  src="assets/img/profiles/avatar-01.jpg"
                                  alt="Profile"
                                />
                              </span>
                              <div className="flex-grow-1">
                                <p className="mb-1">
                                  A new teacher record for{" "}
                                  <span className="text-dark fw-semibold">
                                    Elisa
                                  </span>{" "}
                                </p>
                                <span>09:45 AM</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex p-0">
                      <Link href="#" className="btn btn-light w-100 me-2">
                        Cancel
                      </Link>
                      <Link
                        href={all_routes.activity}
                        className="btn btn-primary w-100"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="dropdown profile-dropdown">
                  <Link
                    href="#"
                    className="dropdown-toggle d-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <span className="avatar avatar-md online">
                      <ImageWithBasePath
                        src="assets/img/profiles/avatar-12.jpg"
                        alt="Img"
                        className="img-fluid rounded-circle"
                      />
                    </span>
                  </Link>
                  <div className="dropdown-menu shadow-none">
                    <div className="card mb-0">
                      <div className="card-header">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg me-2 avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-12.jpg"
                              alt="img"
                            />
                          </span>
                          <div>
                            <h5 className="mb-0">Kevin Larry</h5>
                            <p className="fs-12 fw-medium mb-0">
                              warren@example.com
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <Link
                          className="dropdown-item d-inline-flex align-items-center p-0 py-2"
                          href={all_routes.profile}
                        >
                          <i className="ti ti-user-circle me-1" />
                          My Profile
                        </Link>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center p-0 py-2"
                          href={all_routes.bussinessSettings}
                        >
                          <i className="ti ti-settings me-1" />
                          Settings
                        </Link>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center p-0 py-2"
                          href={all_routes.profilesettings}
                        >
                          <i className="ti ti-circle-arrow-up me-1" />
                          My Account
                        </Link>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center p-0 py-2"
                          href={all_routes.knowledgebase}
                        >
                          <i className="ti ti-question-mark me-1" />
                          Knowledge Base
                        </Link>
                      </div>
                      <div className="card-footer">
                        <Link
                          className="dropdown-item d-inline-flex align-items-center p-0 py-2"
                          href={all_routes.login}
                        >
                          <i className="ti ti-login me-2" />
                          Logout
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="dropdown mobile-user-menu">
            <Link
              href="#"
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fa fa-ellipsis-v" />
            </Link>
            <div className="dropdown-menu dropdown-menu-end">
              <Link className="dropdown-item" href={all_routes.profile}>
                My Profile
              </Link>
              <Link className="dropdown-item" href={all_routes.profilesettings}>
                Settings
              </Link>
              <Link className="dropdown-item" href={all_routes.login}>
                Logout
              </Link>
            </div>
          </div>
          {/* /Mobile Menu */}
        </div>
      </div>
    </>
  );
});

Header.displayName = "Header";

export default Header;
