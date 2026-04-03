export default function DataStatePanel({
  type = 'loading',
  title,
  message,
  onRetry,
  className = ''
}) {
  const isError = type === 'error';
  const isEmpty = type === 'empty';

  const resolvedTitle = title
    || (type === 'loading' ? 'Đang tải dữ liệu...' : type === 'error' ? 'Không thể tải dữ liệu' : 'Chưa có dữ liệu');

  const resolvedMessage = message
    || (type === 'loading'
      ? 'Vui lòng đợi trong giây lát.'
      : type === 'error'
        ? 'Đã có lỗi xảy ra, bạn có thể thử lại.'
        : 'Hiện chưa có dữ liệu để hiển thị.');

  return (
    <div className={`data-state-panel ${className}`.trim()} role={isError ? 'alert' : 'status'}>
      <h3>{resolvedTitle}</h3>
      <p>{resolvedMessage}</p>
      {isError && onRetry ? (
        <button type="button" className="btn secondary" onClick={onRetry}>
          Thử lại
        </button>
      ) : null}
      {isEmpty && onRetry ? (
        <button type="button" className="btn secondary" onClick={onRetry}>
          Tải lại
        </button>
      ) : null}
    </div>
  );
}
