import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { type LearningPath } from '../data/siteContent'

type JourneySceneProps = {
  path: LearningPath
  transitionKey: number
}

export function JourneyScene({ path, transitionKey }: JourneySceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const it = path.id === 'it'
  const uid = `journey-${path.id}`

  useLayoutEffect(() => {
    const scene = sceneRef.current
    if (!scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.fromTo(scene,
        { autoAlpha: 0.58, clipPath: 'inset(0 0 0 7%)', scale: 1.035 },
        { autoAlpha: 1, clipPath: 'inset(0 0 0 0%)', scale: 1, duration: 1.05, ease: 'power4.out', clearProps: 'clipPath,transform' },
      )
      gsap.fromTo('.scene-note',
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out', delay: 0.18, clearProps: 'transform,opacity,visibility' },
      )
      gsap.fromTo('.route-node',
        { scale: 0.75, autoAlpha: 0, transformOrigin: '50% 50%' },
        { scale: 1, autoAlpha: 1, duration: 0.48, stagger: 0.09, delay: 0.28, ease: 'back.out(1.5)', clearProps: 'transform,opacity,visibility' },
      )
    }, scene)

    return () => context.revert()
  }, [transitionKey])

  return (
    <div ref={sceneRef} className={`journey-scene journey-scene-${path.id}`} aria-hidden="true">
      <svg className="journey-art" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <radialGradient id={`${uid}-spot`} cx="57%" cy="39%" r="69%">
            <stop offset="0" stopColor={it ? '#495268' : '#50443e'} />
            <stop offset=".56" stopColor={it ? '#252b3b' : '#292a33'} />
            <stop offset="1" stopColor="#15181e" />
          </radialGradient>
          <linearGradient id={`${uid}-metal`} x1=".1" y1=".08" x2=".94" y2=".84">
            <stop stopColor="#4a211c" />
            <stop offset=".16" stopColor="#e48e5c" />
            <stop offset=".29" stopColor="#f4c49a" />
            <stop offset=".43" stopColor="#7a3827" />
            <stop offset=".58" stopColor="#cf7041" />
            <stop offset=".76" stopColor="#3c2224" />
            <stop offset=".91" stopColor="#e9a16e" />
            <stop offset="1" stopColor="#623024" />
          </linearGradient>
          <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#f8d4af" stopOpacity="0" />
            <stop offset=".23" stopColor="#ffd4a8" stopOpacity=".8" />
            <stop offset=".7" stopColor="#ef9a6a" stopOpacity=".3" />
            <stop offset="1" stopColor="#ffd4a8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-route`} x1=".02" y1=".1" x2=".9" y2=".9">
            <stop stopColor="#f8c59d" />
            <stop offset=".45" stopColor="#f48b4a" />
            <stop offset="1" stopColor="#c14c2b" />
          </linearGradient>
          <radialGradient id={`${uid}-flare`}>
            <stop stopColor="#f7a064" stopOpacity=".42" />
            <stop offset="1" stopColor="#f7a064" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
          <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="16" />
            <feOffset dy="19" />
            <feComponentTransfer><feFuncA type="linear" slope=".4" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id={`${uid}-fine-lines`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(27)">
            <path d="M0 0v8" stroke="#fff" strokeOpacity=".11" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1200" height="760" fill={`url(#${uid}-spot)`} />
        <ellipse cx="730" cy="338" rx="345" ry="260" fill={`url(#${uid}-flare)`} filter={`url(#${uid}-soft)`} />

        <g className="scene-architecture" opacity=".45">
          <path d="M62 634H1140M130 686H1080" stroke="#d8d5cc" strokeOpacity=".28" />
          <path d="M109 131V634M1090 110V633M109 634 278 510M1090 633 922 510" stroke="#d8d5cc" strokeOpacity=".2" />
          <path d="M172 628 302 541M1019 628 883 540" stroke="#d8d5cc" strokeOpacity=".17" />
          <path d="M140 204h194M866 182h204M150 210v57M1058 188v62" stroke="#e5e1d8" strokeOpacity=".23" />
          <path d="M120 583h971" stroke="#d8d5cc" strokeOpacity=".1" strokeDasharray="2 14" />
        </g>

        {it ? (
          <g className="it-sculpture" filter={`url(#${uid}-shadow)`}>
            <path d="M-75 623C123 594 197 475 296 427 400 376 456 469 572 431 675 397 712 256 838 254c126-2 182 105 305 48" stroke="#2b1619" strokeWidth="184" strokeLinecap="round" />
            <path d="M-75 599C123 570 197 451 296 403 400 352 456 445 572 407 675 373 712 232 838 230c126-2 182 105 305 48" stroke={`url(#${uid}-metal)`} strokeWidth="144" strokeLinecap="round" />
            <path d="M-75 569C123 540 197 421 296 373 400 322 456 415 572 377 675 343 712 202 838 200c126-2 182 105 305 48" stroke={`url(#${uid}-edge)`} strokeWidth="3" strokeLinecap="round" />
            <path d="M-75 635C123 606 197 487 296 439 400 388 456 481 572 443 675 409 712 268 838 266c126-2 182 105 305 48" stroke={`url(#${uid}-edge)`} strokeWidth="2" strokeLinecap="round" opacity=".62" />
            <path d="M-75 599C123 570 197 451 296 403 400 352 456 445 572 407 675 373 712 232 838 230c126-2 182 105 305 48" stroke={`url(#${uid}-fine-lines)`} strokeWidth="140" strokeLinecap="round" opacity=".22" />
            <path d="M-75 599C123 570 197 451 296 403 400 352 456 445 572 407 675 373 712 232 838 230c126-2 182 105 305 48" stroke={`url(#${uid}-route)`} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 13" />
            <g className="route-node" transform="translate(296 403)"><circle r="13" fill="#1b2028" stroke="#f2b28a" strokeWidth="2"/><circle r="3" fill="#f7a064"/></g>
            <g className="route-node" transform="translate(572 407)"><circle r="13" fill="#1b2028" stroke="#f2b28a" strokeWidth="2"/><circle r="3" fill="#f7a064"/></g>
            <g className="route-node" transform="translate(838 230)"><circle r="13" fill="#1b2028" stroke="#f2b28a" strokeWidth="2"/><circle r="3" fill="#f7a064"/></g>
          </g>
        ) : (
          <g className="business-sculpture" filter={`url(#${uid}-shadow)`}>
            <path d="M123 588 361 443 554 504 795 356 1078 469" stroke="#281719" strokeWidth="118" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M123 565 361 420 554 481 795 333 1078 446" stroke={`url(#${uid}-metal)`} strokeWidth="88" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M123 536 361 391 554 452 795 304 1078 417" stroke={`url(#${uid}-edge)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M123 565 361 420 554 481 795 333 1078 446" stroke={`url(#${uid}-fine-lines)`} strokeWidth="82" strokeLinecap="round" strokeLinejoin="round" opacity=".21" />
            <path d="M123 565 361 420 554 481 795 333 1078 446" stroke={`url(#${uid}-route)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 12" />
            <path d="M354 421v-160l122-73 125 39v234M783 335V158l128-66 130 46v350" stroke="#e1d8c8" strokeOpacity=".35" strokeWidth="1.4" />
            <path d="M354 261 476 333l125-72M354 316l122 72 125-72M783 158l128 71 130-91M783 214l128 73 130-91M783 272l128 72 130-91" stroke="#e1d8c8" strokeOpacity=".23" strokeWidth="1" />
            <g className="route-node" transform="translate(361 420)"><circle r="13" fill="#1b2028" stroke="#f2b28a" strokeWidth="2"/><circle r="3" fill="#f7a064"/></g>
            <g className="route-node" transform="translate(554 481)"><circle r="13" fill="#1b2028" stroke="#f2b28a" strokeWidth="2"/><circle r="3" fill="#f7a064"/></g>
            <g className="route-node" transform="translate(795 333)"><circle r="13" fill="#1b2028" stroke="#f2b28a" strokeWidth="2"/><circle r="3" fill="#f7a064"/></g>
          </g>
        )}

        <path d="M62 122h24M62 122v24M1138 122h-24M1138 122v24M62 638h24M62 638v-24M1138 638h-24M1138 638v-24" stroke="#eee8dd" strokeOpacity=".55" strokeWidth="1.5" />
      </svg>

      <div className="scene-overlay">
        <div className="scene-topline">
          <span className="scene-code scene-note">DC / JOURNEY {path.number}</span>
          <span className="scene-status scene-note"><i /> {it ? 'مسار التقنية' : 'مسار الأعمال'} · مصر</span>
        </div>
        <div className="scene-caption scene-note" dir="rtl">
          <span>{path.sceneTitle}</span>
          <span className="scene-caption-code" dir="ltr">{path.sceneCode}</span>
        </div>
        <div className="scene-bottom-label scene-note" dir="ltr">
          <span>LEARN</span><i /><span>MAKE</span><i /><span>MOVE FORWARD</span>
        </div>
      </div>
    </div>
  )
}
