const nodemailer = require('nodemailer');

// ─── Tạo transporter ────────────────────────────────────────────────────────
// Hỗ trợ Gmail hoặc SMTP tùy chỉnh
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password (không phải mật khẩu thường)
      },
    });
  }
  // SMTP tùy chỉnh (Brevo, Mailgun, SendGrid, v.v.)
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Format tiền VNĐ ────────────────────────────────────────────────────────
const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

// ─── HTML template xác nhận đơn hàng ────────────────────────────────────────
const buildConfirmationHTML = (order) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Xác nhận đơn hàng ${order.orderCode}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;">

    <!-- Header -->
    <div style="background:#09090b;padding:40px 48px;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A96E;">Sip &amp; Brew</p>
      <h1 style="margin:0;font-size:28px;font-weight:300;color:#F5F0E8;letter-spacing:-0.02em;">Đơn Hàng Đã Được Xác Nhận</h1>
    </div>

    <!-- Body -->
    <div style="padding:40px 48px;">
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
        Xin chào <strong style="color:#09090b;">${order.customer.fullName}</strong>,<br/>
        Cảm ơn bạn đã đặt hàng tại Sip &amp; Brew. Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.
      </p>

      <!-- Order code -->
      <div style="background:#f9f6f0;border-left:3px solid #C9A96E;padding:16px 20px;margin:0 0 32px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#888;">Mã đơn hàng</p>
        <p style="margin:0;font-size:22px;font-weight:600;color:#09090b;letter-spacing:0.05em;">${order.orderCode}</p>
      </div>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <thead>
          <tr style="border-bottom:1px solid #e5e5e0;">
            <th style="text-align:left;padding:8px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;font-weight:400;">Sản phẩm</th>
            <th style="text-align:right;padding:8px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;font-weight:400;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
          <tr style="border-bottom:1px solid #f0f0ea;">
            <td style="padding:14px 0;">
              <p style="margin:0 0 2px;font-size:14px;color:#09090b;font-weight:500;">${item.name}</p>
              <p style="margin:0;font-size:12px;color:#888;">SL: ${item.quantity} × ${fmt(item.price)}</p>
            </td>
            <td style="padding:14px 0;text-align:right;font-size:14px;color:#09090b;">${fmt(item.price * item.quantity)}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 0;font-size:13px;color:#888;">Tạm tính</td>
            <td style="padding:12px 0;text-align:right;font-size:13px;color:#888;">${fmt(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#888;">Phí vận chuyển</td>
            <td style="padding:4px 0;text-align:right;font-size:13px;color:${order.shippingFee === 0 ? '#C9A96E' : '#888'};">${order.shippingFee === 0 ? 'Miễn phí' : fmt(order.shippingFee)}</td>
          </tr>
          <tr style="border-top:2px solid #09090b;">
            <td style="padding:14px 0;font-size:16px;font-weight:600;color:#09090b;">Tổng cộng</td>
            <td style="padding:14px 0;text-align:right;font-size:18px;font-weight:600;color:#C9A96E;">${fmt(order.totalPrice)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Delivery info -->
      <div style="background:#f9f6f0;padding:20px 24px;margin:0 0 32px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#888;">Thông tin giao hàng</p>
        <p style="margin:0 0 4px;font-size:14px;color:#09090b;"><strong>Người nhận:</strong> ${order.customer.fullName}</p>
        <p style="margin:0 0 4px;font-size:14px;color:#09090b;"><strong>Điện thoại:</strong> ${order.customer.phone}</p>
        <p style="margin:0 0 4px;font-size:14px;color:#09090b;"><strong>Địa chỉ:</strong> ${order.customer.address}</p>
        <p style="margin:0;font-size:14px;color:#09090b;"><strong>Thanh toán:</strong> ${{ cod: 'COD - Tiền mặt khi nhận hàng', banking: 'Chuyển khoản ngân hàng', momo: 'Ví MoMo' }[order.paymentMethod]}</p>
        ${order.customer.note ? `<p style="margin:8px 0 0;font-size:13px;color:#888;font-style:italic;">Ghi chú: ${order.customer.note}</p>` : ''}
      </div>

      <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
        Thời gian giao hàng dự kiến: <strong style="color:#09090b;">30–60 phút</strong> trong nội thành.<br/>
        Chúng tôi sẽ liên hệ qua SĐT của bạn khi đơn hàng được giao.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#09090b;padding:28px 48px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:rgba(245,240,232,0.4);">Sip &amp; Brew — Thức uống thượng hạng</p>
      <p style="margin:0;font-size:11px;color:rgba(245,240,232,0.25);">© ${new Date().getFullYear()} Sip &amp; Brew. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Gửi email xác nhận cho khách hàng ─────────────────────────────────────
const sendOrderConfirmation = async (order) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER/EMAIL_PASS chưa được cấu hình — bỏ qua gửi email');
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from:    `"Sip & Brew" <${process.env.EMAIL_USER}>`,
    to:      order.customer.email,
    subject: `✅ Xác nhận đơn hàng ${order.orderCode} — Sip & Brew`,
    html:    buildConfirmationHTML(order),
  });

  console.log(`📧 Email xác nhận đã gửi → ${order.customer.email}`);
};

// ─── Gửi thông báo cho Admin ────────────────────────────────────────────────
const sendAdminNotification = async (order) => {
  if (!process.env.ADMIN_EMAIL || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const transporter = createTransporter();

  await transporter.sendMail({
    from:    `"Sip & Brew System" <${process.env.EMAIL_USER}>`,
    to:      process.env.ADMIN_EMAIL,
    subject: `🛒 Đơn hàng mới: ${order.orderCode} — ${order.customer.fullName}`,
    html: `
      <p><strong>Đơn hàng mới:</strong> ${order.orderCode}</p>
      <p><strong>Khách hàng:</strong> ${order.customer.fullName} — ${order.customer.phone}</p>
      <p><strong>Địa chỉ:</strong> ${order.customer.address}</p>
      <p><strong>Tổng tiền:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</p>
      <p><strong>SP:</strong> ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
    `,
  });
};

module.exports = { sendOrderConfirmation, sendAdminNotification };
