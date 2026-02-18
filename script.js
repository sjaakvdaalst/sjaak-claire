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
        'story-p1':             'Claire and I, Sjaak, first met in 2021 when she studied abroad at my high school in Eschweiler, Germany. We ended up as classmates and seatmates, and pretty quickly became close friends.',
        'story-p2':             'What started with joking around in the classroom turned into a real friendship. We spent weekends hiking, going to Mass together, and talking for hours over coffee.',
        'story-p3':             'Over the years, we\'ve kept in touch through letters, calls, and visits across thousands of miles. In June last year, Sjaak proposed to Claire at the Abbey of Mount Angel with a pair of wooden clogs. We’re grateful for where our relationship has led us and are excited for the future.',

        'moments-heading':      'Moments Through the Years',
        'gallery-1-caption':    'Our first date in Cologne.',
        'gallery-2-caption':    'Sjaak\'s first time ever in the US.',
        'gallery-3-caption':    'Riding San Francisco\'s historical cable cars.',
        'gallery-4-caption':    'Enjoying the beach in southern Oregon.',
        'gallery-5-caption':    'Celebrating the 4th of July.',
        'gallery-6-caption':    'Our "Abiprom", celebrating Sjaak\'s Abitur and Claire\'s high school graduation.',
        'gallery-7-caption':    'Our families meeting up for the first time.',
        'gallery-8-caption':    'Playing detective.',
        'gallery-9-caption':    'Getting a private tour at the Streekmuseum in Eersel by Sjaak\'s grandfather.',
        'gallery-10-caption':   'Visiting Krakow with Sjaak\'s father, Wil.',
        'gallery-11-caption':   'Visiting Seattle around Christmas time.',
        'gallery-12-caption':   'Reviewing coffee has been a routine during our relationship. This was in Seattle.',
        'gallery-13-caption':   'Hiking at Silver Falls.',
        'gallery-14-caption':   'Sjaak proposes to Claire and hands her his hand-carved wooden clogs.',
        'gallery-15-caption':   'Engagement photoshoot.',

        'mass-heading':         'Nuptial Mass',
        'mass-note':            'Please arrive 15 minutes early, silence your cellphones, and (please!) no photos.',

        'reception-heading':    'Reception',
        'reception-menu-link':  'Link to menu.',

        'faq-heading':          'Commonly Asked Questions',
        'faq-q1':               'Is there a dress code?',
        'faq-a1':               'In general, formal attire is appreciated. For the Church, please dress modestly (e.g., covered shoulders).',
        'faq-q2':               'What is parking like?',
        'faq-a2':               'At St. Mary, there is a parking lot next to the church. At Sorella, there is street parking available.',
        'faq-q3':               'Where should we stay?',
        'faq-a3':               'As there are not many options in the Mt Angel/Silverton area, Salem has some reasonable places to stay.',

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
        'nav-registry':         'Cadeaulijst',
        'nav-rsvp':             'RSVP',

        'welcome-heading':      'Welkom!',
        'welcome-p1':           'Claire en Sjaak nodigen u met vreugde uit om deel te nemen aan de viering van hun verbintenis in het Sacrament van het Huwelijk.',
        'welcome-p2':           'Hieronder vindt u alle details over de ceremonie, de receptie en meer. Wij zijn dankbaar voor uw aanwezigheid terwijl wij samen aan dit grote, levenslange avontuur beginnen.',

        'story-heading':        'Een Kijkje in Ons Verhaal',
        'story-p1':             'Claire en ik, Sjaak, ontmoetten elkaar voor het eerst in 2021 toen zij een semester in het buitenland studeerde aan mijn middelbare school in Eschweiler, Duitsland. We kwamen bij elkaar in de klas te zitten en werden al snel goede vrienden.',
        'story-p2':             'Wat begon met grapjes in de klas, groeide uit tot een echte vriendschap. We brachten weekenden door met wandelen, samen naar de mis gaan en urenlang kletsen onder het genot van een kop koffie.',
        'story-p3':             'In de loop der jaren zijn we in contact gebleven via brieven, telefoontjes en bezoeken over duizenden kilometers. In juni vorig jaar vroeg Sjaak Claire ten huwelijk in de abdij van Mount Angel met een paar houten klompen. We zijn dankbaar voor waar onze relatie ons heeft gebracht en kijken vol enthousiasme naar de toekomst.',

        'moments-heading':      'Momenten door de Jaren',
        'gallery-1-caption':    'Ons eerste date in Keulen.',
        'gallery-2-caption':    'Sjaaks allereerste bezoek aan de VS.',
        'gallery-3-caption':    'Een rit op de historische kabeltrams van San Francisco.',
        'gallery-4-caption':    'Genieten van het strand in het zuiden van Oregon.',
        'gallery-5-caption':    'De viering van 4 juli.',
        'gallery-6-caption':    'Ons "Abiprom", ter viering van Sjaaks Abitur en Claire\'s eindexamen.',
        'gallery-7-caption':    'Onze families ontmoeten elkaar voor het eerst.',
        'gallery-8-caption':    'Detectives spelen.',
        'gallery-9-caption':    'Een privérondleiding in het Streekmuseum in Eersel door Sjaaks grootvader.',
        'gallery-10-caption':   'Krakau bezoeken met Sjaaks vader, Wil.',
        'gallery-11-caption':   'Seattle bezoeken rond Kerstmis.',
        'gallery-12-caption':   'Koffie recenseren is een vast ritueel in onze relatie. Dit was in Seattle.',
        'gallery-13-caption':   'Wandelen bij Silver Falls.',
        'gallery-14-caption':   'Sjaak vraagt Claire ten huwelijk en overhandigt haar zijn handgesneden houten klompen.',
        'gallery-15-caption':   'Verlovingsfotoshoot.',

        'mass-heading':         'Huwelijksmis',
        'mass-note':            'Gelieve 15 minuten van tevoren aanwezig te zijn, uw mobiele telefoons uit te zetten en (alstublieft!) geen foto\'s te maken.',

        'reception-heading':    'Receptie',
        'reception-menu-link':  'Link naar het menu.',

        'faq-heading':          'Veelgestelde Vragen',
        'faq-q1':               'Is er een dresscode?',
        'faq-a1':               'Voor de kerk wordt u verzocht bescheiden en formeel gekleed te gaan (bijvoorbeeld met bedekte schouders).',
        'faq-q2':               'Hoe zit het met parkeren?',
        'faq-a2':               'Bij St. Mary is er een parkeerplaats naast de kerk. Bij Sorella kun je langs de weg parkeren.',
        'faq-q3':               'Waar kunnen we verblijven?',
        'faq-a3':               'Er zijn niet veel opties in het Mt Angel/Silverton-gebied, maar Salem heeft enkele redelijke mogelijkheden.',

        'registry-heading':     'Uw aanwezigheid is werkelijk het mooiste cadeau dat wij ons kunnen wensen.',
        'registry-message':     'Maar als u toch iets wilt geven, hebben wij een kleine cadeaulijst samengesteld.\nKlik op onderstaande link om de cadeaulijst te bezoeken.',
        'registry-link':        'Bezoek onze cadeaulijst',

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
        'story-p1':             'Claire und ich, Sjaak, lernten uns 2021 kennen, als sie ein Jahr an meiner Schule in Eschweiler verbrachte. Wir wurden Klassenkameraden und saßen nebeneinander und wurden schnell enge Freunde.',
        'story-p2':             'Was mit Scherzen im Unterricht begann, entwickelte sich zu einer echten Freundschaft. Wir verbrachten Wochenenden mit Wandern, gingen gemeinsam zur Messe und unterhielten uns stundenlang bei ein paar Tassen Kaffee.',
        'story-p3':             'Über die Jahre hielten wir durch Briefe, Anrufe und Besuche über Tausende von Kilometern hinweg Kontakt. Im Juni letzten Jahres machte Sjaak Claire in der Abtei Mount Angel mit einem Paar Holzschuhen einen Heiratsantrag. Wir sind dankbar für das, was unsere Beziehung uns gebracht hat, und freuen uns auf die Zukunft.',

        'moments-heading':      'Momente durch die Jahre',
        'gallery-1-caption':    'Unser erstes Date in Köln.',
        'gallery-2-caption':    'Sjaaks erstes Mal in den USA.',
        'gallery-3-caption':    'Eine Fahrt mit den historischen Seilbahnen von San Francisco.',
        'gallery-4-caption':    'Am Strand im Süden Oregons.',
        'gallery-5-caption':    'Feier zum 4. Juli.',
        'gallery-6-caption':    'Unser "Abiprom" – zur Feier von Sjaaks Abitur und Claires High-School-Abschluss.',
        'gallery-7-caption':    'Unsere Familien treffen sich zum ersten Mal.',
        'gallery-8-caption':    'Detektive spielen.',
        'gallery-9-caption':    'Eine private Führung im Streekmuseum in Eersel durch Sjaaks Großvater.',
        'gallery-10-caption':   'Krakau besuchen mit Sjaaks Vater, Wil.',
        'gallery-11-caption':   'Seattle zur Weihnachtszeit.',
        'gallery-12-caption':   'Kaffee zu bewerten ist eine feste Tradition in unserer Beziehung. Dies war in Seattle.',
        'gallery-13-caption':   'Wandern bei Silver Falls.',
        'gallery-14-caption':   'Sjaak macht Claire einen Heiratsantrag und überreicht ihr seine handgeschnitzten Holzschuhe.',
        'gallery-15-caption':   'Verlobungsfotoshooting.',

        'mass-heading':         'Trauungsmesse',
        'mass-note':            'Bitte kommen Sie 15 Minuten früher, schalten Sie Ihre Handys stumm und (bitte!) machen Sie keine Fotos.',

        'reception-heading':    'Empfang',
        'reception-menu-link':  'Link zur Speisekarte.',

        'faq-heading':          'Häufig gestellte Fragen',
        'faq-q1':               'Gibt es einen Dresscode?',
        'faq-a1':               'Im Allgemeinen wird formelle Kleidung geschätzt. Für den Gottesdienst bitten wir Sie, sich dezent zu kleiden (z. B. Schultern bedeckt).',
        'faq-q2':               'Wie sieht es mit Parkmöglichkeiten aus?',
        'faq-a2':               'Bei St. Mary gibt es einen Parkplatz neben der Kirche. Bei Sorella kann man an der Straße parken.',
        'faq-q3':               'Wo können wir übernachten?',
        'faq-a3':               'Da es in der Gegend um Mt Angel/Silverton wenige Möglichkeiten gibt, bietet Salem einige solide Optionen.',

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

console.log('Wedding website initialized successfully!');;







