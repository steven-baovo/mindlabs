# Bản đồ Kỹ thuật (Technical Map) - Mindlabs

Tài liệu này tóm tắt cấu trúc kỹ thuật và sơ đồ tính năng của dự án Mindlabs, giúp nhà phát triển nhanh chóng nắm bắt hệ thống.

---

## 🏗️ Tổng quan Kiến trúc
*   **Framework**: Next.js 16 (App Router) với Turbopack.
*   **Database & Auth**: Supabase (PostgreSQL).
*   **CMS (Nội dung)**: Sanity.io (quản lý bài viết Blog).
*   **Styling**: Tailwind CSS 4.
*   **State Management**: React Context (Focus, Workspace) + Local State.

---

## 🗺️ Bản đồ Tính năng (Feature Map)

### 1. MindFocus (Bộ đếm Pomodoro & Quản lý Nhiệm vụ)
*   **Mô tả**: Giúp người dùng tập trung làm việc theo phương pháp Pomodoro.
*   **Kỹ thuật chính**:
    *   `FocusContext.tsx`: Quản lý thời gian, trạng thái chạy/dừng toàn cục.
    *   **Optimistic UI**: Thao tác thêm/sửa/xóa task cập nhật ngay lập tức ở client và đồng bộ ngầm với server.
    *   Hỗ trợ Guest Mode (lưu `localStorage` khi chưa đăng nhập).
*   **Files chính**: `src/app/(frontend)/pomodoro/page.tsx`, `src/components/focus/*`.

### 2. MindSpace (Không gian làm việc & Ghi chú)
*   **Mô tả**: Quản lý ghi chú (Notes) và Bản đồ tư duy (Mindmap).
*   **Kỹ thuật chính**:
    *   Trình soạn thảo văn bản (Rich Text Editor) dựa trên Tiptap.
    *   Hệ thống cây thư mục (Folder-based resource management).
    *   Vẽ Mindmap với các node có thể kéo thả.
*   **Files chính**: `src/app/(frontend)/mindspace/*`, `src/components/mindnote/*`, `src/components/mindmap/*`.

### 3. mindAI (Trợ lý Trí tuệ nhân tạo)
*   **Mô tả**: Chat và hỗ trợ xử lý thông tin bằng AI.
*   **Kỹ thuật chính**:
    *   Tích hợp mô hình ngôn ngữ lớn (LLM).
    *   Hệ thống "Skills" để mở rộng khả năng của AI.
*   **Files chính**: `src/app/(frontend)/mindai/*`, `src/components/mindai/*`.

### 4. Clarity Planner (Lập kế hoạch trực quan)
*   **Mô tả**: Xếp lịch và quản lý thời gian dạng khối (Time blocking).
*   **Files chính**: `src/app/(frontend)/clarity/*`, `src/components/clarity/*`.

### 5. Blog (Thư viện Nghiên cứu)
*   **Mô tả**: Hiển thị các bài viết chia sẻ kiến thức.
*   **Kỹ thuật chính**:
    *   Fetch dữ liệu từ Sanity CMS.
    *   Hỗ trợ ISR (Incremental Static Regeneration) với `revalidate = 60`.
    *   Fallback dữ liệu mẫu từ `mockPosts.ts` khi không có kết nối Sanity.
*   **Files chính**: `src/app/(frontend)/blog/*`.

---

## 📂 Cấu trúc Thư mục Dự án

```text
mindlabs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Module Đăng nhập/Đăng ký
│   │   ├── (frontend)/         # Module Giao diện chính (Blog, Focus, MindSpace...)
│   │   └── api/                # Các API Endpoints
│   ├── components/             # UI Components chia theo module
│   ├── contexts/               # React Contexts quản lý state
│   ├── hooks/                  # Custom Hooks (useDebounce, useLocalStorage...)
│   └── lib/                    # Cấu hình Supabase, Tiptap, utils
├── supabase/                   # Database migrations
└── package.json                # Dependencies & Scripts
```
