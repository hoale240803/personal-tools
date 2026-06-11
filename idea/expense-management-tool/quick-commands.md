# push new code to Google App Script
# PHẢI chạy từ thư mục expense-management-tool (nơi chứa .clasp.json)
cd idea/expense-management-tool && npx @google/clasp push -f

# Hoặc dùng lệnh đầy đủ từ thư mục gốc:
npx --prefix . @google/clasp push -f --rootDir ./idea/expense-management-tool/src
