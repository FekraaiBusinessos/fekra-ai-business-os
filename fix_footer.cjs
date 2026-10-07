const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const newFooter = `<footer className="w-full border-t border-[rgba(var(--color-text-base-rgb),0.1)] flex-shrink-0 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center gap-10 text-[var(--color-text-secondary)]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {/* WhatsApp Group Section */}
                  <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-sm font-bold text-[var(--color-text-medium)] uppercase tracking-widest">Keep Updated</p>
                      <a 
                        href="https://chat.whatsapp.com/ITpOHY73yToFJLxGz7ZyZq" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#25D366]/20 hover:scale-105 active:scale-95"
                      >
                        <WhatsAppIcon />
                        <span className="text-sm font-bold">جروب الواتس ودخول مجتمع Fekra ai</span>
                      </a>
                  </div>

                  {/* Collaboration Section */}
                  <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-sm font-bold text-[var(--color-text-medium)] uppercase tracking-widest">Business & Collaboration</p>
                      <div className="flex flex-col items-center gap-2">
                          <p className="text-xs font-medium">للتواصل والتعاون للشركات وشرح الأداة لفريقك</p>
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
              </div>

              <div className="flex justify-center items-center flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-white/5 w-full">
                  <div className="flex flex-col items-center gap-2">
                      <span className="font-bold text-[var(--color-accent)] text-xl tracking-wider">Fekra Ai Business OS</span>
                      <p className="text-xs font-medium opacity-60">
                         © {new Date().getFullYear()} Fekra Ai Solutions. All rights reserved.
                      </p>
                  </div>
              </div>

              <div className="text-center flex flex-col items-center gap-3">
                  <div className="space-y-1.5 opacity-60">
                      <p className="text-[11px] sm:text-sm font-medium leading-relaxed max-w-3xl">
                        تواصل معنا بشكل مباشر إذا واجهت أي مشكلة، عندك فكرة لتطويرها، أو شاركنا اهتمامك للاستمرار ❤️
                      </p>
                  </div>
              </div>

              {/* Recruitment Footer Bar */}
              <div className="w-full mt-8 pt-10 border-t border-white/5 bg-black/10 rounded-[3rem] p-8 flex flex-col items-center gap-6 shadow-inner animate-in fade-in duration-1000">
                  <div className="space-y-3 text-center">
                      <p className="text-sm sm:text-base font-bold text-white/90 leading-relaxed max-w-3xl mx-auto">
                        مرحب بالتعاون مع أي شركة أو مشروع يحتاج لتطوير الفريق لديه في أدوات الذكاء الاصطناعي والتدريب. يجب حجز موعد للقاء.
                      </p>
                      <p className="text-sm sm:text-base font-medium italic text-white/50 leading-relaxed max-w-3xl mx-auto">
                        Open for collaboration with any company or project looking to empower their team with AI tools and training. Please book an appointment for a meeting.
                      </p>
                  </div>
                  <a 
                    href="https://wa.me/+201065414900" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-white text-black hover:bg-[var(--color-accent)] hover:text-white px-10 py-4 rounded-full transition-all shadow-2xl hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-sm"
                  >
                    <WhatsAppIcon />
                    <span>Contact Us</span>
                  </a>
              </div>
          </div>
        </footer>`;

const oldFooterRegex = /<footer[\s\S]*?<\/footer>/g;
content = content.replace(oldFooterRegex, newFooter);

fs.writeFileSync('App.tsx', content);
