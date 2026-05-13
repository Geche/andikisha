// Define the shape of the sidebar slice state
interface SidebarState {
  mobileSidebar: boolean;
  expandMenu: boolean;
  miniSidebar: boolean;
}

// Define the root state by combining all slice states
export interface RootState {
  sidebarSlice: SidebarState;
  themeSetting: any; // You might want to properly type this as well
}

export type { SidebarState };
