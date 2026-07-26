import ScreenFrame from '../components/ScreenFrame';
import { Headphones, Mail, MessageCircle, BookOpen } from 'lucide-react';

const SUPPORT_CHANNELS = [
  { icon: Headphones, title: 'Live Support', desc: 'Mon–Fri 9AM–6PM PKT', action: 'Start Chat' },
  { icon: Mail, title: 'Email Support', desc: 'support@taimorpackages.com', action: 'Send Email' },
  { icon: MessageCircle, title: 'WhatsApp', desc: '+92 300 1234567', action: 'Message' },
  { icon: BookOpen, title: 'Documentation', desc: 'User guides & API docs', action: 'Browse Docs' },
];

export default function SupportScreen() {
  return (
    <ScreenFrame title="Support" subtitle="Get help with Taimor Packages ERP">
      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
        {SUPPORT_CHANNELS.map((ch) => {
          const Icon = ch.icon;
          return (
            <div key={ch.title} className="erp-stat-box">
              <div className="mb-2 flex items-center gap-2">
                <Icon size={18} />
                <h3 className="erp-strong text-sm">{ch.title}</h3>
              </div>
              <p className="erp-muted text-xs">{ch.desc}</p>
              <button type="button" className="erp-btn-primary mt-3">{ch.action}</button>
            </div>
          );
        })}
      </div>
    </ScreenFrame>
  );
}
