"use client";

import React, { useState, useCallback } from 'react';
import { TowColData } from '../../data/json/twoColData';
import PerfectScrollbar from "react-perfect-scrollbar";
import "../../../../node_modules/react-perfect-scrollbar/dist/css/styles.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { all_routes } from '@/routes/all_routes';

const TwoColumnSidebar = () => {
    const routes = all_routes;
    const Location = usePathname();
    const [activeTab, setActiveTab] = useState<string>('Dashboard');
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // Check if a route is active
    const isRouteActive = (route: string | undefined): boolean => {
        if (!route || route === '#' || route === '#') return false;
        return Location === route;
    };

    // Check if any submenu item is active (recursive)
    const hasActiveChild = useCallback((items: any[] | undefined): boolean => {
        if (!items) return false;
        return items.some((item: any) => {
            if (isRouteActive(item.route)) return true;
            if (item.subMenusTwo && hasActiveChild(item.subMenusTwo)) return true;
            if (item.subMenusThree && hasActiveChild(item.subMenusThree)) return true;
            return false;
        });
    }, [Location]);

    // Check if menu has active descendant
    const hasActiveDescendant = useCallback((menuItem: any): boolean => {
        if (isRouteActive(menuItem.route)) return true;
        if (menuItem.subMenus && hasActiveChild(menuItem.subMenus)) return true;
        if (menuItem.subMenusTwo && hasActiveChild(menuItem.subMenusTwo)) return true;
        return false;
    }, [Location, hasActiveChild]);

    // Toggle submenu open/close
    const toggleMenu = (menuKey: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    // Check if menu is open
    const isMenuOpen = (menuKey: string): boolean => {
        return openMenus[menuKey] || false;
    };

    // Get all menu items flattened for tabs
    const getAllMenuItems = () => {
        const items: any[] = [];
        TowColData.forEach((mainMenu) => {
            mainMenu.menu.forEach((menuItem: any) => {
                items.push(menuItem);
            });
        });
        return items;
    };

    const menuItems = getAllMenuItems();

    // Render third level submenus
    const renderSubMenuThree = (subMenusThree: any[], parentKey: string) => {
        if (!subMenusThree || subMenusThree.length === 0) return null;

        return (
            <ul style={{ display: isMenuOpen(parentKey) ? "block" : "none" }}>
                {subMenusThree.map((item: any, index: number) => (
                    <li key={`${parentKey}-${index}`}>
                        <Link
                            href={item.route || "#"}
                            className={isRouteActive(item.route) ? 'active' : ''}
                        >
                            {item.menuValue}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    // Render second level submenus (subMenusTwo)
    const renderSubMenuTwo = (subMenusTwo: any[], parentKey: string) => {
        if (!subMenusTwo || subMenusTwo.length === 0) return null;

        return (
            <ul style={{ display: isMenuOpen(parentKey) ? "block" : "none" }}>
                {subMenusTwo.map((item: any, index: number) => {
                    const itemKey = `${parentKey}-${index}`;
                    const hasThirdLevel = item.subMenusThree && item.subMenusThree.length > 0;

                    return (
                        <li
                            key={itemKey}
                            className={hasThirdLevel ? "submenu submenu-two submenu-three" : ""}
                        >
                            {hasThirdLevel ? (
                                <>
                                    <Link
                                        href={item.route || "#"}
                                        className={`${hasActiveDescendant(item) ? 'active' : ''} ${isMenuOpen(itemKey) ? 'subdrop' : ''}`}
                                        onClick={(e) => {
                                            if (!item.route || item.route === "#" || item.route === "#") {
                                                e.preventDefault();
                                            }
                                            toggleMenu(itemKey);
                                        }}
                                    >
                                        {item.menuValue}
                                        <span className="menu-arrow inside-submenu inside-submenu-two"></span>
                                    </Link>
                                    {renderSubMenuThree(item.subMenusThree, itemKey)}
                                </>
                            ) : (
                                <Link
                                    href={item.route || "#"}
                                    className={isRouteActive(item.route) ? 'active' : ''}
                                >
                                    {item.menuValue}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    // Render first level submenus
    const renderSubMenus = (subMenus: any[], menuValue: string) => {
        if (!subMenus || subMenus.length === 0) return null;

        return subMenus.map((subMenu: any, index: number) => {
            const subMenuKey = `${menuValue}-sub-${index}`;
            const hasNestedMenu = subMenu.customSubmenuTwo && subMenu.subMenusTwo && subMenu.subMenusTwo.length > 0;

            if (hasNestedMenu) {
                return (
                    <li key={subMenuKey} className="submenu">
                        <Link
                            href={subMenu.route || "#"}
                            className={`${hasActiveDescendant(subMenu) ? 'active' : ''} ${isMenuOpen(subMenuKey) ? 'subdrop' : ''}`}
                            onClick={(e) => {
                                if (!subMenu.route || subMenu.route === "#" || subMenu.route === "#") {
                                    e.preventDefault();
                                }
                                toggleMenu(subMenuKey);
                            }}
                        >
                            <span>{subMenu.menuValue}</span>
                            <span className="menu-arrow"></span>
                        </Link>
                        {renderSubMenuTwo(subMenu.subMenusTwo, subMenuKey)}
                    </li>
                );
            } else {
                return (
                    <li key={subMenuKey}>
                        <Link
                            href={subMenu.route || "#"}
                            className={isRouteActive(subMenu.route) ? 'active' : ''}
                        >
                            <span>{subMenu.menuValue}</span>
                        </Link>
                    </li>
                );
            }
        });
    };

    return (
        <div className="two-col-sidebar" id="two-col-sidebar">
            <div className="sidebar sidebar-twocol">
                {/* Mini Sidebar with Icon Tabs */}
                <div className="twocol-mini">
                    <Link href={routes.adminDashboard} className="logo-small">
                        <img src="assets/img/logo-small.svg" alt="Logo" />
                    </Link>
                    <PerfectScrollbar>
                        <div className="sidebar-left slimscroll">
                            <div className="nav flex-column align-items-center nav-pills" id="sidebar-tabs" role="tablist" aria-orientation="vertical">
                                {menuItems.map((item: any, index: number) => (
                                    <Link
                                        key={`tab-${index}`}
                                        href="#"
                                        className={`nav-link ${activeTab === item.menuValue ? 'active' : ''} ${hasActiveDescendant(item) ? 'active' : ''}`}
                                        title={item.menuValue}
                                        data-bs-toggle="tab"
                                        data-bs-target={`#${item.menuValue.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab(item.menuValue);
                                        }}
                                    >
                                        <i className={`ti ti-${item.icon}`}></i>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </PerfectScrollbar>
                </div>

                {/* Sidebar Right Content */}
                <div className="sidebar-right">
                    <div className="sidebar-logo mb-4">
                        <Link href={routes.adminDashboard} className="logo logo-normal">
                            <img src="assets/img/logo.svg" alt="Logo" />
                        </Link>
                        <Link href={routes.adminDashboard} className="dark-logo">
                            <img src="assets/img/logo-white.svg" alt="Logo" />
                        </Link>
                    </div>
                    <div className="sidebar-scroll">
                        <h6 className="mb-3">Welcome to SmartHR</h6>
                        <div className="text-center rounded bg-light p-3 mb-4">
                            <div className="avatar avatar-lg online mb-3">
                                <img src="assets/img/profiles/avatar-02.jpg" alt="Img" className="img-fluid rounded-circle" />
                            </div>
                            <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
                            <p className="fs-10">System Admin</p>
                        </div>
                        <div className="tab-content" id="v-pills-tabContent">
                            {menuItems.map((item: any, index: number) => (
                                <div
                                    key={`content-${index}`}
                                    className={`tab-pane fade ${activeTab === item.menuValue ? 'show active' : ''}`}
                                    id={item.menuValue.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}
                                >
                                    <ul>
                                        <li className="menu-title">
                                            <span>{item.menuValue.toUpperCase()}</span>
                                        </li>
                                        {renderSubMenus(item.subMenus, item.menuValue)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoColumnSidebar;
