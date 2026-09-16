// ScrollTrigger.config({ ignoreMobileResize: true });
// ScrollTrigger.normalizeScroll(true);

const EASE = "cubic-bezier(0.62, 0.01, 0.36, 0.99)";
const OPACITY_DURATION = 0.3;
const SCALE_DURATION = 0.5;
const STEP_DELAY = 0.15;
const SCALE_STEP = 0.025;
const FIRST_STEP_DELAY = 0.6;

const IMAGES = [
  document.querySelector(".preloader-img:nth-child(1)"),
  document.querySelector(".preloader-img:nth-child(2)"),
  document.querySelector(".preloader-img:nth-child(3)"),
  document.querySelector(".preloader-img:nth-child(4)"),
];

const progressFill = document.querySelector(".preloader-progress-bar-fill");
const preloader = document.querySelector(".preloader");
const walletCard = document.querySelector(".wallet-card");
const walletCardInner = document.querySelector(".wallet-card-inner");
const heroText = document.querySelector(".hero-text");
const gradientVid = document.querySelector(".card-background-vid");
const navbar = document.querySelector(".navbar");
// const cookieBanner = document.querySelector(".cookie-banner");

// Считаем смещение чтобы карточка стартовала по центру экрана
const cardRect = walletCard.getBoundingClientRect();
const viewportCenter = window.innerHeight / 2;
const cardCenter = cardRect.top + cardRect.height / 2;

// Если ширина экрана меньше 479px, используем 10, иначе 24
// const adaptiveOffset = 38;

const centerOffset = viewportCenter - cardCenter;

// ===== INITIAL STATES =====
// gsap.set(cookieBanner, {
//   autoAlpha: 0,
//   pointerEvents: "none",
//   y: 20,
// });
gsap.set(walletCard, {
  autoAlpha: 0,
  y: centerOffset,
  scale: 1.025,
});
gsap.set(heroText, {
  autoAlpha: 0,
  y: "10rem",
  scale: 0.6,
});
gsap.set(IMAGES.slice(1), { opacity: 1 });
gsap.set(gradientVid, {
  opacity: 0,
});
gsap.set(navbar, {
  autoAlpha: 0,
});

function lockScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  const scrollY = Math.abs(parseInt(document.body.style.top || "0"));
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.overflow = "";
  window.scrollTo(0, scrollY);
}

function runPreloader() {
  lockScroll();

  const tl = gsap.timeline({
    onComplete: () => {
      unlockScroll();
      // СИГНАЛ: Прелоадер полностью завершен
      window.preloaderFinished = true;
      window.dispatchEvent(new Event("preloaderDone"));
    },
  });

  const STEPS = IMAGES.slice(1);
  const TOTAL_STEPS = STEPS.length;

  STEPS.forEach((img, stepIndex) => {
    const progressPercent = ((stepIndex + 1) / TOTAL_STEPS) * 100;
    const stepStart =
      stepIndex === 0 ? `+=${FIRST_STEP_DELAY}` : `+=${STEP_DELAY}`;
    const prevImg = IMAGES[stepIndex];

    tl.set(window, { scrollTo: { y: 0 } })
      .set(document.documentElement, { scrollTop: 0 })
      .set(document.body, { scrollTop: 0 });

    tl.to(
      prevImg,
      { autoAlpha: 0, duration: OPACITY_DURATION, ease: EASE },
      stepStart
    );
    tl.to(
      progressFill,
      { width: progressPercent + "%", duration: OPACITY_DURATION, ease: EASE },
      "<"
    );

    IMAGES.forEach((otherImg, j) => {
      if (j >= stepIndex) {
        // было j > stepIndex
        const newScale = 1 - (stepIndex + 1) * SCALE_STEP;
        tl.to(
          otherImg,
          { scale: newScale, duration: SCALE_DURATION, ease: EASE },
          "<"
        );
      }
    });

    if (stepIndex === STEPS.length - 1) {
      tl.to(walletCard, { autoAlpha: 1, scale: 1, duration: 0.1 }, "-=0.55");
    }
  });

  // Прогресс до 100%
  tl.to(progressFill, {
    width: "100%",
    duration: OPACITY_DURATION,
    ease: EASE,
  });

  // Прелоадер уезжает + карточка едет на своё место в потоке (y: 0)
  tl.to(preloader, {
    y: "100%",
    duration: 0.7,
    ease: EASE,
    delay: 0.1,
    autoAlpha: 0,
  });

  tl.to(walletCard, { y: 0, scale: 1, duration: 0.5, ease: EASE }, "-=0.5");

  // Флип
  tl.fromTo(
    walletCardInner,
    { rotateX: 0 },
    { rotateX: 180, duration: 0.3, ease: EASE },
    "-=0.8"
  );
  // Gradient video
  tl.to(
    gradientVid,
    { autoAlpha: 1, duration: 2, ease: "linear" },
    "-=2.5"
  );

  // Hero text
  tl.to(
    heroText,
    { scale: 1, y: "0rem", autoAlpha: 1, duration: 0.6, ease: EASE },
    "-=0.5"
  );
  tl.to(navbar, { autoAlpha: 1, duration: 0.5, ease: EASE }, "-=0.3");

  tl.to(".card-container", { zIndex: 2 });
  tl.to({}, { duration: 0.6 });
  // tl.to(cookieBanner, {
  //   autoAlpha: 1,
  //   pointerEvents: "auto",
  //   y: 0,
  // });
}
runPreloader();

// navbar animation

const navbarContainer = document.querySelector(".navbar-container");

if (navbarContainer) {
  ScrollTrigger.create({
    trigger: ".section-hero",
    start: "50% top",
    endTrigger: ".footer-card",
    end: "top 50%",
    onEnter: () => navbarContainer.classList.add("is-collapsed"),
    onLeaveBack: () => navbarContainer.classList.remove("is-collapsed"),
    onLeave: () => navbarContainer.classList.remove("is-collapsed"),
    onEnterBack: () => navbarContainer.classList.add("is-collapsed"),
  });
}



// about section animation

(function () {

  const section = document.querySelector(".section-about");
  const headingWrapper = document.querySelector(".about-heading");
  const heading = document.querySelector(".h2-about");
  const btn = document.querySelector("#about-bttn");
  const imgWrap = document.querySelector(".about-image-wrapper");
  const aboutImg = document.querySelector(".about-image");
  const zoomSection = document.querySelector("[section-spend-desk]");
  const zoomHead = document.querySelector("[zoom-heading]");
  const zoomSubtexts = gsap.utils.toArray("[spend-subtext]");

  if (!section || !headingWrapper || !heading || !btn || !imgWrap) return;

  /* ── Градиент на heading ── */
  const text = heading.textContent;
  heading.innerHTML = `<span class="gradient-text">${text}</span>`;
  const span = heading.querySelector(".gradient-text");

  Object.assign(span.style, {
    backgroundImage: "linear-gradient(135deg, #EAEAF0 0%, #EAEAF0 25%, #F586A7 45%, #FF9EBD 55%, #0A0A0B 75%, #0A0A0B 100%)",
    backgroundSize: "400% 400%",
    display: "inline-block",
    webkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    webkitTextFillColor: "transparent",
  });

  /* ── Градиент скролл ── */
  gsap.to(
    { p: 0 },
    {
      p: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 40%",
        end: "top -40%",
        scrub: true,
      },
      onUpdate() {
        const pos = this.targets()[0].p * 100;
        span.style.backgroundPosition = `${pos}% ${pos}%`;
      },
    }
  );

  const mmZoom = gsap.matchMedia();

  /* ══════════════════════════════════════
     МОБИЛКА — без зума, без pin
  ══════════════════════════════════════ */
  mmZoom.add("(max-width: 479px)", () => {

    gsap.set(".background-fixed", { background: "rgba(10,10,11,0)" });
    gsap.set([btn, imgWrap], { autoAlpha: 0, y: 60 });
    gsap.set(heading, { y: 120, scale: 1.1, transformOrigin: "center center" });

    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=120%",
        pin: false,
        scrub: true,
        markers: false,
      },
    });

    mainTl
      .to(heading, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" })
      .to([btn, imgWrap], { autoAlpha: 1, y: 0, duration: 0.3, ease: "expo.out", stagger: 0.05 }, "-=0.2")
      // ФИКС: overwrite: "auto" чтобы не конфликтовать с tlBlackBg
      .to(".background-fixed", { background: "#0a0a0b", duration: 0.3, overwrite: "auto" }, ">+=0.6")
      .to(section, { autoAlpha: 0, duration: 0.3, }, "<");

      const spendTlmob = gsap.timeline({
        scrollTrigger: {
          trigger: "[section-spend-mob]",
          start: "top 70%",
          end: "top 0%",
          scrub: true,
          markers: false,
        }
      });
      
      spendTlmob
      .from(["[spend-heading-mob]", "[spend-subtext-mob]"], {
          autoAlpha: 0,
          y: 30,
          duration: 1,
          ease: "expo.out",
          stagger: 0.6,
        })
        .to("[spend-card-mob]", { y: "8vh", rotation: 5, ease: "none", duration: 1, }, "+=0.8")
      
        .from("[spend-terminal-glow-mob]", {
          autoAlpha: 0,
          duration: 0.5,
        })

        const tlBlackBg = gsap.timeline({
          scrollTrigger: {
            trigger: ".section-refer",
            start: "top -5%",
            end: "top -40%",
            scrub: true,
            markers: false,
          },
        });
        
        // ФИКС: overwrite: "auto"
        tlBlackBg.to(".background-fixed", { background: "rgba(10,10,11,0)", overwrite: "auto" });

        return () => {
          mainTl.kill();
          spendTlmob.kill();
          tlBlackBg.kill();
        };
    
  });

  /* ══════════════════════════════════════
     ДЕСКТОП — оригинальный зум
  ══════════════════════════════════════ */
  mmZoom.add("(min-width: 480px)", () => {
    gsap.set(".background-fixed", { background: "rgba(10,10,11,0)" });
    gsap.set(headingWrapper, { y: "0rem" });
    gsap.set(zoomSection, { autoAlpha: 0 });
    gsap.set([zoomHead, ...zoomSubtexts], { autoAlpha: 0, y: 20 });
    gsap.set([btn, imgWrap], { autoAlpha: 0, y: 100 });
    gsap.set(heading, { scale: 1.25, transformOrigin: "center center" });
    gsap.set(".spend-terminal-glow", { autoAlpha: 0 });
    gsap.set("[spend-inner]", {
      outlineColor: "rgba(255,255,255,0)",
    });

    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=400%",
        pin: false,
        scrub: true,
        markers: false,
        snap: {
          snapTo: [0, 0.43, 0.9],
          duration: { min: 0.3, max: 1.5 },
          delay: 0.01,
          ease: "power1.inOut",
        },
        onLeaveBack: () => {
          gsap.set(zoomSection, { autoAlpha: 0 });
        },
      },
    });

    mainTl
      .to(heading, { scale: 1, y: 0, duration: 0.5, ease: "power2.inOut" })
      .to(headingWrapper, { y: "-22rem", duration: 0.5, ease: "power2.inOut" }, "<")
      .to([btn, imgWrap], { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.1 }, "-=0.2")
      .to({}, { duration: 0.1 })
      // ФИКС: overwrite: "auto"
      .to(".background-fixed", { duration: 0.5, background: "#0a0a0b", overwrite: "auto" }, "<")
      .to(headingWrapper, { autoAlpha: 0, duration: 0.6, ease: "expo.out" }, "<")
      .to(imgWrap, { width: "calc(100vw - 5vh)", height: "95vh", borderRadius: "2.25rem", outlineColor: "#232324", duration: 1, ease: "power3.inOut" }, "<")
      .to(zoomSection, { autoAlpha: 1, duration: 0.15 }, "<+=0.4")
      .to(aboutImg, { autoAlpha: 0, duration: 0.001 })
      .to("[spend-inner]", {
        outlineColor: "rgba(255,255,255,0.1)", duration: 0.05
      }, "-=0.5")
      .to([zoomHead, ...zoomSubtexts], { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out", stagger: 0.1 }, "-=0.5")
      .to(".spend-card", { y: "9vh", rotation: 5, ease: "none" }, "-=0.5")
      .to(".spend-terminal-glow", { autoAlpha: 1, duration: 0.2, ease: "power2.out" }, "<0.4");


      const tlBlackBg = gsap.timeline({
        scrollTrigger: {
          trigger: ".section-refer",
          start: "top -5%",
          end: "top -40%",
          scrub: true,
          markers: false,
        },
      });
      
      // ФИКС: overwrite: "auto"
      tlBlackBg.to(".background-fixed", { background: "rgba(10,10,11,0)", overwrite: "auto" });


    /* Resize */
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        gsap.set(imgWrap, { clearProps: "all" });
        const ir = imgWrap.getBoundingClientRect();
        const cs = window.getComputedStyle(imgWrap);
        gsap.set(imgWrap, { width: ir.width, height: ir.height, borderRadius: cs.borderRadius });
        mainTl.getChildren().forEach((tween) => {
          if (tween.targets && tween.targets()[0] === imgWrap && tween.vars.width) {
            tween.invalidate();
          }
        });
        ScrollTrigger.refresh();
      }, 150);
    });

    return () => {
      mainTl.kill();
      tlBlackBg.kill();
    };
  });

})();

    /* earn-coin параллакс */
    gsap.to(".earn-coin", {
      y: "9vh",
      rotation: 19,
      ease: "none",
      scrollTrigger: {
        trigger: ".section-earn",
        start: "top 80%",
        end: "bottom top",
        scrub: true,
      },
    });

//// stack cards
const mmCards = gsap.matchMedia();

mmCards.add("(min-width: 480px)", () => {
const cards = gsap.utils.toArray("[stack-card]");
const headings = gsap.utils.toArray("[stack-heading]");
const subtexts = gsap.utils.toArray("[stack-subtext]");
const overlays = gsap.utils.toArray("[section-stack-overlay]");

gsap.set(cards, { scale: 0.4 });
gsap.set(cards[0], { y: "0%" });
gsap.set([headings, subtexts], { autoAlpha: 0, y: 20 });

// --- Секция 0: repay-section ---
const tl0 = gsap.timeline({
  scrollTrigger: {
    trigger: cards[0],
    start: "top 100%",
    end: "top -100%",
    scrub: true,
    markers: false,
  },
});

tl0.to(cards[0], { scale: 1, y: "0%", ease: "power2.out" }, 0);
tl0.to([headings[0], subtexts[0]].filter(Boolean), { autoAlpha: 1, y: 0, ease: "power2.out" }, 0);

tl0.to(cards[0], { scale: 0.4, y: "0%", ease: "power2.in" }, 0.5);
tl0.to([headings[0], subtexts[0]].filter(Boolean), { autoAlpha: 0, y: -10, ease: "power2.in" }, 0.5);
if (overlays[0]) tl0.to(overlays[0], { opacity: 0.7 }, 0.5);

// --- Секция 1: section-refer ---
const tl1 = gsap.timeline({
  scrollTrigger: {
    trigger: cards[1],
    start: "top 100%",
    end: "top -100%",
    scrub: true,
    markers: false,
  },
});

tl1.to(cards[1], { scale: 1, y: "0%", ease: "power2.out" }, 0);
tl1.to([headings[1], subtexts[1]].filter(Boolean), { autoAlpha: 1, y: 0, ease: "power2.out" }, 0);

tl1.to(cards[1], { scale: 0.4, y: "0%", ease: "power2.in" }, 0.5);
tl1.to([headings[1], subtexts[1]].filter(Boolean), { autoAlpha: 0, y: -10, ease: "power2.in" }, 0.5);
if (overlays[1]) tl1.to(overlays[1], { opacity: 0.7 }, 0.5);

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: cards[2],
    start: "top 100%",
    end: "top -30vh",
    scrub: true,
    markers: false,
  },
});

tl2.to(cards[2], { scale: 1, y: "0%", ease: "power2.out" }, 0);
tl2.to([headings[2], subtexts[2]].filter(Boolean), { autoAlpha: 1, y: 0, ease: "power2.out" }, 0);

});


// // --- spendToRepayTL не тронут ---
const spendToRepayTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".repay-section",
    start: "top 90%",
    end: "top -120%",
    scrub: true,
    markers: false,
  },
});

spendToRepayTL
  .to(
    ".about-image-wrapper",
    { y: "-32%", scale: 0.35, ease: "power2.out" },
    0
  )
  .to(
    "[section-spend-overlay]",
    { opacity: 0.7, ease: "power2.out" },
    "<"
  );

// footer animation

let mm = gsap.matchMedia();

mm.add("(min-width: 480px)", () => {
  gsap.to(".stack-wrapper", {
    scale: 0.5,
    ease: "none",
    scrollTrigger: {
      trigger: ".footer-card",
      start: "top 50%",
      end: "bottom bottom",
      scrub: true,
    },
  });

  gsap.to([".section-earn", ".section-refer", ".repay-section"], {
    ease: "none",
    borderRadius: "10rem",
    scrollTrigger: {
      trigger: ".footer-card",
      start: "top 50%",
      end: "bottom 85%",
      scrub: true,
    },
  });
});

gsap.from([".h2-footer", ".footer-h-subtext", "[footer-btn]"], {
  y: 30,
  autoAlpha: 0,
  duration: 0.8,
  stagger: 0.2,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".footer-card",
    start: "top 60%",
    toggleActions: "play none none reverse",
  },
});

let mmFooter = gsap.matchMedia();

mmFooter.add("(min-width: 480px)", () => {
  gsap.from(".footer-bg", {
    y: 600,
    scale: 1.3,
    autoAlpha: 0,
    scrollTrigger: {
      trigger: ".footer-card",
      start: "top 40%",
      end: "top 00%",
      scrub: 2,
    },
  });
});

gsap.from(["[footer-bottom-el]"], {
  y: 30,
  autoAlpha: 0,
  duration: 0.8,
  stagger: 0.2,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".footer-bottom",
    start: "top 98%",
    toggleActions: "play none none reverse",
    markers: false,
  },
});

ScrollTrigger.create({
  trigger: ".footer-card",
  start: "top 50%",
  onEnter: () => gsap.set(".about-image-wrapper", { autoAlpha: 0 }),
  onLeaveBack: () => gsap.set(".about-image-wrapper", { autoAlpha: 1 }),
});

/// COOKIE BANNER

document.addEventListener("DOMContentLoaded", function () {
  const banner = document.querySelector(".cookie-banner");

  function dismissBanner() {
    banner.style.transition =
      "opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    banner.style.opacity = "0";
    banner.style.transform = "translateY(20px)";
    setTimeout(() => (banner.style.display = "none"), 400);
  }

  document
    .querySelector("[data-cookie-accept]")
    ?.addEventListener("click", dismissBanner);
  document
    .querySelector("[data-cookie-reject]")
    ?.addEventListener("click", dismissBanner);
});

let mmSnap = gsap.matchMedia();

mmSnap.add("(min-width: 480px)", () => {

const sectionsHeroToAbout = ["#section-hero", "#section-about"];

gsap.to(sectionsHeroToAbout, {
  scrollTrigger: {
    trigger: "#section-hero",
    start: "bottom bottom",
    end: "bottom top",
    markers: false,
    snap: {
      snapTo: 1 / (sectionsHeroToAbout.length - 1),
      duration: { min: 0.5, max: 0.8 },
      delay: 0.01,
      ease: "power1.inOut"
    }
  }
});

///

const sectionsAboutToRepay = [".repay-section", "#section-about"];

gsap.to(sectionsAboutToRepay, {
  scrollTrigger: {
    trigger: ".repay-section",
    start: "top bottom",
    end: "+=100%",
    markers: false,
    snap: {
      snapTo: 1 / (sectionsAboutToRepay.length - 1),
      duration: { min: 0.5, max: 0.8 },
      delay: 0.01,
      ease: "power1.inOut"
    }
  }
});

///

const sectionsRepayToRefer = [".repay-section", ".section-refer"];

gsap.to(sectionsRepayToRefer, {
  scrollTrigger: {
    trigger: ".section-refer",
    start: "top bottom",
    end: "+=100%",
    markers: false,
    snap: {
      snapTo: 1 / (sectionsRepayToRefer.length - 1),
      duration: { min: 0.5, max: 0.8 },
      delay: 0.01,
      ease: "power1.inOut"
    }
  }
});

///

const sectionsoReferToEarn = [".section-earn", ".section-refer"];

gsap.to(sectionsoReferToEarn, {
  scrollTrigger: {
    trigger: ".section-earn",
    start: "top bottom",
    end: "+=100%",
    markers: false,
    snap: {
      snapTo: 1 / (sectionsoReferToEarn.length - 1),
      duration: { min: 0.5, max: 0.8 },
      delay: 0.01,
      ease: "power1.inOut"
    }
  }
});

///

const sectionsoEarnToFooter = [".section-earn", ".footer-card"];

gsap.to(sectionsoEarnToFooter, {
  scrollTrigger: {
    trigger: ".footer-card",
    start: "top bottom",
    end: "+=100%",
    markers: false,
    snap: {
      snapTo: 1 / (sectionsoEarnToFooter.length - 1),
      duration: { min: 0.5, max: 0.8 },
      delay: 0.1,
      ease: "power1.inOut"
    }
  }
});

return () => {};
});
