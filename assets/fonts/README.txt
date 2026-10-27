Vazir font: this archive does not contain the original Vazir binaries because a
verified binary download was not available in the build environment.
The site currently bundles NotoSansArabic-Regular.woff2 as an OFL-licensed,
fully local fallback. It already works offline and in Persian.

To use genuine local Vazir:
1) Download Vazir from its official source:
   https://www.jsdelivr.com/package/npm/vazir-font
   or https://github.com/rastikerdar/vazir-font/tree/v30.1.0/dist
2) Copy Vazir-Regular.woff2 and Vazir-Bold.woff2 into this folder.
3) Replace the first @font-face blocks in assets/css/site.css with:
   @font-face{font-family:'Vazir';src:url('/assets/fonts/Vazir-Regular.woff2') format('woff2');font-weight:400;font-display:swap}
   @font-face{font-family:'Vazir';src:url('/assets/fonts/Vazir-Bold.woff2') format('woff2');font-weight:700;font-display:swap}
   :root{--font:'Vazir',Tahoma,sans-serif}
4) Change the font preload in every HTML page to Vazir-Regular.woff2.

The included Noto fallback follows the SIL Open Font License; source:
https://github.com/notofonts/arabic
Avoid renaming a different font as Vazir; fonts must be genuine.
