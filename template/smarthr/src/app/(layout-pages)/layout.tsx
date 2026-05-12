"use client";
import Header from "@/core/common/header";
import HorizontalSidebar from "@/core/common/horizontal-sidebar";
import Sidebar from "@/core/common/sidebar";
import StackedSidebar from "@/core/common/stacked-sidebar";
import TwoColumnSidebar from "@/core/common/two-column";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function ThemeLayouts({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname(); // Get the current pathname

    useEffect(() => {
        const htmlElement = document.documentElement;

        // Reset classes before applying new ones
        document.body.classList.remove(
            "menu-horizontal",
            "layout-box-mode",
            "mini-sidebar",
            "expand-menu",
            "layout-mode-rtl",
            "data-layout-transparent"
        );

        // Only allow data-layout and data-width in this segment
        const attrsToClear = [
            "data-card",
            "data-sidebar",
            "data-theme",
            "data-topbar",
            "data-topbarcolor",
            "data-color",
            "data-loader",
            "data-size"
        ];
        attrsToClear.forEach((attr) => htmlElement.removeAttribute(attr));
        // Clear body data-* attributes set by global theme
        document.body.removeAttribute("data-sidebarbg");
        document.body.removeAttribute("data-topbarbg");

        switch (pathname) {
            case "/layout-horizontal":
                htmlElement.setAttribute("data-layout", "horizontal");
                document.body.classList.add("menu-horizontal");
                break;

            case "/layout-detached":
                htmlElement.setAttribute("data-layout", "detached");
                break;

            case "/layout-modern":
                htmlElement.setAttribute("data-layout", "modern");
                break;

            case "/layout-two-column":
                htmlElement.setAttribute("data-layout", "twocolumn");
                break;

            case "/layout-hovered":
                htmlElement.setAttribute("data-layout", "layout-hovered");
                document.body.classList.add("mini-sidebar");
                break;

            case "/layout-box":
                htmlElement.setAttribute("data-layout", "default");
                htmlElement.setAttribute("data-width", "box");
                document.body.classList.add("mini-sidebar", "layout-box-mode");
                break;
            case "/layout-horizontal-single":
                htmlElement.setAttribute("data-layout", "horizontal-single");
                document.body.classList.add("menu-horizontal");
                break;
            case "/layout-horizontal-overlay":
                htmlElement.setAttribute("data-layout", "horizontal-overlay");
                document.body.classList.add("menu-horizontal");
                break;
            case "/layout-horizontal-box":
                htmlElement.setAttribute("data-layout", "horizontal-box");
                document.body.classList.add("menu-horizontal");
                break;
            case "/layout-horizontal-sidemenu":
                htmlElement.setAttribute("data-layout", "horizontal-sidemenu");
                break;
            case "/layout-vertical-transparent":
                htmlElement.setAttribute("data-layout", "data-layout-transparent");
                document.body.classList.add("data-layout-transparent expand-menu");
                break;
            case "/layout-without-header":
                htmlElement.setAttribute("data-layout", "without-header");
                break;
            case "/layout-rtl":
                htmlElement.setAttribute("data-layout", "layout-mode-rtl");
                document.body.classList.add("layout-mode-rtl");
                break;

            case "/layout-dark":
                htmlElement.setAttribute("data-theme", "dark");
                break;
            default:
                htmlElement.setAttribute("data-layout", "default");
                break;
        }
    }, [pathname]);


    return (
        <div className="main-wrapper">
            <Header />
            <Sidebar />
        <HorizontalSidebar />
        <TwoColumnSidebar />
        <StackedSidebar />
            {children}
        </div>
    );
}
