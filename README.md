# Dodo Costa

Arabic-first learning platform homepage for Dodo Costa × Sawa Gate.

## Development

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm run build
npm run test:e2e
```

Playwright runs against Microsoft Edge at 1440, 1280, 768, 390 and 320 pixels. Review screenshots are saved in `test-results/`.

## Stack

- React and TypeScript with Vite
- Tailwind CSS 4 and custom CSS for the editorial layout
- GSAP, ScrollTrigger, and Lenis for entrance, synchronized smooth scrolling, and learning-path transitions
- React Bits Blur Text for the cinematic Arabic hero title
- Arabic typography: Cairo and Tajawal; Fira Code is limited to code and technical labels
- ESLint and Playwright for code and interaction checks

This repository contains the public homepage only. Account creation, login, enrollment, and payments remain on Dodo Costa's existing service; there is no local backend or API.
