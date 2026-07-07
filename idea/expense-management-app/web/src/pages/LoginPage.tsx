import { Mail, ShieldCheck, Sparkles } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-400/30">
            <Mail className="h-7 w-7 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Expense Tracker</h1>
          <p className="mt-2 text-sm text-slate-300">
            Tự động theo dõi chi tiêu từ email mua hàng Gmail
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 space-y-3">
            <Feature icon={Mail} text="Đọc email mua hàng qua Gmail API" />
            <Feature icon={Sparkles} text="Gemini phân tích tên, giá, danh mục" />
            <Feature icon={ShieldCheck} text="Miễn phí — chỉ dùng cho cá nhân" />
          </div>

          <button
            type="button"
            onClick={onLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
          >
            <GoogleIcon />
            Đăng nhập bằng Google
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Đăng nhập Google để truy cập Gmail và Google Sheets
          </p>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-200">
      <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
      {text}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
