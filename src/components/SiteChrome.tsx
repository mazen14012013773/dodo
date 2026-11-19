import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import gsap from 'gsap'
import { dodoSite } from '../data/siteContent'

const navigation = [
  { label: 'المسارات', href: '#paths' },
  { label: 'تجربة التعلّم', href: '#experience' },
  { label: 'كيف نعمل', href: '#method' },
  { label: 'آراء الطلاب', href: '#stories' },
  { label: 'الأسعار', href: '#pricing' },
  { label: 'الأسئلة', href: '#faq' },
]

export function ArrowIcon({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={`arrow-icon arrow-${direction}`}>
      <path d="M19 12H5m0 0 6.5 6.5M5 12l6.5-6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BrandLockup({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`brand-lockup ${footer ? 'brand-lockup-footer' : ''}`} href="#top" aria-label="دودو كوستا × سوا جيت — الرئيسية">
      <svg aria-hidden="true" viewBox="0 0 38 38" fill="none" className="brand-mark">
        <path d="M5.5 7.5h9a4.5 4.5 0 0 1 4.5 4.5v18a3.8 3.8 0 0 0-3.8-3.5H5.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M32.5 7.5h-9a4.5 4.5 0 0 0-4.5 4.5v18a3.8 3.8 0 0 1 3.8-3.5h9.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M19 12v18" stroke="currentColor" strokeWidth="1.45" />
      </svg>
      <span className="brand-name"><strong>دودو كوستا</strong><span>× سوا جيت</span></span>
    </a>
  )
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useLayoutEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(menu, { height: menuOpen ? 'auto' : 0, autoAlpha: menuOpen ? 1 : 0 })
      return
    }
    const animation = gsap.to(menu, {
      height: menuOpen ? 'auto' : 0,
      autoAlpha: menuOpen ? 1 : 0,
      duration: menuOpen ? 0.42 : 0.28,
      ease: menuOpen ? 'power3.out' : 'power2.inOut',
    })
    return () => { animation.kill() }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandLockup />
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="login-link" href={`${dodoSite}/Auth/Login`}>تسجيل الدخول</a>
          <a className="header-join" href={`${dodoSite}/Auth/Register`}>ابدأ بكود الدعوة <ArrowIcon direction="right" /></a>
        </div>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((value) => !value)}>
          <span /><span />
        </button>
      </div>
      <div id="mobile-navigation" ref={menuRef} className="mobile-nav" aria-hidden={!menuOpen} inert={!menuOpen}>
        <nav aria-label="التنقل على الهاتف">
          {navigation.map((item) => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>)}
        </nav>
        <div className="mobile-nav-actions"><a href={`${dodoSite}/Auth/Login`} onClick={closeMenu}>تسجيل الدخول</a><a href={`${dodoSite}/Auth/Register`} onClick={closeMenu}>ابدأ بكود الدعوة</a></div>
      </div>
    </header>
  )
}

export function MagneticLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    const node = ref.current
    if (!node || reduced.current || event.pointerType === 'touch') return
    const rect = node.getBoundingClientRect()
    gsap.to(node, { x: (event.clientX - rect.left - rect.width / 2) * 0.11, y: (event.clientY - rect.top - rect.height / 2) * 0.12, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
  }

  const reset = () => {
    if (ref.current && !reduced.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' })
  }

  return <a ref={ref} href={href} className={className} onPointerMove={move} onPointerLeave={reset}>{children}</a>
}
