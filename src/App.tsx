import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent as ReactTouchEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { JourneyScene } from './components/JourneyScene'
import { ArrowIcon, BrandLockup, MagneticLink, SiteHeader } from './components/SiteChrome'
import { dodoSite, learningFeatures, methodSteps, paths, plans, questions, studentReviews, type LearningPathId } from './data/siteContent'

gsap.registerPlugin(ScrollTrigger)
const BlurText = lazy(() => import('./components/BlurText'))

function AccordionItem({ question, answer, index, open, onToggle }: {
  question: string
  answer: string
  index: number
  open: boolean
  onToggle: () => void
}) {
  const answerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const answerNode = answerRef.current
    if (!answerNode) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(answerNode, { height: open ? 'auto' : 0, autoAlpha: open ? 1 : 0 })
      return
    }
    const animation = open
      ? gsap.fromTo(answerNode, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: 0.42, ease: 'power3.out', overwrite: true })
      : gsap.to(answerNode, { height: 0, autoAlpha: 0, duration: 0.28, ease: 'power2.inOut', overwrite: true })
    return () => { animation.kill() }
  }, [open])

  return (
    <article className={`faq-item ${open ? 'faq-item-open' : ''}`}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={onToggle}>
          <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
          <span>{question}</span>
          <span className="faq-plus" aria-hidden="true" />
        </button>
      </h3>
      <div id={`faq-answer-${index}`} ref={answerRef} className="faq-answer" aria-hidden={!open}>
        <p>{answer}</p>
      </div>
    </article>
  )
}

function App() {
  const [activePathId, setActivePathId] = useState<LearningPathId>('it')
  const [transitionKey, setTransitionKey] = useState(0)
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const activeIndex = paths.findIndex((item) => item.id === activePathId)
  const path = paths[activeIndex]

  const selectPath = useCallback((id: LearningPathId) => {
    if (id === activePathId) return
    setActivePathId(id)
    setTransitionKey((value) => value + 1)
  }, [activePathId])

  const stepPath = useCallback((delta: number) => {
    const next = (activeIndex + delta + paths.length) % paths.length
    selectPath(paths[next].id)
  }, [activeIndex, selectPath])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.hero-shell') || target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') stepPath(1)
      if (event.key === 'ArrowRight') stepPath(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stepPath])

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.08,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    })
    const updateScrollTrigger = () => ScrollTrigger.update()
    const tick = (time: number) => lenis.raf(time * 1000)
    lenisRef.current = lenis
    lenis.on('scroll', updateScrollTrigger)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', updateScrollTrigger)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [])

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
      entrance
        .from('.site-header', { y: -18, autoAlpha: 0, duration: 0.6 })
        .from('.hero-shell', { y: 18, autoAlpha: 0, duration: 0.55 }, '-=0.26')
        .from('.hero-copy-animate', { y: 24, autoAlpha: 0, duration: 0.66, stagger: 0.075 }, '-=0.28')
        .from('.stage-info', { y: 14, autoAlpha: 0, duration: 0.52, stagger: 0.08 }, '-=0.46')

      gsap.utils.toArray<HTMLElement>('.scroll-reveal').forEach((element) => {
        gsap.fromTo(element,
          { y: 34, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.78,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          },
        )
      })

      gsap.to('.journey-art', {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: '.hero-shell', start: 'top top', end: 'bottom top', scrub: 0.85 },
      })
    }, rootRef)

    return () => context.revert()
  }, [])

  const handleTabKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex + 1) % paths.length
    if (event.key === 'ArrowRight') nextIndex = (activeIndex - 1 + paths.length) % paths.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = paths.length - 1
    if (nextIndex === activeIndex) return
    event.preventDefault()
    event.stopPropagation()
    selectPath(paths[nextIndex].id)
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus()
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchX.current
    const end = event.changedTouches[0]?.clientX
    touchX.current = null
    if (start === null || end === undefined || Math.abs(end - start) < 52) return
    stepPath(end < start ? 1 : -1)
  }

  const revealPath = (id: LearningPathId) => {
    selectPath(id)
    if (lenisRef.current) lenisRef.current.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return (
    <div ref={rootRef} className="site-root">
      <a className="skip-link" href="#main">انتقل إلى المحتوى</a>
      <SiteHeader />

      <main id="main">
        <section className="hero-section page-gutter" id="top" aria-labelledby="hero-title">
          <div className="hero-shell" dir="rtl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <aside className="hero-panel">
              <div className="hero-copy-animate panel-kicker"><i /> منصة تعليمية مصرية <span>دودو كوستا × سوا جيت</span></div>
              <div className="hero-copy-animate hero-intro">
                <h1 id="hero-title"><Suspense fallback={<><span className="hero-blur-line">المعرفة تفتح</span><span className="hero-blur-line hero-blur-accent">لك طريقًا.</span></>}><BlurText text="المعرفة تفتح" className="hero-blur-line" direction="bottom" delay={150} stepDuration={0.48} blur={7} distance={24} trigger="load" /><BlurText text="لك طريقًا." className="hero-blur-line hero-blur-accent" direction="bottom" delay={230} stepDuration={0.48} blur={7} distance={24} trigger="load" /></Suspense></h1>
                <p>مسارات في تكنولوجيا المعلومات وريادة الأعمال، تبدأ من الأساس وتصل إلى التطبيق.</p>
              </div>

              <div className="path-tabs hero-copy-animate" role="tablist" aria-label="اختر مسارك التعليمي">
                {paths.map((item) => (
                  <button key={item.id} type="button" role="tab" id={`tab-${item.id}`} aria-selected={activePathId === item.id} aria-controls="path-details" tabIndex={activePathId === item.id ? 0 : -1} className={`path-tab ${activePathId === item.id ? 'path-tab-active' : ''}`} onClick={() => selectPath(item.id)} onKeyDown={handleTabKey}>
                    <span className="tab-number">{item.number}</span><span>{item.title}</span><span className="tab-rule" />
                  </button>
                ))}
              </div>

              <div id="path-details" role="tabpanel" aria-labelledby={`tab-${path.id}`} className="path-detail" key={path.id}>
                <span className="path-eyebrow">{path.english}</span>
                <h2>{path.longTitle}</h2>
                <p>{path.summary}</p>
                <ol className="path-topics">
                  {path.topics.map((topic, index) => <li key={topic}><span>{String(index + 1).padStart(2, '0')}</span><span>{topic}</span></li>)}
                </ol>
                <div className="panel-actions">
                  <MagneticLink href={`${dodoSite}/Auth/Register`} className="panel-cta"><span>ابدأ بكود الدعوة</span><ArrowIcon direction="right" /></MagneticLink>
                  <a href="#paths" className="panel-secondary">تفاصيل المسارات</a>
                </div>
              </div>

              <div className="panel-bottom"><span>مساران · رحلة واحدة</span><span dir="ltr">0{activeIndex + 1} <i /> 02</span></div>
            </aside>

            <div className="hero-visual" role="region" aria-roledescription="عارض المسارات التعليمية" aria-label={path.longTitle}>
              <div className="stage-info stage-head" dir="ltr">
                <span className="stage-brand"><i /> DODO COSTA / LEARNING</span>
                <span className="stage-meta">EGYPT · 2026</span>
              </div>
              <div className="stage-rule" />
              <JourneyScene path={path} transitionKey={transitionKey} />
              <div className="stage-info stage-foot" dir="ltr">
                <div className="stage-current"><span>{path.number}</span><strong>{path.english}</strong></div>
                <div className="stage-controls">
                  <button type="button" aria-label="المسار السابق" onClick={() => stepPath(-1)}><ArrowIcon direction="right" /></button>
                  <div className="stage-pagination" role="group" aria-label="التنقل بين المسارات">
                    {paths.map((item) => <button key={item.id} type="button" aria-label={`عرض ${item.title}`} aria-current={item.id === activePathId ? 'true' : undefined} className={`pagination-tick ${item.id === activePathId ? 'pagination-active' : ''}`} onClick={() => selectPath(item.id)}><span />{item.number}</button>)}
                  </div>
                  <button type="button" aria-label="المسار التالي" onClick={() => stepPath(1)}><ArrowIcon direction="left" /></button>
                </div>
                <span className="stage-count">0{activeIndex + 1} / 02</span>
              </div>
            </div>
          </div>
          <div className="hero-caption" dir="rtl"><span>تعلّم · طبّق · تقدّم</span><span className="caption-line" /><a href="#paths">استكشف المسارين <ArrowIcon direction="left" /></a></div>
        </section>

        <section className="paths-section page-gutter" id="paths" aria-labelledby="paths-title">
          <div className="paths-heading scroll-reveal">
            <div><span className="section-kicker">المسارات التعليمية <i /> ٠١—٠٢</span><h2 id="paths-title">مساران واضحان.<br /><span>مهارات تبني عليها.</span></h2></div>
            <p>اختر المجال الأقرب لك. كل مسار يبدأ بالمفاهيم الأساسية، ثم يقودك إلى موضوعات يمكنك تطبيقها.</p>
          </div>
          <div className="path-index">
            {paths.map((item) => (
              <article className={`path-index-row scroll-reveal ${activePathId === item.id ? 'path-index-current' : ''}`} key={item.id}>
                <span className="index-number">{item.number}</span>
                <div className="index-title"><span>{item.english}</span><h3>{item.title}</h3></div>
                <p>{item.summary}</p>
                <ul>{item.topics.slice(0, 3).map((topic) => <li key={topic}>{topic}</li>)}</ul>
                <button type="button" className="index-action" aria-label={`عرض ${item.longTitle} في المقدمة`} onClick={() => revealPath(item.id)}><ArrowIcon direction="left" /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="experience-section page-gutter" id="experience" aria-labelledby="experience-title">
          <div className="experience-inner">
            <div className="experience-copy scroll-reveal">
              <span className="section-kicker section-kicker-light">التعلّم لا يقف عند المشاهدة</span>
              <h2 id="experience-title">كل درس يقرّبك<br />من <span>شيء تصنعه.</span></h2>
              <p>تعلّم فكرة جديدة، جرّبها بنفسك، ثم اعرف الخطوة التالية في مسارك.</p>
              <a className="experience-link" href={`${dodoSite}/Auth/Login`}>ادخل إلى منصتك <ArrowIcon direction="left" /></a>
            </div>
            <div className="experience-list">
              <div className="experience-rail" aria-hidden="true"><span /></div>
              {learningFeatures.map((item, index) => (
                <article className={`experience-row scroll-reveal ${index === 1 ? 'experience-row-emphasis' : ''}`} key={item.number}>
                  <span className="experience-number">{item.number}</span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                  <span className="experience-note">{item.note}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="method-section page-gutter" id="method" aria-labelledby="method-title">
          <div className="method-heading scroll-reveal">
            <span className="section-kicker">من التسجيل إلى الإنجاز</span>
            <h2 id="method-title">خطوة تعرفها.<br /><span>والتي بعدها أوضح.</span></h2>
            <p>المنصة مخصّصة لطلابها. ابدأ بكود الدعوة، ثم تقدّم في مسارك خطوةً بخطوة.</p>
          </div>
          <div className="method-list">
            {methodSteps.map((step) => (
              <article className="method-row scroll-reveal" key={step.number}>
                <span className="method-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <span className="method-mark" aria-hidden="true"><ArrowIcon direction="left" /></span>
              </article>
            ))}
          </div>
        </section>

        <section className="stories-section page-gutter" id="stories" aria-labelledby="stories-title">
          <div className="stories-heading scroll-reveal">
            <div>
              <span className="section-kicker">آراء طلابنا <i /> ٠٣</span>
              <h2 id="stories-title">تجربتهم،<br /><span>بكلماتهم.</span></h2>
            </div>
            <p>تجارب طلاب المنصة مع التعلّم التفاعلي، خطوات التقدّم، والشهادات.</p>
          </div>
          <div className="stories-grid">
            {studentReviews.map((review) => (
              <article className="story-entry scroll-reveal" key={review.number}>
                <div className="story-index"><span>{review.number}</span><i /></div>
                <span className="story-quote-mark" aria-hidden="true">“</span>
                <blockquote>{review.quote}</blockquote>
                <div className="story-author">
                  <span className="story-avatar" aria-hidden="true">{review.initial}</span>
                  <span><strong>{review.name}</strong><small>{review.detail}</small></span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pricing-section page-gutter" id="pricing" aria-labelledby="pricing-title">
          <div className="pricing-inner">
            <div className="pricing-heading scroll-reveal">
              <div><span className="section-kicker">الاشتراك</span><h2 id="pricing-title">اختر وتيرة تعلّمك.</h2></div>
              <p>ثلاث باقات فعلية، بحسب المسار والمدة التي تناسبك.</p>
            </div>
            <div className="pricing-index">
              {plans.map((plan) => (
                <article className={`price-row scroll-reveal ${'featured' in plan && plan.featured ? 'price-row-featured' : ''}`} key={plan.number}>
                  <div className="price-name"><span>{plan.number}</span><div><h3>{plan.name}</h3><p>{plan.subtitle}</p></div>{'featured' in plan && plan.featured && <span className="plan-label">المساران كاملان</span>}</div>
                  <div className="price-amount"><strong>{plan.price}</strong><span>ج.م <i>{plan.period}</i></span></div>
                  <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                  <a className="price-action" href={`${dodoSite}/Auth/Register`}><span>تابع التسجيل</span><ArrowIcon direction="left" /></a>
                </article>
              ))}
            </div>
            <p className="payment-note"><i /> الدفع عبر فودافون كاش، إنستاباي، أو نقدًا.</p>
          </div>
        </section>

        <section className="faq-section page-gutter" id="faq" aria-labelledby="faq-title">
          <div className="faq-heading scroll-reveal">
            <span className="section-kicker">معلومات تهمك</span>
            <h2 id="faq-title">أسئلة<br /><span>قبل أن تبدأ.</span></h2>
            <a href={`${dodoSite}/Contact`}>لديك سؤال آخر؟ تواصل معنا <ArrowIcon direction="left" /></a>
          </div>
          <div className="faq-list">
            {questions.map((item, index) => <AccordionItem key={item.question} question={item.question} answer={item.answer} index={index} open={openQuestion === index} onToggle={() => setOpenQuestion((current) => current === index ? null : index)} />)}
          </div>
        </section>

        <section className="closing-section page-gutter" aria-labelledby="closing-title">
          <div className="closing-panel scroll-reveal">
            <div className="closing-motif" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="closing-copy"><span className="section-kicker section-kicker-light">خطوتك التالية تبدأ هنا</span><h2 id="closing-title">جاهز تبدأ رحلتك؟</h2><p>تواصل مع المدرب للحصول على كود الدعوة، وابدأ بناء مهاراتك خطوةً بخطوة.</p></div>
            <MagneticLink href={`${dodoSite}/Auth/Register`} className="closing-cta"><span>ابدأ بكود الدعوة</span><ArrowIcon direction="right" /></MagneticLink>
            <span className="closing-signature">دودو كوستا × سوا جيت <i /> مصر</span>
          </div>
        </section>
      </main>

      <footer className="site-footer page-gutter">
        <BrandLockup footer />
        <p>منصة تعليمية مصرية في تكنولوجيا المعلومات وريادة الأعمال.</p>
        <nav aria-label="روابط إضافية"><a href="#paths">المسارات</a><a href="#stories">آراء الطلاب</a><a href="#pricing">الأسعار</a><a href={`${dodoSite}/Auth/Login`}>تسجيل الدخول</a><a href={`${dodoSite}/Terms`}>الشروط والأحكام</a><a href={`${dodoSite}/Privacy`}>الخصوصية</a></nav>
        <span className="copyright">© دودو كوستا × سوا جيت</span>
      </footer>
    </div>
  )
}

export default App
