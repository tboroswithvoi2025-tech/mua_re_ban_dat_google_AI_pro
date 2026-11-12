import { Boxes, BadgeDollarSign, Headphones } from 'lucide-react'

const FEATURES = [
  {
    icon: Boxes,
    title: 'Nguồn hàng chủ động',
    desc: 'Kiểm soát toàn bộ nguồn cung dịch vụ, không phụ thuộc trung gian. Đảm bảo tính ổn định và liên tục.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Giá cả minh bạch',
    desc: 'Bảng giá rõ ràng, không phụ phí ẩn. Bạn biết chính xác số tiền phải thanh toán cho từng đơn hàng.',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ khách hàng trực tiếp',
    desc: 'Kênh liên hệ Zalo và Facebook phản hồi nhanh chóng. Xử lý sự cố và bảo hành trong thời gian sớm nhất.',
  },
]

export default function InfoSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title">Vì sao chọn chúng tôi</h2>
          <p className="section-subtitle">Ba cam kết cốt lõi của NGUỒN HÀNG TỰ CUNG</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass-card glass-card-hover p-8 text-center group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-mystic-500/20 to-abyss-500/20 rounded-2xl blur-md group-hover:from-mystic-500/40 group-hover:to-abyss-500/40 transition-all duration-500" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-mystic-600/30 to-abyss-600/30 rounded-2xl border border-mystic-400/20 flex items-center justify-center">
                  <f.icon className="w-7 h-7 text-mystic-300 group-hover:text-gold-300 transition-colors duration-500" />
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
