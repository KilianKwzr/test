/* ==========================================================================
   Kilian Kwiczor — Scripts de la page
   ========================================================================== */

/* ==========================================================================
   Mesure d'audience (Google Analytics) + consentement cookies (RGPD)
   GA n'est chargé QUE si le visiteur accepte. Aucun cookie de suivi avant.
   ========================================================================== */
(function () {
    var GA_ID = "G-7D9XPF9CGH";
    var STORE = "cookie-consent";

    function loadGA() {
        if (window.__gaLoaded) return;
        window.__gaLoaded = true;
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag("js", new Date());
        gtag("config", GA_ID, { anonymize_ip: true });
    }

    function hideBanner() {
        var b = document.getElementById("cookieBanner");
        if (b) b.remove();
    }

    function showBanner() {
        var banner = document.createElement("div");
        banner.className = "cookie-banner";
        banner.id = "cookieBanner";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-label", "Consentement aux cookies de mesure d'audience");
        banner.innerHTML =
            '<p class="cookie-banner__text">Ce site utilise des cookies de mesure d\'audience (Google Analytics) pour comprendre sa fréquentation. Vous pouvez les accepter ou les refuser.</p>' +
            '<div class="cookie-banner__actions">' +
            '<button type="button" class="btn btn--outline cookie-banner__btn" id="cookieRefuse">Refuser</button>' +
            '<button type="button" class="btn btn--light cookie-banner__btn" id="cookieAccept">Accepter</button>' +
            "</div>";
        document.body.appendChild(banner);

        document.getElementById("cookieAccept").addEventListener("click", function () {
            try { localStorage.setItem(STORE, "granted"); } catch (e) {}
            loadGA();
            hideBanner();
        });
        document.getElementById("cookieRefuse").addEventListener("click", function () {
            try { localStorage.setItem(STORE, "denied"); } catch (e) {}
            hideBanner();
        });
    }

    var choice = null;
    try { choice = localStorage.getItem(STORE); } catch (e) {}

    if (choice === "granted") {
        loadGA();
    } else if (choice !== "denied") {
        if (document.body) showBanner();
        else document.addEventListener("DOMContentLoaded", showBanner);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    /* ---------- Navbar : fond au scroll ---------- */
    const nav = document.getElementById("nav");

    const onScroll = () => {
        nav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Menu mobile ---------- */
    const burger = document.getElementById("navBurger");
    const links = document.getElementById("navLinks");

    burger.addEventListener("click", () => {
        const open = links.classList.toggle("is-open");
        burger.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", open);
    });

    // Ferme le menu quand on clique sur un lien
    links.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
            links.classList.remove("is-open");
            burger.classList.remove("is-open");
            burger.setAttribute("aria-expanded", "false");
        })
    );

    /* ---------- Apparition des sections au scroll ---------- */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    /* ---------- Carrousel clients : défile seul + prise en main ---------- */
    (function setupMarquee() {
        const marquee = document.querySelector(".marquee");
        if (!marquee) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const SPEED = 0.5;          // px par frame (~30 px/s à 60fps)
        let paused = false;         // survol
        let dragging = false;
        let startX = 0;
        let startScroll = 0;
        let moved = false;

        // Boucle infinie : le contenu est doublé, on ramène le scroll
        // dans la première moitié pour un défilement continu.
        function half() {
            return marquee.scrollWidth / 2;
        }
        function normalize() {
            const h = half();
            if (h <= 0) return;
            if (marquee.scrollLeft >= h) marquee.scrollLeft -= h;
            else if (marquee.scrollLeft < 0) marquee.scrollLeft += h;
        }

        function tick() {
            if (!reduce && !paused && !dragging) {
                marquee.scrollLeft += SPEED;
                normalize();
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);

        // Pause au survol (souris) — on garde le défilement sur mobile
        marquee.addEventListener("mouseenter", () => { paused = true; });
        marquee.addEventListener("mouseleave", () => { paused = false; });

        // Prise en main : glisser-déposer horizontal.
        // Souris/stylet = on pilote scrollLeft ; tactile = scroll natif (on
        // met juste l'auto en pause le temps du geste).
        marquee.addEventListener("pointerdown", (e) => {
            dragging = true;
            moved = false;
            startX = e.clientX;
            startScroll = marquee.scrollLeft;
            if (e.pointerType !== "touch") {
                marquee.classList.add("is-grabbing");
                try { marquee.setPointerCapture(e.pointerId); } catch (_) {}
            }
        });
        marquee.addEventListener("pointermove", (e) => {
            if (!dragging || e.pointerType === "touch") return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 3) moved = true;
            marquee.scrollLeft = startScroll - dx;
            normalize();
        });
        function endDrag(e) {
            if (!dragging) return;
            dragging = false;
            marquee.classList.remove("is-grabbing");
            try { marquee.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        marquee.addEventListener("pointerup", endDrag);
        marquee.addEventListener("pointercancel", endDrag);
        marquee.addEventListener("pointerleave", endDrag);

        // Empêche le "clic fantôme" sur un logo après un glissement
        marquee.addEventListener("click", (e) => {
            if (moved) { e.preventDefault(); e.stopPropagation(); }
        }, true);

        // Molette horizontale (trackpad / shift+molette) reste native
    })();

    /* ---------- FAQ : accordéon ---------- */
    document.querySelectorAll(".faq__item").forEach((item) => {
        const question = item.querySelector(".faq__question");
        const answer = item.querySelector(".faq__answer");

        question.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");

            // Ferme les autres questions ouvertes
            document.querySelectorAll(".faq__item.is-open").forEach((other) => {
                if (other !== item) {
                    other.classList.remove("is-open");
                    other.querySelector(".faq__question").setAttribute("aria-expanded", "false");
                    other.querySelector(".faq__answer").style.maxHeight = null;
                }
            });

            item.classList.toggle("is-open", !isOpen);
            question.setAttribute("aria-expanded", String(!isOpen));
            answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
        });
    });

    /* ---------- Page Projets : filtrage des vidéos par catégorie ---------- */
    const filterButtons = document.querySelectorAll(".filter");
    if (filterButtons.length) {
        const cards = document.querySelectorAll(".video-card");

        filterButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                filterButtons.forEach((b) => b.classList.remove("is-active"));
                btn.classList.add("is-active");

                const filter = btn.dataset.filter;
                cards.forEach((card) => {
                    const show = filter === "all" || card.dataset.category === filter;
                    card.classList.toggle("is-hidden", !show);
                });
            });
        });
    }

    /* ---------- Page À propos : emplacement si le portrait est absent ---------- */
    const portrait = document.getElementById("portraitPhoto");
    if (portrait) {
        portrait.addEventListener("error", () => {
            portrait.closest(".about-hero__photo").classList.add("about-hero__photo--empty");
        });
        if (portrait.complete && portrait.naturalWidth === 0) {
            portrait.closest(".about-hero__photo").classList.add("about-hero__photo--empty");
        }
    }

    /* ---------- Page Contact : envoi du formulaire en AJAX ---------- */
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        const statusEl = document.getElementById("formStatus");
        const successEl = document.getElementById("formSuccess");
        const submitBtn = contactForm.querySelector(".form__submit");

        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Anti-spam : si le honeypot est rempli, on ignore silencieusement.
            if (contactForm.querySelector(".form__honey").value) return;

            statusEl.textContent = "";
            statusEl.classList.remove("is-error");
            submitBtn.disabled = true;
            submitBtn.textContent = "Envoi en cours…";

            try {
                const endpoint = contactForm.action.replace(
                    "formsubmit.co/",
                    "formsubmit.co/ajax/"
                );
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: new FormData(contactForm),
                });

                if (!response.ok) throw new Error("http " + response.status);
                const data = await response.json();
                if (data.success === "true" || data.success === true) {
                    contactForm.hidden = true;
                    successEl.hidden = false;
                    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                    throw new Error("formsubmit");
                }
            } catch (err) {
                statusEl.textContent =
                    "Le message n'a pas pu être envoyé. Vérifiez les informations indiquées ou écrivez-moi directement à contact@kiliankwiczor.com.";
                statusEl.classList.add("is-error");
                submitBtn.disabled = false;
                submitBtn.textContent = "Envoyer les informations du projet";
            }
        });
    }

    /* ---------- Vidéo de fond : masque le lecteur si le fichier est absent ---------- */
    const heroVideo = document.querySelector(".hero__video");
    if (heroVideo) {
        heroVideo.addEventListener(
            "error",
            () => {
                heroVideo.style.display = "none";
            },
            true
        );
    }
});
