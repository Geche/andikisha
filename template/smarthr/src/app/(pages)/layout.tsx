"use client";
import Header from "@/core/common/header";
import HorizontalSidebar from "@/core/common/horizontal-sidebar";
import Sidebar from "@/core/common/sidebar";
import StackedSidebar from "@/core/common/stacked-sidebar";
import ThemeSettings from "@/core/common/theme-settings";
import TwoColumnSidebar from "@/core/common/two-column";
import { useSelector } from "react-redux";

export default function PagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const dataLayout = useSelector((state: any) => state.themeSetting.dataLayout);
    
    const wrapperClass = `main-wrapper ${dataLayout === 'horizontal-single' ? 'menu-horizontal' : dataLayout === 'horizontal-overlay' ? 'menu-horizontal' :''}`;
    
    
    return (
        <div className={wrapperClass}>
            <Header />
            <Sidebar />
        <HorizontalSidebar />
        <TwoColumnSidebar />
        <StackedSidebar />
            <ThemeSettings />
            {children}
        </div>
    );
}
