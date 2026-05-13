"use client";

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ThemeSettingState } from "../types";
import { getItem, setItem } from "../../utils/storage";

const getInitialState = (): ThemeSettingState => {
  // Default values
  const defaultState: ThemeSettingState = {
    dataLayout: "default",
    dataWidth: "fluid",
    dataCard: "bordered",
    dataSize: "default",
    dataSidebar: "light",
    dataSidebarAll: "",
    dataTopbarAll: "",
    dataTopBarColorAll: "",
    dataColorAll: "",
    dataTheme: "light",
    dataTopBar: "white",
    dataTopBarColor: "white",
    dataSidebarBg: "",
    dataTopbarBg: "",
    dataColor: "primary",
    dataLoader: "enable",
    isRtl: false,
    headerCollapse: false,
  };

  // Only access localStorage in the browser environment
  if (typeof window === 'undefined') {
    return defaultState;
  }

  // In the browser, try to get values from localStorage with fallback to defaults
  return {
    dataLayout: getItem("dataLayout") || defaultState.dataLayout,
    dataWidth: getItem("dataWidth") || defaultState.dataWidth,
    dataCard: getItem("dataCard") || defaultState.dataCard,
    dataSize: getItem("dataSize") || defaultState.dataSize,
    dataSidebar: getItem("dataSidebar") || defaultState.dataSidebar,
    dataSidebarAll: getItem("dataSidebarAll") || defaultState.dataSidebarAll,
    dataTopbarAll: getItem("dataTopbarAll") || defaultState.dataTopbarAll,
    dataTopBarColorAll: getItem("dataTopBarColorAll") || defaultState.dataTopBarColorAll,
    dataColorAll: getItem("dataColorAll") || defaultState.dataColorAll,
    dataTheme: getItem("dataTheme") || defaultState.dataTheme,
    dataTopBar: getItem("dataTopBar") || defaultState.dataTopBar,
    dataTopBarColor: getItem("dataTopBarColor") || defaultState.dataTopBarColor,
    dataSidebarBg: getItem("dataSidebarBg") || defaultState.dataSidebarBg,
    dataTopbarBg: getItem("dataTopbarBg") || defaultState.dataTopbarBg,
    dataColor: getItem("dataColor") || defaultState.dataColor,
    dataLoader: getItem("dataLoader") || defaultState.dataLoader,
    isRtl: getItem("rtl") === 'true' || defaultState.isRtl,
    headerCollapse: defaultState.headerCollapse,
  };
};

const initialState: ThemeSettingState = getInitialState();

const themeSettingSlice = createSlice({
  name: "themeSetting",
  initialState,
  reducers: {
    setHeaderCollapse: (state, action: PayloadAction<boolean>) => {
      state.headerCollapse = action.payload;
    },
    setDataLayout: (state, action: PayloadAction<string>) => {
      state.dataLayout = action.payload;
      setItem("dataLayout", action.payload);
      document.documentElement.setAttribute("data-layout", action.payload);
    },
    setDataWidth: (state, action: PayloadAction<string>) => {
      state.dataWidth = action.payload;
      setItem("dataWidth", action.payload);
      document.documentElement.setAttribute("data-width", action.payload);
    },
    setDataCard: (state, action: PayloadAction<string>) => {
      state.dataCard = action.payload;
      setItem("dataCard", action.payload);
      document.documentElement.setAttribute("data-card", action.payload);
    },
    setDataSize: (state, action: PayloadAction<string>) => {
      state.dataSize = action.payload;
      setItem("dataSize", action.payload);
      document.documentElement.setAttribute("data-size", action.payload);
    },
    setDataSidebar: (state, action: PayloadAction<string>) => {
      state.dataSidebar = action.payload;
      setItem("dataSidebar", action.payload);
      document.documentElement.setAttribute("data-sidebar", action.payload);
    },
    setDataSidebarAll: (state, action: PayloadAction<string>) => {
      state.dataSidebarAll = action.payload;
      setItem("dataSidebarAll", action.payload);
    },
    setDataColorAll: (state, action: PayloadAction<string>) => {
      state.dataColorAll = action.payload;
      setItem("dataColorAll", action.payload);
    },
    setDataTopBarColorAll: (state, action: PayloadAction<string>) => {
      state.dataTopBarColorAll = action.payload;
      setItem("dataTopBarColorAll", action.payload);
    },
    setDataTopbarAll: (state, action: PayloadAction<string>) => {
      state.dataTopbarAll = action.payload;
      setItem("dataTopbarAll", action.payload);
    },
    setDataTheme: (state, action: PayloadAction<string>) => {
      const themeValue = action.payload === "dark" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", themeValue);
      state.dataTheme = action.payload;
      setItem("dataTheme", action.payload);
    },
    setTopBarColor: (state, action: PayloadAction<string>) => {
      state.dataTopBar = action.payload;
      setItem("dataTopBar", action.payload);
      document.documentElement.setAttribute("data-topbar", action.payload);
    },
    setTopBarColor2: (state, action: PayloadAction<string>) => {
      state.dataTopBarColor = action.payload;
      setItem("dataTopBarColor", action.payload);
      document.documentElement.setAttribute("data-topbarcolor", action.payload);
    },
    setDataSidebarBg: (state, action: PayloadAction<string>) => {
      state.dataSidebarBg = action.payload;
      setItem("dataSidebarBg", action.payload);
      document.body.setAttribute("data-sidebarbg", action.payload);
    },
    setDataTopbarBg: (state, action: PayloadAction<string>) => {
      state.dataTopbarBg = action.payload;
      setItem("dataTopbarBg", action.payload);
      document.body.setAttribute("data-topbarbg", action.payload);
    },
    setDataColor: (state, action: PayloadAction<string>) => {
      state.dataColor = action.payload;
      setItem("dataColor", action.payload);
      document.documentElement.setAttribute("data-color", action.payload);
    },
    setLoader: (state, action: PayloadAction<string>) => {
      state.dataLoader = action.payload;
      setItem("dataLoader", action.payload);
      document.documentElement.setAttribute("data-loader", action.payload);
    },
    setRtl: (state, action: PayloadAction<boolean | string>) => {
      const isRtl = typeof action.payload === 'string' ? action.payload === 'true' : action.payload;
      state.isRtl = isRtl;
      setItem("rtl", String(isRtl));
      document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    },
    resetAllMode: (state) => {
      state.dataLayout = "default";
      state.dataWidth = "fluid";
      state.dataCard = "bordered";
      state.dataSize = "default";
      state.dataSidebar = "light";
      state.dataTheme = "light";
      state.dataTopBar = "white";
      state.dataTopBarColor = "white";
      state.dataSidebarBg = "";
      state.dataTopbarBg = "";
      state.dataColor = "primary";
      state.dataLoader = "enable";
      state.isRtl = false;
      
      // Update storage
      setItem("dataLayout", "default");
      setItem("dataWidth", "fluid");
      setItem("dataCard", "bordered");
      setItem("dataSize", "default");
      setItem("dataSidebar", "light");
      setItem("dataTheme", "light");
      setItem("dataTopBar", "white");
      setItem("dataTopBarColor", "white");
      setItem("dataSidebarBg", "");
      setItem("dataTopbarBg", "");
      setItem("dataColor", "primary");
      setItem("dataLoader", "enable");
      setItem("rtl", "false");
      
      // Update DOM attributes
      document.documentElement.setAttribute("data-layout", "default");
      document.documentElement.setAttribute("data-width", "fluid");
      document.documentElement.setAttribute("data-card", "bordered");
      document.documentElement.setAttribute("data-size", "default");
      document.documentElement.setAttribute("data-sidebar", "light");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.setAttribute("data-topbar", "white");
      document.documentElement.setAttribute("data-topbarcolor", "white");
      document.documentElement.setAttribute("data-color", "primary");
      document.documentElement.setAttribute("data-loader", "enable");
      document.documentElement.setAttribute("dir", "ltr");
      document.body.setAttribute("data-sidebarbg", "");
      document.body.setAttribute("data-topbarbg", "");
    },
  },
});

export const {
  setDataLayout,
  setDataWidth,
  setDataCard,
  setDataSize,
  resetAllMode,
  setTopBarColor,
  setDataTheme,
  setDataSidebar,
  setDataSidebarAll,
  setDataColorAll,
  setDataTopBarColorAll,
  setDataTopbarAll,
  setDataSidebarBg,
  setDataTopbarBg,
  setHeaderCollapse,
  setDataColor,
  setLoader,
  setTopBarColor2,
  setRtl,
} = themeSettingSlice.actions;

export default themeSettingSlice.reducer;
