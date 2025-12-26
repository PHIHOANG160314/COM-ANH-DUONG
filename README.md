# COM-ANH-DUONG

[![CI/CD Pipeline](https://github.com/PHIHOANG160314/COM-ANH-DUONG/actions/workflows/ci.yml/badge.svg)](https://github.com/PHIHOANG160314/COM-ANH-DUONG/actions/workflows/ci.yml)

## 📋 Mô tả

Repository chứa các tài liệu và dữ liệu của dự án COM-ANH-DUONG.

## 📁 Cấu trúc

```
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD Pipeline
├── menu mau.xlsx           # File menu mẫu
└── README.md               # File này
```

## 🚀 CI/CD

Pipeline tự động chạy khi:
- Push code lên branch `main`
- Tạo Pull Request
- Trigger thủ công

### Các bước trong Pipeline:
1. **🔍 Validate** - Kiểm tra files
2. **🏗️ Build** - Build project
3. **🚀 Deploy** - Deploy lên production

## 👤 Tác giả

**PHIHOANG160314**

## 📄 License

MIT License
