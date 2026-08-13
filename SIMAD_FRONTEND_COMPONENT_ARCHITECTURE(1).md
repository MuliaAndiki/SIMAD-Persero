# SIMAD Frontend Component Architecture

## 1. Architecture Overview

SIMAD menggunakan kombinasi:

- Atomic Design
- Feature/Domain-based Organisms
- Page Composition
- Orchestration Layer melalui `_container`
- Props-driven Data Flow

Alur utama:

```text
Page
  ↓
_Container
  ↓
Page Section
  ↓
Organisms
  ↓
Atoms
```

Prinsip utama:

> `_container` mengatur logic dan data, `Section` menyusun halaman, `Organisms` menangani UI feature/domain, dan `Atoms` menyediakan UI primitive yang reusable.

---

## 2. Struktur Folder

Struktur utama yang digunakan:

```text
components/
├── atoms/
├── organisms/
│   ├── application/
│   ├── attendance/
│   ├── dashboard/
│   ├── department/
│   ├── form/
│   ├── institution/
│   ├── notification/
│   ├── office/
│   ├── supervisor/
│   └── ...
├── page/
│   ├── application/
│   ├── attendance/
│   ├── auth/
│   ├── dashboard/
│   ├── hr/
│   ├── intern/
│   ├── profile/
│   └── supervisor/
├── pwa/
└── wrapper/
```

Untuk route yang memiliki logic dan orchestration:

```text
app/
└── (private)/
    └── hr/
        └── departments/
            ├── page.tsx
            └── _container/
                └── DepartmentsContainer.tsx
```

---

# 3. Layer Architecture

## 3.1 `_container` — Orchestration Layer

`_container` adalah pusat orchestration untuk sebuah halaman/feature.

### Tanggung jawab

Container bertanggung jawab terhadap:

- API request
- API mutation
- Server state
- UI state yang berhubungan dengan feature
- Event handler
- Loading state
- Error state
- Pagination
- Filtering
- Sorting
- Modal/dialog state
- Business interaction
- Menghubungkan API dengan Section
- Mengorkestrasi component

### Contoh

```tsx
export function DepartmentsContainer() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (department: DepartmentResponse) => {
    // orchestration
  };

  const handleDelete = async (department: DepartmentResponse) => {
    // API mutation
  };

  return (
    <DepartmentsSection
      departments={departments}
      isSaving={isSaving}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
```

### Container tidak boleh

Container tidak boleh menjadi tempat:

- JSX UI yang kompleks
- Detail styling
- Definisi component besar
- Component inline yang panjang

---

# 4. `page/*Section` — Page Composition Layer

Section merupakan composition layer untuk sebuah halaman.

Contoh:

```text
components/page/hr/DepartmentsSection.tsx
```

### Tanggung jawab

Section bertanggung jawab terhadap:

- Composition
- Layout halaman
- Menghubungkan beberapa Organism
- Menerima props dari Container
- Meneruskan props ke Organism
- Menentukan susunan visual feature

### Section tidak boleh

Section tidak boleh:

- Melakukan API request
- Mengakses service/API secara langsung
- Mengandung business logic kompleks
- Mendefinisikan component besar secara inline
- Menyimpan logic API
- Menjadi tempat semua UI component ditulis dalam satu file

### Contoh yang benar

```tsx
export function DepartmentsSection({
  departments,
  statistics,
  onCreate,
  onEdit,
  onDelete,
}: DepartmentsSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <DepartmentCard {...statistics} />

      <DepartmentTable data={departments} onEdit={onEdit} onDelete={onDelete} />

      <DepartmentForm onSubmit={onCreate} />
    </div>
  );
}
```

Section hanya melakukan composition.

---

# 5. `organisms` — Feature / Domain Components

Organisms merupakan component yang memiliki tanggung jawab UI yang lebih besar dan biasanya berhubungan dengan domain tertentu.

Organisms dikelompokkan berdasarkan domain/feature.

Contoh:

```text
organisms/
├── application/
├── attendance/
├── dashboard/
├── department/
├── institution/
├── notification/
└── supervisor/
```

Contoh component:

```text
organisms/department/
├── DepartmentCard.tsx
├── DepartmentTable.tsx
├── DepartmentForm.tsx
└── DepartmentDeleteDialog.tsx
```

### Tanggung jawab

Organism:

- Menerima data melalui props
- Menampilkan UI feature
- Menangani local UI state jika diperlukan
- Menangani interaksi lokal
- Menggunakan Atomic Components
- Mengirim event ke parent melalui callback props

### Organism tidak boleh

Organism tidak boleh:

- Mengambil data dari API secara langsung
- Mengetahui endpoint API
- Memanggil service API
- Mengandung orchestration halaman
- Mengambil business state global tanpa alasan yang jelas

---

# 6. `atoms` — UI Primitive

Atoms adalah component UI yang reusable dan tidak bergantung pada domain bisnis SIMAD.

Contoh:

```text
atoms/
├── button.tsx
├── input.tsx
├── badge.tsx
├── card.tsx
├── dialog.tsx
├── select.tsx
├── calendar.tsx
├── skeleton.tsx
└── ...
```

Atoms harus bersifat generic.

Contoh:

```tsx
<Button />
<Input />
<Badge />
<Dialog />
<Select />
<Card />
```

Atoms tidak boleh mengetahui:

- Intern
- HR
- Supervisor
- Department
- Application
- Attendance
- API endpoint
- Business rule SIMAD

---

# 7. Domain-Specific Components

Component yang sudah mengetahui domain SIMAD tidak sebaiknya ditempatkan di `atoms`.

Contoh:

```text
ApplicationBadge
AttendanceStatusBadge
InstitutionCombobox
```

Component seperti ini sudah memiliki pengetahuan domain.

Hindari:

```text
atoms/
├── ApplicationBadge.tsx
├── AttendanceStatusBadge.tsx
└── InstitutionCombobox.tsx
```

Lebih tepat:

```text
organisms/
├── application/
│   └── ApplicationBadge.tsx
│
├── attendance/
│   └── AttendanceStatusBadge.tsx
│
└── institution/
    └── InstitutionCombobox.tsx
```

Jika suatu saat project membutuhkan layer `molecules`, component sederhana yang domain-specific dapat ditempatkan di sana. Namun `molecules` tidak wajib dibuat hanya untuk mengikuti istilah Atomic Design.

---

# 8. Props-Driven Data Flow

Data harus mengalir dari Container ke bawah melalui props.

```text
API
 ↓
Container
 ↓ props
Section
 ↓ props
Organism
 ↓ props
Atom
```

Contoh:

```tsx
<DepartmentCard
  total={statistics.total}
  active={statistics.active}
  inactive={statistics.inactive}
/>
```

Interface:

```tsx
export interface DepartmentCardProps {
  total: number;
  active: number;
  inactive: number;
}
```

Component:

```tsx
export function DepartmentCard({
  total,
  active,
  inactive,
}: DepartmentCardProps) {
  return (
    // presentation
  );
}
```

Component tidak melakukan fetch data sendiri.

---

# 9. Props sebagai Contract

Setiap component yang memiliki props kompleks harus memiliki interface yang jelas.

Hindari:

```tsx
function DepartmentCard({
  total,
  active,
  inactive,
}: {
  total: number;
  active: number;
  inactive: number;
}) {}
```

Gunakan:

```tsx
export interface DepartmentCardProps {
  total: number;
  active: number;
  inactive: number;
}

export function DepartmentCard({
  total,
  active,
  inactive,
}: DepartmentCardProps) {}
```

Untuk component kompleks, type dapat dipisahkan:

```text
department-form/
├── DepartmentForm.tsx
├── DepartmentForm.types.ts
└── DepartmentForm.schema.ts
```

Tidak perlu membuat file type terpisah untuk component yang sangat sederhana jika justru membuat struktur menjadi terlalu verbose.

---

# 10. Event Flow

Event bergerak ke atas menggunakan callback props.

```text
Atom
  │
  │ onClick
  ▼
Organism
  │
  │ onEdit
  ▼
Section
  │
  │ onEdit
  ▼
Container
  │
  ▼
API
```

Contoh:

```tsx
<DepartmentTable
  data={departments}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

Container yang menentukan apa yang terjadi ketika event tersebut dipanggil.

---

# 11. Form Architecture

Form merupakan salah satu component yang paling sering menjadi terlalu besar.

Jangan menulis form 100–300 baris langsung di Section.

Hindari:

```tsx
function DepartmentsSection() {
  function DepartmentFormDialog() {
    // banyak state
    // banyak handler
    // banyak JSX
  }

  function DepartmentTable() {
    // ...
  }

  return (
    // ...
  );
}
```

Gunakan:

```text
components/
├── organisms/
│   └── department/
│       ├── DepartmentCard.tsx
│       ├── DepartmentTable.tsx
│       ├── DepartmentForm.tsx
│       └── DepartmentDeleteDialog.tsx
│
└── page/
    └── hr/
        └── DepartmentsSection.tsx
```

Section kemudian hanya melakukan composition:

```tsx
export function DepartmentsSection({
  departments,
  form,
  onEdit,
  onDelete,
  onSave,
}: DepartmentsSectionProps) {
  return (
    <>
      <DepartmentTable data={departments} onEdit={onEdit} onDelete={onDelete} />

      <DepartmentForm {...form} onSave={onSave} />
    </>
  );
}
```

---

# 12. Local State vs Orchestration State

Tidak semua state harus berada di Container.

## Local UI State

Boleh berada di Organism jika hanya berhubungan dengan UI lokal.

Contoh:

```text
- dropdown open/close
- accordion open/close
- password visibility
- tab aktif
- input draft
```

## Orchestration State

Harus berada di Container jika mempengaruhi feature/page.

Contoh:

```text
- data dari API
- loading API
- mutation state
- selected department
- modal edit department
- pagination
- filter
- sorting
- error API
```

Prinsip:

> State yang hanya dibutuhkan component tetap lokal. State yang mengatur interaksi antar-component berada di Container.

---

# 13. Tidak Perlu Memaksakan Atomic Design Secara Kaku

SIMAD menggunakan Atomic Design sebagai prinsip organisasi component, bukan sebagai aturan bahwa semua component harus dipaksa masuk ke:

```text
Atom
Molecule
Organism
Template
Page
```

Hindari struktur berlebihan seperti:

```text
components/
├── atoms/
├── molecules/
├── organisms/
├── templates/
├── features/
└── pages/
```

jika layer tersebut tidak memberikan manfaat nyata.

Untuk SIMAD cukup gunakan:

```text
atoms
organisms
page
_container
```

Dengan tambahan domain grouping pada Organisms.

---

# 14. Contoh Struktur Feature Department

Struktur yang direkomendasikan:

```text
app/
└── (private)/
    └── hr/
        └── departments/
            ├── page.tsx
            └── _container/
                └── DepartmentsContainer.tsx

components/
├── atoms/
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
│
├── organisms/
│   └── department/
│       ├── DepartmentCard.tsx
│       ├── DepartmentTable.tsx
│       ├── DepartmentForm.tsx
│       └── DepartmentDeleteDialog.tsx
│
└── page/
    └── hr/
        └── DepartmentsSection.tsx
```

Flow:

```text
DepartmentsContainer
        │
        │ data + handlers
        ▼
DepartmentsSection
        │
        ├── DepartmentCard
        ├── DepartmentTable
        ├── DepartmentForm
        └── DepartmentDeleteDialog
                    │
                    ▼
                  Atoms
```

---

# 15. Naming Convention

Gunakan PascalCase untuk component React:

```text
DepartmentCard.tsx
DepartmentTable.tsx
DepartmentForm.tsx
DepartmentDeleteDialog.tsx
DepartmentsSection.tsx
DepartmentsContainer.tsx
```

Gunakan nama yang menunjukkan domain dan fungsi.

Hindari nama terlalu generik:

```text
Card1.tsx
CustomCard.tsx
DataComponent.tsx
SectionComponent.tsx
FormComponent.tsx
```

Lebih baik:

```text
DepartmentCard.tsx
InternAttendanceCard.tsx
ApplicationStatusBadge.tsx
SupervisorAttendanceTable.tsx
```

---

# 16. Index / Barrel Export

Untuk domain yang memiliki banyak Organism, gunakan barrel export jika membantu keterbacaan import.

Contoh:

```text
organisms/
└── department/
    ├── DepartmentCard.tsx
    ├── DepartmentTable.tsx
    ├── DepartmentForm.tsx
    ├── DepartmentDeleteDialog.tsx
    └── index.ts
```

`index.ts`:

```tsx
export { DepartmentCard } from "./DepartmentCard";
export { DepartmentTable } from "./DepartmentTable";
export { DepartmentForm } from "./DepartmentForm";
export { DepartmentDeleteDialog } from "./DepartmentDeleteDialog";
```

Kemudian:

```tsx
import {
  DepartmentCard,
  DepartmentTable,
  DepartmentForm,
  DepartmentDeleteDialog,
} from "@/components/organisms/department";
```

Gunakan barrel export secara selektif. Tidak perlu membuat `index.ts` di setiap folder jika tidak memberikan manfaat.

---

# 17. Anti-Pattern

## Component melakukan API

```tsx
function DepartmentTable() {
  const departments = await Api.Department.getAll();
}
```

Tidak diperbolehkan.

Gunakan:

```text
Container → API
Container → Section → DepartmentTable
```

---

## Section memiliki component besar

```tsx
function DepartmentsSection() {
  function DepartmentFormDialog() {
    // 200 lines
  }

  function DepartmentTable() {
    // 300 lines
  }
}
```

Tidak diperbolehkan.

Pisahkan menjadi Organism.

---

## Atom mengetahui domain

```tsx
<AttendanceStatusBadge />
```

Jika component berada di `atoms`, berarti atom sudah mengetahui domain attendance.

Pindahkan ke domain component.

---

## Props mengambil data sendiri

Hindari:

```tsx
<DepartmentCard />
```

jika component kemudian melakukan fetch.

Gunakan:

```tsx
<DepartmentCard total={total} active={active} inactive={inactive} />
```

---

# 18. Final Architecture

Arsitektur frontend SIMAD:

```text
                         ┌─────────────┐
                         │     API     │
                         └──────┬──────┘
                                │
                                ▼
                     ┌──────────────────┐
                     │    _container    │
                     │                  │
                     │ API             │
                     │ State           │
                     │ Mutation        │
                     │ Handler         │
                     │ Orchestration   │
                     └────────┬─────────┘
                              │
                              │ props
                              ▼
                     ┌──────────────────┐
                     │      Section     │
                     │                  │
                     │ Page Composition │
                     └────────┬─────────┘
                              │
                              │ props
                              ▼
                     ┌──────────────────┐
                     │    Organisms     │
                     │                  │
                     │ Domain UI        │
                     │ Local UI State   │
                     └────────┬─────────┘
                              │
                              │ props
                              ▼
                     ┌──────────────────┐
                     │      Atoms       │
                     │                  │
                     │ UI Primitive     │
                     └──────────────────┘
```

## Core Principles

1. **Container owns orchestration.**
2. **Section owns page composition.**
3. **Organism owns domain-level UI.**
4. **Atom owns generic UI primitive.**
5. **Data flows downward through props.**
6. **Events flow upward through callbacks.**
7. **API access hanya melalui Container/orchestration layer.**
8. **Section tidak boleh menjadi tempat component besar.**
9. **Domain-specific component tidak ditempatkan di Atom.**
10. **Atomic Design tidak dipaksakan secara kaku jika menambah kompleksitas.**
11. **Gunakan domain grouping untuk Organisms.**
12. **Local UI state boleh berada di component jika tidak membutuhkan orchestration.**

---

# 19. State Management Architecture

## Core Principle

Feature state hanya boleh dimiliki oleh `_container`.

`Section`, `Organism`, `Card`, dan `Atom` tidak boleh memiliki feature state.

Alur state:

```text
_container
│
├── State
├── API
├── Mutation
├── Handler
│
│ state + actions
▼
Section
│
│ props
▼
Organism
│
│ props
▼
Card / Atom
```

Prinsip utama:

> `_container` adalah owner dari state dan orchestration. Semua layer di bawahnya menerima data dan action melalui props.

---

## 19.1 `_container` sebagai State Owner

Semua state yang berhubungan dengan feature harus didefinisikan di `_container`.

Contoh:

```tsx
const [formLogin, setFormLogin] = useState<LoginBody>({
  email: "",
  password: "",
});

const [showPassword, setShowPassword] = useState(false);
```

Container juga menangani mutation:

```tsx
const login = useLogin();
```

Kemudian state dan action dikirim ke Section:

```tsx
<LoginSection
  state={{
    formLogin,
    showPassword,
    isPending: login.isPending,
  }}
  actions={{
    onChange: handleChange,
    onSubmit: handleSubmit,
    onTogglePassword: handleTogglePassword,
  }}
/>
```

---

## 19.2 Grouped Props

Untuk menghindari terlalu banyak props pada component, gunakan grouped props.

Gunakan:

```tsx
<LoginSection
  state={{
    formLogin,
    showPassword,
    isPending: login.isPending,
  }}
  actions={{
    onChange: handleChange,
    onSubmit: handleSubmit,
    onTogglePassword: handleTogglePassword,
  }}
/>
```

Daripada:

```tsx
<LoginSection
  formLogin={formLogin}
  showPassword={showPassword}
  isPending={login.isPending}
  onChange={handleChange}
  onSubmit={handleSubmit}
  onTogglePassword={handleTogglePassword}
/>
```

### State Group

`state` digunakan untuk seluruh data yang dibutuhkan component.

Contoh:

```tsx
state={{
  data,
  isLoading,
  isPending,
  isOpen,
}}
```

### Actions Group

`actions` digunakan untuk seluruh callback/event handler.

Contoh:

```tsx
actions={{
  onSubmit,
  onClose,
  onEdit,
  onDelete,
}}
```

Pattern ini membuat interface component lebih mudah dibaca dan lebih scalable ketika feature berkembang.

---

## 19.3 State Interface

Gunakan interface khusus untuk grouped state dan actions.

Contoh:

```tsx
export interface LoginSectionState {
  formLogin: LoginBody;
  showPassword: boolean;
  isPending: boolean;
}

export interface LoginSectionActions {
  onChange: (field: keyof LoginBody, value: string) => void;

  onSubmit: () => Promise<void>;

  onTogglePassword: () => void;
}

export interface LoginSectionProps {
  state: LoginSectionState;
  actions: LoginSectionActions;
}
```

Kemudian:

```tsx
export function LoginSection({ state, actions }: LoginSectionProps) {
  return <LoginForm state={state} actions={actions} />;
}
```

---

## 19.4 Object State untuk Form

Jika beberapa state memiliki hubungan yang sama, gunakan object state.

Gunakan:

```tsx
const [formLogin, setFormLogin] = useState<LoginBody>({
  email: "",
  password: "",
});
```

Daripada:

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

Object state membuat state form lebih mudah dikirim sebagai satu unit.

```tsx
state={{
  formLogin,
}}
```

---

## 19.5 Generic Form Handler

Gunakan generic handler untuk update field pada object state.

```tsx
const handleChange = (field: keyof LoginBody, value: string) => {
  setFormLogin((current) => ({
    ...current,
    [field]: value,
  }));
};
```

Kemudian component:

```tsx
<Input
  value={state.formLogin.email}
  onChange={(event) => actions.onChange("email", event.target.value)}
/>
```

Dan:

```tsx
<Input
  type={state.showPassword ? "text" : "password"}
  value={state.formLogin.password}
  onChange={(event) => actions.onChange("password", event.target.value)}
/>
```

---

## 19.6 Section Tidak Boleh Memiliki Feature State

Tidak diperbolehkan:

```tsx
function LoginSection() {
  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });

  // ...
}
```

Section hanya menerima state:

```tsx
export function LoginSection({ state, actions }: LoginSectionProps) {
  // composition only
}
```

Section bertugas sebagai **page composition layer**, bukan state owner.

---

## 19.7 Organism Tidak Boleh Memiliki Feature State

Tidak diperbolehkan:

```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ...
}
```

Gunakan:

```tsx
function LoginForm({ state, actions }: LoginFormProps) {
  // presentation + event binding
}
```

Organism boleh membaca state melalui props, tetapi tidak memiliki ownership terhadap feature state.

---

## 19.8 Card Tidak Boleh Memiliki Feature State

Card harus bersifat presentation-oriented.

Tidak diperbolehkan:

```tsx
function DepartmentCard() {
  const [department, setDepartment] = useState(null);

  // ...
}
```

Gunakan:

```tsx
<DepartmentCard value={statistics.total} label="Total Departemen" />
```

Dengan interface:

```tsx
export interface DepartmentCardProps {
  value: number;
  label: string;
}
```

Card hanya menerima data yang diperlukan untuk rendering.

---

## 19.9 Atom Tidak Boleh Memiliki Feature State

Atom tidak boleh mengetahui business state SIMAD.

Contoh:

```tsx
<Button />
<Input />
<Badge />
<Dialog />
<Select />
```

Atom hanya bertanggung jawab terhadap primitive UI.

Business state seperti:

```text
isSaving
isPending
applicationStatus
attendanceStatus
selectedIntern
selectedDepartment
```

tidak boleh diambil atau dikelola oleh Atom.

---

## 19.10 State Ownership Rule

Gunakan aturan berikut:

| State                      | Owner        |
| -------------------------- | ------------ |
| API data                   | `_container` |
| API loading                | `_container` |
| API error                  | `_container` |
| Mutation state             | `_container` |
| Form state                 | `_container` |
| Modal/dialog feature state | `_container` |
| Pagination                 | `_container` |
| Filtering                  | `_container` |
| Sorting                    | `_container` |
| Selected data              | `_container` |
| Feature-level tabs         | `_container` |
| Business interaction state | `_container` |
| Feature event handler      | `_container` |

---

## 19.11 Local UI State Exception

State lokal hanya diperbolehkan jika benar-benar bersifat internal dan tidak mempengaruhi orchestration feature.

Contoh yang dapat dipertimbangkan:

```text
- primitive accessibility state
- animation state
- internal UI interaction
- uncontrolled primitive behavior
```

Namun default architecture SIMAD adalah:

> Jika state berhubungan dengan feature, page, API, form, modal, filtering, pagination, mutation, atau business interaction, state harus berada di `_container`.

Jangan memindahkan state ke component hanya karena component tersebut membutuhkan state tersebut.

---

## 19.12 Data Flow

Data selalu mengalir ke bawah:

```text
API
 ↓
_container
 ↓
state
 ↓
Section
 ↓
Organism
 ↓
Card / Atom
```

Event mengalir ke atas melalui callback:

```text
Atom
 ↓ onClick / onChange
Organism
 ↓ callback
Section
 ↓ callback
_container
 ↓
API / mutation
```

Contoh:

```tsx
<DepartmentTable
  state={{
    data: departments,
    isLoading,
  }}
  actions={{
    onEdit: handleEdit,
    onDelete: handleDelete,
  }}
/>
```

---

## 19.13 Complete Example

### Container

```tsx
export function LoginContainer() {
  const [formLogin, setFormLogin] = useState<LoginBody>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const login = useLogin();

  const handleChange = (field: keyof LoginBody, value: string) => {
    setFormLogin((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword((current) => !current);
  };

  const handleSubmit = async () => {
    await login.mutateAsync(formLogin);
  };

  return (
    <LoginSection
      state={{
        formLogin,
        showPassword,
        isPending: login.isPending,
      }}
      actions={{
        onChange: handleChange,
        onSubmit: handleSubmit,
        onTogglePassword: handleTogglePassword,
      }}
    />
  );
}
```

### Section

```tsx
export function LoginSection({ state, actions }: LoginSectionProps) {
  return <LoginForm state={state} actions={actions} />;
}
```

### Organism

```tsx
export function LoginForm({ state, actions }: LoginFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        actions.onSubmit();
      }}
    >
      <Input
        value={state.formLogin.email}
        onChange={(event) => actions.onChange("email", event.target.value)}
      />

      <Input
        type={state.showPassword ? "text" : "password"}
        value={state.formLogin.password}
        onChange={(event) => actions.onChange("password", event.target.value)}
      />

      <Button type="submit" disabled={state.isPending}>
        Login
      </Button>
    </form>
  );
}
```

Tidak ada state di Section maupun Organism.

---

## 19.14 Final State Architecture

```text
                         ┌───────────────┐
                         │      API      │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │     _container       │
                    │                      │
                    │ State                │
                    │ API                  │
                    │ Mutation             │
                    │ Handler              │
                    │ Orchestration        │
                    └──────────┬───────────┘
                               │
                         state + actions
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Section        │
                    │                      │
                    │ Composition only     │
                    └──────────┬───────────┘
                               │
                               │ props
                               ▼
                    ┌──────────────────────┐
                    │      Organism        │
                    │                      │
                    │ Presentation         │
                    │ Event binding        │
                    └──────────┬───────────┘
                               │
                               │ props
                               ▼
                    ┌──────────────────────┐
                    │    Card / Atom       │
                    │                      │
                    │ UI / Presentation    │
                    └──────────────────────┘
```

### Final Rules

1. `_container` adalah **single owner** untuk feature state.
2. `Section` tidak boleh membuat feature state.
3. `Organism` tidak boleh membuat feature state.
4. `Card` tidak boleh membuat feature state.
5. `Atom` tidak boleh membuat business/feature state.
6. Gunakan `state` untuk mengelompokkan data/state props.
7. Gunakan `actions` untuk mengelompokkan callback/event props.
8. Gunakan object state untuk state yang memiliki hubungan yang sama, terutama form.
9. API dan mutation hanya di orchestration layer.
10. Data mengalir ke bawah melalui props.
11. Event mengalir ke atas melalui callback.
12. Local UI state hanya menjadi exception untuk behavior yang benar-benar internal dan tidak mempengaruhi feature orchestration.
