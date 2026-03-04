gsap.registerPlugin(Observer);

let sections = document.querySelectorAll("section"),
  images = document.querySelectorAll(".bg"),
  headings = gsap.utils.toArray(".section-heading"),
  subheadings = gsap.utils.toArray(".section-subheading"),
  outerWrappers = gsap.utils.toArray(".outer"),
  innerWrappers = gsap.utils.toArray(".inner"),
  splitHeadings = headings.map(heading => {
    return new SplitType(heading, { types: 'chars,words,lines', lineClass: 'clip-text' });
  }),
  currentIndex = -1,
  wrap = gsap.utils.wrap(0, sections.length),
  animating;

gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

function gotoSection(index, direction) {
  index = wrap(index); // make sure it's valid
  animating = true;
  let fromTop = direction === -1,
    dFactor = fromTop ? -1 : 1,
    tl = gsap.timeline({
      defaults: { duration: 1.25, ease: "power1.inOut" },
      onComplete: () => animating = false
    });

  if (currentIndex >= 0) {
    // Determine the elements to hide from previous section
    let oldAnimItems = sections[currentIndex].querySelectorAll('.anim-item');

    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(images[currentIndex], { yPercent: -15 * dFactor })
      .to(oldAnimItems, { autoAlpha: 0, duration: 0.3 }, 0)
      .set(sections[currentIndex], { autoAlpha: 0 });
  }

  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });

  let currentAnimItems = sections[index].querySelectorAll('.anim-item');

  tl.fromTo([outerWrappers[index], innerWrappers[index]], {
    yPercent: i => i ? -100 * dFactor : 100 * dFactor
  }, {
    yPercent: 0
  }, 0)
    .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
    .fromTo(splitHeadings[index].chars, {
      autoAlpha: 0,
      yPercent: 150 * dFactor
    }, {
      autoAlpha: 1,
      yPercent: 0,
      duration: 1,
      ease: "power2",
      stagger: {
        each: 0.02,
        from: "random"
      }
    }, 0.2)
    .fromTo(subheadings[index], {
      autoAlpha: 0,
      y: 20 * dFactor
    }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, 0.8)
    .fromTo(currentAnimItems, {
      autoAlpha: 0,
      y: 30 * dFactor
    }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.15
    }, 1.0);

  currentIndex = index;
}

Observer.create({
  type: "wheel,touch,pointer",
  wheelSpeed: -1,
  onDown: () => !animating && gotoSection(currentIndex - 1, -1),
  onUp: () => !animating && gotoSection(currentIndex + 1, 1),
  tolerance: 10,
  preventDefault: true
});

// Initialize first section
gotoSection(0, 1);

// Attach interactions to header to jump to sections manually if desired
document.querySelectorAll('header nav a').forEach((link, idx) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (animating) return;

    let targetIndex;
    // Map navbar clicks to our 4 sections
    if (idx === 0) targetIndex = 0; // Intro
    if (idx === 1) targetIndex = 1; // Resume 
    if (idx === 2) targetIndex = 2; // Projects
    if (idx === 3) targetIndex = 3; // Contact

    if (targetIndex !== currentIndex && targetIndex !== undefined) {
      let direction = targetIndex > currentIndex ? 1 : -1;
      gotoSection(targetIndex, direction);
    }
  });
});
