/* ==========================================================================
   Kilian Kwiczor — Scripts de la page
   ========================================================================== */

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
                    "Le message n'a pas pu être envoyé. Vérifiez les informations indiquées ou écrivez-moi directement à kilianlamare@gmail.com.";
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
