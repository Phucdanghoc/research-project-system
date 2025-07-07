
const TableAdmin = ({
  columns = [],
  data = [],
  actions = null,
  emptyMessage = 'Không có dữ liệu để hiển thị.',
  className = 'w-full bg-white shadow-md rounded-lg text-center',
  headerClassName = 'bg-blue-400 text-white',
  rowClassName = 'hover:bg-blue-100',
  cellClassName = 'py-2 px-4',
}) => {
  return (
    <table className={className}>
      <thead>
        <tr className={headerClassName}>
          {columns.map((column, index) => (
            <th key={index} className={cellClassName}>
              {column.header}
            </th>
          ))}
          {actions && <th className={cellClassName}>Hành động</th>}
        </tr>
      </thead>
      <tbody >
        {data.length > 0 ? (
          data.map((item, rowIndex) => (
            <tr key={item.id || rowIndex} className={rowClassName}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={cellClassName}>
                  {column.render
                    ? column.render(item, rowIndex)
                    : item[column.key] || '-'}
                </td>
              ))}
              <td className={`${cellClassName}  justify-center items-center space-x-2`}>
                {actions(item, rowIndex)}
              </td>

            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length + (actions ? 1 : 0)}
              className={`${cellClassName} text-gray-500`}
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableAdmin;