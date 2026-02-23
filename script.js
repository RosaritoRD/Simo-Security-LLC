const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuBtn.textContent = open ? "✕" : "☰";
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuBtn.textContent = "☰";
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}
  // Modal
  const modal = document.getElementById("quoteModal");
  const openBtn = document.getElementById("openQuote");
  const closeBtn = document.getElementById("closeQuote");
  const form = document.getElementById("quoteForm");

  function openModal(){
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal(){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  openBtn?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });

  // Submit via email (no backend)
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    const subject = encodeURIComponent("Simo Security — Quote Request");
    const body = encodeURIComponent(
`Name: ${payload.name}
Phone: ${payload.phone}
Email: ${payload.email}
Service: ${payload.service}
Date: ${payload.date}
Hours: ${payload.hours}
Location: ${payload.location}

Details:
${payload.details || ""}`
    );

    window.location.href = `mailto:athierasimo@gmail.com?subject=${subject}&body=${body}`;
    closeModal();
    form.reset();
  });

  // FAQ accordion (only one open)
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item").forEach(i => {
        i.classList.remove("open");
        const b = i.querySelector(".faq-q");
        b?.setAttribute("aria-expanded", "false");
      });

      if(!isOpen){
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
