import { nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue';
import { ArrowLeft, ArrowRight, ChevronRight, Instagram, Linkedin, Menu, ShoppingCart, UserRound, X, Youtube } from 'lucide-vue-next';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { A11y, Autoplay, EffectFade, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import VideoCard from './components/VideoCard.vue';
import NoiseBackdrop from './components/NoiseBackdrop.vue';
import NewsletterForm from './components/NewsletterForm.vue';
import { menus, original, press, promoCards, slides, social, stories } from './content';
const modules = [A11y, Autoplay, EffectFade, Keyboard];
const activeSlide = ref(0);
const pressIndex = ref(0);
const activeMenu = ref(null);
const mobileOpen = ref(false);
const scrolled = ref(false);
const headerHidden = ref(false);
const header = ref();
const hero = shallowRef();
const carousels = {};
const carouselEdges = reactive({ social: { start: true, end: false }, stories: { start: true, end: false } });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = ref(window.innerWidth >= 1060);
const carouselBreakpoints = { 768: { slidesPerView: 2 }, 1060: { slidesPerView: 4 } };
let previousScroll = 0;
let menuTimer;
let focusReturn = null;
function registerCarousel(name, swiper) { carousels[name] = swiper; updateCarousel(name, swiper); }
function updateCarousel(name, swiper) {
    if (name === 'press')
        pressIndex.value = swiper.realIndex;
    else
        carouselEdges[name] = { start: swiper.isBeginning, end: swiper.isEnd };
}
function move(name, delta) { delta > 0 ? carousels[name]?.slideNext() : carousels[name]?.slidePrev(); }
function enterMenu(name) { if (desktop.value) {
    clearTimeout(menuTimer);
    activeMenu.value = name;
} }
function leaveMenu() { if (desktop.value)
    menuTimer = window.setTimeout(() => { activeMenu.value = null; }, 160); }
function cancelMenuClose() { clearTimeout(menuTimer); }
function toggleMenu(name) { activeMenu.value = desktop.value ? name : activeMenu.value === name ? null : name; }
async function openMobile() {
    focusReturn = document.activeElement;
    mobileOpen.value = !mobileOpen.value;
    activeMenu.value = null;
    await nextTick();
    if (mobileOpen.value)
        header.value?.querySelector('.mobile-nav button')?.focus();
}
function closeOverlays() {
    activeMenu.value = null;
    mobileOpen.value = false;
    nextTick(() => focusReturn?.focus());
}
function onScroll() {
    const y = window.scrollY;
    scrolled.value = y > 140;
    if (Math.abs(y - previousScroll) > 4)
        headerHidden.value = y > 160 && y > previousScroll && !activeMenu.value && !mobileOpen.value;
    previousScroll = y;
}
function onResize() { desktop.value = window.innerWidth >= 1060; if (desktop.value)
    mobileOpen.value = false; }
function onKey(event) {
    if (event.key === 'Escape') {
        closeOverlays();
        return;
    }
    if (event.key !== 'Tab' || !mobileOpen.value)
        return;
    const root = header.value;
    const items = [...(root?.querySelectorAll('a[href],button,summary') || [])].filter(e => e.getClientRects().length > 0);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
        event.preventDefault();
        last?.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
    }
}
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onResize); document.addEventListener('keydown', onKey); });
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); document.removeEventListener('keydown', onKey); clearTimeout(menuTimer); });
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "also-site" },
    ...{ class: ({ 'overlay-open': __VLS_ctx.mobileOpen }) },
});
/** @type {__VLS_StyleScopedClasses['also-site']} */ ;
/** @type {__VLS_StyleScopedClasses['overlay-open']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "announcement" },
    href: (__VLS_ctx.original('/pages/events')),
});
/** @type {__VLS_StyleScopedClasses['announcement']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ onMouseenter: (__VLS_ctx.cancelMenuClose) },
    ...{ onMouseleave: (__VLS_ctx.leaveMenu) },
    ref: "header",
    ...{ class: "also-header" },
    ...{ class: ({ solid: __VLS_ctx.scrolled, hidden: __VLS_ctx.headerHidden, expanded: __VLS_ctx.activeMenu || __VLS_ctx.mobileOpen, 'mobile-submenu': __VLS_ctx.mobileOpen && __VLS_ctx.activeMenu }) },
});
/** @type {__VLS_StyleScopedClasses['also-header']} */ ;
/** @type {__VLS_StyleScopedClasses['solid']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['expanded']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-submenu']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-bar" },
});
/** @type {__VLS_StyleScopedClasses['header-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "also-logo" },
    href: "/",
    'aria-label': "ALSO home",
});
/** @type {__VLS_StyleScopedClasses['also-logo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    'aria-label': "Primary navigation",
});
for (const [_, name] of __VLS_vFor((__VLS_ctx.menus))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onMouseenter: (...[$event]) => {
                return (__VLS_ctx.enterMenu(name));
                // @ts-ignore
                [mobileOpen, mobileOpen, mobileOpen, original, cancelMenuClose, leaveMenu, scrolled, headerHidden, activeMenu, activeMenu, menus, enterMenu,];
            } },
        ...{ onFocus: (...[$event]) => {
                return (__VLS_ctx.enterMenu(name));
                // @ts-ignore
                [enterMenu,];
            } },
        ...{ onClick: (...[$event]) => {
                return (__VLS_ctx.toggleMenu(name));
                // @ts-ignore
                [toggleMenu,];
            } },
        key: (name),
        ...{ class: ({ active: __VLS_ctx.activeMenu === name }) },
        'aria-expanded': (__VLS_ctx.activeMenu === name),
        'aria-controls': "mega-menu",
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    (name);
    // @ts-ignore
    [activeMenu, activeMenu,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-actions" },
});
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "pill light small" },
    href: (__VLS_ctx.original('/pages/events')),
});
/** @type {__VLS_StyleScopedClasses['pill']} */ ;
/** @type {__VLS_StyleScopedClasses['light']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "cart-link" },
    'aria-label': "Cart",
    href: (__VLS_ctx.original('/cart')),
});
/** @type {__VLS_StyleScopedClasses['cart-link']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.ShoppingCart} */
ShoppingCart;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: (24),
    strokeWidth: (1.5),
}));
const __VLS_2 = __VLS_1({
    size: (24),
    strokeWidth: (1.5),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "account-link" },
    href: (__VLS_ctx.original('/account/login')),
    'aria-label': "Account",
});
/** @type {__VLS_StyleScopedClasses['account-link']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.UserRound} */
UserRound;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    size: (24),
    strokeWidth: (1.5),
}));
const __VLS_7 = __VLS_6({
    size: (24),
    strokeWidth: (1.5),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openMobile) },
    ...{ class: "menu-button" },
    'aria-label': (__VLS_ctx.mobileOpen ? 'Close menu' : 'Open menu'),
    'aria-expanded': (__VLS_ctx.mobileOpen),
});
/** @type {__VLS_StyleScopedClasses['menu-button']} */ ;
if (__VLS_ctx.mobileOpen) {
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        size: (24),
    }));
    const __VLS_12 = __VLS_11({
        size: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
}
else {
    let __VLS_15;
    /** @ts-ignore @type { | typeof __VLS_components.Menu} */
    Menu;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        size: (24),
    }));
    const __VLS_17 = __VLS_16({
        size: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
}
if (__VLS_ctx.mobileOpen && !__VLS_ctx.activeMenu) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "mobile-nav" },
        'aria-label': "Mobile navigation",
    });
    /** @type {__VLS_StyleScopedClasses['mobile-nav']} */ ;
    for (const [_, name] of __VLS_vFor((__VLS_ctx.menus))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.mobileOpen && !__VLS_ctx.activeMenu))
                        throw 0;
                    return (__VLS_ctx.toggleMenu(name));
                    // @ts-ignore
                    [mobileOpen, mobileOpen, mobileOpen, mobileOpen, original, original, original, activeMenu, menus, toggleMenu, openMobile,];
                } },
            key: (name),
        });
        (name);
        let __VLS_20;
        /** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
        ChevronRight;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            size: (18),
        }));
        const __VLS_22 = __VLS_21({
            size: (18),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: (__VLS_ctx.original('/account/login')),
    });
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.UserRound} */
    UserRound;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        size: (20),
    }));
    const __VLS_27 = __VLS_26({
        size: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        ...{ class: "pill purple" },
        href: (__VLS_ctx.original('/pages/events')),
    });
    /** @type {__VLS_StyleScopedClasses['pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['purple']} */ ;
}
let __VLS_30;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    name: "menu",
}));
const __VLS_32 = __VLS_31({
    name: "menu",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const { default: __VLS_35 } = __VLS_33.slots;
if (__VLS_ctx.activeMenu) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        id: "mega-menu",
        ...{ class: "mega-menu" },
    });
    /** @type {__VLS_StyleScopedClasses['mega-menu']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mobile-menu-heading" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-menu-heading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeMenu))
                    throw 0;
                return (__VLS_ctx.activeMenu = null);
                // @ts-ignore
                [original, original, activeMenu, activeMenu,];
            } },
        'aria-label': "Back to menu",
    });
    let __VLS_36;
    /** @ts-ignore @type { | typeof __VLS_components.ArrowLeft} */
    ArrowLeft;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        size: (20),
    }));
    const __VLS_38 = __VLS_37({
        size: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    (__VLS_ctx.activeMenu);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeOverlays) },
        'aria-label': "Close menu",
    });
    let __VLS_41;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        size: (22),
    }));
    const __VLS_43 = __VLS_42({
        size: (22),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "mega-links" },
        'aria-label': (`${__VLS_ctx.activeMenu} navigation`),
    });
    /** @type {__VLS_StyleScopedClasses['mega-links']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.menus[__VLS_ctx.activeMenu].links))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
            key: (item.label),
        });
        if (item.children) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.details, __VLS_intrinsics.details)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.summary, __VLS_intrinsics.summary)({});
            (item.label);
            let __VLS_46;
            /** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
            ChevronRight;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                size: (16),
            }));
            const __VLS_48 = __VLS_47({
                size: (16),
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            for (const [child] of __VLS_vFor((item.children))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                    key: (child.label),
                    href: (__VLS_ctx.original(child.href)),
                });
                (child.label);
                // @ts-ignore
                [original, activeMenu, activeMenu, activeMenu, menus, closeOverlays,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.original(item.href)),
            });
            (item.label);
        }
        // @ts-ignore
        [original,];
    }
    for (const [card] of __VLS_vFor((__VLS_ctx.menus[__VLS_ctx.activeMenu].cards))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            key: (card.title),
            ...{ class: "mega-card" },
            href: (__VLS_ctx.original(card.href)),
        });
        /** @type {__VLS_StyleScopedClasses['mega-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (`/assets/${card.image}`),
            alt: (card.title),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        (card.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pill light small" },
        });
        /** @type {__VLS_StyleScopedClasses['pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['light']} */ ;
        /** @type {__VLS_StyleScopedClasses['small']} */ ;
        (card.action);
        // @ts-ignore
        [original, activeMenu, menus,];
    }
}
// @ts-ignore
[];
var __VLS_33;
if (__VLS_ctx.activeMenu || __VLS_ctx.mobileOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeOverlays) },
        ...{ class: "backdrop" },
        ...{ class: ({ dimmed: __VLS_ctx.mobileOpen }) },
        'aria-label': "Close overlay",
        tabindex: "-1",
    });
    /** @type {__VLS_StyleScopedClasses['backdrop']} */ ;
    /** @type {__VLS_StyleScopedClasses['dimmed']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    id: "top",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "hero" },
    'aria-label': "Featured stories",
});
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
let __VLS_51;
/** @ts-ignore @type { | typeof __VLS_components.Swiper | typeof __VLS_components.Swiper} */
Swiper;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ 'onFocusin': {} },
    ...{ 'onFocusout': {} },
    ...{ class: "hero-swiper" },
    modules: (__VLS_ctx.modules),
    effect: "fade",
    fadeEffect: ({ crossFade: true }),
    speed: (__VLS_ctx.reducedMotion ? 0 : 650),
    loop: (true),
    autoplay: (__VLS_ctx.reducedMotion ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }),
    keyboard: ({ enabled: true, onlyInViewport: true }),
}));
const __VLS_53 = __VLS_52({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ 'onFocusin': {} },
    ...{ 'onFocusout': {} },
    ...{ class: "hero-swiper" },
    modules: (__VLS_ctx.modules),
    effect: "fade",
    fadeEffect: ({ crossFade: true }),
    speed: (__VLS_ctx.reducedMotion ? 0 : 650),
    loop: (true),
    autoplay: (__VLS_ctx.reducedMotion ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }),
    keyboard: ({ enabled: true, onlyInViewport: true }),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
let __VLS_56;
const __VLS_57 = {
    /** @type {typeof __VLS_56.swiper} */
    onSwiper: (...[$event]) => {
        return (__VLS_ctx.hero = $event);
        // @ts-ignore
        [mobileOpen, mobileOpen, activeMenu, closeOverlays, modules, reducedMotion, reducedMotion, hero,];
    },
};
const __VLS_58 = {
    /** @type {typeof __VLS_56.slideChange} */
    onSlideChange: (...[$event]) => {
        return (__VLS_ctx.activeSlide = $event.realIndex);
        // @ts-ignore
        [activeSlide,];
    },
};
const __VLS_59 = {
    /** @type {typeof __VLS_56.focusin} */
    onFocusin: (...[$event]) => {
        return (__VLS_ctx.hero?.autoplay?.pause());
        // @ts-ignore
        [hero,];
    },
};
const __VLS_60 = {
    /** @type {typeof __VLS_56.focusout} */
    onFocusout: (...[$event]) => {
        return (__VLS_ctx.hero?.autoplay?.resume());
        // @ts-ignore
        [hero,];
    },
};
/** @type {__VLS_StyleScopedClasses['hero-swiper']} */ ;
const { default: __VLS_61 } = __VLS_54.slots;
for (const [slide, index] of __VLS_vFor((__VLS_ctx.slides))) {
    let __VLS_62;
    /** @ts-ignore @type { | typeof __VLS_components.SwiperSlide | typeof __VLS_components.SwiperSlide} */
    SwiperSlide;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        key: (slide.image),
    }));
    const __VLS_64 = __VLS_63({
        key: (slide.image),
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const { default: __VLS_67 } = __VLS_65.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.picture, __VLS_intrinsics.picture)({
        ...{ class: "hero-media" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-media']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
        media: "(max-width: 1059px)",
        srcset: (`/assets/${slide.mobile}`),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (`/assets/${slide.image}`),
        alt: (slide.title),
        fetchpriority: (index === 0 ? 'high' : 'auto'),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-shade" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-shade']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-copy" },
        ...{ class: (`slide-${index}`) },
    });
    /** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
    if (index === 2) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "test-spin-sticker" },
            src: "/assets/test-spin-sticker.png",
            alt: "Test Spin Near You",
        });
        /** @type {__VLS_StyleScopedClasses['test-spin-sticker']} */ ;
    }
    else if (index === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
        (slide.title);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        (slide.title);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        ...{ class: "pill" },
        ...{ class: (index === 2 ? 'light' : 'purple') },
        href: (__VLS_ctx.original(slide.href)),
        tabindex: (__VLS_ctx.activeSlide === index ? 0 : -1),
    });
    /** @type {__VLS_StyleScopedClasses['pill']} */ ;
    (slide.action);
    // @ts-ignore
    [original, activeSlide, slides,];
    var __VLS_65;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_54;
var __VLS_55;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-dots" },
    role: "group",
    'aria-label': "Choose slide",
});
/** @type {__VLS_StyleScopedClasses['hero-dots']} */ ;
for (const [_, index] of __VLS_vFor((__VLS_ctx.slides))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return (__VLS_ctx.hero?.slideToLoop(index));
                // @ts-ignore
                [hero, slides,];
            } },
        key: (index),
        ...{ class: ({ active: index === __VLS_ctx.activeSlide }) },
        'aria-label': (`Go to slide ${index + 1}`),
        'aria-pressed': (index === __VLS_ctx.activeSlide),
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [activeSlide, activeSlide,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "promo-section" },
    'aria-label': "Explore ALSO",
});
/** @type {__VLS_StyleScopedClasses['promo-section']} */ ;
let __VLS_68;
/** @ts-ignore @type { | typeof __VLS_components.Swiper | typeof __VLS_components.Swiper} */
Swiper;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
    modules: ([__VLS_ctx.A11y]),
    slidesPerView: (1),
    spaceBetween: (16),
    breakpoints: ({ 1060: { slidesPerView: 3 } }),
    ...{ class: "promo-grid" },
}));
const __VLS_70 = __VLS_69({
    modules: ([__VLS_ctx.A11y]),
    slidesPerView: (1),
    spaceBetween: (16),
    breakpoints: ({ 1060: { slidesPerView: 3 } }),
    ...{ class: "promo-grid" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
/** @type {__VLS_StyleScopedClasses['promo-grid']} */ ;
const { default: __VLS_73 } = __VLS_71.slots;
for (const [card] of __VLS_vFor((__VLS_ctx.promoCards))) {
    let __VLS_74;
    /** @ts-ignore @type { | typeof __VLS_components.SwiperSlide | typeof __VLS_components.SwiperSlide} */
    SwiperSlide;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        key: (card.image),
    }));
    const __VLS_76 = __VLS_75({
        key: (card.image),
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const { default: __VLS_79 } = __VLS_77.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        ...{ class: "promo-card" },
        href: (__VLS_ctx.original(card.href)),
    });
    /** @type {__VLS_StyleScopedClasses['promo-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (`/assets/${card.image}`),
        alt: (card.title || 'Test Spin'),
        loading: "lazy",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (card.title) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        (card.title);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pill light small" },
    });
    /** @type {__VLS_StyleScopedClasses['pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['light']} */ ;
    /** @type {__VLS_StyleScopedClasses['small']} */ ;
    (card.action);
    // @ts-ignore
    [original, A11y, promoCards,];
    var __VLS_77;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_71;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "social-section" },
    'aria-labelledby': "social-title",
});
/** @type {__VLS_StyleScopedClasses['social-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-head" },
});
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    id: "social-title",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://www.instagram.com/ridealso/",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "carousel-controls" },
});
/** @type {__VLS_StyleScopedClasses['carousel-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.move('social', -1));
            // @ts-ignore
            [move,];
        } },
    'aria-label': "Previous community video",
    disabled: (__VLS_ctx.carouselEdges.social.start),
});
let __VLS_80;
/** @ts-ignore @type { | typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({}));
const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.move('social', 1));
            // @ts-ignore
            [move, carouselEdges,];
        } },
    'aria-label': "Next community video",
    disabled: (__VLS_ctx.carouselEdges.social.end),
});
let __VLS_85;
/** @ts-ignore @type { | typeof __VLS_components.ArrowRight} */
ArrowRight;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({}));
const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
let __VLS_90;
/** @ts-ignore @type { | typeof __VLS_components.Swiper | typeof __VLS_components.Swiper} */
Swiper;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ 'onResize': {} },
    ...{ class: "social-track" },
    modules: ([__VLS_ctx.A11y, __VLS_ctx.Keyboard]),
    slidesPerView: (1),
    spaceBetween: (16),
    breakpoints: (__VLS_ctx.carouselBreakpoints),
}));
const __VLS_92 = __VLS_91({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ 'onResize': {} },
    ...{ class: "social-track" },
    modules: ([__VLS_ctx.A11y, __VLS_ctx.Keyboard]),
    slidesPerView: (1),
    spaceBetween: (16),
    breakpoints: (__VLS_ctx.carouselBreakpoints),
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
let __VLS_95;
const __VLS_96 = {
    /** @type {typeof __VLS_95.swiper} */
    onSwiper: (...[$event]) => {
        return (__VLS_ctx.registerCarousel('social', $event));
        // @ts-ignore
        [A11y, carouselEdges, Keyboard, carouselBreakpoints, registerCarousel,];
    },
};
const __VLS_97 = {
    /** @type {typeof __VLS_95.slideChange} */
    onSlideChange: (...[$event]) => {
        return (__VLS_ctx.updateCarousel('social', $event));
        // @ts-ignore
        [updateCarousel,];
    },
};
const __VLS_98 = {
    /** @type {typeof __VLS_95.resize} */
    onResize: (...[$event]) => {
        return (__VLS_ctx.updateCarousel('social', $event));
        // @ts-ignore
        [updateCarousel,];
    },
};
/** @type {__VLS_StyleScopedClasses['social-track']} */ ;
const { default: __VLS_99 } = __VLS_93.slots;
for (const [video, index] of __VLS_vFor((__VLS_ctx.social))) {
    let __VLS_100;
    /** @ts-ignore @type { | typeof __VLS_components.SwiperSlide | typeof __VLS_components.SwiperSlide} */
    SwiperSlide;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
        key: (video.src),
    }));
    const __VLS_102 = __VLS_101({
        key: (video.src),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const { default: __VLS_105 } = __VLS_103.slots;
    const __VLS_106 = VideoCard;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
        ...(video),
        index: (index),
    }));
    const __VLS_108 = __VLS_107({
        ...(video),
        index: (index),
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    // @ts-ignore
    [social,];
    var __VLS_103;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_93;
var __VLS_94;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "press-section" },
    'aria-labelledby': "press-title",
});
/** @type {__VLS_StyleScopedClasses['press-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-head" },
});
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    id: "press-title",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "carousel-controls" },
});
/** @type {__VLS_StyleScopedClasses['carousel-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-live': "polite",
});
(String(__VLS_ctx.pressIndex + 1).padStart(2, '0'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.move('press', -1));
            // @ts-ignore
            [move, pressIndex,];
        } },
    'aria-label': "Previous press quote",
});
let __VLS_111;
/** @ts-ignore @type { | typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({}));
const __VLS_113 = __VLS_112({}, ...__VLS_functionalComponentArgsRest(__VLS_112));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.move('press', 1));
            // @ts-ignore
            [move,];
        } },
    'aria-label': "Next press quote",
});
let __VLS_116;
/** @ts-ignore @type { | typeof __VLS_components.ArrowRight} */
ArrowRight;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({}));
const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
let __VLS_121;
/** @ts-ignore @type { | typeof __VLS_components.Swiper | typeof __VLS_components.Swiper} */
Swiper;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ class: "press-track" },
    modules: ([__VLS_ctx.A11y]),
    slidesPerView: (1.1),
    spaceBetween: (16),
    loop: (true),
    breakpoints: ({ 768: { slidesPerView: 2.3 }, 1060: { slidesPerView: 3.9 } }),
}));
const __VLS_123 = __VLS_122({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ class: "press-track" },
    modules: ([__VLS_ctx.A11y]),
    slidesPerView: (1.1),
    spaceBetween: (16),
    loop: (true),
    breakpoints: ({ 768: { slidesPerView: 2.3 }, 1060: { slidesPerView: 3.9 } }),
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
let __VLS_126;
const __VLS_127 = {
    /** @type {typeof __VLS_126.swiper} */
    onSwiper: (...[$event]) => {
        return (__VLS_ctx.registerCarousel('press', $event));
        // @ts-ignore
        [A11y, registerCarousel,];
    },
};
const __VLS_128 = {
    /** @type {typeof __VLS_126.slideChange} */
    onSlideChange: (...[$event]) => {
        return (__VLS_ctx.updateCarousel('press', $event));
        // @ts-ignore
        [updateCarousel,];
    },
};
/** @type {__VLS_StyleScopedClasses['press-track']} */ ;
const { default: __VLS_129 } = __VLS_124.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.press))) {
    let __VLS_130;
    /** @ts-ignore @type { | typeof __VLS_components.SwiperSlide | typeof __VLS_components.SwiperSlide} */
    SwiperSlide;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
        key: (item.quote),
    }));
    const __VLS_132 = __VLS_131({
        key: (item.quote),
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    const { default: __VLS_135 } = __VLS_133.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (item.quote);
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (`/assets/${item.logo}`),
        alt: (item.name),
        loading: "lazy",
    });
    // @ts-ignore
    [press,];
    var __VLS_133;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_124;
var __VLS_125;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "quad-section" },
});
/** @type {__VLS_StyleScopedClasses['quad-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.picture, __VLS_intrinsics.picture)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.source)({
    media: "(max-width:1059px)",
    srcset: "/assets/quad-mobile.jpg",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/assets/quads.webp",
    alt: "ALSO TM-Q four-wheel cargo vehicle",
    loading: "lazy",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "pill green" },
    href: (__VLS_ctx.original('/products/quad')),
});
/** @type {__VLS_StyleScopedClasses['pill']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "stories-section" },
    'aria-labelledby': "stories-title",
});
/** @type {__VLS_StyleScopedClasses['stories-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-head" },
});
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    id: "stories-title",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "carousel-controls" },
});
/** @type {__VLS_StyleScopedClasses['carousel-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.move('stories', -1));
            // @ts-ignore
            [original, move,];
        } },
    'aria-label': "Previous story",
    disabled: (__VLS_ctx.carouselEdges.stories.start),
});
let __VLS_136;
/** @ts-ignore @type { | typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({}));
const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.move('stories', 1));
            // @ts-ignore
            [move, carouselEdges,];
        } },
    'aria-label': "Next story",
    disabled: (__VLS_ctx.carouselEdges.stories.end),
});
let __VLS_141;
/** @ts-ignore @type { | typeof __VLS_components.ArrowRight} */
ArrowRight;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({}));
const __VLS_143 = __VLS_142({}, ...__VLS_functionalComponentArgsRest(__VLS_142));
let __VLS_146;
/** @ts-ignore @type { | typeof __VLS_components.Swiper | typeof __VLS_components.Swiper} */
Swiper;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ 'onResize': {} },
    ...{ class: "stories-track" },
    modules: ([__VLS_ctx.A11y]),
    slidesPerView: (1.04),
    spaceBetween: (16),
    breakpoints: (__VLS_ctx.carouselBreakpoints),
}));
const __VLS_148 = __VLS_147({
    ...{ 'onSwiper': {} },
    ...{ 'onSlideChange': {} },
    ...{ 'onResize': {} },
    ...{ class: "stories-track" },
    modules: ([__VLS_ctx.A11y]),
    slidesPerView: (1.04),
    spaceBetween: (16),
    breakpoints: (__VLS_ctx.carouselBreakpoints),
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
let __VLS_151;
const __VLS_152 = {
    /** @type {typeof __VLS_151.swiper} */
    onSwiper: (...[$event]) => {
        return (__VLS_ctx.registerCarousel('stories', $event));
        // @ts-ignore
        [A11y, carouselEdges, carouselBreakpoints, registerCarousel,];
    },
};
const __VLS_153 = {
    /** @type {typeof __VLS_151.slideChange} */
    onSlideChange: (...[$event]) => {
        return (__VLS_ctx.updateCarousel('stories', $event));
        // @ts-ignore
        [updateCarousel,];
    },
};
const __VLS_154 = {
    /** @type {typeof __VLS_151.resize} */
    onResize: (...[$event]) => {
        return (__VLS_ctx.updateCarousel('stories', $event));
        // @ts-ignore
        [updateCarousel,];
    },
};
/** @type {__VLS_StyleScopedClasses['stories-track']} */ ;
const { default: __VLS_155 } = __VLS_149.slots;
for (const [story] of __VLS_vFor((__VLS_ctx.stories))) {
    let __VLS_156;
    /** @ts-ignore @type { | typeof __VLS_components.SwiperSlide | typeof __VLS_components.SwiperSlide} */
    SwiperSlide;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
        key: (story.slug),
    }));
    const __VLS_158 = __VLS_157({
        key: (story.slug),
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    const { default: __VLS_161 } = __VLS_159.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        ...{ class: "story-card" },
        href: (__VLS_ctx.original(`/blogs/all/${story.slug}`)),
    });
    /** @type {__VLS_StyleScopedClasses['story-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "story-image" },
    });
    /** @type {__VLS_StyleScopedClasses['story-image']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (`/assets/${story.image}`),
        alt: (story.title),
        loading: "lazy",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (story.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pill dark small" },
    });
    /** @type {__VLS_StyleScopedClasses['pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['small']} */ ;
    // @ts-ignore
    [original, stories,];
    var __VLS_159;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_149;
var __VLS_150;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "signup" },
});
/** @type {__VLS_StyleScopedClasses['signup']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
const __VLS_162 = NewsletterForm;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({}));
const __VLS_164 = __VLS_163({}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    id: "footer",
    ...{ class: "also-footer" },
});
/** @type {__VLS_StyleScopedClasses['also-footer']} */ ;
const __VLS_167 = NoiseBackdrop;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({}));
const __VLS_169 = __VLS_168({}, ...__VLS_functionalComponentArgsRest(__VLS_168));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-content" },
});
/** @type {__VLS_StyleScopedClasses['footer-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-columns" },
});
/** @type {__VLS_StyleScopedClasses['footer-columns']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-products" },
});
/** @type {__VLS_StyleScopedClasses['footer-products']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/products/tm-b')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/products/quad')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/products/helmet')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/collections/gear')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/pages/company')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/blogs/all')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://jobs.ashbyhq.com/Ridealso",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
for (const [[label, path]] of __VLS_vFor(([['CUSTOMER SUPPORT', 'support'], ['SERVICE', 'service-and-assembly'], ['RETURNS', 'returns'], ['CORPORATE SALES', 'corporate-sales'], ['FINANCING', 'financing'], ['EVO POP-UP', 'partnerships-evo']]))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        key: (path),
        href: (__VLS_ctx.original(`/pages/${path}`)),
    });
    (label);
    // @ts-ignore
    [original, original, original, original, original, original, original,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/account')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/account?view=orders')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-bottom" },
});
/** @type {__VLS_StyleScopedClasses['footer-bottom']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "social-links" },
    'aria-label': "Social media",
});
/** @type {__VLS_StyleScopedClasses['social-links']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://www.linkedin.com/company/ridealso",
    'aria-label': "LinkedIn",
});
let __VLS_172;
/** @ts-ignore @type { | typeof __VLS_components.Linkedin} */
Linkedin;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({}));
const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://www.instagram.com/ridealso/",
    'aria-label': "Instagram",
});
let __VLS_177;
/** @ts-ignore @type { | typeof __VLS_components.Instagram} */
Instagram;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({}));
const __VLS_179 = __VLS_178({}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://www.tiktok.com/@ridealso",
    'aria-label': "TikTok",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "tiktok-mark" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['tiktok-mark']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://www.youtube.com/@ride_also",
    'aria-label': "YouTube",
});
let __VLS_182;
/** @ts-ignore @type { | typeof __VLS_components.Youtube} */
Youtube;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({}));
const __VLS_184 = __VLS_183({}, ...__VLS_functionalComponentArgsRest(__VLS_183));
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "legal" },
    'aria-label': "Legal",
});
/** @type {__VLS_StyleScopedClasses['legal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "mailto:media@ridealso.com",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/pages/terms')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/pages/privacy')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.original('/pages/supplier-terms')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "footer-word" },
    href: "/",
    'aria-label': "ALSO home",
});
/** @type {__VLS_StyleScopedClasses['footer-word']} */ ;
// @ts-ignore
[original, original, original, original, original,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
