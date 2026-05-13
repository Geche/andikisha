// index.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Table, Skeleton } from "antd";
import type { DatatableProps } from "../../data/types";

// Skeleton row component for loading state
const SkeletonRow = React.memo(({ columns, rowId }: { columns: number; rowId: string }) => (
  <tr className="skeleton-row">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={`${rowId}-col-${index}`} style={{ padding: "12px 8px" }}>
        <Skeleton.Input active size="small" style={{ width: "100%", height: 20 }} />
      </td>
    ))}
  </tr>
));

SkeletonRow.displayName = "SkeletonRow";

// Table skeleton component
const TableSkeleton = React.memo(({ columns, rows = 10 }: { columns: number; rows?: number }) => (
  <div className="table-skeleton">
    <table className="table datanew dataTable no-footer" style={{ width: "100%" }}>
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={`skeleton-th-${index}`} style={{ padding: "12px 8px" }}>
              <Skeleton.Input active size="small" style={{ width: "80%", height: 16 }} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <SkeletonRow key={`skeleton-row-${rowIndex}`} columns={columns} rowId={`skeleton-row-${rowIndex}`} />
        ))}
      </tbody>
    </table>
  </div>
));

TableSkeleton.displayName = "TableSkeleton";

// Custom hook for debounced value
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

function Datatable<T extends object = object>({
  columns,
  dataSource,
  Selection,
  loading: externalLoading,
  skeletonRows = 10,
}: DatatableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [Selections, setSelections] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [tableData, setTableData] = useState<T[]>([]);
  const initialLoadRef = useRef<boolean>(false);

  // Debounce search text for better performance with large datasets
  const debouncedSearchText = useDebounce(searchText, 300);

  // Track searching state - show skeleton when search text is being debounced
  useEffect(() => {
    if (searchText !== debouncedSearchText) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchText, debouncedSearchText]);
  
  // Use external loading if provided, otherwise use internal loading state or searching state
  const showLoading = externalLoading !== undefined ? externalLoading : (isLoading || isSearching);

  // Handle initial loading - load data immediately without artificial delays
  useEffect(() => {
    if (initialLoadRef.current) return;

    // Load data immediately for fast page rendering
    setTableData(dataSource);
    setIsLoading(false);
    initialLoadRef.current = true;
  }, [dataSource]);

  // Update table data when dataSource changes (after initial load)
  useEffect(() => {
    if (initialLoadRef.current) {
      setTableData(dataSource);
    }
  }, [dataSource]);

  // Optimized filtered data with memoization for large datasets
  const filteredData = useMemo(() => {
    if (!debouncedSearchText) return tableData;
    
    const searchLower = debouncedSearchText.toLowerCase();
    
    // Use more efficient filtering for large datasets
    return tableData.filter((record: T) => {
      const values = Object.values(record);
      for (let i = 0; i < values.length; i++) {
        if (String(values[i]).toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      return false;
    });
  }, [tableData, debouncedSearchText]);

  // Memoize the row selection configuration
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: setSelectedRowKeys,
    }),
    [selectedRowKeys]
  );

  // Memoize pagination configuration with virtual scrolling support for large datasets
  const paginationConfig = useMemo(
    () => ({
      locale: { items_per_page: "" },
      nextIcon: <i className="ti ti-chevron-right" />,
      prevIcon: <i className="ti ti-chevron-left" />,
      defaultPageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "30", "50", "100"],
    }),
    []
  );

  // Memoize pagination config with selection
  const paginationConfigWithSelection = useMemo(
    () => ({
      ...paginationConfig,
      showTotal: (total: number, range: [number, number]) =>
        `Showing ${range[0]} - ${range[1]} of ${total} entries`,
    }),
    [paginationConfig]
  );

  // Memoize the search input change handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    []
  );

  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  useEffect(() => {
    setSelections(Selection ?? true);
  }, [Selection]);

  // Calculate column count for skeleton
  const columnCount = useMemo(() => {
    return (Selections ? 1 : 0) + columns.length;
  }, [Selections, columns.length]);

  // Virtual scroll configuration for large datasets
  const scrollConfig = useMemo(() => {
    // Enable virtual scroll for datasets larger than 100 rows
    if (filteredData.length > 100) {
      return { y: 500 };
    }
    return undefined;
  }, [filteredData.length]);

  // Generate unique row key - uses 'key' or 'id' field if available, otherwise uses index
  const getRowKey = useCallback((record: T, index?: number): string => {
    const rec = record as Record<string, unknown>;
    if (rec.key !== undefined) return String(rec.key);
    if (rec.id !== undefined) return String(rec.id);
    return `row-${index}`;
  }, []);

  // Memoized table props for better performance
  const tableProps = useMemo(
    () => ({
      className: "table datanew dataTable no-footer",
      rowHoverable: false,
      dataSource: filteredData,
      scroll: scrollConfig,
      virtual: filteredData.length > 500, // Enable virtual rendering for very large datasets
      rowKey: getRowKey,
    }),
    [filteredData, scrollConfig, getRowKey]
  );

  return (
    <>
      <div className="table-top-data">
        <div className="row p-3">
          <div className="col-sm-12 col-md-6">
            <div
              className="dataTables_length"
              id="DataTables_Table_0_length"
            ></div>
          </div>
          <div className="col-sm-12 col-md-6">
            <div
              id="DataTables_Table_0_filter"
              className="dataTables_filter text-end mb-0"
            >
              <label className="d-flex align-items-center justify-content-end gap-2">
                <div className="position-relative">
                  <input
                    type="search"
                    className="form-control form-control-sm"
                    placeholder="Search"
                    aria-controls="DataTables_Table_0"
                    value={searchText}
                    onChange={handleSearchChange}
                    disabled={isLoading}
                    style={{ paddingRight: isSearching ? 32 : searchText ? 28 : 8 }}
                  />
                  {isSearching ? (
                    <span
                      className="position-absolute d-flex align-items-center"
                      style={{
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <span 
                        className="spinner-border spinner-border-sm text-primary" 
                        style={{ width: 14, height: 14 }}
                      />
                    </span>
                  ) : searchText && !isLoading ? (
                    <button
                      type="button"
                      className="btn btn-sm position-absolute"
                      onClick={handleClearSearch}
                      style={{
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        padding: "2px 6px",
                        background: "transparent",
                        border: "none",
                      }}
                    >
                      <i className="ti ti-x fs-12 text-muted" />
                    </button>
                  ) : null}
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {showLoading ? (
        <TableSkeleton columns={columnCount} rows={skeletonRows} />
      ) : !Selections ? (
        <Table
          {...tableProps}
          columns={columns}
          pagination={paginationConfig}
        />
      ) : (
        <Table
          {...tableProps}
          rowSelection={rowSelection}
          columns={columns}
          pagination={paginationConfigWithSelection}
        />
      )}
    </>
  );
}

export default React.memo(Datatable) as typeof Datatable;
