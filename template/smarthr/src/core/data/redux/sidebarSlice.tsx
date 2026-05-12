"use client";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SidebarState } from "../types";

const initialState: SidebarState = {
  mobileSidebar: false,
  miniSidebar: false,
  expandMenu: false,
  resetMobileSidebar: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setMobileSidebar: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebar = action.payload;
    },
    setMiniSidebar: (state, action: PayloadAction<boolean>) => {
      state.miniSidebar = action.payload;
    },
    toggleMiniSidebar: (state) => {
      state.miniSidebar = !state.miniSidebar;
    },
    setExpandMenu: (state, action: PayloadAction<boolean>) => {
      state.expandMenu = action.payload;
    },
    setResetMobileSidebar: (state) => {
      state.mobileSidebar = false;
    },
  },
});

export const {
  setMobileSidebar,
  setMiniSidebar,
  setExpandMenu,
  toggleMiniSidebar,
  setResetMobileSidebar,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
