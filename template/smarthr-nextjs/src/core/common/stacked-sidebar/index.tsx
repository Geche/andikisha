"use client";

import { useState, useCallback } from 'react';
import { TowColData } from '../../data/json/twoColData';
import ImageWithBasePath from '../imageWithBasePath';
import React from 'react';
import { all_routes } from '@/routes/all_routes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const StackedSidebar = () => {
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
    const hasActiveChild = useCallback((subMenus: any[] | undefined): boolean => {
        if (!subMenus) return false;
        return subMenus.some((item: any) => {
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

    // Get all menu items flattened for tab content
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

    // Find current active menu item for initial tab selection
    const findActiveMenuItem = useCallback(() => {
        for (const item of menuItems) {
            if (hasActiveDescendant(item)) {
                return item.menuValue;
            }
        }
        return 'Dashboard';
    }, [menuItems, hasActiveDescendant]);

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
                            className={hasThirdLevel ? "submenu submenu-two" : ""}
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
                                        <span className="menu-arrow inside-submenu"></span>
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

    // Render submenu items for tab content
    const renderSubMenuItems = (subMenus: any[], menuValue: string) => {
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
        <div className="stacked-sidebar" id="stacked-sidebar">
            <div className="sidebar sidebar-stacked" style={{ display: 'flex' }}>
                {/* Mini Sidebar */}
                <div className="stacked-mini">
                    <Link href={routes.adminDashboard} className="logo-small">
                        <ImageWithBasePath src="assets/img/logo-small.svg" alt="Logo" />
                    </Link>
                    <div className="sidebar-left slimscroll">
                        <div className="d-flex align-items-center flex-column">
                            <div className="mb-1 notification-item">
                                <Link href="#" className="btn btn-menubar position-relative">
                                    <i className="ti ti-bell"></i>
                                    <span className="notification-status-dot"></span>
                                </Link>
                            </div>
                            <div className="mb-1">
                                <Link href="#" className="btn btn-menubar btnFullscreen">
                                    <i className="ti ti-maximize"></i>
                                </Link>
                            </div>
                            <div className="mb-1">
                                <Link href={routes.calendar} className="btn btn-menubar">
                                    <i className="ti ti-layout-grid-remove"></i>
                                </Link>
                            </div>
                            <div className="mb-1">
                                <Link href={routes.chat} className="btn btn-menubar position-relative">
                                    <i className="ti ti-brand-hipchat"></i>
                                    <span className="badge bg-info rounded-pill d-flex align-items-center justify-content-center header-badge">5</span>
                                </Link>
                            </div>
                            <div className="mb-1">
                                <Link href={routes.email} className="btn btn-menubar">
                                    <i className="ti ti-mail"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Right */}
                <div className="sidebar-right d-flex justify-content-between flex-column">
                    <div className="sidebar-scroll">
                        <h6 className="mb-3">Welcome to SmartHR</h6>
                        <div className="sidebar-profile text-center rounded bg-light p-3 mb-4">
                            <div className="avatar avatar-lg online mb-3">
                                <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="Img" className="img-fluid rounded-circle" />
                            </div>
                            <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
                            <p className="fs-10">System Admin</p>
                        </div>
                        <div className="stack-menu">
                            {/* Tab Navigation */}
                            <div className="nav flex-column align-items-center nav-pills" role="tablist" aria-orientation="vertical">
                                <div className="row g-2">
                                    {menuItems.map((item: any, index: number) => (
                                        <div className="col-6" key={`tab-${index}`}>
                                            <Link
                                                href={`#menu-${item.menuValue.toLowerCase().replace(/\s+/g, '-')}`}
                                                role="tab"
                                                className={`nav-link ${activeTab === item.menuValue ? 'active' : ''} ${hasActiveDescendant(item) ? 'active' : ''}`}
                                                title={item.menuValue}
                                                data-bs-toggle="tab"
                                                data-bs-target={`#menu-${item.menuValue.toLowerCase().replace(/\s+/g, '-')}`}
                                                aria-selected={activeTab === item.menuValue}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab(item.menuValue);
                                                }}
                                            >
                                                <span><i className={`ti ti-${item.icon}`}></i></span>
                                                <p>{item.menuValue}</p>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {menuItems.map((item: any, index: number) => (
                                    <div
                                        key={`content-${index}`}
                                        className={`tab-pane fade ${activeTab === item.menuValue ? 'show active' : ''}`}
                                        id={`menu-${item.menuValue.toLowerCase().replace(/\s+/g, '-')}`}
                                         style={{
    display: activeTab === item.menuValue ? 'block' : 'none',
  }}
                                    >
                                        <ul className="stack-submenu">
                                            {renderSubMenuItems(item.subMenus, item.menuValue)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-3">
                        <Link href="#" className="d-flex align-items-center fs-12 mb-3">Documentation</Link>
                        <Link href="#" className="d-flex align-items-center fs-12">Change Log<span className="badge bg-pink badge-xs text-white fs-10 ms-2">v4.0.9</span></Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StackedSidebar;
