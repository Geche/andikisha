"use client";

import { datatable } from "../../../core/data/json/datatable";
import Table from "../../../core/common/dataTable/index";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

type DataTableRow = {
  key: string;
  name: string;
  position: string;
  office: string;
  age: string;
  startDate: string;
  salary: string;
};

const DataTablesComponent = () => {
  const routes = all_routes;
  const data = datatable;
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a: DataTableRow, b: DataTableRow) =>
        a.name.length - b.name.length,
    },
    {
      title: "Position",
      dataIndex: "position",
      sorter: (a: DataTableRow, b: DataTableRow) =>
        a.position.length - b.position.length,
    },
    {
      title: "Office",
      dataIndex: "office",
      sorter: (a: DataTableRow, b: DataTableRow) =>
        a.office.length - b.office.length,
    },
    {
      title: "Age",
      dataIndex: "age",
      sorter: (a: DataTableRow, b: DataTableRow) => a.age.length - b.age.length,
    },
    {
      title: "Start date",
      dataIndex: "startDate",
      sorter: (a: DataTableRow, b: DataTableRow) =>
        a.startDate.length - b.startDate.length,
    },
    {
      title: "Salary",
      dataIndex: "age",
      sorter: (a: DataTableRow, b: DataTableRow) =>
        a.salary.length - b.salary.length,
    },
  ];
  return (
    <div>
      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">Data Tables</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Data Tables</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Default Datatable</h4>
                  <p className="card-text">
                    This is the most basic example of the datatables
                  </p>
                </div>
                <div className="card-body">
                  <Table<DataTableRow> dataSource={data} columns={columns} />
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* /Page Header */}
    </div>
  );
};

export default DataTablesComponent;
