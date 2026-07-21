<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const buildAvifSrcSet = (source: string, widths: number[]) =>
  widths.map((width) => `${source.replace(".jpg", `-${width}.avif`)} ${width}w`).join(", ");

const heroSlides = [
  {
    title: ["Nowoczesna aranżacja", "Twojego ogrodu"],
    description: "Marka GiardDesign to wieloletnie doświadczenie i wysoka estetyka realizacji. Oferujemy kompleksowy zakres usług z indywidualnym podejściem do każdego projektu.",
    image: "/images/hero.jpg",
    avifSrcSet: buildAvifSrcSet("/images/hero.jpg", [640, 768, 960, 1333]),
    width: 1333,
    height: 2000,
    alt: "Geometryczne kompozycje zieleni",
  },
  {
    title: ["Projekt dopasowany", "do Twojej przestrzeni"],
    description: "Łączymy funkcjonalność, naturę i współczesną estetykę, aby stworzyć ogród odpowiadający Twoim potrzebom i rytmowi życia.",
    image: "/images/project-6.jpg",
    avifSrcSet: buildAvifSrcSet("/images/project-6.jpg", [480, 960, 1200]),
    width: 1200,
    height: 1800,
    alt: "Ogród przy nowoczesnej willi",
  },
  {
    title: ["Zieleń zaprojektowana", "z myślą o Tobie"],
    description: "Od pierwszej koncepcji po realizację dbamy o każdy detal. Dzięki temu powstają przestrzenie piękne, trwałe i wygodne na co dzień.",
    image: "/images/project-3.jpg",
    avifSrcSet: buildAvifSrcSet("/images/project-3.jpg", [480, 960, 1200]),
    width: 1349,
    height: 1800,
    alt: "Geometryczna kompozycja zieleni",
  },
];

const services = [
  {
    title: "Projekty",
    description: "Zaprojektujemy Twój ogród w nowoczesnym stylu i z najlepszym wykorzystaniem istniejącej przestrzeni.",
    icon: "/icons/project.png",
    action: "Dowiedz się więcej",
    href: "#kontakt",
  },
  {
    title: "Wizualizacje",
    description: "Przedstawimy Ci projekty koncepcyjne w postaci wirtualnego spaceru animowanego w technologii 3D.",
    icon: "/icons/visualization.png",
    action: "Dowiedz się więcej",
    href: "#kontakt",
  },
  {
    title: "Realizacje",
    description: "Zrealizujemy Twoje marzenie przy użyciu najnowszych rozwiązań i zaawansowanych technologii.",
    icon: "/icons/realization.png",
    action: "Zobacz nasze realizacje",
    href: "#realizacje",
  },
];

const galleryImages = [
  { src: "/images/project-1.jpg", alt: "Ogród z nowoczesnym tarasem", shape: "tall", width: 1400, height: 1050 },
  { src: "/images/project-2.jpg", alt: "Nowoczesna rabata ogrodowa", shape: "wide", width: 1400, height: 933 },
  { src: "/images/project-3.jpg", alt: "Geometryczna kompozycja zieleni", shape: "square", width: 1349, height: 1800 },
  { src: "/images/project-4.jpg", alt: "Zielony ogród przy domu", shape: "square", width: 1350, height: 1800 },
  { src: "/images/project-5.jpg", alt: "Ogród widziany z góry", shape: "square", width: 1400, height: 933 },
  { src: "/images/project-6.jpg", alt: "Ogród przy nowoczesnej willi", shape: "tall", width: 1200, height: 1800 },
  { src: "/images/project-7.jpg", alt: "Detal minimalistycznego ogrodu", shape: "wide", width: 1400, height: 933 },
  { src: "/images/project-8.jpg", alt: "Ścieżka pośród zieleni", shape: "tall", width: 1350, height: 1800 },
  { src: "/images/project-9.jpg", alt: "Zaciszny fragment ogrodu", shape: "wide", width: 1400, height: 938 },
].map((image) => ({
  ...image,
  avifSrcSet: buildAvifSrcSet(image.src, [480, 960, 1200]),
}));

const menuOpen = ref(false);
const offerOpen = ref(false);
const searchOpen = ref(false);
const searchQuery = ref("");
const searchInput = ref<HTMLInputElement | null>(null);
const galleryOpen = ref(false);
const galleryGrid = ref<HTMLElement | null>(null);
const lightboxIndex = ref<number | null>(null);
const lightboxDialog = ref<HTMLElement | null>(null);
const lightboxCloseButton = ref<HTMLButtonElement | null>(null);
const activeGalleryImage = computed(() =>
  lightboxIndex.value === null ? null : galleryImages[lightboxIndex.value],
);
const activeHeroIndex = ref(0);
const heroDirection = ref(1);
const activeHeroSlide = computed(() => heroSlides[activeHeroIndex.value]);
let revealObserver: IntersectionObserver | undefined;
let masonryObserver: IntersectionObserver | undefined;
let masonryInstance: { layout?: () => void; destroy?: () => void } | undefined;
let masonryLoading = false;
let previouslyFocusedElement: HTMLElement | null = null;

const closeMenu = () => {
  menuOpen.value = false;
  offerOpen.value = false;
};

const toggleOfferMenu = () => {
  offerOpen.value = !offerOpen.value;
  searchOpen.value = false;
};

const openSearch = async () => {
  searchOpen.value = true;
  offerOpen.value = false;
  await nextTick();
  searchInput.value?.focus();
};

const submitSearch = () => {
  const query = searchQuery.value.toLocaleLowerCase("pl");
  let target = "#oferta";

  if (query.includes("firm") || query.includes("pasj")) target = "#o-firmie";
  if (query.includes("real") || query.includes("galer") || query.includes("ogród")) target = "#realizacje";
  if (query.includes("kontakt") || query.includes("telefon") || query.includes("mail")) target = "#kontakt";

  document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  searchOpen.value = false;
  menuOpen.value = false;
};

const changeHeroSlide = (step: number) => {
  heroDirection.value = step;
  activeHeroIndex.value = (activeHeroIndex.value + step + heroSlides.length) % heroSlides.length;
};

const openLightbox = async (index: number) => {
  previouslyFocusedElement = document.activeElement as HTMLElement | null;
  lightboxIndex.value = index;
  await nextTick();
  lightboxCloseButton.value?.focus();
};

const closeLightbox = () => {
  lightboxIndex.value = null;
  nextTick(() => previouslyFocusedElement?.focus());
};

const changeLightboxImage = (step: number) => {
  if (lightboxIndex.value === null) return;
  lightboxIndex.value = (lightboxIndex.value + step + galleryImages.length) % galleryImages.length;
};

const handleGlobalKeys = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    if (lightboxIndex.value !== null) closeLightbox();
    offerOpen.value = false;
    searchOpen.value = false;
  }

  if (lightboxIndex.value !== null && event.key === "ArrowLeft") changeLightboxImage(-1);
  if (lightboxIndex.value !== null && event.key === "ArrowRight") changeLightboxImage(1);

  if (lightboxIndex.value !== null && event.key === "Tab" && lightboxDialog.value) {
    const controls = Array.from(lightboxDialog.value.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])"));
    const first = controls[0];
    const last = controls.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
};

const handleOutsideNavigation = (event: PointerEvent) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target;
  if (!target.closest(".nav-offer")) offerOpen.value = false;
  if (!target.closest(".nav-search")) searchOpen.value = false;
};

const initializeMasonry = async () => {
  if (!galleryGrid.value || masonryInstance || masonryLoading) return;
  masonryLoading = true;

  try {
    const { default: Masonry } = await import("masonry-layout");
    const grid = galleryGrid.value;
    if (!grid) return;

    masonryInstance = new Masonry(grid, {
      itemSelector: ".gallery-shot",
      columnWidth: ".gallery-sizer",
      gutter: ".gallery-gutter",
      percentPosition: true,
      horizontalOrder: true,
      transitionDuration: "420ms",
    });

    grid.querySelectorAll("img").forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", () => masonryInstance?.layout?.(), { once: true });
      }
    });

    masonryObserver?.disconnect();
  } catch {
    masonryInstance = undefined;
  } finally {
    masonryLoading = false;
  }
};

watch(lightboxIndex, (index) => {
  document.body.style.overflow = index === null ? "" : "hidden";
});

watch(galleryOpen, async () => {
  await nextTick();
  window.requestAnimationFrame(() => masonryInstance?.layout?.());
});

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeys);
  document.addEventListener("pointerdown", handleOutsideNavigation);

  if (galleryGrid.value) {
    masonryObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) initializeMasonry();
      },
      { rootMargin: "1200px 0px" },
    );
    masonryObserver.observe(galleryGrid.value);
  }

  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  nodes.forEach((node) => revealObserver?.observe(node));
});

onBeforeUnmount(() => {
  revealObserver?.disconnect();
  masonryObserver?.disconnect();
  masonryInstance?.destroy?.();
  masonryInstance = undefined;
  window.removeEventListener("keydown", handleGlobalKeys);
  document.removeEventListener("pointerdown", handleOutsideNavigation);
  document.body.style.overflow = "";
});
</script>

<template>
  <a class="skip-link" href="#main-content">Przejdź do głównej treści</a>
  <header class="site-header">
      <nav class="site-container nav-inner" aria-label="Główna nawigacja">
        <a href="#start" aria-label="GiardDesign — strona główna" @click="closeMenu">
          <img class="brand-logo" src="/logo.svg" alt="GiardDesign" width="115" height="19" />
        </a>

        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="main-menu"
          :aria-label="menuOpen ? 'Zamknij menu' : 'Otwórz menu'"
          @click="menuOpen = !menuOpen"
        >
          <span />
          <span />
        </button>

        <div id="main-menu" class="nav-links" :class="{ 'nav-links-open': menuOpen }">
          <div class="nav-offer">
            <button
              class="nav-offer-toggle"
              type="button"
              :aria-expanded="offerOpen"
              aria-controls="offer-menu"
              @click="toggleOfferMenu"
            >
              Oferta <span aria-hidden="true">⌄</span>
            </button>
            <Transition name="nav-pop">
              <div v-if="offerOpen" id="offer-menu" class="offer-dropdown">
                <a href="#oferta" @click="closeMenu">Projekty</a>
                <a href="#oferta" @click="closeMenu">Wizualizacje 3D</a>
                <a href="#realizacje" @click="closeMenu">Realizacje</a>
              </div>
            </Transition>
          </div>
          <a href="#o-firmie" @click="closeMenu">O firmie</a>
          <a href="#realizacje" @click="closeMenu">Realizacje</a>
          <a href="#kontakt" @click="closeMenu">Kontakt</a>
          <form class="nav-search" :class="{ 'nav-search-open': searchOpen }" role="search" @submit.prevent="submitSearch">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="search"
              placeholder="Czego szukasz?"
              aria-label="Szukaj na stronie"
              :tabindex="searchOpen ? 0 : -1"
            />
            <button
              type="button"
              :aria-label="searchOpen ? 'Wyszukaj' : 'Otwórz wyszukiwarkę'"
              :aria-expanded="searchOpen"
              @click="searchOpen ? submitSearch() : openSearch()"
            >
              <span class="search-icon" aria-hidden="true" />
            </button>
          </form>
        </div>
      </nav>
  </header>

  <main id="main-content" class="min-h-screen overflow-hidden bg-white text-[#111]">

    <section id="start" class="hero-section scroll-mt-20">
      <Transition :name="heroDirection > 0 ? 'hero-next' : 'hero-prev'" mode="out-in">
        <div :key="activeHeroIndex" class="hero-grid">
          <div class="hero-copy">
            <h1>
              <span v-for="line in activeHeroSlide.title" :key="line">{{ line }}</span>
            </h1>
            <p>{{ activeHeroSlide.description }}</p>
            <div class="hero-actions">
              <a class="arrow-link" href="#kontakt">
                <span>Skontaktuj się z nami</span><span class="arrow-link-icon" aria-hidden="true">→</span>
              </a>
              <a class="arrow-link arrow-link-light" href="#realizacje">
                <span>Zobacz nasze realizacje</span><span class="arrow-link-icon" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div class="hero-photo-wrap">
            <picture>
              <source
                type="image/avif"
                :srcset="activeHeroSlide.avifSrcSet"
                sizes="(max-width: 820px) 100vw, 48vw"
              />
              <img
                class="hero-photo"
                :src="activeHeroSlide.image"
                :alt="activeHeroSlide.alt"
                :width="activeHeroSlide.width"
                :height="activeHeroSlide.height"
                :fetchpriority="activeHeroIndex === 0 ? 'high' : 'auto'"
                decoding="async"
              />
            </picture>
            <div class="hero-controls" aria-label="Sterowanie slajderem">
              <button type="button" aria-label="Poprzedni slajd" @click="changeHeroSlide(-1)">←</button>
              <button type="button" aria-label="Następny slajd" @click="changeHeroSlide(1)">→</button>
            </div>
            <p class="hero-slide-count" aria-live="polite">0{{ activeHeroIndex + 1 }} / 0{{ heroSlides.length }}</p>
          </div>
        </div>
      </Transition>
    </section>

    <section id="oferta" class="offer-section scroll-mt-20">
      <div class="content-container">
        <div class="section-intro" data-reveal>
          <span class="eyebrow">Oferta</span>
          <h2>Działamy <em>kompleksowo</em></h2>
          <p>
            Oferujemy kompletną obsługę inwestycji terenów zielonych. Projektujemy nowoczesne
            ogrody przydomowe oraz rezydencjonalne. Stworzymy dla Ciebie projekt, zwizualizujemy
            go i wcielimy w życie, a na każdym etapie posłużymy radą i wieloletnim doświadczeniem.
          </p>
        </div>

        <div class="service-grid">
          <a
            v-for="(service, index) in services"
            :key="service.title"
            class="service-card"
            :href="service.href"
            :aria-label="`${service.title}: ${service.action}`"
            data-reveal
            :style="{ '--delay': `${index * 90}ms` }"
          >
            <div>
              <img class="service-icon" :src="service.icon" alt="" width="48" height="48" loading="lazy" decoding="async" aria-hidden="true" />
              <h3>{{ service.title }}</h3>
              <p>{{ service.description }}</p>
            </div>
            <span class="service-action">{{ service.action }}<span aria-hidden="true"> →</span></span>
          </a>
        </div>
      </div>
    </section>

    <section id="o-firmie" class="about-section scroll-mt-20">
      <div class="site-container about-grid">
        <div class="about-photo-wrap" data-reveal>
          <picture>
            <source
              type="image/avif"
              srcset="/images/about-640.avif 640w, /images/about-960.avif 960w, /images/about-1440.avif 1440w"
              sizes="(max-width: 820px) 100vw, 48vw"
            />
            <img src="/images/about.jpg" alt="Ogród przy tradycyjnym domu" width="1800" height="1200" loading="lazy" decoding="async" />
          </picture>
        </div>
        <div class="about-copy" data-reveal>
          <span class="eyebrow eyebrow-light">O firmie</span>
          <h2>Tworzymy<br /><em>z pasją</em></h2>
          <p>
            Każdy projekt to nowe wyzwanie. Dlatego nasz zespół tworzą wykwalifikowani projektanci
            oraz architekci, których zadaniem jest rozpoznanie i realizacja potrzeb każdego Klienta.
            Nasza specjalizacja to przestrzenie nowoczesne, które charakteryzuje minimalizm,
            geometria i elegancka prostota. Tworzymy ogrody małoobsługowe, dostosowane do
            współczesnego trybu życia.
          </p>
          <a class="arrow-link arrow-link-light" href="#kontakt">
            <span>Poznaj nas bliżej</span><span class="arrow-link-icon" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>

    <section id="realizacje" class="projects-section scroll-mt-20">
      <div class="content-container projects-heading" data-reveal>
        <span class="eyebrow">Realizacje</span>
        <h2>Nasze <em>projekty</em></h2>
      </div>

      <div class="gallery-wrap" :class="{ 'gallery-open': galleryOpen }">
        <div id="project-gallery" ref="galleryGrid" class="gallery-grid">
          <div class="gallery-sizer" aria-hidden="true" />
          <div class="gallery-gutter" aria-hidden="true" />
          <figure
            v-for="(image, imageIndex) in galleryImages"
            :key="image.src"
            class="gallery-shot"
            :class="`gallery-${image.shape}`"
            data-reveal
            :style="{ '--delay': `${imageIndex * 55}ms` }"
          >
            <button
              class="gallery-image-button"
              type="button"
              :aria-label="`Otwórz zdjęcie: ${image.alt}`"
              @click="openLightbox(imageIndex)"
            >
              <picture>
                <source
                  type="image/avif"
                  :srcset="image.avifSrcSet"
                  sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 820px) calc((100vw - 60px) / 2), calc((100vw - 84px) / 3)"
                />
                <img :src="image.src" :alt="image.alt" :width="image.width" :height="image.height" loading="lazy" decoding="async" />
              </picture>
              <span class="gallery-image-hint" aria-hidden="true">Zobacz</span>
            </button>
          </figure>
        </div>
        <div class="gallery-fade" aria-hidden="true" />
        <button
          class="gallery-toggle"
          type="button"
          aria-controls="project-gallery"
          :aria-expanded="galleryOpen"
          @click="galleryOpen = !galleryOpen"
        >
          {{ galleryOpen ? "Zwiń" : "Rozwiń" }}<span aria-hidden="true">{{ galleryOpen ? " ↑" : " ↓" }}</span>
        </button>
      </div>
    </section>

    <section class="social-section">
      <div class="content-container">
        <div class="social-card" data-reveal>
          <h2>Zostańmy w kontakcie!<br />Znajdziesz nas na <em>Instagramie.</em></h2>
          <div>
            <p>Śledź nasze najnowsze realizacje!</p>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
    </section>

    <footer id="kontakt" class="site-footer scroll-mt-20">
      <div class="content-container">
        <div class="footer-cta">
          <img src="/logo-light.svg" alt="GiardDesign" width="115" height="19" loading="lazy" decoding="async" />
          <div>
            <p>Daj znać, co możemy dla Ciebie zrobić!</p>
            <a class="arrow-link" href="mailto:giarddesign@kontakt.pl">
              <span>Skontaktuj się z nami</span><span class="arrow-link-icon" aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div class="footer-links">
          <nav aria-label="Linki w stopce">
            <a href="#kontakt">Kontakt</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
          <div>
            <a href="tel:000000000">000-000-000</a>
            <a href="mailto:giarddesign@kontakt.pl">giarddesign@kontakt.pl</a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>Prawa zastrzeżone © 2026</p>
          <p>Projekt powstał w procesie rekrutacyjnym dla agencji <a href="https://adrespect.pl/" target="_blank" rel="noopener noreferrer">adRespect.pl</a></p>
        </div>
      </div>
    </footer>
  </main>

  <Transition name="lightbox">
      <div
        v-if="activeGalleryImage"
        ref="lightboxDialog"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Galeria realizacji"
        @click.self="closeLightbox"
      >
        <button ref="lightboxCloseButton" class="lightbox-close" type="button" aria-label="Zamknij galerię" @click="closeLightbox">×</button>
        <button class="lightbox-nav lightbox-prev" type="button" aria-label="Poprzednie zdjęcie" @click="changeLightboxImage(-1)">←</button>
        <figure class="lightbox-content">
          <picture>
            <source type="image/avif" :srcset="activeGalleryImage.avifSrcSet" sizes="100vw" />
            <img
              :src="activeGalleryImage.src"
              :alt="activeGalleryImage.alt"
              :width="activeGalleryImage.width"
              :height="activeGalleryImage.height"
              decoding="async"
            />
          </picture>
          <figcaption>{{ activeGalleryImage.alt }}</figcaption>
        </figure>
        <button class="lightbox-nav lightbox-next" type="button" aria-label="Następne zdjęcie" @click="changeLightboxImage(1)">→</button>
        <p class="lightbox-count" aria-live="polite">{{ (lightboxIndex ?? 0) + 1 }} / {{ galleryImages.length }}</p>
      </div>
  </Transition>
</template>
