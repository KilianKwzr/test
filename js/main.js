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
