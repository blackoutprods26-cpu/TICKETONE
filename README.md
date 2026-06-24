# 🎟 TicketOne — Guía de Configuración y Despliegue

Plataforma completa de gestión y distribución de entradas **gratuitas** para eventos.
Construida en HTML5, CSS3, JavaScript vanilla + Firebase (Auth, Firestore, Storage) + EmailJS.

---

## 📁 Estructura del proyecto

```
ticketone/
├── index.html                 → Home
├── eventos.html                → Listado de eventos con filtros
├── evento.html                 → Página individual de evento
├── reservar.html               → Formulario de reserva + entrada con QR
├── mis-entradas.html           → Buscador de entradas por email
├── 404.html
├── css/
│   ├── style.css               → Estilos generales (web pública)
│   └── admin.css                → Estilos del panel admin
├── js/
│   ├── firebase-config.js       → Configuración e inicialización Firebase
│   ├── utils.js                  → Utilidades (QR, PDF, toasts, fechas, auth...)
│   └── email.js                  → Envío de correos vía EmailJS
├── legal/
│   ├── privacidad.html
│   ├── terminos.html
│   └── cookies.html
├── admin/
│   ├── login.html               → Login de administrador
│   ├── index.html                → Dashboard
│   ├── eventos.html              → Gestión de eventos (CRUD)
│   ├── entradas.html             → Gestión de entradas
│   ├── scanner.html              → Control de acceso (QR)
│   └── estadisticas.html         → Estadísticas y registro de actividad
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json                → (opcional, si despliegas también en Firebase Hosting)
├── vercel.json
└── EMAILJS_TEMPLATE.html         → Plantilla HTML para EmailJS
```

---

## 1️⃣ Configuración de Firebase

El proyecto ya está configurado con las credenciales proporcionadas
(`ticketone-24122`). Sigue estos pasos en la [Consola de Firebase](https://console.firebase.google.com/):

### A. Activar Authentication

1. Ve a **Build → Authentication → Sign-in method**.
2. Activa el proveedor **Correo electrónico/contraseña** (Email/Password).
3. **No actives** el registro público — los usuarios no se registran, solo el administrador inicia sesión.

### B. Crear el usuario administrador (único)

1. Ve a **Authentication → Users → Add user**.
2. Introduce el **email** y **contraseña** que quieras usar para el panel admin.
3. Copia el **UID** generado para ese usuario (lo necesitas en el siguiente paso).

### C. Crear la base de datos Firestore

1. Ve a **Build → Firestore Database → Crear base de datos**.
2. Selecciona **modo producción** y la región más cercana (ej. `eur3 - europe-west`).
3. Una vez creada, ve a la pestaña **Reglas** y pega el contenido de `firestore.rules`.
4. Pulsa **Publicar**.

### D. Registrar al administrador en Firestore

Esto es **imprescindible** — sin este documento, el login de admin no funcionará aunque
el usuario exista en Authentication.

1. En Firestore, crea una colección llamada **`admins`**.
2. Crea un documento cuyo **ID del documento sea exactamente el UID** copiado en el paso B.
3. Añade estos campos al documento:

```
email: "tu_email@ejemplo.com"   (string)
role: "admin"                    (string)
createdAt: (timestamp actual)
```

✅ Con esto, al iniciar sesión en `/admin/login` con ese email/contraseña, el sistema
verificará que existe `admins/{UID}` y dará acceso al panel.

### E. Activar Storage

1. Ve a **Build → Storage → Comenzar**.
2. Usa el bucket por defecto (`ticketone-24122.firebasestorage.app`, ya configurado).
3. Ve a la pestaña **Reglas** y pega el contenido de `storage.rules`.
4. Pulsa **Publicar**.

> Esto permite que solo los administradores autenticados puedan subir imágenes de eventos,
> mientras que cualquier visitante puede verlas (lectura pública).

### F. Crear los índices compuestos de Firestore

La aplicación usa varias consultas combinadas (`where` + `orderBy`) que requieren índices
compuestos. Tienes dos opciones:

**Opción 1 — Automática (recomendada):**
Simplemente usa la web normalmente. Si Firestore necesita un índice que no existe,
la consola del navegador mostrará un error con un **enlace directo** para crear ese
índice con un clic. Haz esto la primera vez que cargues cada página.

**Opción 2 — Con Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase use ticketone-24122
firebase deploy --only firestore:indexes
```
Esto desplegará automáticamente todos los índices definidos en `firestore.indexes.json`.

---

## 2️⃣ Configuración de EmailJS

Las credenciales ya están integradas en `js/email.js`:
- Service ID: `service_uiug5ka`
- Template ID: `template_a3yctcf`
- Public Key: `3knvNMS4hnVW1wQm_1tFM`

### Pasos a seguir:

1. Entra en [dashboard.emailjs.com](https://dashboard.emailjs.com/).
2. Verifica que el **Service** `service_uiug5ka` está conectado a la cuenta de correo
   desde la que quieres enviar los emails (Gmail, Outlook, etc.).
3. Ve a **Email Templates** y abre (o crea) la plantilla con ID `template_a3yctcf`.
4. Abre el archivo **`EMAILJS_TEMPLATE.html`** incluido en este proyecto:
   - Copia el **asunto**: `Tu entrada para {{event_name}}`
   - Copia **todo el HTML** en el editor de código de la plantilla.
   - Asegúrate de que el campo **"To Email"** de la plantilla sea `{{to_email}}`.
5. Guarda la plantilla.
6. Haz una reserva de prueba en la web para confirmar que el correo llega correctamente
   (revisa también la carpeta de spam la primera vez).

> 💡 Si en el futuro quieres más fiabilidad, puedes migrar el envío a una Cloud Function
> con Nodemailer/SendGrid — la estructura del ticket (`ticketId`, QR generado vía URL,
> datos del evento) ya está preparada para ello.

---

## 3️⃣ Despliegue en Vercel

1. Sube este proyecto a un repositorio de GitHub/GitLab (o arrástralo directamente).
2. En [vercel.com](https://vercel.com), crea un **nuevo proyecto** e impórtalo.
3. **Framework Preset**: selecciona **"Other"** (proyecto estático, sin build).
4. **Root Directory**: la raíz del proyecto (donde está `index.html`).
5. No se necesita ningún *Build Command* ni *Output Directory* — Vercel servirá los
   archivos estáticos directamente gracias a `vercel.json`.
6. Pulsa **Deploy**.

Una vez desplegado, tu web estará disponible en `https://tu-proyecto.vercel.app`.

### ⚠️ Importante: Autorizar el dominio en Firebase

1. Ve a **Firebase Console → Authentication → Settings → Authorized domains**.
2. Añade el dominio que te ha dado Vercel (ej. `tu-proyecto.vercel.app`).
3. Si luego conectas un dominio propio, añádelo también aquí.

---

## 4️⃣ Primeros pasos tras el despliegue

1. Ve a `https://tu-dominio/admin/login` e inicia sesión con el usuario administrador
   creado en el paso 1B.
2. En **Eventos**, pulsa **"+ Nuevo evento"** y crea tu primer evento:
   - Sube una imagen (se almacena en Firebase Storage).
   - Completa nombre, descripción, fecha, hora, ubicación, categoría y aforo.
   - Activa **"Publicado"** para que sea visible en la web pública.
   - Activa **"Destacado"** si quieres que aparezca en el carrusel de portada.
3. Comparte el enlace del evento o visita `/eventos` para verlo en la web.
4. Haz una reserva de prueba desde la web pública con un email real para comprobar
   todo el flujo: reserva → email con QR → "Mis Entradas" → Control de Acceso.

---

## 5️⃣ Categorías disponibles

```
Música · Deportes · Teatro y Artes · Tecnología · Gastronomía · Cine · Infantil · Networking
```

Estas categorías están "hardcodeadas" en los `<select>` y filtros. Si quieres añadir o
quitar categorías, edítalas en:
- `eventos.html` (filtros laterales)
- `index.html` (chips de categoría)
- `admin/eventos.html` (`<select id="ev-category">`)
- archivos donde se usa `categoryEmoji()` (mapa de iconos por categoría)

---

## 6️⃣ Notas funcionales importantes

- **Sin pagos**: el sistema no incluye Stripe, PayPal, Bizum ni ningún campo de tarjeta.
  Todas las entradas son gratuitas por diseño.
- **Sin mapas**: no se usa Google Maps ni ninguna librería de mapas, según lo solicitado.
- **Anti-duplicados**: un mismo email no puede reservar dos veces para el mismo evento
  (se valida contra Firestore antes de crear la entrada).
- **Lista de espera**: cuando el aforo llega a 0, el botón cambia automáticamente a
  "Apuntarme a la lista de espera" (`status: "waiting"` en Firestore, no descuenta aforo).
- **Sin límite de entradas por persona**: cada persona puede reservar para tantos
  eventos distintos como quiera (solo se limita la duplicidad por evento).
- **Un único administrador**: el sistema está pensado para un solo usuario admin
  (colección `admins` con un único documento). Si en el futuro necesitas más
  administradores, simplemente añade más documentos a la colección `admins` con el
  UID correspondiente de cada usuario.
- **Modo oscuro/claro**: se guarda la preferencia en `localStorage` (`to_theme`).
- **PDF de entrada**: se genera en el navegador con `jsPDF`, incluyendo el QR.
- **Registro de actividad**: cada acción del admin (crear/editar/eliminar eventos,
  reenviar correos, cancelar entradas, validar accesos...) se guarda en la colección
  `activity_log`, visible en el Dashboard y en Estadísticas.

---

## 7️⃣ Estructura de datos en Firestore

### `events`
```json
{
  "title": "string",
  "description": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "string",
  "capacity": 500,
  "remaining": 500,
  "image": "https://...",
  "category": "Música",
  "published": true,
  "featured": false,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `tickets`
```json
{
  "ticketId": "TKT-XXXXXXXX",
  "eventId": "string",
  "eventName": "string",
  "eventDate": "YYYY-MM-DD",
  "eventTime": "HH:MM",
  "eventLocation": "string",
  "name": "string",
  "email": "string",
  "phone": "string | null",
  "status": "active | waiting | cancelled",
  "used": false,
  "usedAt": "timestamp | null",
  "createdAt": "timestamp"
}
```

### `admins`
```json
{
  "email": "string",
  "role": "admin",
  "createdAt": "timestamp"
}
```
> ID del documento = UID de Firebase Authentication.

### `activity_log`
```json
{
  "action": "create_event | edit_event | ... ",
  "details": "string descriptivo",
  "adminEmail": "string",
  "adminUid": "string",
  "timestamp": "timestamp"
}
```

---

## ✅ Checklist final antes de producción

- [ ] Authentication: Email/Password activado
- [ ] Usuario admin creado en Authentication
- [ ] Documento `admins/{UID}` creado en Firestore
- [ ] Reglas de Firestore publicadas (`firestore.rules`)
- [ ] Reglas de Storage publicadas (`storage.rules`)
- [ ] Índices de Firestore creados (CLI o automáticos)
- [ ] Plantilla de EmailJS configurada y probada
- [ ] Proyecto desplegado en Vercel
- [ ] Dominio de Vercel añadido a "Authorized domains" en Firebase
- [ ] Primer evento creado y publicado desde el panel admin
- [ ] Reserva de prueba completada (email + QR recibidos correctamente)

---

¡Listo! TicketOne está preparado para producción. 🎉
