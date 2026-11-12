import { useEffect, useState } from 'react'
import { MessageCircle, Facebook, Mail, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SiteSettings } from '@/types'

export default function ContactSection() {
  const [settings, setSettings] = useState<SiteSettings>({})

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('key, value')
      const map: SiteSettings = {}
      ;(data ?? []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
      setSettings(map)
    })()
  }, [])

  const contacts = [
    { type: 'Zalo', label: 'Zalo 1', value: settings.zalo_1, link: settings.zalo_link_1, icon: MessageCircle },
    { type: 'Zalo', label: 'Zalo 2', value: settings.zalo_2, link: settings.zalo_link_2, icon: MessageCircle },
    { type: 'Facebook', label: 'Facebook 1', value: settings.facebook_1, link: settings.facebook_1, icon: Facebook },
    { type: 'Facebook', label: 'Facebook 2', value: settings.facebook_2, link: settings.facebook_2, icon: Facebook },
  ].filter((c) => c.link)

  return (
    <section id="contact" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mystic-500/10 border border-mystic-400/20 mb-4">
            <Mail className="w-4 h-4 text-mystic-300" />
            <span className="text-sm text-mystic-200">Liên hệ</span>
          </div>
          <h2 className="section-title">KẾT NỐI VỚI CHÚNG TÔI</h2>
          <p className="section-subtitle">Liên hệ trực tiếp qua Zalo hoặc Facebook để được hỗ trợ nhanh chóng</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contacts.map((c, i) => (
            <a
              key={i}
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card glass-card-hover p-6 text-center group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="relative inline-flex items-center justify-center w-14 h-14 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-mystic-500/20 to-abyss-500/20 rounded-2xl blur-md group-hover:from-mystic-500/40 group-hover:to-abyss-500/40 transition-all duration-500" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-mystic-600/30 to-abyss-600/30 rounded-2xl border border-mystic-400/20 flex items-center justify-center">
                  <c.icon className="w-6 h-6 text-mystic-300 group-hover:text-gold-300 transition-colors duration-500" />
                </div>
              </div>
              <div className="font-display font-semibold text-white text-sm mb-1">{c.label}</div>
              {c.type === 'Zalo' && c.value && (
                <div className="text-mystic-300 text-xs">{c.value}</div>
              )}
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 group-hover:text-mystic-300 transition-colors">
                Mở liên kết <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
