import React, { useState, useCallback, useMemo } from "react";
import { Input, Spin } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { useSearchDebounce } from "../../hooks/useDebounceThrottle";

interface DebouncedSearchInputProps {
  placeholder?: string;
  delay?: number;
  minLength?: number;
  onSearch: (term: string) => void;
  onClear?: () => void;
  className?: string;
  size?: "small" | "middle" | "large";
  allowClear?: boolean;
  disabled?: boolean;
  loading?: boolean;
  validate?: (term: string) => boolean;
  showSearchIcon?: boolean;
  autoFocus?: boolean;
}

const DebouncedSearchInput: React.FC<DebouncedSearchInputProps> = ({
  placeholder = "Search...",
  delay = 300,
  minLength = 2,
  onSearch,
  onClear,
  className = "",
  size = "middle",
  allowClear = true,
  disabled = false,
  loading = false,
  validate,
  showSearchIcon = true,
  autoFocus = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Use the search debounce hook
  const {
    searchTerm: debouncedSearch,
    isSearching,
    hasValidSearch,
  } = useSearchDebounce(searchTerm, delay, minLength);

  // Memoize the search handler
  const handleSearch = useCallback(
    (term: string) => {
      if (validate && !validate(term)) {
        return;
      }
      onSearch(term);
    },
    [onSearch, validate]
  );

  // Handle search term changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setSearchTerm("");
    onClear?.();
  }, [onClear]);

  // Trigger search when debounced term changes
  React.useEffect(() => {
    if (hasValidSearch) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, hasValidSearch, handleSearch]);

  // Memoize the suffix icon
  const suffixIcon = useMemo(() => {
    if (loading) {
      return <LoadingOutlined spin />;
    }
    if (isSearching) {
      return <Spin size="small" />;
    }
    if (showSearchIcon) {
      return <SearchOutlined />;
    }
    return null;
  }, [loading, isSearching, showSearchIcon]);

  // Memoize the input props
  const inputProps = useMemo(
    () => ({
      placeholder,
      value: searchTerm,
      onChange: handleChange,
      onClear: handleClear,
      className,
      size,
      allowClear: allowClear && !disabled,
      disabled,
      prefix:
        showSearchIcon && !loading && !isSearching ? (
          <SearchOutlined />
        ) : undefined,
      suffix: suffixIcon,
      autoFocus,
    }),
    [
      placeholder,
      searchTerm,
      handleChange,
      handleClear,
      className,
      size,
      allowClear,
      disabled,
      showSearchIcon,
      loading,
      isSearching,
      suffixIcon,
      autoFocus,
    ]
  );

  return (
    <div className="debounced-search-input">
      <Input {...inputProps} />
      {hasValidSearch && isSearching && (
        <div className="search-indicator">
          <small>Searching...</small>
        </div>
      )}
    </div>
  );
};

export default React.memo(DebouncedSearchInput);
