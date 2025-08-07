// confetti.js
// Efecto confeti simple y sin dependencias externas
export function launchConfetti() {
  const colors = ["#FFD700", "#FF69B4", "#00CFFF", "#FF6347", "#7CFC00", "#FFB347"];
  const numConfetti = 120;
  for (let i = 0; i < numConfetti; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti-piece";
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.animationDelay = (Math.random() * 0.7) + "s";
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 3000);
  }
}
