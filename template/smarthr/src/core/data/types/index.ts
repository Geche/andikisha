// ============================================================================
// REDUX STORE TYPES
// ============================================================================

export interface ThemeSettingState {
  dataLayout: string;
  dataWidth: string;
  dataCard: string;
  dataSize: string;
  dataSidebar: string;
  dataSidebarAll: string;
  dataTopbarAll: string;
  dataTopBarColorAll: string;
  dataColorAll: string;
  dataTheme: string;
  dataTopBar: string;
  dataTopBarColor: string;
  dataSidebarBg: string;
  dataTopbarBg: string;
  dataColor: string;
  dataLoader: string;
  isRtl: boolean | string;
  headerCollapse: boolean;
}

export interface SidebarState {
  mobileSidebar: boolean;
  miniSidebar: boolean;
  expandMenu: boolean;
  resetMobileSidebar: boolean;
}

export interface RootState {
  themeSetting: ThemeSettingState;
  sidebarSlice: SidebarState;
}

// ============================================================================
// MENU & NAVIGATION TYPES
// ============================================================================

export interface SubMenuItem {
  label: string;
  link: string;
  submenu?: boolean;
  showSubRoute?: boolean;
  base?: string;
  base2?: string;
  customSubmenuTwo?: boolean;
  submenuItems?: SubMenuItem[];
  themeSetting?: boolean;
}

export interface MenuItem {
  label: string;
  link: string;
  submenu: boolean;
  showSubRoute: boolean;
  icon: string;
  base: string;
  materialicons: string;
  dot?: boolean;
  submenuItems: SubMenuItem[];
  themeSetting?: boolean;
}

export interface MainMenu {
  tittle: string;
  icon: string;
  showAsTab: boolean;
  separateRoute: boolean;
  submenuItems: MenuItem[];
}

export interface HorizontalSubMenu {
  menuValue?: string;
  label?: string;
  route?: string;
  base?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
  customSubmenuTwo?: boolean;
  subMenusTwo?: HorizontalSubMenu[];
}

export interface HorizontalMenuItem {
  menuValue: string;
  hasSubRoute?: boolean;
  hasSubRouteTwo?: boolean;
  showSubRoute?: boolean;
  icon: string;
  base: string;
  base1?: string;
  base2?: string;
  subMenus: HorizontalSubMenu[];
}

export interface HorizontalMainMenu {
  title: string;
  showAsTab: boolean;
  separateRoute: boolean;
  menu: HorizontalMenuItem[];
}

// ============================================================================
// DATA TABLE TYPES
// ============================================================================

import type { ColumnType } from "antd/es/table";

export interface TableColumn {
  title: string;
  dataIndex: string;
  key?: string;
  render?: (text: string, record: any, index?: number) => React.ReactNode;
  sorter?: (a: any, b: any) => number;
  filters?: { text: string; value: string }[];
  onFilter?: (value: string, record: any) => boolean;
  width?: number | string;
  fixed?: "left" | "right";
  ellipsis?: boolean;
  children?: TableColumn[];
}

export interface DatatableProps<T extends object = TableData> {
  columns: ColumnType<T>[];
  dataSource: T[];
  Selection?: boolean;
  loading?: boolean;
  skeletonRows?: number;
}

// ============================================================================
// COMMON DATA TYPES
// ============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: "active" | "inactive" | "pending";
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  salary?: number;
}

export interface Employee extends User {
  employeeId: string;
  department: string;
  position: string;
  manager?: string;
  salary: number;
  joinDate: string;
  leaveBalance?: number;
}

export interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  class: string;
  section: string;
  rollNo: string;
  admissionNo: string;
  parentName: string;
  parentPhone: string;
  address: string;
  dob: string;
  gender: "male" | "female" | "other";
  status: "active" | "inactive";
  joinDate: string;
}

export interface Teacher extends User {
  teacherId: string;
  subject: string;
  qualification: string;
  experience: number;
  salary: number;
  joinDate: string;
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  size: string;
  website?: string;
  phone: string;
  email: string;
  address: string;
  status: "active" | "inactive";
  createdDate: string;
  owner: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "lost" | "converted";
  value: number;
  assignedTo: string;
  createdDate: string;
  lastContact: string;
}

export interface Deal {
  id: number;
  name: string;
  company: string;
  value: number;
  stage:
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "closed-won"
    | "closed-lost";
  probability: number;
  closeDate: string;
  owner: string;
  createdDate: string;
  status: "active" | "closed";
}

export interface Contact {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  status: "active" | "inactive";
  createdDate: string;
  lastContact: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  status: "planning" | "in-progress" | "completed" | "on-hold" | "cancelled";
  progress: number;
  budget: number;
  manager: string;
  team: string[];
  priority: "low" | "medium" | "high" | "urgent";
}

export interface Task {
  id: number;
  title: string;
  description: string;
  project?: string;
  assignedTo: string;
  assignedBy: string;
  startDate: string;
  dueDate: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  tags?: string[];
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Expense {
  id: number;
  expenseName: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  approvedBy?: string;
  receipt?: string;
}

export interface Leave {
  id: number;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface Attendance {
  id: number;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "present" | "absent" | "late" | "half-day";
  totalHours?: number;
  overtime?: number;
}

export interface Payroll {
  id: number;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "paid";
  paidDate?: string;
}

// ============================================================================
// FORM & INPUT TYPES
// ============================================================================

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "date"
    | "checkbox"
    | "radio";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type StatusType = "success" | "error" | "warning" | "info";
export type SizeType = "small" | "medium" | "large";
export type ColorType =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark";

export interface Notification {
  id: string;
  type: StatusType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

// ============================================================================
// CHART & ANALYTICS TYPES
// ============================================================================

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface AnalyticsData {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  growthRate: number;
  chartData: ChartData;
}

// ============================================================================
// FILE & MEDIA TYPES
// ============================================================================

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

// ============================================================================
// SETTINGS & CONFIGURATION TYPES
// ============================================================================

export interface AppSettings {
  theme: "light" | "dark";
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface UserPreferences {
  userId: string;
  settings: AppSettings;
  dashboardLayout: string;
  sidebarCollapsed: boolean;
  recentPages: string[];
}

// ============================================================================
// ERROR & VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
  timestamp: string;
}

// ============================================================================
// EVENT & CALLBACK TYPES
// ============================================================================

export interface EventHandler<T = any> {
  (event: T): void;
}

export interface ChangeHandler<T = any> {
  (value: T): void;
}

export interface ClickHandler {
  (event: React.MouseEvent<HTMLElement>): void;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "outline-primary"
    | "outline-secondary"
    | "outline-success"
    | "outline-danger"
    | "outline-warning"
    | "outline-info"
    | "outline-light"
    | "outline-dark";
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean;
  onClick?: ClickHandler;
  type?: "button" | "submit" | "reset";
  href?: string;
  target?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  centered?: boolean;
  backdrop?: boolean | "static";
  keyboard?: boolean;
}

export interface DropdownProps extends BaseComponentProps {
  items: Array<{
    label: string;
    value: string | number;
    icon?: string;
    disabled?: boolean;
    onClick?: () => void;
  }>;
  trigger?: "click" | "hover";
  placement?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

// ============================================================================
// LEGACY COMPATIBILITY TYPES
// ============================================================================

// For backward compatibility with existing code
export interface TableData {
  [key: string]: string | number | boolean | null | undefined;
}

export interface CommonState {
  darkMode: boolean;
}

export interface status {
  text: string;
  status: string;
}

export interface CountriesData {
  name: string;
  countryName: string;
  countryId: string;
  startDate: string;
  endDate: string;
  countryCode: string;
}

export interface DealsInterface {
  dealName: string;
  stage: string;
  dealValue: string;
  tag1: string;
  closeDate: string;
  crearedDate: string;
  owner: string;
  status: string;
  probability: string;
}

export interface DeleteRequestInterface {
  id: number;
  si_no: string;
  select: string;
  customer_name: string;
  customer_image: string;
  customer_no: string;
  created: string;
  delete_request: string;
  Action: string;
}

export interface AppState {
  mouseOverSidebar: string;
}
