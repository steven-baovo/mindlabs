# Quy định Ngôn ngữ Thiết kế (Design Language) - Mindlabs

Tài liệu này quy định các tiêu chuẩn về thẩm mỹ, màu sắc, typography và tương tác để đảm bảo giao diện Mindlabs luôn đồng nhất, hiện đại và mang lại trải nghiệm "Premium" cho người dùng.

---

## 🎨 1. Triết lý Thiết kế (Design Philosophy)
*   **Minimalist but Premium**: Tối giản nhưng tinh tế. Không dùng màu sắc lòe loẹt, tập trung vào khoảng trắng (whitespace) và bố cục thoáng đãng.
*   **Smooth & Alive**: Giao diện phải mang lại cảm giác "sống động" thông qua các hiệu ứng chuyển động mượt mà (Micro-animations) và phản hồi tức thì (Optimistic UI).
*   **Glassmorphism**: Sử dụng hiệu ứng kính (blur, opacity nhẹ) để tạo chiều sâu cho các bảng điều khiển và modal.

---

## 🌈 2. Bảng màu (Color Palette)
Chúng ta tuyệt đối **không sử dụng các màu cơ bản nguyên bản** (như thuần đỏ `#FF0000`, thuần xanh `#0000FF`). Hãy sử dụng các dải màu được tinh chỉnh hài hòa:

*   **Màu chủ đạo (Primary)**: Màu thương hiệu hoặc các màu pastel đậm đà.
*   **Màu nền (Background)**:
    *   Sáng: Trắng ngà hoặc xám siêu nhẹ (`#F9F9F9`, `#F5F5F5`).
    *   Tối (nếu có): Xám đen sâu, không dùng đen tuyền.
*   **Màu chữ**:
    *   Chính: `#000000` với opacity `0.9` hoặc xám đậm để bớt gắt.
    *   Phụ: Opacity `0.4` - `0.5` cho subtext.

---

## font-family 3. Kiểu chữ (Typography)
*   Không sử dụng font mặc định của trình duyệt.
*   Ưu tiên các font hiện đại từ Google Fonts: **Inter**, **Outfit**, hoặc **Roboto**.
*   **Quy tắc**:
    *   Tiêu đề nhỏ, nhãn (Label): Chữ in hoa (UPPERCASE), `font-black`, `tracking-widest` (giãn chữ rộng), kích thước nhỏ (`text-[10px]`).
    *   Tiêu đề lớn: `font-black`, `tracking-tighter` (chữ khít lại để tạo cảm giác hiện đại).

---

## ✨ 4. Tương tác & Hiệu ứng (Interactions & Effects)
*   **Hover State**: Mọi nút bấm hoặc item có thể click đều phải có hiệu ứng hover nhẹ nhàng (thay đổi `bg-opacity`, scale nhẹ `scale-[1.02]`, hoặc đổi màu nhẹ).
*   **Micro-animations**: Dùng `framer-motion` cho các hiệu ứng xuất hiện (fade in, slide up) để giao diện không bị giật cục.
*   **Bo góc (Border Radius)**: Sử dụng bo góc lớn (`rounded-3xl`, `rounded-[32px]`) cho các thẻ (Card) và Modal để tạo cảm giác thân thiện, hiện đại.

---

## 🚫 5. Quy tắc cấm kỵ (Anti-patterns)
*   **Không dùng ảnh placeholder**: Nếu cần ảnh minh họa, phải tạo ảnh thực tế hoặc dùng công nghệ AI để sinh ảnh đẹp.
*   **Không để giao diện đơ**: Mọi hành động click (như lưu, xóa) phải có trạng thái loading hoặc cập nhật lạc quan (Optimistic UI) ngay lập tức.
