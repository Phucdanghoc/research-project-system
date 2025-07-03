#!/bin/bash
set -e

# Xoá file server.pid nếu tồn tại (tránh lỗi Rails server đã chạy)
rm -f /rails/tmp/pids/server.pid

# Chạy câu lệnh gốc (migrate + start server)
exec "$@"
