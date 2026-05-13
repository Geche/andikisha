import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeSettingState {
  theme: 'light' | 'dark';
  dataLayout?: any;
  headerCollapse?: any;
  dataWidth?: any;
  dataCard?: any;
  dataTopBar?: any;
  dataTopBarColor?: any;
  dataTheme?: any;
  dataSidebarAll?: any;
  dataColorAll?: any;
  dataTopBarColorAll?: any;
  dataTopbarAll?: any;
  dataSidebar?: any;
  dataSidebarBg?: any;
  dataTopbarBg?: any;
  dataColor?: any;
  dataLoader?: any;
  isRtl?: any;
  dataSize?: any;
}

const initialState: ThemeSettingState = {
  theme: 'light',
  dataLayout: 'default',
  headerCollapse: 'default',
  dataWidth: 'fluid',
  dataCard: 'false',
  dataTopBar: 'light',
  dataTopBarColor: 'light',
  dataTheme: 'light',
  dataSidebarAll: '74, 58, 222',
  dataColorAll: '74, 58, 222',
  dataTopBarColorAll: '255, 255, 255',
  dataTopbarAll: '242, 242, 242',
  dataSidebar: 'light',
  dataSidebarBg: 'light',
  dataTopbarBg: 'light',
  dataColor: 'primary',
  dataLoader: 'false',
  isRtl: '',
  dataSize: 'default',
};

const themeSettingSlice = createSlice({
  name: 'themeSetting',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setDataLayout: (state, action: PayloadAction<any>) => {
      state.dataLayout = action.payload;
    },
    setHeaderCollapse: (state, action: PayloadAction<any>) => {
      state.headerCollapse = action.payload;
    },
    setDataWidth: (state, action: PayloadAction<any>) => {
      state.dataWidth = action.payload;
    },
    setDataCard: (state, action: PayloadAction<any>) => {
      state.dataCard = action.payload;
    },
    setTopBarColor: (state, action: PayloadAction<any>) => {
      state.dataTopBar = action.payload;
    },
    setTopBarColor2: (state, action: PayloadAction<any>) => {
      state.dataTopBarColor = action.payload;
    },
    setDataTheme: (state, action: PayloadAction<any>) => {
      state.dataTheme = action.payload;
    },
    setDataSidebar: (state, action: PayloadAction<any>) => {
      state.dataSidebar = action.payload;
    },
    setDataSidebarBg: (state, action: PayloadAction<any>) => {
      state.dataSidebarBg = action.payload;
    },
    setDataTopbarBg: (state, action: PayloadAction<any>) => {
      state.dataTopbarBg = action.payload;
    },
    setDataColor: (state, action: PayloadAction<any>) => {
      state.dataColor = action.payload;
    },
    setLoader: (state, action: PayloadAction<any>) => {
      state.dataLoader = action.payload;
    },
    setRtl: (state, action: PayloadAction<any>) => {
      state.isRtl = action.payload;
    },
    setDataSize: (state, action: PayloadAction<any>) => {
      state.dataSize = action.payload;
    },
    setDataSidebarAll: (state, action: PayloadAction<any>) => {
      state.dataSidebarAll = action.payload;
    },
    setDataTopbarAll: (state, action: PayloadAction<any>) => {
      state.dataTopbarAll = action.payload;
    },
    setDataTopBarColorAll: (state, action: PayloadAction<any>) => {
      state.dataTopBarColorAll = action.payload;
    },
    setDataColorAll: (state, action: PayloadAction<any>) => {
      state.dataColorAll = action.payload;
    },
    resetAllMode: (state) => {
      state.dataLayout = 'default';
      state.dataWidth = 'fluid';
      state.dataCard = 'false';
      state.dataTopBar = 'light';
      state.dataTopBarColor = 'light';
      state.dataTheme = 'light';
      state.dataSidebarAll = '74, 58, 222';
      state.dataColorAll = '74, 58, 222';
      state.dataTopBarColorAll = '255, 255, 255';
      state.dataTopbarAll = '242, 242, 242';
      state.dataSidebar = 'light';
      state.dataSidebarBg = 'light';
      state.dataTopbarBg = 'light';
      state.dataColor = 'primary';
      state.dataLoader = 'false';
      state.isRtl = '';
      state.dataSize = 'default';
    },
  },
});

export const { setTheme, setDataLayout, setHeaderCollapse, setDataWidth, setDataCard, setTopBarColor, setTopBarColor2, setDataTheme, setDataSidebar, setDataSidebarBg, setDataTopbarBg, setDataColor, setLoader, setRtl, setDataSidebarAll, setDataTopbarAll, setDataTopBarColorAll, setDataColorAll, resetAllMode, setDataSize } = themeSettingSlice.actions;
export default themeSettingSlice.reducer;
