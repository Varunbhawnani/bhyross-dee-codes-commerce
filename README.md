This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

This is the file and folder structure of the project:

## 📁 Project Folder Structure

```
bhyross-dee-codes-commerce-main/
├── .gitignore
├── .npmrc
├── README.md
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├──admin/
│   │   ├   ├── AdminBannerSection.tsx
│   │   ├   ├── ProductForm.tsx
│   │   ├   ├── ProductList.tsx
│   │   ├   ├── OverviewStats.tsx
│   │   ├   ├── OrdersTab.tsx
│   │   ├   ├── CustomersTab.tsx
│   │   ├   ├── SettingsTab.tsx
│   │   ├   └── DeleteConfirmModal.tsx
│   │   ├── Footer.tsx
│   │   ├── MultiImageUploader.tsx
│   │   ├── Navigation.tsx
│   │   ├── ProductImageGallery.tsx
│   │   ├── ProductImageManager.tsx
│   │   ├── BannerCarousel.tsx
│   │   ├── SearchDropdown.tsx
│   │   └── ui/
│   ├── contexts/
│   │   └── CartContext.tsx
│   │   └── SettingsContext.tsx
│   ├── hooks/
│   │   ├── useRazorpayCheckout.tsx
│   │   ├── useAnalytics.tsx
│   │   ├── useAdminStats.tsx
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAuth.tsx
│   │   ├── useCart.tsx
│   │   ├── useBannerImages.tsx
│   │   ├── useProductOperations.tsx
│   │   └── useProducts.tsx
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── OrderSuccessPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── BhyrossPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── DeeCodesPage.tsx
│   │   ├── HomePage.css
│   │   ├── HomePage.tsx
│   │   ├── Index.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NotFound.tsx
│   │   ├── ProductPage.tsx
│   │   ├── Real_Home.tsx
│   │   ├── Terms.tsx
│   │   ├── Privacy.tsx
│   │   ├── CollectionsPage.tsx 
│   │   ├── CraftsmanshipPage.tsx
│   │   └── SizeGuidePage.tsx
│   ├── styles/
│   │   └── brands.css
│   └── utils/
│   │   ├── utmTracking.ts
│   │   ├── facebookPixel.ts
│   │   ├── analytics.ts
│   │   ├── imageUpload.ts
│   │   └── webhookService.ts
└── supabase/
    ├── config.toml
    └── functions/
        ├── create-razorpay-order/
        │   └── index.ts
        └── verify-razorpay-payment/
            └── index.ts
