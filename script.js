function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("show");
}

function selectPlan(plan) {
  document.getElementById("plan").value = plan + " Membership";
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("formMessage");

  message.textContent = `Thanks ${name}! Your request has been received. We'll contact you soon.`;
  this.reset();
});
