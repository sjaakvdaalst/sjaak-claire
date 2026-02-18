// ==========================================
// NAVIGATION MENU
// ==========================================

const menuToggle = document.querySelector('.menu-toggle');
const navMenu    = document.querySelector('.nav-menu');
const navClose   = document.querySelector('.nav-close');
const navLinks   = document.querySelectorAll('.nav-link');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navClose.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// ==========================================
// SMOOTH SCROLL
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetPosition =
                target.getBoundingClientRect().top + window.pageYOffset - 60;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

// ==========================================
// LOADING STATE — body fades in on load
// ==========================================

document.body.style.opacity = '0';
window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity    = '1';
});

// ==========================================
// PRELOAD CRITICAL IMAGES
// ==========================================

['img/snow-h-3.JPG', 'img/logo-gold.PNG', 'img/snow-h-1.JPG'].forEach(src => {
    const img = new Image();
    img.src = src;
});

// ==========================================
// HERO — clarify animation on load (once)
// ==========================================

function clarifyText(element, startDelay = 0) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';

    const letters = text.split('').map(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className   = 'letter';
        element.appendChild(span);
        return span;
    });

    const center = letters.length / 2;

    letters.forEach((letter, i) => {
        const distanceFromCenter = Math.abs(i - center);
        const jitter = Math.random() * 30;
        const delay  = startDelay + distanceFromCenter * 70 + jitter;
        setTimeout(() => {
            letter.style.opacity   = '1';
            letter.style.filter    = 'blur(0px)';
            letter.style.transform = 'translateX(0px)';
        }, delay);
    });
}

window.addEventListener('load', () => {
    const name1     = document.getElementById('name1');
    const ampersand = document.getElementById('ampersand');
    const name2     = document.getElementById('name2');

    if (name1)     clarifyText(name1, 500);
    if (ampersand) setTimeout(() => ampersand.classList.add('active'), 1500);
    if (name2)     clarifyText(name2, 2000);
});

// ==========================================
// LOGO ROTATION ON SCROLL
// ==========================================

let lastScrollY = window.scrollY;
let rotation    = 0;
const logoImage = document.querySelector('.logo-image');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    rotation += (currentScrollY - lastScrollY) * 0.15;
    if (logoImage) logoImage.style.transform = `rotate(${rotation}deg)`;
    lastScrollY = currentScrollY;
}, { passive: true });

// ==========================================
// VIDEO LAZY LOADING (play/pause with viewport)
// ==========================================

const storyVideo = document.querySelector('.story-video');
if (storyVideo) {
    // Attempt to play; catch rejection (Safari/iOS autoplay policy)
    function tryPlay() {
        const promise = storyVideo.play();
        if (promise !== undefined) {
            promise.catch(() => {
                // Autoplay was prevented — wait for a user gesture then retry
                const resumeOnInteraction = () => {
                    storyVideo.play().catch(() => {});
                };
                document.addEventListener('touchstart', resumeOnInteraction, { once: true });
                document.addEventListener('click', resumeOnInteraction, { once: true });
            });
        }
    }

    new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) {
                tryPlay();
            } else {
                storyVideo.pause();
            }
        }),
        { threshold: 0.3 }
    ).observe(storyVideo);
}

// ==========================================
// PARALLAX — hero background on scroll
// ==========================================

const heroBackground = document.querySelector('.hero-background');
window.addEventListener('scroll', () => {
    if (heroBackground) {
        // Parallax only; zoom animation is handled by CSS @keyframes
        heroBackground.style.transform = `translateY(${window.pageYOffset * 0.4}px) scale(1)`;
    }
}, { passive: true });

// ==========================================
// SCROLL ANIMATION SYSTEM
// Bidirectional: adds .sa-visible on enter,
// removes .sa-visible on leave — every time.
// ==========================================

function setupScrollAnimations() {
    // Observer factory: threshold + optional rootMargin
    function makeObserver(threshold = 0.2, rootMargin = '0px') {
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('sa-visible');
                } else {
                    entry.target.classList.remove('sa-visible');
                }
            });
        }, { threshold, rootMargin });
    }

    const obs = makeObserver(0.2);

    // Helper: apply class and observe
    function watch(selector, extraClass = '', delay = '') {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('sa-up');
            if (extraClass) el.classList.add(extraClass);
            if (delay)      el.classList.add(delay);
            obs.observe(el);
        });
    }

    function watchLeft(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('sa-left');
            obs.observe(el);
        });
    }

    // ------------------------------------------
    // WELCOME section
    // ------------------------------------------
    watch('.welcome-text');
    watch('.welcome .cross-symbol');

    // ------------------------------------------
    // OUR STORY section — staggered paragraphs
    // ------------------------------------------
    watch('.story-heading');

    const storyTexts = document.querySelectorAll('.story-text');
    storyTexts.forEach((el, i) => {
        el.classList.add('sa-up');
        const delays = ['sa-delay-1', 'sa-delay-2', 'sa-delay-3', 'sa-delay-4'];
        if (delays[i]) el.classList.add(delays[i]);
        obs.observe(el);
    });

    watch('.story-content .cross-symbol');

    // ------------------------------------------
    // MOMENTS section
    // ------------------------------------------
    watch('.moments-heading');
    watchLeft('.gallery-scroll');     // slides in from left

    // ------------------------------------------
    // EVENT sections (Nuptial Mass + Reception)
    // ------------------------------------------
    watch('.event-info');
    watch('.event-map', '', 'sa-delay-2');

    // ------------------------------------------
    // FAQ section (pattern strip is static; no SA)
    // ------------------------------------------
    watch('.faq-heading');
    watch('.faq-icon',      '', 'sa-delay-1');
    watch('.faq-container', '', 'sa-delay-2');

    // ------------------------------------------
    // REGISTRY section
    // ------------------------------------------
    watchLeft('.registry-image');      // slides in from left
    watch('.registry-text');

    // ------------------------------------------
    // RSVP section
    // ------------------------------------------
    watch('.rsvp-form-wrapper');

    // ------------------------------------------
    // Intermission quote-divider (fades in once visible)
    // Managed separately via the scroll handler below
    // ------------------------------------------
    const quoteDivider = document.querySelector('.quote-divider');
    if (quoteDivider) {
        makeObserver(0.4).observe(quoteDivider);
    }
}

// ==========================================
// INTERMISSION — IO-driven clarify animation
// Enter: 0.5s delay → clarify letters center-out over ~2s
//        background zooms out over 2.5s (low movement)
// Leave: letters + divider fade out quickly
//        background snaps back to scale(1.06) with no animation
// ==========================================

function setupIntermission() {
    const intermission = document.querySelector('.intermission');
    const bg           = document.querySelector('.intermission-bg');
    const quote        = document.getElementById('intermission-quote');
    if (!intermission || !quote || !bg) return;

    // --- Build letter spans, set initial (hidden, offset) state ---
    const text = quote.textContent;
    quote.textContent = '';
    quote.style.opacity = '1';

    const letters = text.split('').map(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className   = 'letter';
        quote.appendChild(span);
        return span;
    });

    const center = letters.length / 2;

    // Position letters at their outward offset immediately (no transition)
    function resetLetters() {
        letters.forEach((letter, i) => {
            const dist       = Math.abs(i - center);
            const normalized = dist / (center || 1);
            const direction  = i < center ? -1 : 1;
            letter.style.transition = 'none';
            letter.style.opacity    = '0';
            letter.style.filter     = 'blur(8px)';
            letter.style.transform  = `translateX(${60 * normalized * direction}px)`;
        });
    }

    resetLetters();

    // --- Add gold divider ---
    const divider = document.createElement('span');
    divider.className      = 'quote-divider';
    divider.style.opacity  = '0';
    divider.style.transition = 'none';
    quote.parentNode.appendChild(divider);

    let enterTimer = null;
    let leaveTimer = null;

    // --- ENTER: clarify in, center-out, over ~2s, with 0.5s initial delay ---
    function clarifyIn() {
        clearTimeout(enterTimer);
        clearTimeout(leaveTimer);

        // Background: enable transition and zoom out (low movement: 1.06→1)
        bg.style.transition = 'transform 2.5s ease-out';
        bg.style.transform  = 'scale(1)';

        enterTimer = setTimeout(() => {
            letters.forEach((letter, i) => {
                const dist  = Math.abs(i - center);
                // Each letter starts its 0.6s transition staggered from center
                const delay = dist * 75; // ~75ms per step outward
                setTimeout(() => {
                    letter.style.transition = 'opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease';
                    letter.style.opacity    = '1';
                    letter.style.filter     = 'blur(0px)';
                    letter.style.transform  = 'translateX(0)';
                }, delay);
            });

            // Divider fades in shortly after the first letters appear
            setTimeout(() => {
                divider.style.transition = 'opacity 0.7s ease';
                divider.style.opacity    = '0.7';
            }, 350);
        }, 500); // 0.5s initial delay
    }

    // --- LEAVE: simple fade out; background snaps back instantly (no zoom-in) ---
    function fadeOut() {
        clearTimeout(enterTimer);
        clearTimeout(leaveTimer);

        // Fade letters
        letters.forEach(letter => {
            letter.style.transition = 'opacity 0.35s ease';
            letter.style.opacity    = '0';
        });
        divider.style.transition = 'opacity 0.35s ease';
        divider.style.opacity    = '0';

        // After fade, reset positions so next enter re-clarifies from scratch
        leaveTimer = setTimeout(() => {
            resetLetters();
            // Snap bg back to zoomed-in state with NO transition
            bg.style.transition = 'none';
            bg.style.transform  = 'scale(1.06)';
        }, 380);
    }

    // --- IntersectionObserver ---
    new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                clarifyIn();
            } else {
                fadeOut();
            }
        });
    }, { threshold: 0.15 }).observe(intermission);
}

// ==========================================
// LANGUAGE / i18n SYSTEM
// ==========================================

const translations = {
    en: {
        'nav-story':            'Our Story',
        'nav-mass':             'Nuptial Mass',
        'nav-registry':         'Registry',
        'nav-rsvp':             'RSVP',

        'welcome-heading':      'Welcome!',
        'welcome-p1':           'Claire and Sjaak joyfully invite you to share in the celebration of their union in the Sacrament of Holy Matrimony.',
        'welcome-p2':           'Below, you will find all details about the ceremony, reception, and more. We\'re grateful for your presence as we embark on this great lifelong adventure together.',

        'story-heading':        'A Peek Into Our Story',
        'story-p1':             'Our journey began in Germany in 2021 when Claire studied abroad at Sjaak\'s high school in Eschweiler. We were classmates, seatmates, and soon — inseparable friends.',
        'story-p2':             'What started as shared laughter in religion class grew into a friendship rooted in faith, discovery, and wonder. We spent weekends hiking, going to Mass together, and sharing long conversations over coffee.',
        'story-p3':             'Through time, letters, and thousands of miles, our story has unfolded beautifully — guided by God\'s providence and deepened through the love of family, adventure, and prayer.',

        'moments-heading':      'Moments Through the Years',
        'gallery-1-caption':    'Our first date in Cologne.',
        'gallery-2-caption':    'Sjaak\'s first time ever in the US.',
        'gallery-3-caption':    'Celebrating the 4th of July.',
        'gallery-4-caption':    'Our "Abiprom", celebrating Sjaak\'s Abitur and Claire\'s high school graduation.',
        'gallery-5-caption':    'Our families meeting up for the first time.',
        'gallery-6-caption':    '007.',
        'gallery-7-caption':    'Visiting Seattle around Christmas time.',
        'gallery-8-caption':    'Sjaak proposes to Claire and hands her his hand-carved wooden clogs.',

        'mass-heading':         'Nuptial Mass',
        'mass-note':            'Please arrive 15 minutes early. There\'s a parking lot next to the church.',

        'reception-heading':    'Reception',
        'reception-menu-link':  'Link to menu.',

        'faq-heading':          'Commonly Asked Questions',
        'faq-q1':               'Is there a dress code?',
        'faq-a1':               'For the Church, please dress modestly (e.g., covered shoulders).',
        'faq-q2':               'Are children welcome?',
        'faq-a2':               'Yes! Make sure to mention it in the RSVP if applicable.',
        'faq-q3':               'Where should we stay?',
        'faq-a3':               'As there are not many options in the Mt Angel/Silverton area, Salem has some options.',

        'registry-heading':     'Your presence is truly the best gift we could ask for.',
        'registry-message':     'But if you feel called to give a little something, we\'ve put together a small registry.\nClick the link below to reach the gift registry.',
        'registry-link':        'Visit our gift registry',

        'rsvp-heading':         'Please RSVP by June 1st, 2026',
        'rsvp-label-name':      'Full Name',
        'rsvp-label-email':     'Email Address',
        'rsvp-label-attending': 'Will you be attending?',
        'rsvp-opt-select':      'Please select',
        'rsvp-opt-yes':         'Yes',
        'rsvp-opt-no':          'No',
        'rsvp-label-guests':    'Number of guests',
        'rsvp-label-message':   'Message for the couple',
        'rsvp-submit':          'Send RSVP',
        'rsvp-alert':           'Thank you for your RSVP! We look forward to celebrating with you.',

        'footer':               '© 2026 Claire & Sjaak. All rights reserved.',
    },

    nl: {
        'nav-story':            'Ons Verhaal',
        'nav-mass':             'Huwelijksmis',
        'nav-registry':         'Verlanglijst',
        'nav-rsvp':             'RSVP',

        'welcome-heading':      'Welkom!',
        'welcome-p1':           'Claire en Sjaak nodigen u met vreugde uit om deel te nemen aan de viering van hun verbintenis in het Sacrament van het Heilig Huwelijk.',
        'welcome-p2':           'Hieronder vindt u alle details over de ceremonie, de receptie en meer. Wij zijn dankbaar voor uw aanwezigheid terwijl wij samen aan dit grote, levenslange avontuur beginnen.',

        'story-heading':        'Een Blik op Ons Verhaal',
        'story-p1':             'Ons verhaal begon in Duitsland in 2021, toen Claire een uitwisselingsjaar deed op Sjaaks middelbare school in Eschweiler. We waren klasgenoten, zaten naast elkaar en werden al snel — onafscheidelijke vrienden.',
        'story-p2':             'Wat begon met gedeeld gelach in de godsdienstles groeide uit tot een vriendschap geworteld in geloof, ontdekking en verwondering. We brachten weekenden door met wandelen, samen naar de mis gaan en lange gesprekken over koffie.',
        'story-p3':             'Door de tijd, brieven en duizenden kilometers heeft ons verhaal zich prachtig ontvouwd — geleid door Gods voorzienigheid en verdiept door de liefde van familie, avontuur en gebed.',

        'moments-heading':      'Momenten door de Jaren',
        'gallery-1-caption':    'Ons eerste afspraakje in Keulen.',
        'gallery-2-caption':    'Sjaaks allereerste bezoek aan de VS.',
        'gallery-3-caption':    'De viering van 4 juli.',
        'gallery-4-caption':    'Ons "Abiprom", ter viering van Sjaaks Abitur en Claire\'s eindexamen.',
        'gallery-5-caption':    'Onze families ontmoeten elkaar voor het eerst.',
        'gallery-6-caption':    '007.',
        'gallery-7-caption':    'Seattle bezoeken rond Kerstmis.',
        'gallery-8-caption':    'Sjaak vraagt Claire ten huwelijk en overhandigt haar zijn handgesneden houten klompen.',

        'mass-heading':         'Huwelijksmis',
        'mass-note':            'Gelieve 15 minuten vroeg te komen. Er is een parkeerplaats naast de kerk.',

        'reception-heading':    'Receptie',
        'reception-menu-link':  'Link naar het menu.',

        'faq-heading':          'Veelgestelde Vragen',
        'faq-q1':               'Is er een kledingvoorschrift?',
        'faq-a1':               'Kleed u voor de kerk bescheiden (bijv. bedekte schouders).',
        'faq-q2':               'Zijn kinderen welkom?',
        'faq-a2':               'Ja! Vermeld dit in uw RSVP indien van toepassing.',
        'faq-q3':               'Waar kunnen we verblijven?',
        'faq-a3':               'Er zijn niet veel opties in het Mt Angel/Silverton-gebied, maar Salem heeft enkele mogelijkheden.',

        'registry-heading':     'Uw aanwezigheid is werkelijk het mooiste cadeau dat wij ons kunnen wensen.',
        'registry-message':     'Maar als u toch iets wilt geven, hebben wij een kleine verlanglijst samengesteld.\nKlik op onderstaande link om de verlanglijst te bezoeken.',
        'registry-link':        'Bezoek onze verlanglijst',

        'rsvp-heading':         'Meld u aan vóór 1 juni 2026',
        'rsvp-label-name':      'Volledige naam',
        'rsvp-label-email':     'E-mailadres',
        'rsvp-label-attending': 'Bent u aanwezig?',
        'rsvp-opt-select':      'Maak een keuze',
        'rsvp-opt-yes':         'Ja',
        'rsvp-opt-no':          'Nee',
        'rsvp-label-guests':    'Aantal gasten',
        'rsvp-label-message':   'Bericht voor het bruidspaar',
        'rsvp-submit':          'Aanmelding verzenden',
        'rsvp-alert':           'Bedankt voor uw aanmelding! We kijken ernaar uit om met u te vieren.',

        'footer':               '© 2026 Claire & Sjaak. Alle rechten voorbehouden.',
    },

    de: {
        'nav-story':            'Unsere Geschichte',
        'nav-mass':             'Trauungsmesse',
        'nav-registry':         'Wunschliste',
        'nav-rsvp':             'RSVP',

        'welcome-heading':      'Willkommen!',
        'welcome-p1':           'Claire und Sjaak laden Sie herzlich ein, an der Feier ihrer Verbindung im Sakrament der Heiligen Ehe teilzunehmen.',
        'welcome-p2':           'Nachfolgend finden Sie alle Details zur Zeremonie, zum Empfang und mehr. Wir sind dankbar für Ihre Anwesenheit, wenn wir gemeinsam dieses große lebenslange Abenteuer beginnen.',

        'story-heading':        'Ein Blick auf unsere Geschichte',
        'story-p1':             'Unsere Geschichte begann 2021 in Deutschland, als Claire ein Auslandsjahr an Sjaaks Gymnasium in Eschweiler verbrachte. Wir waren Klassenkameraden, saßen nebeneinander und wurden bald — unzertrennliche Freunde.',
        'story-p2':             'Was mit gemeinsamem Lachen im Religionsunterricht begann, wuchs zu einer im Glauben, in der Entdeckung und im Staunen verwurzelten Freundschaft. Wir verbrachten Wochenenden beim Wandern, gemeinsamen Messebesuchen und langen Gesprächen bei Kaffee.',
        'story-p3':             'Durch Zeit, Briefe und Tausende von Kilometern hat sich unsere Geschichte wunderschön entfaltet — geleitet von Gottes Vorsehung und vertieft durch die Liebe zu Familie, Abenteuer und Gebet.',

        'moments-heading':      'Momente durch die Jahre',
        'gallery-1-caption':    'Unser erstes Date in Köln.',
        'gallery-2-caption':    'Sjaaks erstes Mal in den USA.',
        'gallery-3-caption':    'Feier zum 4. Juli.',
        'gallery-4-caption':    'Unser "Abiprom" – zur Feier von Sjaaks Abitur und Claires High-School-Abschluss.',
        'gallery-5-caption':    'Unsere Familien treffen sich zum ersten Mal.',
        'gallery-6-caption':    '007.',
        'gallery-7-caption':    'Seattle zur Weihnachtszeit.',
        'gallery-8-caption':    'Sjaak macht Claire einen Heiratsantrag und überreicht ihr seine handgeschnitzten Holzschuhe.',

        'mass-heading':         'Trauungsmesse',
        'mass-note':            'Bitte kommen Sie 15 Minuten früher. Es gibt einen Parkplatz neben der Kirche.',

        'reception-heading':    'Empfang',
        'reception-menu-link':  'Link zur Speisekarte.',

        'faq-heading':          'Häufig gestellte Fragen',
        'faq-q1':               'Gibt es einen Dresscode?',
        'faq-a1':               'Bitte kleiden Sie sich für die Kirche dezent (z.B. bedeckte Schultern).',
        'faq-q2':               'Sind Kinder willkommen?',
        'faq-a2':               'Ja! Bitte erwähnen Sie es in der RSVP, falls zutreffend.',
        'faq-q3':               'Wo können wir übernachten?',
        'faq-a3':               'Da es in der Gegend um Mt Angel/Silverton wenige Möglichkeiten gibt, bietet Salem einige Optionen.',

        'registry-heading':     'Ihre Anwesenheit ist wirklich das schönste Geschenk, das wir uns wünschen können.',
        'registry-message':     'Aber wenn Sie dennoch etwas schenken möchten, haben wir eine kleine Wunschliste zusammengestellt.\nKlicken Sie auf den Link unten, um die Wunschliste zu besuchen.',
        'registry-link':        'Unsere Wunschliste besuchen',

        'rsvp-heading':         'Bitte melden Sie sich bis zum 1. Juni 2026 an',
        'rsvp-label-name':      'Vollständiger Name',
        'rsvp-label-email':     'E-Mail-Adresse',
        'rsvp-label-attending': 'Werden Sie teilnehmen?',
        'rsvp-opt-select':      'Bitte auswählen',
        'rsvp-opt-yes':         'Ja',
        'rsvp-opt-no':          'Nein',
        'rsvp-label-guests':    'Anzahl der Gäste',
        'rsvp-label-message':   'Nachricht an das Brautpaar',
        'rsvp-submit':          'Anmeldung absenden',
        'rsvp-alert':           'Vielen Dank für Ihre Anmeldung! Wir freuen uns darauf, mit Ihnen zu feiern.',

        'footer':               '© 2026 Claire & Sjaak. Alle Rechte vorbehalten.',
    }
};

let currentLang = localStorage.getItem('weddingLang') || 'en';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('weddingLang', lang);
    document.documentElement.lang = lang;

    // Update all [data-i18n] text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key  = el.getAttribute('data-i18n');
        const text = translations[lang][key];
        if (text === undefined) return;

        // Registry message uses \n as a soft line break
        if (key === 'registry-message') {
            el.innerHTML = text.replace(/\n/g, '<br>');
        } else if (key === 'footer') {
            // Footer uses a copyright symbol that needs to stay as HTML entity
            el.innerHTML = text.replace('©', '&copy;');
        } else {
            el.textContent = text;
        }
    });

    // Update lang button active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('lang-active', btn.dataset.lang === lang);
    });
}

function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
            // Close the nav menu after switching
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Apply saved/default language on load
    setLanguage(currentLang);
}



function setupGalleryScrollbar() {
    const galleryScroll = document.querySelector('.gallery-scroll');
    const container     = document.querySelector('.gallery-container');
    if (!galleryScroll || !container) return;

    // Inject the custom scrollbar track below the gallery scroll
    const track = document.createElement('div');
    track.className = 'gallery-scrollbar-track';
    const thumb = document.createElement('div');
    thumb.className = 'gallery-scrollbar-thumb';
    track.appendChild(thumb);
    container.appendChild(track);

    function updateThumb() {
        const scrollLeft  = galleryScroll.scrollLeft;
        const maxScroll   = galleryScroll.scrollWidth - galleryScroll.clientWidth;
        const trackWidth  = track.clientWidth;
        const ratio       = galleryScroll.clientWidth / galleryScroll.scrollWidth;
        const thumbWidth  = Math.max(40, trackWidth * ratio);
        const thumbLeft   = maxScroll > 0
            ? (scrollLeft / maxScroll) * (trackWidth - thumbWidth)
            : 0;

        thumb.style.width     = thumbWidth + 'px';
        thumb.style.transform = `translateX(${thumbLeft}px)`;
    }

    galleryScroll.addEventListener('scroll', updateThumb, { passive: true });

    // Click on track to jump scroll position
    track.addEventListener('click', (e) => {
        const rect      = track.getBoundingClientRect();
        const clickPos  = (e.clientX - rect.left) / rect.width;
        const maxScroll = galleryScroll.scrollWidth - galleryScroll.clientWidth;
        galleryScroll.scrollTo({ left: clickPos * maxScroll, behavior: 'smooth' });
    });

    // Initial render + update on resize
    updateThumb();
    window.addEventListener('resize', updateThumb, { passive: true });
}

// ==========================================
// GALLERY — click-to-reveal on mobile
// ==========================================

function setupGalleryClick() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                galleryItems.forEach(other => {
                    if (other !== item) other.classList.remove('active');
                });
                item.classList.toggle('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.gallery-item')) {
            galleryItems.forEach(item => item.classList.remove('active'));
        }
    });
}

// ==========================================
// FAQ ACCORDION
// ==========================================

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem  = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
        if (!isActive) faqItem.classList.add('active');
    });
});


// ==========================================
// FORM VALIDATION ENHANCEMENT
// ==========================================

document.querySelectorAll('.rsvp-form input, .rsvp-form select, .rsvp-form textarea')
    .forEach(input => {
        input.addEventListener('blur', () => {
            input.style.borderColor = input.checkValidity()
                ? 'rgba(228, 219, 147, 0.5)'
                : '#ff6b6b';
        });
        input.addEventListener('focus', () => {
            input.style.borderColor = 'rgba(228, 219, 147, 0.3)';
        });
    });

// ==========================================
// INITIALISE EVERYTHING ON DOM READY
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    setupScrollAnimations();
    setupIntermission();
    setupGalleryScrollbar();
    setupGalleryClick();
    setupLanguageSwitcher();
});

console.log('Wedding website initialized successfully!');



