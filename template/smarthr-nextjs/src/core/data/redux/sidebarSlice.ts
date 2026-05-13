import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./types";

const initialState: RootState['sidebarSlice'] = {
  mobileSidebar: false,
  expandMenu: false,
  miniSidebar: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setMobileSidebar: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebar = action.payload;
    },
    setExpandMenu: (state, action: PayloadAction<boolean>) => {
      state.expandMenu = action.payload;
    },
    setMiniSidebar: (state, action: PayloadAction<boolean>) => {
      state.miniSidebar = action.payload;
    },
    toggleMiniSidebar: (state) => {
      state.expandMenu = !state.expandMenu;
    },
  },
});

export const { setMobileSidebar, setExpandMenu, toggleMiniSidebar, setMiniSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
