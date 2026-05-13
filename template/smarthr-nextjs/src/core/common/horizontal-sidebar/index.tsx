"use client";

import { useState, useCallback } from 'react';
import { HorizontalSidebarData } from '../../data/json/horizontalSidebar';
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from 'react';

const HorizontalSidebar = () => {
    const Location = usePathname();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    
    // Check if a route is active
    const isRouteActive = (route: string | undefined): boolean => {
        if (!route) return false;
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
        if (menuItem.subMenusThree && hasActiveChild(menuItem.subMenusThree)) return true;
        return false;
    }, [Location, hasActiveChild]);

    // Toggle menu open/close
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


    // Render third level submenus (subMenusThree)
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
                                            if (!item.route || item.route === "#") {
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
    const renderSubMenus = (subMenus: any[], parentKey: string) => {
        if (!subMenus || subMenus.length === 0) return null;
        
        return (
            <ul style={{ display: isMenuOpen(parentKey) ? "block" : "none" }}>
                {subMenus.map((subMenu: any, index: number) => {
                    const subMenuKey = `${parentKey}-${index}`;
                    const hasSecondLevel = subMenu.customSubmenuTwo && subMenu.subMenusTwo && subMenu.subMenusTwo.length > 0;
                    
                    return (
                        <li 
                            key={subMenuKey}
                            className={hasSecondLevel ? "submenu submenu-two" : ""}
                        >
                            {hasSecondLevel ? (
                                <>
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
                                        <span className="menu-arrow inside-submenu"></span>
                                    </Link>
                                    {renderSubMenuTwo(subMenu.subMenusTwo, subMenuKey)}
                                </>
                            ) : (
                                <Link 
                                    href={subMenu.route || "#"} 
                                    className={isRouteActive(subMenu.route) ? 'active' : ''}
                                >
                                    <span>{subMenu.menuValue}</span>
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="sidebar sidebar-horizontal" id="horizontal-menu">
            <div className="sidebar-menu">
                <div className="main-menu">
                    <ul className="nav-menu">
                        <li className="menu-title">
                            <span>Main</span>
                        </li>
                        {HorizontalSidebarData?.map((mainMenu, mainIndex) => (
                            <React.Fragment key={`main-${mainIndex}`}>
                                {mainMenu?.menu?.map((data: any, menuIndex: number) => {
                                    const menuKey = `menu-${mainIndex}-${menuIndex}`;
                                    const isActive = hasActiveDescendant(data);
                                    const isOpen = isMenuOpen(menuKey);
                                    
                                    return (
                                        <li className="submenu" key={menuKey}>
                                            <Link 
                                                href="#" 
                                                className={`${isActive ? "active" : ""} ${isOpen ? "subdrop" : ""}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleMenu(menuKey);
                                                }}
                                            >
                                                <i className={`ti ti-${data.icon}`}></i>
                                                <span>{data.menuValue}</span>
                                                <span className="menu-arrow"></span>
                                            </Link>
                                            {renderSubMenus(data.subMenus, menuKey)}
                                        </li>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </ul>
                    <div className="d-xl-flex align-items-center d-none">
                        <Link href="#" className="me-3 avatar avatar-sm">
                            <img src="assets/img/profiles/avatar-07.jpg" alt="profile" className="rounded-circle" />
                        </Link>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HorizontalSidebar;
