# TASK: Build SIMAD Landing Page

## Project Context

Saya sedang mengembangkan:

**SIMAD — Sistem Informasi Manajemen Magang & Absensi Digital**

SIMAD adalah platform digital untuk mengelola proses magang, mulai dari pengajuan, verifikasi, onboarding, absensi, monitoring, hingga sertifikat.

Project menggunakan:

- Next.js
- React
- TypeScript
- Tailwind CSS
- GSAP
- Responsive Web / PWA
- Atomic Design + Domain-based Organisms
- `_container` sebagai orchestration layer

Saya sudah memiliki:

- PRD SIMAD
- `global.css`
- `themeConfig`
- Design tokens / theme
- Component architecture
- API architecture
- UI/UX Pro Max CLI sudah ter-install secara global:

```bash
npm install -g ui-ux-pro-max-cli

Gunakan skill/tool tersebut jika tersedia di environment/OmniRoute untuk membantu menghasilkan keputusan UI/UX yang lebih matang.

1. PRIMARY OBJECTIVE

Buat landing page SIMAD yang:

modern
profesional
credible
clean
human-designed
responsive
mobile-first
memiliki visual hierarchy yang kuat
tidak terlihat seperti website yang dihasilkan AI secara generik
tidak menggunakan template SaaS generik
tidak menggunakan terlalu banyak gradient
tidak menggunakan terlalu banyak glassmorphism
tidak menggunakan card berlebihan
tidak menggunakan floating blobs secara random
tidak menggunakan animasi berlebihan

Landing page harus terasa seperti produk digital institusional yang benar-benar digunakan, bukan landing page startup AI generik.

2. IMPORTANT: READ EXISTING PROJECT FIRST

Sebelum menulis atau mengubah code:

Baca PRD SIMAD yang tersedia di project.
Inspect struktur app/.
Inspect components/.
Inspect global.css.
Inspect themeConfig.
Inspect existing typography.
Inspect existing spacing.
Inspect existing color tokens.
Inspect existing reusable atoms.
Inspect existing organisms.
Inspect existing layout.
Inspect apakah GSAP sudah memiliki utility/helper.
Inspect apakah ada existing animation component.
Inspect routing yang sudah tersedia.

Jangan membuat ulang sesuatu yang sudah tersedia.

Jangan mengganti theme yang sudah dibuat.

Jangan membuat design token baru jika token existing sudah dapat digunakan.

3. SOURCE OF TRUTH

Gunakan PRD sebagai source of truth untuk:

value proposition
problem
goals
target user
role
feature
workflow
attendance
internship management
certificate
application
supervisor
HR/Admin

Jangan mengarang fitur yang tidak terdapat di PRD.

Jika suatu informasi tidak tersedia di PRD:

jangan membuat klaim faktual
gunakan copy yang netral
atau gunakan placeholder yang jelas
4. LANDING PAGE INFORMATION ARCHITECTURE

Landing page harus dibangun sebagai beberapa Section yang memiliki tujuan berbeda.

Recommended structure:

Landing Page
│
├── Navbar
│
├── Hero
│
├── Problem / Context
│
├── How SIMAD Works
│
├── Core Features
│
├── Attendance Experience
│
├── Internship Management
│
├── Role-based Experience
│
├── Digital Certificate
│
├── Benefits / Impact
│
├── CTA
│
└── Footer

Jangan membuat semua section menggunakan pola:

icon
title
description
card

Setiap section harus memiliki visual composition yang berbeda.

5. HERO SECTION

Hero harus menjadi bagian paling kuat dari landing page.

Jangan menggunakan hero template generik seperti:

Badge
Huge Gradient Heading
Paragraph
Two Buttons
Floating Dashboard Mockup

secara default.

Buat hero yang memiliki hubungan visual dengan produk SIMAD.

Hero harus menjelaskan:

What

SIMAD adalah sistem manajemen magang dan absensi digital.

Why

Mengubah proses magang manual menjadi proses digital yang lebih terstruktur dan terdokumentasi.

CTA

Gunakan CTA berdasarkan fitur/routing yang benar-benar tersedia.

Contoh:

Mulai Pengajuan
Pelajari SIMAD
Login

Jangan membuat CTA yang tidak memiliki destination nyata.

6. HERO VISUAL

Jika membutuhkan visual dashboard/device:

Jangan membuat dashboard mockup yang terlalu generik.

Visual harus menggambarkan konteks SIMAD:

internship
attendance
calendar
application
supervisor
certificate
activity

Gunakan existing component jika memungkinkan.

Jika perlu membuat visual baru:

buat sebagai reusable Organism, bukan JSX besar di Section.

7. PROBLEM SECTION

Jelaskan perubahan dari proses manual ke digital.

Gunakan konteks dari PRD.

Contoh konsep:

Sebelum SIMAD
- Dokumen fisik
- Verifikasi manual
- Absensi tidak terdokumentasi dengan baik
- Rekap manual
- Sertifikat dibuat satu per satu


Dengan SIMAD
- Pengajuan digital
- Verifikasi terpusat
- Absensi digital
- Monitoring
- Rekap data
- Sertifikat digital

Jangan membuat section berupa dua kolom card sederhana.

Buat visual storytelling:

Manual Process
       ↓
Digital Transformation
       ↓
SIMAD

Gunakan GSAP untuk memperkuat transisi visual tersebut.

8. HOW SIMAD WORKS

Tampilkan lifecycle magang:

Pengajuan
   ↓
Verifikasi
   ↓
Onboarding
   ↓
Penempatan
   ↓
Absensi
   ↓
Monitoring
   ↓
Selesai
   ↓
Sertifikat

Buat seperti journey/timeline.

Jangan menggunakan 8 card yang berjajar.

Gunakan:

horizontal timeline pada desktop
vertical timeline pada mobile

GSAP dapat digunakan untuk membuat progress timeline ketika user melakukan scroll.

9. CORE FEATURES

Tampilkan fitur utama SIMAD.

Namun jangan membuat:

6 Card Grid
6 Icon
6 Heading
6 Paragraph

karena pola tersebut terlalu generik.

Gunakan visual hierarchy.

Misalnya:

                    ┌─────────────────────┐
                    │                     │
                    │   Attendance        │
                    │                     │
                    └─────────────────────┘


┌───────────────┐                  ┌───────────────┐
│ Application   │                  │ Certificate   │
└───────────────┘                  └───────────────┘

atau composition lain yang lebih editorial.

Feature yang ditampilkan harus berdasarkan PRD.

10. ATTENDANCE SECTION

Absensi merupakan salah satu core value SIMAD.

Tampilkan konsep:

Check In
   ↓
Location Validation
   ↓
Attendance Recorded
   ↓
Monitoring
   ↓
Check Out

Visual dapat berupa:

calendar
attendance timeline
location indicator
check-in/check-out UI
status attendance

Gunakan animasi GSAP untuk:

timeline
status transition
number/count animation
scroll reveal

Jangan membuat animasi hanya untuk dekorasi.

Animasi harus menjelaskan konsep.

11. INTERNSHIP MANAGEMENT

Tampilkan bagaimana SIMAD mengelola lifecycle peserta magang.

Contoh visual:

Applicant
    ↓
HR Verification
    ↓
Approved
    ↓
Department Assignment
    ↓
Supervisor
    ↓
Internship

Gunakan visual yang menggambarkan relationship antar-role.

12. ROLE-BASED EXPERIENCE

Gunakan role yang terdapat pada PRD:

Intern
HR Admin
Supervisor

Jelaskan tanggung jawab masing-masing.

Namun jangan menggunakan tiga card identik.

Buat composition yang berbeda.

Misalnya:

             SIMAD
               │
       ┌───────┼───────┐
       ↓       ↓       ↓
     Intern    HR    Supervisor

Kemudian setiap role memiliki visual workflow masing-masing.

13. DIGITAL CERTIFICATE

Tampilkan bagaimana sertifikat menjadi bagian dari lifecycle magang.

Concept:

Internship Completed
        ↓
Requirements Verified
        ↓
Certificate Generated
        ↓
Digital Certificate

Visual harus terasa seperti actual document/certificate.

Jangan hanya membuat card:

🎓 Certificate
Download your certificate
14. BENEFITS / IMPACT

Jelaskan manfaat SIMAD berdasarkan PRD.

Gunakan beberapa metric/statement yang memang didukung oleh requirement.

Jangan mengarang angka seperti:

99.9% faster
80% more efficient
10x productivity

jika tidak terdapat data penelitian/measurement.

Gunakan qualitative value:

lebih terstruktur
lebih terdokumentasi
lebih mudah dipantau
mengurangi proses manual
memudahkan rekapitulasi
memudahkan pengelolaan peserta
15. CTA SECTION

CTA terakhir harus sederhana.

Jangan menggunakan:

Ready to transform your business?
Start your journey today!

karena terlalu generik.

Gunakan copy yang berhubungan langsung dengan SIMAD.

Contoh:

Kelola proses magang dalam satu sistem.


Mulai proses magang secara lebih terstruktur dengan SIMAD.

CTA harus sesuai dengan routing yang benar-benar tersedia.

16. NAVBAR

Navbar:

clean
compact
responsive
mobile-friendly

Desktop:

Logo | Tentang | Fitur | Cara Kerja | FAQ | Login

Mobile:

Logo                  Menu

Jangan membuat navbar terlalu tinggi.

Gunakan sticky/fixed hanya jika memang memberikan UX benefit.

17. RESPONSIVE DESIGN

Landing page harus mobile-first.

Prioritas:

Mobile
   ↓
Tablet
   ↓
Desktop

Jangan membuat desktop design terlebih dahulu lalu hanya mengecilkan layout.

Pastikan:

typography readable
CTA mudah disentuh
spacing tidak terlalu besar
horizontal overflow tidak terjadi
animation tidak mengganggu mobile
timeline berubah menjadi vertical
visual tidak keluar viewport
18. GSAP ANIMATION PRINCIPLES

Gunakan GSAP secara intentional.

Gunakan animasi untuk:

Entrance
fade
translate
scale
clip-path
Scroll

Gunakan:

ScrollTrigger

untuk section yang membutuhkan scroll-based storytelling.

Timeline

Gunakan progress animation untuk workflow SIMAD.

Numbers

Jika terdapat metric yang valid:

gunakan number counter.

Micro interaction

Gunakan animasi ringan:

hover
button
navigation
card interaction
19. DO NOT OVER-ANIMATE

Jangan:

setiap element memiliki animation
setiap section menggunakan parallax
setiap card floating
menggunakan infinite animation pada banyak element
menggunakan excessive blur
menggunakan excessive scale
menggunakan bouncing animation

Landing page harus terasa professional.

20. ACCESSIBILITY

Pastikan:

semantic HTML
proper heading hierarchy
button memiliki accessible label
image memiliki alt
keyboard navigation
focus state
sufficient contrast
reduced motion support

Respect:

prefers-reduced-motion

GSAP animation harus dapat dikurangi/nonaktif ketika user menggunakan reduced motion.

21. PERFORMANCE

Jangan membuat landing page berat hanya demi visual.

Hindari:

massive animation timeline
unnecessary dependencies
large image assets
continuous scroll listeners
expensive calculations setiap frame

Gunakan GSAP hanya ketika memberikan nilai visual/UX.

22. ANTI AI-SLOP RULES

Ini adalah bagian penting.

Landing page TIDAK BOLEH terlihat seperti hasil template AI.

Hindari kombinasi berikut secara berlebihan:

Gradient background
+
Glass card
+
Huge heading
+
Purple/blue glow
+
Floating blobs
+
3-column card grid
+
Sparkle icons
+
"AI-powered"

Hindari:

generic SaaS template
generic startup copy
excessive rounded cards
excessive shadows
excessive gradients
excessive glassmorphism
random decorative circles
random floating shapes
emoji sebagai visual utama
icon untuk setiap paragraph
section dengan struktur yang sama berulang kali
23. DESIGN DIRECTION

Gunakan existing:

global.css
themeConfig
CSS variables
design tokens

Jangan membuat theme baru.

Jangan override warna global secara sembarangan.

Gunakan:

bg-background
text-foreground
bg-primary
text-primary-foreground
border-border
text-muted-foreground

atau token yang memang tersedia di project.

24. UI/UX PRO MAX

Karena ui-ux-pro-max-cli sudah ter-install:

npm install -g ui-ux-pro-max-cli

gunakan tool/skill tersebut jika dapat diakses oleh environment OmniRoute.

Gunakan untuk membantu:

design direction
typography pairing
spacing
visual hierarchy
UX review
accessibility
responsive considerations
anti-pattern detection

Namun jangan blindly mengikuti output tool.

Output tool harus disesuaikan dengan:

SIMAD
+
existing theme
+
existing architecture
+
PRD

Prioritaskan konsistensi project daripada template recommendation.

25. FRONTEND ARCHITECTURE

SIMAD menggunakan:

Page
  ↓
_container
  ↓
Section
  ↓
Organism
  ↓
Atom

_container adalah orchestration layer.

Container bertanggung jawab terhadap:

API
state
mutation
handler
business interaction
loading
error
data orchestration

Section bertanggung jawab terhadap:

page composition
layout
composition antar-organism

Organism bertanggung jawab terhadap:

feature UI
domain UI
complex visual component

Atom bertanggung jawab terhadap:

primitive UI

Gunakan architecture existing dan jangan membuat architecture baru.

26. LANDING PAGE STRUCTURE

Recommended:

app/
└── (public)/
    └── page.tsx

Jika landing page membutuhkan orchestration:

app/
└── (public)/
    └── _container/
        └── LandingContainer.tsx

Components:

components/
├── atoms/
│
├── organisms/
│   └── landing/
│       ├── LandingHero.tsx
│       ├── LandingProblem.tsx
│       ├── LandingWorkflow.tsx
│       ├── LandingFeatures.tsx
│       ├── LandingAttendance.tsx
│       ├── LandingRoles.tsx
│       ├── LandingCertificate.tsx
│       ├── LandingBenefits.tsx
│       ├── LandingCTA.tsx
│       └── LandingFooter.tsx
│
└── page/
    └── landing/
        └── LandingSection.tsx

Sesuaikan nama dengan convention project jika sudah ada.

27. COMPONENT RULES

Jangan membuat component besar seperti:

function LandingSection() {
  // 800 lines JSX
}

Jangan membuat:

function LandingSection() {
  function Hero() {}
  function Features() {}
  function Workflow() {}
  function CTA() {}
}

Pisahkan menjadi Organism.

Section hanya melakukan composition.

Contoh:

export function LandingSection({
  state,
  actions,
}: LandingSectionProps) {
  return (
    <>
      <LandingHero
        state={state.hero}
        actions={actions.hero}
      />


      <LandingProblem />


      <LandingWorkflow
        state={state.workflow}
      />


      <LandingFeatures
        state={state.features}
      />


      <LandingAttendance />


      <LandingRoles />


      <LandingCertificate />


      <LandingBenefits />


      <LandingCTA
        actions={actions.cta}
      />
    </>
  );
}
28. PROPS-DRIVEN

Component tidak boleh mengambil data sendiri.

Hindari:

<LandingFeature />

jika component melakukan fetching.

Gunakan:

<LandingFeature
  value={feature}
  description={description}
/>

atau grouped props:

<LandingFeatures
  state={{
    features,
    isLoading,
  }}
/>
29. STATE

Jika landing page membutuhkan state yang mempengaruhi feature/page:

letakkan di _container.

Contoh:

const [activeRole, setActiveRole] = useState<Role>("intern");

Kemudian:

<LandingSection
  state={{
    activeRole,
  }}
  actions={{
    onRoleChange: setActiveRole,
  }}
/>

Jangan membuat orchestration state di Section.

Local UI state yang benar-benar internal boleh tetap berada di Organism sesuai architecture existing.

30. GSAP COMPONENT ARCHITECTURE

Jangan menaruh seluruh GSAP animation dalam satu file global.

Animation sebaiknya dekat dengan component yang menggunakannya.

Contoh:

organisms/
└── landing/
    ├── LandingHero.tsx
    ├── LandingHero.animation.ts
    ├── LandingWorkflow.tsx
    ├── LandingWorkflow.animation.ts
    └── ...

Namun jangan membuat animation file jika animation-nya hanya beberapa baris dan lebih readable inline.

Gunakan judgment.

31. IMPLEMENTATION PROCESS

Kerjakan secara bertahap.

Phase 1

Inspect:

PRD
global.css
themeConfig
existing components
existing layout
existing routing
Phase 2

Gunakan UI/UX Pro Max untuk melakukan design analysis.

Phase 3

Buat information architecture landing page.

Phase 4

Implement:

Navbar
Hero
Problem
Workflow
Features
Attendance
Roles
Certificate
Benefits
CTA
Footer
Phase 5

Implement GSAP animations.

Phase 6

Responsive refinement.

Phase 7

Accessibility refinement.

Phase 8

Performance review.

Phase 9

Visual review dan anti-AI-slop review.

32. FINAL QUALITY CHECK

Sebelum selesai, review:

Visual
 Tidak terlihat seperti template AI
 Tidak terlalu banyak card
 Tidak terlalu banyak gradient
 Tidak terlalu banyak glassmorphism
 Visual hierarchy jelas
 Typography konsisten
 Spacing konsisten
 Theme existing digunakan
UX
 User memahami SIMAD dalam 5–10 detik pertama
 User memahami masalah yang diselesaikan
 User memahami workflow
 User memahami fitur utama
 User memahami role
 CTA jelas
 Mobile UX baik
Technical
 TypeScript strict
 Tidak ada unnecessary any
 Tidak ada duplicate component
 Tidak ada API call di component presentation
 Tidak ada business logic di Section
 _container menangani orchestration
 Props digunakan untuk data flow
 GSAP digunakan secara intentional
 Reduced motion didukung
 Tidak ada console error
 Tidak ada hydration error
 Tidak ada horizontal overflow
 Tidak ada unnecessary dependency
33. IMPORTANT FINAL INSTRUCTION

Jangan langsung menulis seluruh landing page dalam satu langkah.

Pertama:

Inspect PRD.
Inspect existing frontend architecture.
Inspect theme.
Inspect existing components.
Inspect available UI/UX Pro Max capability.
Tentukan visual direction.
Tentukan section structure.
Baru implement.

Prioritas:

PRD
  ↓
Information Architecture
  ↓
UX
  ↓
Visual Design
  ↓
Component Architecture
  ↓
Implementation
  ↓
GSAP
  ↓
Responsive
  ↓
Accessibility
  ↓
Performance

Jangan mengorbankan readability code hanya demi visual.

Landing page harus terlihat unik karena information architecture, composition, typography, spacing, dan storytelling-nya, bukan karena menambahkan banyak efek visual.


Satu hal yang menurut saya penting untuk project Anda: **jangan minta agent "buat landing page yang keren"**. Prompt di atas sengaja memaksa alurnya dari **PRD → IA → UX → component architecture → implementasi**, sehingga hasilnya tidak sekadar kumpulan hero + card + gradient.

Dan ini tetap konsisten dengan arsitektur frontend SIMAD Anda: `_container` sebagai orchestration, Section sebagai composition, dan Organism sebagai domain/feature UI. :contentReference[oaicite:1]{index=1} Bahkan anti-pattern seperti API call di component dan component besar di Section memang sudah dilarang dalam architecture Anda. :contentReference[oaicite:2]{index=2}
```
