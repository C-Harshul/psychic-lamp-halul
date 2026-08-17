(function () {
    'use strict';

    var BETA_URL = 'https://forms.gle/gprd8EuGD65VVGQYA';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var SCENES = [
        'athena',
        'brand',
        'who-q',
        'who-a',
        'how',
        'arch-0',
        'arch-1',
        'arch-2',
        'arch-tag',
        'privacy',
        'join'
    ];

    function q(sel, root) {
        return (root || document).querySelector(sel);
    }

    function qa(sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    }

    function clampVw(min, vw, max) {
        var v = window.innerWidth * (vw / 100);
        return Math.max(min, Math.min(max, v));
    }

    function titleBig() {
        return clampVw(48, 8, 92);
    }

    function titleAnswer() {
        return clampVw(40, 5, 52);
    }

    function titleHowSmall() {
        return clampVw(40, 4.8, 52);
    }

    function stageId(index) {
        if (index <= 1) return 'intro';
        if (index <= 3) return 'who';
        if (index <= 8) return 'architecture';
        if (index === 9) return 'privacy';
        return 'join';
    }

    function revealStatic() {
        qa('.beat-copy, .brand-overlay, .arch-tagline, .arch-row, .who-line').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.height = 'auto';
        });
        var dim = q('.athena-dim');
        if (dim) dim.style.opacity = '0.55';
        var kicker = q('.how-kicker');
        if (kicker) kicker.style.height = 'auto';
    }

    function loadGsap(cb) {
        if (window.gsap) {
            cb(window.gsap);
            return;
        }
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        s.onload = function () { cb(window.gsap); };
        s.onerror = function () { cb(null); };
        document.head.appendChild(s);
    }

    function setupDeck(gsap) {
        var stages = qa('.stage');
        var dim = q('.athena-dim');
        var brand = q('.brand-overlay');
        var img = q('.athena-img');
        var star = q('.star-glow');
        var whoAnswer = q('.who-line');
        var howTitle = q('#architecture .how-live');
        var howWrap = q('.how-live-wrap');
        var howKicker = q('.how-kicker');
        var rows = qa('.arch-row');
        var copies = qa('.layer-copy');
        var tagline = q('.arch-tagline');
        var archRows = q('.arch-rows');
        var archStack = q('.arch-stack');
        var archSticky = q('.arch-sticky');

        var current = 0;
        var animating = false;
        var coolUntil = 0;
        var DUR = 0.85;

        function riseFrom() {
            return Math.round(window.innerHeight * 0.72);
        }

        function setStage(id, visible) {
            stages.forEach(function (el) {
                var on = el.id === id && visible !== false;
                el.classList.toggle('is-on', on);
                if (on) {
                    el.removeAttribute('aria-hidden');
                    el.removeAttribute('inert');
                } else {
                    el.setAttribute('aria-hidden', 'true');
                    el.setAttribute('inert', '');
                }
            });
        }

        function setFocus(layerCount, all) {
            copies.forEach(function (el, i) {
                el.classList.toggle('is-focused', all || i === layerCount - 1);
            });
        }

        function applyIntro(showBrand, dur) {
            var t = dur || 0;
            gsap.to(dim, { opacity: showBrand ? 0.72 : 0, duration: t, ease: 'power2.inOut', overwrite: 'auto' });
            gsap.to(brand, {
                opacity: showBrand ? 1 : 0,
                y: showBrand ? 0 : 16,
                duration: t,
                ease: 'power2.inOut',
                overwrite: 'auto'
            });
            brand.style.pointerEvents = showBrand ? 'auto' : 'none';
            if (img) {
                gsap.to(img, { scale: showBrand ? 1.03 : 1, duration: t, ease: 'power2.inOut', overwrite: 'auto' });
            }
            if (star) {
                gsap.to(star, { opacity: showBrand ? 0.45 : 0.9, duration: t, ease: 'power2.inOut', overwrite: 'auto' });
            }
        }

        function applyWho(answered, dur) {
            var t = dur || 0;
            if (answered) {
                gsap.set(whoAnswer, { overflow: 'hidden' });
                gsap.to(whoAnswer, {
                    opacity: 1,
                    height: 'auto',
                    marginTop: 24,
                    duration: t,
                    ease: 'power2.inOut',
                    overwrite: 'auto'
                });
            } else {
                gsap.set(whoAnswer, { overflow: 'hidden' });
                gsap.to(whoAnswer, {
                    opacity: 0,
                    height: 0,
                    marginTop: 0,
                    duration: t,
                    ease: 'power2.inOut',
                    overwrite: 'auto'
                });
            }
        }

        function howScale() {
            return titleHowSmall() / titleBig();
        }

        function applyArch(step, dur) {
            var t = dur || 0;
            var layers = step <= 0 ? 0 : Math.min(3, step);
            var showTag = step >= 4;
            var showTitleSmall = step >= 1;

            if (howWrap) {
                gsap.to(howWrap, {
                    top: showTitleSmall ? 40 : window.innerHeight * 0.5,
                    yPercent: showTitleSmall ? 0 : -50,
                    duration: t,
                    ease: 'power3.inOut',
                    overwrite: 'auto'
                });
            }
            gsap.to(howTitle, {
                scale: showTitleSmall ? howScale() : 1,
                duration: t,
                ease: 'power3.inOut',
                overwrite: 'auto'
            });

            if (howKicker) {
                gsap.to(howKicker, {
                    autoAlpha: step === 0 ? 1 : 0,
                    y: step === 0 ? 0 : 8,
                    duration: t ? Math.min(0.35, t * 0.45) : 0,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }

            if (archRows) {
                gsap.set(archRows, {
                    display: layers ? 'flex' : 'none'
                });
            }

            rows.forEach(function (row, i) {
                var on = i < layers;
                var visible = window.getComputedStyle(row).display !== 'none';

                if (on) {
                    if (!visible) {
                        gsap.set(row, {
                            display: 'grid',
                            autoAlpha: 1,
                            y: t ? riseFrom() : 0,
                            zIndex: 4
                        });
                        gsap.to(row, {
                            y: 0,
                            duration: t,
                            ease: 'power3.out',
                            overwrite: 'auto',
                            onComplete: function () {
                                gsap.set(row, { zIndex: 1 });
                            }
                        });
                    } else {
                        gsap.to(row, {
                            y: 0,
                            autoAlpha: 1,
                            duration: t ? 0.35 : 0,
                            ease: 'power2.out',
                            overwrite: 'auto'
                        });
                    }
                } else if (visible) {
                    gsap.to(row, {
                        y: riseFrom(),
                        duration: t ? t * 0.7 : 0,
                        ease: 'power3.in',
                        overwrite: 'auto',
                        onComplete: function () {
                            if (i >= layers) gsap.set(row, { display: 'none', y: riseFrom() });
                        }
                    });
                    if (!t) gsap.set(row, { display: 'none', y: riseFrom(), autoAlpha: 1 });
                } else if (!t) {
                    gsap.set(row, { display: 'none', y: riseFrom(), autoAlpha: 1 });
                }
            });

            if (tagline) {
                if (step === 0) {
                    gsap.set(tagline, { display: 'none', opacity: 0 });
                } else {
                    gsap.set(tagline, { display: 'block' });
                    gsap.to(tagline, {
                        opacity: showTag ? 1 : 0,
                        duration: t,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            }

            setFocus(layers, showTag);
        }

        function applyScene(index, dur) {
            var name = SCENES[index];
            if (name === 'athena') applyIntro(false, dur);
            if (name === 'brand') applyIntro(true, dur);
            if (name === 'who-q') applyWho(false, dur);
            if (name === 'who-a') applyWho(true, dur);
            if (name === 'how') applyArch(0, dur);
            if (name === 'arch-0') applyArch(1, dur);
            if (name === 'arch-1') applyArch(2, dur);
            if (name === 'arch-2') applyArch(3, dur);
            if (name === 'arch-tag') applyArch(4, dur);
        }

        function goTo(index) {
            if (index === current || animating) return;
            if (index < 0 || index >= SCENES.length) return;

            var fromStage = stageId(current);
            var toStage = stageId(index);
            var dur = DUR;
            animating = true;

            applyScene(index, fromStage === toStage ? dur : 0);

            if (fromStage === toStage) {
                gsap.delayedCall(dur, function () {
                    current = index;
                    animating = false;
                    coolUntil = Date.now() + 280;
                });
                return;
            }

            var incoming = q('#' + toStage);
            var outgoing = q('#' + fromStage);
            if (incoming) {
                incoming.classList.add('is-on');
                incoming.removeAttribute('aria-hidden');
                incoming.removeAttribute('inert');
                incoming.style.zIndex = '2';
                gsap.set(incoming, { opacity: 0 });
            }
            if (outgoing && outgoing !== incoming) {
                outgoing.style.zIndex = '1';
            }

            var tl = gsap.timeline({
                onComplete: function () {
                    if (outgoing && outgoing !== incoming) {
                        outgoing.classList.remove('is-on');
                        outgoing.setAttribute('aria-hidden', 'true');
                        outgoing.setAttribute('inert', '');
                        outgoing.style.zIndex = '';
                        gsap.set(outgoing, { opacity: 0 });
                    }
                    if (incoming) {
                        incoming.style.zIndex = '';
                        gsap.set(incoming, { opacity: 1 });
                    }
                    current = index;
                    animating = false;
                    coolUntil = Date.now() + 280;
                }
            });

            if (outgoing && outgoing !== incoming) {
                tl.to(outgoing, { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, 0);
            }
            if (incoming) {
                tl.to(incoming, { opacity: 1, duration: 0.45, ease: 'power2.inOut' }, outgoing && outgoing !== incoming ? 0.08 : 0);
            }
        }

        function step(dir) {
            if (animating || Date.now() < coolUntil) return;
            goTo(current + dir);
        }

        document.documentElement.classList.add('deck-mode');

        gsap.set(dim, { opacity: 0 });
        gsap.set(brand, { opacity: 0, y: 16 });
        if (img) gsap.set(img, { scale: 1 });
        gsap.set(whoAnswer, { opacity: 0, height: 0, overflow: 'hidden', marginTop: 0 });
        gsap.set(howTitle, { scale: 1, transformOrigin: '50% 0%' });
        if (howWrap) {
            gsap.set(howWrap, {
                top: window.innerHeight * 0.5,
                yPercent: -50
            });
        }
        if (howKicker) gsap.set(howKicker, { autoAlpha: 1, y: 0 });
        rows.forEach(function (row) {
            gsap.set(row, { y: riseFrom(), autoAlpha: 1, display: 'none' });
        });
        if (archRows) gsap.set(archRows, { display: 'none' });
        if (tagline) gsap.set(tagline, { opacity: 0, display: 'none' });
        setFocus(0, false);

        stages.forEach(function (el) {
            gsap.set(el, { opacity: el.id === 'intro' ? 1 : 0 });
        });
        setStage('intro', true);
        applyScene(0, 0);

        window.addEventListener('wheel', function (e) {
            if (e.ctrlKey) return;
            e.preventDefault();
            if (Math.abs(e.deltaY) < 10) return;
            step(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        var touchY = 0;
        window.addEventListener('touchstart', function (e) {
            if (!e.touches[0]) return;
            touchY = e.touches[0].clientY;
        }, { passive: true });
        window.addEventListener('touchend', function (e) {
            if (!e.changedTouches[0]) return;
            var delta = touchY - e.changedTouches[0].clientY;
            if (Math.abs(delta) < 48) return;
            step(delta > 0 ? 1 : -1);
        }, { passive: true });

        document.addEventListener('keydown', function (e) {
            var tag = (e.target && e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
            if (e.key === ' ' && e.target && e.target.closest && e.target.closest('a, button')) return;

            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                step(1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                step(-1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                goTo(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goTo(SCENES.length - 1);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        qa('a[href="' + BETA_URL + '"]').forEach(function (a) {
            a.setAttribute('rel', 'noopener noreferrer');
        });

        if (reduceMotion) {
            revealStatic();
            return;
        }

        loadGsap(function (gsap) {
            if (!gsap) {
                revealStatic();
                return;
            }
            setupDeck(gsap);
        });
    });
})();
