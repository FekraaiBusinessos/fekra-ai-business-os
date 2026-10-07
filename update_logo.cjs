const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const oldLogo = `<a href="https://linktr.ee/mahmoudredaph" target="_blank" rel="noopener noreferrer">
                  <img
                  src="https://i.ibb.co/4n88pYH1/jenta-branding-3d-glass-app-icon-4k-1-copy.png"
                  alt="Fekra ai 3D Icon"
                  className="w-64 h-64 md:w-96 md:h-96 object-contain drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity"
                  />
              </a>`;

const newLogo = `<div className="flex flex-col items-center justify-center p-8 bg-[rgba(var(--color-background-base-rgb),0.5)] backdrop-blur-md rounded-[3rem] border border-[rgba(var(--color-accent-rgb),0.3)] shadow-[0_0_50px_rgba(var(--color-accent-rgb),0.2)]">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" stroke="currentColor" className="text-[var(--color-accent)]" strokeWidth="4" fill="rgba(0, 229, 255, 0.1)"/>
                      <path d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z" stroke="currentColor" className="text-[var(--color-accent-light)]" strokeWidth="2" fill="none"/>
                      <text x="50" y="55" fontFamily="Tajawal, sans-serif" fontSize="24" fontWeight="bold" fill="currentColor" className="text-[var(--color-text-base)]" textAnchor="middle" dominantBaseline="middle">FAI</text>
                  </svg>
                  <h2 className="mt-4 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-light)] to-[var(--color-accent-dark)] tracking-wider">Fekra Ai</h2>
                  <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] mt-1">Business OS</p>
              </div>`;

content = content.replace(oldLogo, newLogo);

// While we're here, let's remove the pricing banner which is still there:
const oldBanner = `<a 
          href="https://jenta.pro/pricing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full mt-20 hover:opacity-95 transition-opacity group"
        >
          <img 
            src="https://i.ibb.co/HLjDpNbF/1.png" 
            alt="Fekra ai Pricing" 
            className="w-full h-auto rounded-[1.5rem] shadow-xl border border-white/10 group-hover:scale-[1.005] transition-transform duration-300"
          />
        </a>`;

content = content.replace(oldBanner, '');

fs.writeFileSync('App.tsx', content);
