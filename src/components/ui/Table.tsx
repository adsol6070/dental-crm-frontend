import React from "react";
// import { Card, Button } from "react-bootstrap";
// import {
//   useTable,
//   usePagination,
//   useSortBy,
//   TableInstance,
//   TableState,
// } from "react-table";
// import { theme } from "../constants/theme";

interface TableProps {
  columns: any[];
  data: any[];
  title: string;
}

const Table: React.FC<TableProps> = (/* { columns, data, title } */) => {
  // const {
  //   getTableProps,
  //   getTableBodyProps,
  //   headerGroups,
  //   page,
  //   prepareRow,
  //   canPreviousPage,
  //   canNextPage,
  //   pageOptions,
  //   nextPage,
  //   previousPage,
  //   setPageSize,
  //   state: { pageIndex, pageSize },
  // } = useTable(
  //   {
  //     columns,
  //     data,
  //     initialState: { pageIndex: 0, pageSize: 5 },
  //   },
  //   useSortBy,
  //   usePagination
  // ) as TableInstance<object> & {
  //   state: TableState<object> & {
  //     pageIndex: number;
  //     pageSize: number;
  //   };
  //   nextPage: () => void;
  //   previousPage: () => void;
  //   canPreviousPage: boolean;
  //   canNextPage: boolean;
  //   pageOptions: number[];
  //   setPageSize: (size: number) => void;
  // };

  // return (
  //   <Card
  //     style={{
  //       border: "none",
  //       background: `${theme.colors.almostWhite}`,
  //       padding: "10px",
  //     }}
  //   >
  //     <Card.Header
  //       style={{
  //         border: "none",
  //         background: `${theme.colors.almostWhite}`,
  //         ...theme.fonts.bold,
  //       }}
  //     >
  //       <div className="d-flex justify-content-between align-items-center">
  //         <h4>{title}</h4>
  //       </div>
  //     </Card.Header>
  //     <Card.Body
  //       style={{
  //         border: "none",
  //         background: `${theme.colors.almostWhite}`,
  //         padding: "10px",
  //       }}
  //     >
  //       <table {...getTableProps()} style={{ width: "100%" }}>
  //         <thead>
  //           {headerGroups.map((headerGroup) => (
  //             <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
  //               {headerGroup.headers.map((column) => (
  //                 <th
  //                   {...column.getHeaderProps(column.getSortByToggleProps())}
  //                   style={{
  //                     padding: "10px",
  //                     borderBottom: "1px solid #ddd",
  //                     cursor: "pointer",
  //                   }}
  //                   key={column.id}
  //                 >
  //                   {column.render("Header")}
  //                   <span>
  //                     {column.isSorted
  //                       ? column.isSortedDesc
  //                         ? " 🔽"
  //                         : " 🔼"
  //                       : ""}
  //                   </span>
  //                 </th>
  //               ))}
  //             </tr>
  //           ))}
  //         </thead>
  //         <tbody {...getTableBodyProps()}>
  //           {page.map((row) => {
  //             prepareRow(row);
  //             return (
  //               <tr {...row.getRowProps()} key={row.id}>
  //                 {row.cells.map((cell) => (
  //                   <td
  //                     {...cell.getCellProps()}
  //                     style={{
  //                       padding: "10px",
  //                       borderBottom: "1px solid #ddd",
  //                     }}
  //                     key={cell.column.id}
  //                   >
  //                     {cell.render("Cell")}
  //                   </td>
  //                 ))}
  //               </tr>
  //             );
  //           })}
  //         </tbody>
  //       </table>

  //       <div className="pagination mt-3 d-flex justify-content-between align-items-center">
  //         <div>
  //           <Button
  //             onClick={() => previousPage()}
  //             disabled={!canPreviousPage}
  //             variant="outline-primary me-2"
  //           >
  //             Previous
  //           </Button>
  //           <Button
  //             onClick={() => nextPage()}
  //             disabled={!canNextPage}
  //             variant="outline-primary"
  //           >
  //             Next
  //           </Button>
  //         </div>

  //         <span>
  //           Page{" "}
  //           <strong>
  //             {pageIndex + 1} of {pageOptions.length}
  //           </strong>{" "}
  //         </span>

  //         <select
  //           value={pageSize}
  //           onChange={(e) => setPageSize(Number(e.target.value))}
  //           style={{ marginLeft: "10px" }}
  //         >
  //           {[5, 10, 20, 30, 50].map((size) => (
  //             <option key={size} value={size}>
  //               Show {size}
  //             </option>
  //           ))}
  //         </select>
  //       </div>
  //     </Card.Body>
  //   </Card>
  // );
  return <div>Table</div>;
};

export default Table;
