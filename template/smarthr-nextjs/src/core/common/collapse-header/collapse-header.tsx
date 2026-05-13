"use client";

import React  from "react";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { setHeaderCollapse } from "@/core/data/redux/themeSettingSlice";
import Link from "next/link";

const CollapseHeader = () => {
  const dispatch = useDispatch();
  const headerCollapse = useSelector((state: any) => state.themeSetting.headerCollapse);

  const toggleHeaderCollapse = () => {
    const newState = !headerCollapse;
    dispatch(setHeaderCollapse(newState));
    
    // Toggle header-collapse class on body
    if (newState) {
      document.body.classList.add('header-collapse');
    } else {
      document.body.classList.remove('header-collapse');
    }
  };

  // Sync with body class on mount and when headerCollapse changes
  React.useEffect(() => {
    if (headerCollapse) {
      document.body.classList.add('header-collapse');
    } else {
      document.body.classList.remove('header-collapse');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('header-collapse');
    };
  }, [headerCollapse]);

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip id="collapse-tooltip">
        {headerCollapse ? 'Expand' : 'Collapse'} Header
      </Tooltip>}
    >
      <Link 
        href="#" 
        id="collapse-header" 
        className={headerCollapse ? 'active' : ''} 
        onClick={toggleHeaderCollapse}
      >
        <i className={`ti ti-chevrons-${headerCollapse ? 'down' : 'up'}`} />
      </Link>
    </OverlayTrigger>
  );
};

export default CollapseHeader;
