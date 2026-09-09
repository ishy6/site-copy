import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { Menu, X } from 'lucide-vue-next';
const panel = ref(null);
const newsletterOpen = ref(false);
const noticeOpen = ref(false);
const hoveredCategory = ref('');
const search = ref('');
const searchOpen = ref(false);
const mobileSearchInput = ref();
const drawer = ref();
let opener = null;
let newsletterTimer;
const categories = [
    ['New Releases', 'new-releases'], ['Wallets', 'wallets'], ['Bags and Totes', 'bags-totes'],
    ['Keychains', 'keychains'], ['Accessories', 'accessories'], ['Phone Sleeves', 'phone-sleeves'],
    ['Device Cases', 'device-cases'], ['Stationery', 'stationery'], ['Eyewear', 'eyewear'],
    ['Objects', 'objects'], ['Cordovan', 'cordovan'], ['Clearance', 'clearance'], ['Travel', 'travel'],
];
const infoLinks = [['About', 'info/about'], ['Process', 'info/process'], ['Help', 'info/help']];
const menuLinks = computed(() => panel.value === 'info' ? infoLinks : panel.value === 'mobile' ? [...categories, ...infoLinks, ['Journal', 'journal'], ['Account', 'account']] : categories);
const categoryImage = computed(() => hoveredCategory.value === 'new-releases' ? '/assets/makr-cats-new-releases.avif' : `https://media-makr-com.imgix.net/images/makr-cats-${hoveredCategory.value === 'bags-totes' ? 'bags' : hoveredCategory.value}.jpg?w=700&auto=format&q=75`);
const url = (path) => `https://makr.com/${path}`;
const blocks = [
    { type: 'offset', images: ['Bracket_Pouch.avif', 'MAKR_BR_PW_-SUPPORT_2.avif'], title: '"Bracket" Pouch/Wallets', note: 'Now Available.', href: 'wallets' },
    { type: 'center', images: ['Compare_Pouches.avif'], title: 'A Size Comparison -', note: 'Our Dopp Kit, Field Pouch and Pencil Case.', href: 'accessories', comparison: true },
    { type: 'center', images: ['MAKR_2611062.avif'], title: 'Flap PLUS V2 Wallet', note: 'Available in Natural, Brown Ox Blood and Black Horween Latigo.', href: 'new-releases' },
    { type: 'triple', images: ['MAKR_OB_KH_1.avif', 'MAKR_OB_KH_2.avif', 'MAKR_OB_KH_5.avif'], title: 'Bags, Totes and Sacoches.', note: '/bags-totes', href: 'bags-totes', links: ['arc-daypack-carbon', 'bags-totes', 'sacoche-large-metal-ballistic-nylon'] },
    { type: 'center', images: ['MAKR_FW_Carbon_IS_1.avif'], title: 'NEW: Fold Weekenders - Custom Carbon #8 Heavy Cotton Duck', href: 'new-fold-weekender-carbon-canvas' },
    { type: 'offset reverse', images: ['ContactSheet-001.avif', 'Mailer_Image_2.avif'], title: 'Zip Luxe "V2" Now Available in Black and Bark Chromexcel', href: 'wallets' },
    { type: 'wide', images: ['Device_Case_JX.avif'], title: 'Unique "Impossible" Bottom Corners. Fully Lined Wrap Construction.', note: 'Wrap Device Case', href: 'device-cases' },
    { type: 'triple', images: ['MKR_FLD_PCH_Persp_GRN.avif', 'MKR_FLD_PCH_Persp_BRWN.avif', 'MKR_FLD_PCH_Persp_BLK.avif'], title: 'PRE-ORDER: NEW Field Pouches in (3) Finishes', note: 'See them here.', href: 'new-releases', links: ['field-pouch-fern', 'field-pouch-brwn', 'field-pouch-blk'] },
    { type: 'wide', images: ['FW_Fence.avif'], title: '', href: 'new-fold-weekender-brown-canvas' },
    { type: 'triple', images: ['MAKR_FLD_WK_Nat.avif', 'MAKR_FLD_WK_Brown.avif', 'MAKR_FLD_WK_Black.avif'], title: '#8 Heavy Canvas Fold Weekenders', href: 'bags-totes', links: ['fold-weekender-revised-natural-canvas', 'new-fold-weekender-brown-canvas', 'new-fold-weekender-black-canvas'] },
    { type: 'offset reverse', images: ['MAKR_Plate_Hooks.avif', 'Plate-Hooks-R2.avif'], title: 'NEW EDITION - Plate Hooks in Spalted Maple and Stainless Steel', note: 'NEW SET - (9) Unique Plate Options - Select yours here.', href: 'plate-hook-spalted-maple' },
    { type: 'wide inset-edge', images: ['ContactSheet-ZIP-Wallets.avif'], title: 'NEW - Zip Luxe "V2" Wallet', href: 'new-releases' },
    { type: 'wide inset-edge', images: ['Eyewear_Support_01_Panor.avif'], title: 'NEW! Suede Eyewear Sleeve V3', href: 'eyewear' },
    { type: 'wide', images: ['Suede-Eyewear-Comp-1.avif'], title: '', href: 'eyewear' },
    { type: 'center', images: ['DM256830.png'], title: '', href: 'offset-tote-natural' },
    { type: 'offset', images: ['DM256913.avif', 'DM256795.png'], title: 'Offset Tote in Natural #8 Cotton Duck', href: 'offset-tote-natural' },
];
async function togglePanel(name) {
    if (panel.value === name)
        return closePanel();
    opener = document.activeElement;
    panel.value = name;
    await nextTick();
    drawer.value?.focus();
}
function closePanel() {
    panel.value = null;
    hoveredCategory.value = '';
    nextTick(() => opener?.focus());
}
function dismissNewsletter() {
    newsletterOpen.value = false;
    try {
        sessionStorage.setItem('makr-newsletter-dismissed', '1');
    }
    catch { /* Storage can be disabled. */ }
}
function dismissNotice() {
    noticeOpen.value = false;
    try {
        sessionStorage.setItem('makr-notice-dismissed', '1');
    }
    catch { /* Storage can be disabled. */ }
}
async function openSearch() {
    searchOpen.value = true;
    await nextTick();
    mobileSearchInput.value?.focus();
}
function submitSearch() {
    if (search.value.trim())
        window.location.assign(`${url('search')}?search_term=${encodeURIComponent(search.value.trim())}`);
}
function handleKey(event) {
    if (event.key === 'Escape') {
        if (panel.value)
            closePanel();
        else if (searchOpen.value)
            searchOpen.value = false;
        else if (newsletterOpen.value)
            dismissNewsletter();
    }
    if (event.key !== 'Tab' || !panel.value || !drawer.value)
        return;
    const focusable = [...drawer.value.querySelectorAll('a[href],button,input')];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === drawer.value)) {
        event.preventDefault();
        last?.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
    }
}
onMounted(() => {
    document.addEventListener('keydown', handleKey);
    newsletterTimer = window.setTimeout(() => {
        try {
            newsletterOpen.value = !sessionStorage.getItem('makr-newsletter-dismissed');
            noticeOpen.value = !sessionStorage.getItem('makr-notice-dismissed');
        }
        catch {
            newsletterOpen.value = true;
            noticeOpen.value = true;
        }
    }, 7000);
});
onBeforeUnmount(() => { document.removeEventListener('keydown', handleKey); clearTimeout(newsletterTimer); });
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "site" },
    ...{ class: ({ 'has-panel': __VLS_ctx.panel }) },
});
/** @type {__VLS_StyleScopedClasses['site']} */ ;
/** @type {__VLS_StyleScopedClasses['has-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "site-header" },
});
/** @type {__VLS_StyleScopedClasses['site-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "brand" },
    href: "/",
    'aria-label': "MAKR home",
});
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "desktop-links" },
    'aria-label': "Primary navigation",
});
/** @type {__VLS_StyleScopedClasses['desktop-links']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.togglePanel('shop'));
            // @ts-ignore
            [panel, togglePanel,];
        } },
    'aria-expanded': (__VLS_ctx.panel === 'shop'),
    'aria-controls': "navigation-drawer",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.togglePanel('info'));
            // @ts-ignore
            [panel, togglePanel,];
        } },
    'aria-expanded': (__VLS_ctx.panel === 'info'),
    'aria-controls': "navigation-drawer",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.url('journal')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
    ...{ onSubmit: (__VLS_ctx.submitSearch) },
    ...{ class: "search-form" },
    role: "search",
});
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    type: "search",
    placeholder: "Search",
    'aria-label': "Search products",
});
(__VLS_ctx.search);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "account-links" },
});
/** @type {__VLS_StyleScopedClasses['account-links']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.url('account')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.togglePanel('cart'));
            // @ts-ignore
            [panel, togglePanel, url, url, submitSearch, search,];
        } },
    'aria-expanded': (__VLS_ctx.panel === 'cart'),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openSearch) },
    ...{ class: "mobile-search" },
    'aria-label': "Search products",
});
/** @type {__VLS_StyleScopedClasses['mobile-search']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.togglePanel('mobile'));
            // @ts-ignore
            [panel, togglePanel, openSearch,];
        } },
    ...{ class: "mobile-toggle" },
    'aria-label': (__VLS_ctx.panel === 'mobile' ? 'Close menu' : 'Open menu'),
    'aria-expanded': (__VLS_ctx.panel === 'mobile'),
});
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
if (__VLS_ctx.panel === 'mobile') {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        size: (32),
        strokeWidth: (1),
    }));
    const __VLS_2 = __VLS_1({
        size: (32),
        strokeWidth: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Menu} */
    Menu;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        size: (32),
        strokeWidth: (1),
    }));
    const __VLS_7 = __VLS_6({
        size: (32),
        strokeWidth: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.togglePanel('cart'));
            // @ts-ignore
            [panel, panel, panel, togglePanel,];
        } },
    ...{ class: "cart-count" },
    'aria-label': "Open cart, 0 items",
});
/** @type {__VLS_StyleScopedClasses['cart-count']} */ ;
if (__VLS_ctx.searchOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.submitSearch) },
        ...{ class: "mobile-search-panel" },
        role: "search",
    });
    /** @type {__VLS_StyleScopedClasses['mobile-search-panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ref: "mobileSearchInput",
        type: "search",
        placeholder: "Search",
        'aria-label': "Search products on mobile",
        required: true,
    });
    (__VLS_ctx.search);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.searchOpen))
                    throw 0;
                return (__VLS_ctx.searchOpen = false);
                // @ts-ignore
                [submitSearch, search, searchOpen, searchOpen,];
            } },
        type: "button",
        'aria-label': "Close search",
    });
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        size: (20),
    }));
    const __VLS_12 = __VLS_11({
        size: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
}
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    name: "drawer",
}));
const __VLS_17 = __VLS_16({
    name: "drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_20 } = __VLS_18.slots;
if (__VLS_ctx.panel && __VLS_ctx.panel !== 'cart') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        id: "navigation-drawer",
        ref: "drawer",
        ...{ class: "shop-drawer" },
        ...{ class: ({ 'info-drawer': __VLS_ctx.panel === 'info', 'mobile-drawer': __VLS_ctx.panel === 'mobile' }) },
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "Navigation",
        tabindex: "-1",
    });
    /** @type {__VLS_StyleScopedClasses['shop-drawer']} */ ;
    /** @type {__VLS_StyleScopedClasses['info-drawer']} */ ;
    /** @type {__VLS_StyleScopedClasses['mobile-drawer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closePanel) },
        ...{ class: "drawer-close" },
        'aria-label': "Close menu",
    });
    /** @type {__VLS_StyleScopedClasses['drawer-close']} */ ;
    let __VLS_21;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        size: (22),
    }));
    const __VLS_23 = __VLS_22({
        size: (22),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "drawer-list" },
        'aria-label': "Categories",
    });
    /** @type {__VLS_StyleScopedClasses['drawer-list']} */ ;
    for (const [[label, path]] of __VLS_vFor((__VLS_ctx.menuLinks))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!(__VLS_ctx.panel && __VLS_ctx.panel !== 'cart'))
                        throw 0;
                    return (__VLS_ctx.hoveredCategory = path);
                    // @ts-ignore
                    [panel, panel, panel, panel, closePanel, menuLinks, hoveredCategory,];
                } },
            ...{ onFocus: (...[$event]) => {
                    if (!(__VLS_ctx.panel && __VLS_ctx.panel !== 'cart'))
                        throw 0;
                    return (__VLS_ctx.hoveredCategory = path);
                    // @ts-ignore
                    [hoveredCategory,];
                } },
            ...{ onMouseleave: (...[$event]) => {
                    if (!(__VLS_ctx.panel && __VLS_ctx.panel !== 'cart'))
                        throw 0;
                    return (__VLS_ctx.hoveredCategory = '');
                    // @ts-ignore
                    [hoveredCategory,];
                } },
            key: (path),
            href: (__VLS_ctx.url(path)),
        });
        (label);
        // @ts-ignore
        [url,];
    }
    if (__VLS_ctx.hoveredCategory && __VLS_ctx.categories.some(c => c[1] === __VLS_ctx.hoveredCategory)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ onError: (...[$event]) => {
                    if (!(__VLS_ctx.panel && __VLS_ctx.panel !== 'cart'))
                        throw 0;
                    if (!(__VLS_ctx.hoveredCategory && __VLS_ctx.categories.some(c => c[1] === __VLS_ctx.hoveredCategory)))
                        throw 0;
                    return (__VLS_ctx.hoveredCategory = '');
                    // @ts-ignore
                    [hoveredCategory, hoveredCategory, hoveredCategory, categories,];
                } },
            ...{ class: "drawer-image" },
            src: (__VLS_ctx.categoryImage),
            alt: "",
        });
        /** @type {__VLS_StyleScopedClasses['drawer-image']} */ ;
    }
}
// @ts-ignore
[categoryImage,];
var __VLS_18;
let __VLS_26;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    name: "drawer",
}));
const __VLS_28 = __VLS_27({
    name: "drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
if (__VLS_ctx.panel === 'cart') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ref: "drawer",
        ...{ class: "cart-drawer" },
        role: "dialog",
        'aria-modal': "true",
        'aria-labelledby': "cart-title",
        tabindex: "-1",
    });
    /** @type {__VLS_StyleScopedClasses['cart-drawer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closePanel) },
        ...{ class: "drawer-close" },
        'aria-label': "Close cart",
    });
    /** @type {__VLS_StyleScopedClasses['drawer-close']} */ ;
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        size: (22),
    }));
    const __VLS_34 = __VLS_33({
        size: (22),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        id: "cart-title",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-cart" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-cart']} */ ;
}
// @ts-ignore
[panel, closePanel,];
var __VLS_29;
if (__VLS_ctx.panel) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closePanel) },
        ...{ class: "scrim" },
        'aria-label': "Close overlay",
        tabindex: "-1",
    });
    /** @type {__VLS_StyleScopedClasses['scrim']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "sale-banner" },
});
/** @type {__VLS_StyleScopedClasses['sale-banner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sale-content" },
});
/** @type {__VLS_StyleScopedClasses['sale-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sale-small" },
});
/** @type {__VLS_StyleScopedClasses['sale-small']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "content-block pair" },
});
/** @type {__VLS_StyleScopedClasses['content-block']} */ ;
/** @type {__VLS_StyleScopedClasses['pair']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.url('bags-totes')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/assets/DM256427.avif",
    alt: "Black canvas Fold Weekender in the MAKR studio",
    fetchpriority: "high",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "caption" },
});
/** @type {__VLS_StyleScopedClasses['caption']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.url('bags-totes')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/assets/MAKR_2620549.avif",
    alt: "Fold Weekender worn over the shoulder",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "caption" },
});
/** @type {__VLS_StyleScopedClasses['caption']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.u, __VLS_intrinsics.u)({});
for (const [block, index] of __VLS_vFor((__VLS_ctx.blocks))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        key: (index),
        ...{ class: "content-block" },
        ...{ class: (block.type) },
        'aria-label': (block.title || block.href),
    });
    /** @type {__VLS_StyleScopedClasses['content-block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "media-grid" },
        tabindex: (block.type === 'triple' ? 0 : undefined),
    });
    /** @type {__VLS_StyleScopedClasses['media-grid']} */ ;
    for (const [image, imageIndex] of __VLS_vFor((block.images))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (image),
            ...{ class: "media-item" },
        });
        /** @type {__VLS_StyleScopedClasses['media-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (__VLS_ctx.url(block.links?.[imageIndex] || block.href)),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (`/assets/${image}`),
            alt: (block.title || block.href.replaceAll('-', ' ')),
            loading: "lazy",
        });
        if (block.type.includes('offset') && imageIndex === (block.type.includes('reverse') ? 0 : 1)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.url(block.href)),
                ...{ class: "caption" },
            });
            /** @type {__VLS_StyleScopedClasses['caption']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (block.title);
            if (block.note) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (block.note);
            }
        }
        // @ts-ignore
        [panel, url, url, url, url, closePanel, blocks,];
    }
    if (!block.type.includes('offset') && block.title) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "caption" },
        });
        /** @type {__VLS_StyleScopedClasses['caption']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (__VLS_ctx.url(block.href)),
        });
        (block.title);
        if (block.comparison) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.url('dopp-kit-black-ballistic-nylon')),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.url('field-pouch-blk')),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.url('pen-pencil-case-black-ballistic')),
            });
        }
        else if (block.note) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.url(block.href)),
            });
            (block.note);
        }
    }
    // @ts-ignore
    [url, url, url, url, url,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "site-footer" },
});
/** @type {__VLS_StyleScopedClasses['site-footer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-instagram" },
});
/** @type {__VLS_StyleScopedClasses['footer-instagram']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://www.instagram.com/makr_/",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/assets/makr_instagram_17886540806479446.jpeg",
    alt: "MAKR studio on Instagram",
    loading: "lazy",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://www.instagram.com/makr_/",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-links" },
});
/** @type {__VLS_StyleScopedClasses['footer-links']} */ ;
for (const [[label, path]] of __VLS_vFor((__VLS_ctx.categories))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        key: (path),
        href: (__VLS_ctx.url(label === 'Objects' ? 'furniture' : path)),
    });
    (label === 'Objects' ? 'Furniture' : label);
    // @ts-ignore
    [url, categories,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-links footer-contact" },
});
/** @type {__VLS_StyleScopedClasses['footer-links']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-contact']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.newsletterOpen = true);
            // @ts-ignore
            [newsletterOpen,];
        } },
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.url('info/help')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.url('info/help')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "mailto:info@makr.com",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "tel:14077450958",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.url('info/about')),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "copyright" },
});
/** @type {__VLS_StyleScopedClasses['copyright']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://studiobirdsall.com/",
});
let __VLS_37;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    name: "newsletter",
}));
const __VLS_39 = __VLS_38({
    name: "newsletter",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const { default: __VLS_42 } = __VLS_40.slots;
if (__VLS_ctx.newsletterOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ class: "newsletter-card" },
        ...{ class: ({ 'with-notice': __VLS_ctx.noticeOpen }) },
        method: "post",
        action: "https://830d934d.sibforms.com/serve/MUIEAAqjI-GBhydlMY5PFJIlVO7TJabI5_43WakX55eJsi9UgJ8q8tSJ4ZVJbtl5BUqLumQ-ruQpQSr4c82AbsU0HADEM_wzXZLmGXtcQAEOYRcuJ8FGCAVo79b9nbmWh23mI08Nwc-_CjiPjevwkOyg-nvIUzfAnSr-f5A0xI8fryP70qOr_zsaWTFi9nLySYiTQ6lhWvLekdyf",
    });
    /** @type {__VLS_StyleScopedClasses['newsletter-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['with-notice']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.dismissNewsletter) },
        type: "button",
        ...{ class: "newsletter-close" },
        'aria-label': "Close newsletter",
    });
    /** @type {__VLS_StyleScopedClasses['newsletter-close']} */ ;
    let __VLS_43;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        size: (16),
        strokeWidth: (1),
    }));
    const __VLS_45 = __VLS_44({
        size: (16),
        strokeWidth: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "newsletter-fields" },
    });
    /** @type {__VLS_StyleScopedClasses['newsletter-fields']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        name: "EMAIL",
        type: "email",
        autocomplete: "email",
        placeholder: "your@email.com",
        'aria-label': "Email address",
        required: true,
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "hidden",
        name: "locale",
        value: "en",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "hidden",
        name: "email_address_check",
        value: "",
    });
}
// @ts-ignore
[url, url, url, newsletterOpen, noticeOpen, dismissNewsletter,];
var __VLS_40;
let __VLS_48;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    name: "newsletter",
}));
const __VLS_50 = __VLS_49({
    name: "newsletter",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
if (__VLS_ctx.noticeOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bottom-notice" },
    });
    /** @type {__VLS_StyleScopedClasses['bottom-notice']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.noticeOpen))
                    throw 0;
                return (__VLS_ctx.newsletterOpen = true);
                // @ts-ignore
                [newsletterOpen, noticeOpen,];
            } },
        ...{ class: "notice-message" },
    });
    /** @type {__VLS_StyleScopedClasses['notice-message']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.dismissNotice) },
        ...{ class: "notice-close" },
        'aria-label': "Dismiss notice",
    });
    /** @type {__VLS_StyleScopedClasses['notice-close']} */ ;
    let __VLS_54;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
        size: (18),
        strokeWidth: (1),
    }));
    const __VLS_56 = __VLS_55({
        size: (18),
        strokeWidth: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
}
// @ts-ignore
[dismissNotice,];
var __VLS_51;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
