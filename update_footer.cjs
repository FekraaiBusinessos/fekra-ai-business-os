const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Replace "مجتمع جينتا" with "مجتمع Fekra ai"
content = content.replace('جروب الواتس ودخول مجتمع جينتا', 'جروب الواتس ودخول مجتمع Fekra ai');

// Replace the footer completely
const oldFooterRegex = /<footer[\s\S]*?<\/footer>/g;
const newFooter = `<footer className="w-full border-t border-[rgba(var(--color-text-base-rgb),0.1)] flex-shrink-0 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center gap-10 text-[var(--color-text-secondary)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                  {/* WhatsApp Group Section */}
                  <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-sm font-bold text-[var(--color-text-medium)] uppercase tracking-widest">Fekra AI Community</p>
                      <a 
                        href="https://chat.whatsapp.com/ITpOHY73yToFJLxGz7ZyZq" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-[#25D366]/20 hover:scale-105 active:scale-95"
                      >
                        <WhatsAppIcon />
                        <span className="text-base font-bold">انضم لمجتمع Fekra ai</span>
                      </a>
                  </div>

                  {/* Collaboration Section */}
                  <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-sm font-bold text-[var(--color-text-medium)] uppercase tracking-widest">Business & Collaboration</p>
                      <a 
                        href="https://wa.me/+201065414900" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-white/10 hover:scale-105 active:scale-95"
                      >
                        <WhatsAppIcon />
                        <span className="text-base font-black">اضغط هنا للتواصل</span>
                      </a>
                  </div>
              </div>

              <div className="flex justify-center items-center pt-6 border-t border-white/5 w-full">
                  <div className="flex flex-col items-center gap-2">
                      <span className="font-bold text-[var(--color-accent)] text-xl tracking-wider">Fekra Ai Business OS</span>
                      <p className="text-xs font-medium opacity-60">
                         © {new Date().getFullYear()} Fekra Ai Solutions. All rights reserved.
                      </p>
                  </div>
              </div>
          </div>
        </footer>`;

content = content.replace(oldFooterRegex, newFooter);

fs.writeFileSync('App.tsx', content);
