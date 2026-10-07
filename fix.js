const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Fix the InteractiveLogo a tag replacement
content = content.replace(
  '<div className="flex flex-col items-center justify-center">\n                  <img',
  '<a href="https://linktr.ee/mahmoudredaph" target="_blank" rel="noopener noreferrer">\n                  <img'
);

content = content.replace(
  'transition-opacity"\n                  />\n              </div>\n          </div>',
  'transition-opacity"\n                  />\n              </a>\n          </div>'
);

// Fix other </div> back to </a> where appropriate.
// Line 751: pricing a tag
content = content.replace(
  'className="block w-full mt-20 hover:opacity-95 transition-opacity group"\n        >\n          <img \n            src="https://i.ibb.co/HLjDpNbF/1.png" \n            alt="Fekra ai Pricing" \n            className="w-full h-auto rounded-[1.5rem] shadow-xl border border-white/10 group-hover:scale-[1.005] transition-transform duration-300"\n          />\n        </div>',
  'className="block w-full mt-20 hover:opacity-95 transition-opacity group"\n        >\n          <img \n            src="https://i.ibb.co/HLjDpNbF/1.png" \n            alt="Fekra ai Pricing" \n            className="w-full h-auto rounded-[1.5rem] shadow-xl border border-white/10 group-hover:scale-[1.005] transition-transform duration-300"\n          />\n        </a>'
);

// Line 771: linkedin/whatsapp/google buttons
content = content.replace(
  '<span className="text-sm font-bold">لمتابعة كل جديد تابع لينكد إن</span>\n                      </div>',
  '<span className="text-sm font-bold">لمتابعة كل جديد تابع لينكد إن</span>\n                      </a>'
);
content = content.replace(
  '<span className="text-sm font-bold">جروب الواتس ودخول مجتمع جينتا</span>\n                      </div>',
  '<span className="text-sm font-bold">جروب الواتس ودخول مجتمع جينتا</span>\n                      </a>'
);
content = content.replace(
  '<span className="text-base font-black">اضغط هنا للتواصل</span>\n                          </div>',
  '<span className="text-base font-black">اضغط هنا للتواصل</span>\n                          </a>'
);
content = content.replace(
  '<span className="text-sm font-bold text-white/80 group-hover:text-white">قيم الأداة على جوجل</span>\n                      </div>',
  '<span className="text-sm font-bold text-white/80 group-hover:text-white">قيم الأداة على جوجل</span>\n                      </a>'
);
content = content.replace(
  '<img src="https://i.ibb.co/ccBHkDKH/b9c99d1b-58d1-460b-80cf-5e58fa2f16ac-rwc-4x0x705x400x4096-Copy.png" alt="Developer Logo" className="h-16 object-contain" />\n                      </div>',
  '<img src="https://i.ibb.co/ccBHkDKH/b9c99d1b-58d1-460b-80cf-5e58fa2f16ac-rwc-4x0x705x400x4096-Copy.png" alt="Developer Logo" className="h-16 object-contain" />\n                      </a>'
);
content = content.replace(
  '<WhatsAppIcon />\n                    <span>Hire / Contact Me</span>\n                  </div>',
  '<WhatsAppIcon />\n                    <span>Hire / Contact Me</span>\n                  </a>'
);

fs.writeFileSync('App.tsx', content);
