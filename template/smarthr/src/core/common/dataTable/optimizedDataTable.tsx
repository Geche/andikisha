import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table } from "antd";
import type { DatatableProps } from "../../data/types";
import { useDebounce } from "../../hooks/usePerformanceOptimizations";

// Optimized DataTable component with performance enhancements
const OptimizedDataTable = React.memo(
  <T extends object = object>({
    columns,
    dataSource,
    Selection,
  }: DatatableProps<T>) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [Selections, setSelections] = useState<boolean>(true);

    // Debounce search text to prevent excessive filtering
    const debouncedSearchText = useDebounce(searchText, 300);

    // Memoize the filtered data to prevent recalculation on every render
    const filteredData = useMemo(() => {
      if (!debouncedSearchText) return dataSource;
      return dataSource.filter((record: T) =>
        Object.values(record).some((field) =>
          String(field)
            .toLowerCase()
            .includes(debouncedSearchText.toLowerCase())
        )
      );
    }, [dataSource, debouncedSearchText]);

    // Memoize the row selection configuration
    const rowSelection = useMemo(
      () => ({
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }),
      [selectedRowKeys]
    );

    // Memoize pagination configuration
    const paginationConfig = useMemo(
      () => ({
        locale: { items_per_page: "" },
        nextIcon: <i className="ti ti-chevron-right" />,
        prevIcon: <i className="ti ti-chevron-left" />,
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "30"],
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

    // Memoize the clear search handler
    const handleClearSearch = useCallback(() => {
      setSearchText("");
    }, []);

    useEffect(() => {
      setSelections(Selection ?? true);
    }, [Selection]);

    // Memoize the search input component
    const searchInput = useMemo(
      () => (
        <input
          type="search"
          className="form-control form-control-sm"
          placeholder="Search"
          aria-controls="DataTables_Table_0"
          value={searchText}
          onChange={handleSearchChange}
        />
      ),
      [searchText, handleSearchChange]
    );

    // Memoize the table top section
    const tableTopSection = useMemo(
      () => (
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
                <label>
                  {searchInput}
                  {searchText && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={handleClearSearch}
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      ),
      [searchInput, searchText, handleClearSearch]
    );

    // Memoize the table without selection
    const tableWithoutSelection = useMemo(
      () => (
        <Table
          className="table datanew dataTable no-footer"
          columns={columns}
          rowHoverable={false}
          dataSource={filteredData}
          pagination={paginationConfig}
        />
      ),
      [columns, filteredData, paginationConfig]
    );

    // Memoize the table with selection
    const tableWithSelection = useMemo(
      () => (
        <Table
          className="table datanew dataTable no-footer"
          rowSelection={rowSelection}
          columns={columns}
          rowHoverable={false}
          dataSource={filteredData}
          pagination={paginationConfigWithSelection}
        />
      ),
      [rowSelection, columns, filteredData, paginationConfigWithSelection]
    );

    return (
      <>
        {tableTopSection}
        {!Selections ? tableWithoutSelection : tableWithSelection}
      </>
    );
  }
);

OptimizedDataTable.displayName = "OptimizedDataTable";

export default OptimizedDataTable;
