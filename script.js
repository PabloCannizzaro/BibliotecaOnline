const apiBase = "/api";
const coverAssets = [
  "assets/covers/cover-1.svg",
  "assets/covers/cover-2.svg",
  "assets/covers/cover-3.svg",
  "assets/covers/cover-4.svg",
  "assets/covers/cover-5.svg",
  "assets/covers/cover-6.svg"
];

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const homeSection = document.getElementById("homeSection");
const categorySection = document.getElementById("categorySection");
const catalogSection = document.getElementById("catalogSection");
const recommendedSection = document.getElementById("recommendedSection");
const userNavLink = document.getElementById("userNavLink");
const adminNavLink = document.getElementById("adminNavLink");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");
const alertBanner = document.getElementById("alertBanner");
const categoryGrid = document.getElementById("categoryGrid");
const booksGrid = document.getElementById("booksGrid");
const recommendedList = document.getElementById("recommendedList");
const bookDetailSection = document.getElementById("bookDetailSection");
const detailCover = document.getElementById("detailCover");
const detailBookTitle = document.getElementById("detailBookTitle");
const detailDescription = document.getElementById("detailDescription");
const detailAuthors = document.getElementById("detailAuthors");
const detailCategories = document.getElementById("detailCategories");
const detailPublisher = document.getElementById("detailPublisher");
const detailAvailability = document.getElementById("detailAvailability");
const detailPurchasePrice = document.getElementById("detailPurchasePrice");
const detailRentalPrice = document.getElementById("detailRentalPrice");
const btnBuy = document.getElementById("btnBuy");
const btnRent = document.getElementById("btnRent");
const closeDetail = document.getElementById("closeDetail");
const userSection = document.getElementById("userSection");
const userProfileSummary = document.getElementById("userProfileSummary");
const userPurchases = document.getElementById("userPurchases");
const userLoans = document.getElementById("userLoans");
const userHistory = document.getElementById("userHistory");
const adminSection = document.getElementById("adminSection");
const adminStatsGrid = document.getElementById("adminStatsGrid");
const adminOverdue = document.getElementById("adminOverdue");
const adminOverdueCount = document.getElementById("adminOverdueCount");
const adminLowStock = document.getElementById("adminLowStock");
const adminLowStockCount = document.getElementById("adminLowStockCount");
const adminExtra = document.getElementById("adminExtra");
const btnAdminRefresh = document.getElementById("btnAdminRefresh");
const btnAddBookElem = document.getElementById("btnAddBook");
const btnViewBooks = document.getElementById("btnViewBooks");
const btnViewLowStock = document.getElementById("btnViewLowStock");
const btnViewSales = document.getElementById("btnViewSales");
const btnViewLoans = document.getElementById("btnViewLoans");
const btnViewUsers = document.getElementById("btnViewUsers");
const sideUserStatus = document.getElementById("sideUserStatus");
const progressPanelContent = document.getElementById("progressPanelContent");
const digitalLoanPanelContent = document.getElementById("digitalLoanPanelContent");
const userPill = document.getElementById("userPill");
const userGreeting = document.getElementById("userGreeting");
const guestActions = document.getElementById("guestActions");
const btnLogout = document.getElementById("btnLogout");
const btnOpenLogin = document.getElementById("btnOpenLogin");
const btnOpenRegister = document.getElementById("btnOpenRegister");
const notificationButton = document.getElementById("notificationButton");
const notificationBadge = document.getElementById("notificationBadge");
const notificationPanel = document.getElementById("notificationPanel");
const notificationList = document.getElementById("notificationList");
const markNotificationsRead = document.getElementById("markNotificationsRead");
const authModal = document.getElementById("authModal");
const modalOverlay = document.getElementById("modalOverlay");
const closeAuthModal = document.getElementById("closeAuthModal");
const authModalTitle = document.getElementById("authModalTitle");
const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authFirstName = document.getElementById("authFirstName");
const authLastName = document.getElementById("authLastName");
const registerFields = document.getElementById("registerFields");
const authSubmit = document.getElementById("authSubmit");
const switchToRegister = document.getElementById("switchToRegister");
const btnExplore = document.getElementById("btnExplore");
const clearFilters = document.getElementById("clearFilters");
const viewAllCategories = document.getElementById("viewAllCategories");
const loadRecommended = document.getElementById("loadRecommended");
const reviewsList = document.getElementById("reviewsList");
const reviewFormBlock = document.getElementById("reviewFormBlock");
const reviewRating = document.getElementById("reviewRating");
const reviewComment = document.getElementById("reviewComment");
const btnSubmitReview = document.getElementById("btnSubmitReview");
const purchaseModal = document.getElementById("purchaseModal");
const closePurchaseModal = document.getElementById("closePurchaseModal");
const purchaseSummary = document.getElementById("purchaseSummary");
const purchaseForm = document.getElementById("purchaseForm");
const cardNumber = document.getElementById("cardNumber");
const cardHolder = document.getElementById("cardHolder");
const cardExpiration = document.getElementById("cardExpiration");
const cardCvv = document.getElementById("cardCvv");
const confirmPurchase = document.getElementById("confirmPurchase");
const cardNumberError = document.getElementById("cardNumberError");
const cardHolderError = document.getElementById("cardHolderError");
const cardExpirationError = document.getElementById("cardExpirationError");
const cardCvvError = document.getElementById("cardCvvError");

let toastTimer;
let currentBook = null;
let filterCategory = null;
let lastSearch = "";
let currentUser = null;
let authMode = "login";
let latestBooks = [];
let currentAdminBooks = [];
let latestNotifications = [];
let purchaseSubmitting = false;

function getToken() {
  return localStorage.getItem("biblioteca_token");
}

function setToken(token) {
  localStorage.setItem("biblioteca_token", token);
}

function clearToken() {
  localStorage.removeItem("biblioteca_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  return String(value).split("T")[0];
}

function getCoverForBook(book = {}) {
  const existingCover = book.cover_url || book.image_url || book.cover || book.image;
  if (existingCover) return existingCover;
  const bookId = Number(book.book_id || 1);
  return coverAssets[(Math.max(bookId, 1) - 1) % coverAssets.length] || "assets/book-placeholder.svg";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function showAlert(message, type = "success") {
  alertBanner.textContent = message;
  alertBanner.dataset.type = type;
  alertBanner.classList.remove("hidden");
  setTimeout(() => alertBanner.classList.add("hidden"), 3600);
}

async function request(path, options = {}) {
  return fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers
    },
    ...options
  });
}

function renderEmpty(message, actionLabel = "", action = "login") {
  return `
    <div class="empty-state">
      <i class="bi bi-info-circle"></i>
      <p>${escapeHtml(message)}</p>
      ${actionLabel ? `<button class="btn btn-primary small-btn" type="button" data-panel-action="${action}">${escapeHtml(actionLabel)}</button>` : ""}
    </div>
  `;
}

function renderLoading(message) {
  return `<div class="loading-state"><span class="loader-dot"></span>${escapeHtml(message)}</div>`;
}

function isAccountRoute() {
  return window.location.pathname === "/mi-cuenta";
}

function isRecommendedRoute() {
  return window.location.pathname === "/recomendados";
}

function applyRouteView() {
  const accountRoute = isAccountRoute();
  const recommendedRoute = isRecommendedRoute();
  const focusedRoute = accountRoute || recommendedRoute;

  document.body.dataset.view = accountRoute ? "account" : recommendedRoute ? "recommended" : "home";

  [homeSection, categorySection, catalogSection].forEach(section => {
    section?.classList.toggle("route-hidden", focusedRoute);
  });

  recommendedSection?.classList.toggle("route-hidden", accountRoute);
  userSection?.classList.toggle("route-hidden", !accountRoute);
  adminSection?.classList.toggle("route-hidden", accountRoute || recommendedRoute);
  bookDetailSection?.classList.toggle("route-hidden", focusedRoute);

  if (accountRoute && !currentUser) {
    renderAccountGuest();
  }

  if (recommendedRoute) {
    loadRecommendedBooks();
  }
}

function navigateTo(path, scrollTarget = "") {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }

  applyRouteView();

  if (scrollTarget) {
    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function passesLuhn(number) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function parseExpiration(value = "") {
  const match = String(value).trim().match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
  if (month < 1 || month > 12) return null;

  return { month, year };
}

function validatePaymentForm() {
  const errors = {};
  const digits = onlyDigits(cardNumber?.value);
  const holder = cardHolder?.value.trim() || "";
  const expiration = parseExpiration(cardExpiration?.value);
  const cvv = onlyDigits(cardCvv?.value);

  if (!/^\d{13,19}$/.test(digits) || !passesLuhn(digits)) {
    errors.cardNumber = "El numero de tarjeta no es valido";
  }

  if (holder.length < 3 || !/[a-zA-Z]/.test(holder)) {
    errors.cardHolder = "Ingresa el nombre del titular";
  }

  if (!expiration) {
    errors.cardExpiration = "Usa el formato MM/AA";
  } else {
    const expiresAt = new Date(expiration.year, expiration.month, 0, 23, 59, 59);
    if (expiresAt < new Date()) {
      errors.cardExpiration = "La tarjeta esta vencida";
    }
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    errors.cardCvv = "El CVV debe tener 3 o 4 digitos";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

function paintPaymentErrors(errors = {}) {
  const fieldMap = [
    [cardNumber, cardNumberError, errors.cardNumber],
    [cardHolder, cardHolderError, errors.cardHolder],
    [cardExpiration, cardExpirationError, errors.cardExpiration],
    [cardCvv, cardCvvError, errors.cardCvv]
  ];

  fieldMap.forEach(([field, errorNode, message]) => {
    field?.classList.toggle("field-invalid", Boolean(message));
    field?.classList.toggle("field-valid", field.value.trim() && !message);
    if (errorNode) errorNode.textContent = message || "";
  });

  const ready = Object.keys(errors).length === 0;
  confirmPurchase.disabled = !ready || purchaseSubmitting;
  confirmPurchase.classList.toggle("ready", ready && !purchaseSubmitting);
}

function updatePaymentState() {
  if (!purchaseForm) return;
  paintPaymentErrors(validatePaymentForm().errors);
}

function formatCardNumberInput() {
  const digits = onlyDigits(cardNumber.value).slice(0, 19);
  cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpirationInput() {
  const digits = onlyDigits(cardExpiration.value).slice(0, 6);
  if (digits.length <= 2) {
    cardExpiration.value = digits;
    return;
  }
  cardExpiration.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function renderAccountGuest() {
  userSection?.classList.remove("hidden");
  userProfileSummary.innerHTML = renderEmpty("Inicia sesion para ver tu perfil, compras, prestamos e historial.", "Iniciar sesion");
  userPurchases.innerHTML = renderEmpty("Tus compras apareceran aca despues de iniciar sesion.");
  userLoans.innerHTML = renderEmpty("Tus prestamos activos apareceran aca despues de iniciar sesion.");
  if (userHistory) userHistory.innerHTML = renderEmpty("Tu historial aparecera aca despues de iniciar sesion.");
}

function updateNotificationBadge(count = 0) {
  const normalizedCount = Number(count || 0);
  notificationBadge.textContent = String(normalizedCount);
  notificationBadge.classList.toggle("hidden", normalizedCount <= 0);
}

function renderNotifications() {
  if (!currentUser) {
    notificationList.innerHTML = renderEmpty("Inicia sesion para ver tus notificaciones.", "Iniciar sesion");
    return;
  }

  if (!latestNotifications.length) {
    notificationList.innerHTML = renderEmpty("No tenes notificaciones por ahora.");
    return;
  }

  notificationList.innerHTML = latestNotifications.map(item => `
    <article class="notification-item ${item.is_read ? "is-read" : "is-unread"}">
      <span class="notification-dot"></span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.message)}</p>
        <small>${escapeHtml(formatDate(item.created_at))}</small>
      </div>
    </article>
  `).join("");
}

async function loadNotifications() {
  if (!currentUser) {
    latestNotifications = [];
    updateNotificationBadge(0);
    renderNotifications();
    return;
  }

  const res = await request("/user/notifications");
  if (!res.ok) {
    notificationList.innerHTML = renderEmpty("No se pudieron cargar las notificaciones.");
    return;
  }

  const data = await res.json();
  latestNotifications = data.notifications || [];
  updateNotificationBadge(data.unread_count || 0);
  renderNotifications();
}

async function markAllNotificationsRead() {
  if (!currentUser) return;
  const res = await request("/user/notifications/read", { method: "PATCH" });
  if (res.ok) {
    await loadNotifications();
  }
}

function updateNavForSession() {
  const isLogged = Boolean(currentUser);
  const isAdmin = currentUser?.role_name === "admin";

  userNavLink?.classList.toggle("hidden", !isLogged);
  adminNavLink?.classList.toggle("hidden", !isAdmin);
}

function renderGuestPanels() {
  sideUserStatus.textContent = "Ingresá para ver tu historial, préstamos y compras.";
  progressPanelContent.innerHTML = renderEmpty("Tenés que iniciar sesión para ver tu progreso de lectura.", "Iniciar sesión");
  digitalLoanPanelContent.innerHTML = renderEmpty("Tenés que iniciar sesión para ver tus préstamos digitales.", "Iniciar sesión");
}

function renderLoggedPanels(loans = []) {
  sideUserStatus.textContent = `Sesión activa: ${currentUser.email}`;
  progressPanelContent.innerHTML = renderEmpty("Todavía no registraste progreso de lectura.");

  if (!loans.length) {
    digitalLoanPanelContent.innerHTML = renderEmpty("Todavía no tenés préstamos activos.");
    return;
  }

  digitalLoanPanelContent.innerHTML = `
    <div class="side-list">
      ${loans.slice(0, 3).map(item => `
        <article>
          <strong>${escapeHtml(item.title)}</strong>
          <span>Vence: ${escapeHtml(formatDate(item.due_date))}</span>
        </article>
      `).join("")}
    </div>
    <button class="btn btn-primary action-btn" type="button" data-panel-action="user-loans">Ver mis préstamos</button>
  `;
}

function setAuthMode(mode) {
  authMode = mode;
  const isRegister = mode === "register";
  authModalTitle.textContent = isRegister ? "Registrarse" : "Iniciar sesión";
  authSubmit.textContent = isRegister ? "Crear cuenta" : "Ingresar";
  registerFields.classList.toggle("hidden", !isRegister);
  authFirstName.required = isRegister;
  authLastName.required = isRegister;
  authFirstName.disabled = !isRegister;
  authLastName.disabled = !isRegister;
  switchToRegister.textContent = isRegister ? "Iniciar sesión" : "Registrarse";
  switchToRegister.dataset.mode = isRegister ? "login" : "register";
}

function openModal() {
  authModal.classList.remove("hidden");
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  authModal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
}

function openPurchaseModal() {
  if (!currentUser) {
    showAlert("Debes iniciar sesion para comprar", "error");
    openLoginModal();
    return;
  }

  const title = currentBook?.title || "Libro seleccionado";
  const price = currentBook?.purchase_price || 0;

  purchaseSummary.innerHTML = `
    <div>
      <span>Libro</span>
      <strong>${escapeHtml(title)}</strong>
    </div>
    <div>
      <span>Cantidad</span>
      <strong>1 unidad</strong>
    </div>
    <div>
      <span>Total</span>
      <strong>${formatMoney(price)}</strong>
    </div>
  `;

  purchaseForm.reset();
  purchaseSubmitting = false;
  paintPaymentErrors({
    cardNumber: "Completa el numero de tarjeta",
    cardHolder: "Ingresa el nombre del titular",
    cardExpiration: "Usa el formato MM/AA",
    cardCvv: "El CVV debe tener 3 o 4 digitos"
  });
  purchaseModal.classList.remove("hidden");
  modalOverlay.classList.remove("hidden");
  cardNumber.focus();
}

function closePurchase() {
  purchaseModal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
  purchaseSubmitting = false;
}

function openLoginModal() {
  setAuthMode("login");
  openModal();
}

if (menuToggle && mainNav) {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

async function loadCategories() {
  categoryGrid.innerHTML = renderLoading("Cargando categorías...");
  const res = await request("/books/categories");
  if (!res.ok) {
    categoryGrid.innerHTML = renderEmpty("No se pudieron cargar las categorías.");
    return;
  }

  const categories = await res.json();
  if (!categories.length) {
    categoryGrid.innerHTML = renderEmpty("Todavía no hay categorías disponibles.");
    return;
  }

  categoryGrid.innerHTML = categories.map((cat, index) => `
    <article class="category-card pastel-${(index % 6) + 1}" data-id="${escapeHtml(cat.category_id)}">
      <i class="bi bi-tags"></i>
      <p>${escapeHtml(cat.name)}</p>
    </article>
  `).join("");

  categoryGrid.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      filterCategory = card.dataset.id;
      loadBooks(lastSearch, filterCategory);
      navigateTo("/", "catalogSection");
    });
  });
}

function createBookCard(book) {
  const available = Number(book.available_copies || 0);
  const isAvailable = available > 0;
  return `
    <article class="book-card" data-id="${escapeHtml(book.book_id)}">
      <div class="book-cover">
        <img src="${escapeHtml(getCoverForBook(book))}" alt="Portada de ${escapeHtml(book.title)}" onerror="this.src='assets/book-placeholder.svg'">
      </div>
      <div class="book-card-body">
        <span class="book-category">${escapeHtml(book.categories || "Sin categoría")}</span>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="author">${escapeHtml(book.authors || "Autor desconocido")}</p>
        <div class="book-prices">
          <span><i class="bi bi-bag"></i> ${formatMoney(book.purchase_price)}</span>
          <span><i class="bi bi-clock-history"></i> ${formatMoney(book.rental_price)}</span>
        </div>
        <p class="availability ${isAvailable ? "available" : "unavailable"}">${available} disponible${available === 1 ? "" : "s"}</p>
      </div>
      <div class="book-actions">
        <button class="btn btn-secondary btn-detail" type="button" data-book-detail="${escapeHtml(book.book_id)}">Ver detalle</button>
        <button class="btn btn-ghost" type="button" data-book-rent="${escapeHtml(book.book_id)}" ${isAvailable ? "" : "disabled"}>Alquilar</button>
        <button class="btn btn-primary" type="button" data-book-buy="${escapeHtml(book.book_id)}" ${isAvailable ? "" : "disabled"}>Comprar</button>
      </div>
    </article>
  `;
}

function bindBookActions(container) {
  container.querySelectorAll("[data-book-detail]").forEach(btn => {
    btn.addEventListener("click", () => openBookDetail(btn.dataset.bookDetail));
  });

  container.querySelectorAll("[data-book-buy]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentBook = latestBooks.find(book => String(book.book_id) === String(btn.dataset.bookBuy)) || { book_id: btn.dataset.bookBuy };
      handlePurchase();
    });
  });

  container.querySelectorAll("[data-book-rent]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentBook = latestBooks.find(book => String(book.book_id) === String(btn.dataset.bookRent)) || { book_id: btn.dataset.bookRent };
      handleRent();
    });
  });
}

async function loadBooks(search = "", categoryId = null) {
  lastSearch = search;
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categoryId) params.append("category", categoryId);

  booksGrid.innerHTML = renderLoading("Cargando catálogo...");
  const res = await request(`/books?${params.toString()}`);
  if (!res.ok) {
    booksGrid.innerHTML = renderEmpty("No se pudo cargar el catálogo.");
    showAlert("No se pudo cargar el catálogo", "error");
    return;
  }

  const books = await res.json();
  latestBooks = books;
  if (!books.length) {
    booksGrid.innerHTML = renderEmpty("No se encontraron libros con esos filtros.");
    return;
  }

  booksGrid.innerHTML = books.map(createBookCard).join("");
  bindBookActions(booksGrid);
}

async function loadRecommendedBooks() {
  recommendedList.innerHTML = renderLoading("Cargando recomendados...");
  const res = await request("/books?");
  if (!res.ok) {
    recommendedList.innerHTML = renderEmpty("No se pudieron cargar recomendaciones.");
    return;
  }

  const books = await res.json();
  const top = books.slice(0, 4);
  if (!top.length) {
    recommendedList.innerHTML = renderEmpty("Todavía no hay libros recomendados.");
    return;
  }

  recommendedList.innerHTML = top.map(book => `
    <article class="recommended-card">
      <img class="mini-cover" src="${escapeHtml(getCoverForBook(book))}" alt="Portada de ${escapeHtml(book.title)}" onerror="this.src='assets/book-placeholder.svg'">
      <div class="recommended-info">
        <h3>${escapeHtml(book.title)}</h3>
        <p>${escapeHtml(book.authors || "Autor desconocido")}</p>
        <span>${Number(book.available_copies || 0)} disponibles</span>
      </div>
      <button class="btn btn-ghost action-btn btn-detail" type="button" data-book-detail="${escapeHtml(book.book_id)}">Ver más</button>
    </article>
  `).join("");
  bindBookActions(recommendedList);
}

async function openBookDetail(bookId) {
  const res = await request(`/books/${bookId}`);
  if (!res.ok) {
    showAlert("No se pudo cargar el detalle del libro", "error");
    return;
  }

  const { book, authors, categories, availability, reviews } = await res.json();
  currentBook = book;
  bookDetailSection.classList.remove("hidden");
  detailCover.innerHTML = `<img src="${escapeHtml(getCoverForBook(book))}" alt="Portada de ${escapeHtml(book.title)}" onerror="this.src='assets/book-placeholder.svg'">`;
  detailBookTitle.textContent = book.title;
  detailDescription.textContent = book.description || "Sin descripción disponible.";
  detailAuthors.textContent = `Autores: ${authors.map(a => a.name).join(", ") || "N/A"}`;
  detailCategories.textContent = `Categorías: ${categories.map(c => c.name).join(", ") || "N/A"}`;
  detailPublisher.textContent = `Editorial: ${book.publisher_name || "N/A"}`;
  detailAvailability.textContent = `Disponibles: ${Number(availability?.available || 0)}`;
  detailPurchasePrice.textContent = formatMoney(book.purchase_price);
  detailRentalPrice.textContent = formatMoney(book.rental_price);
  reviewsList.innerHTML = reviews.length ? reviews.map(item => `
    <div class="review-card">
      <strong>${escapeHtml(item.first_name)} ${escapeHtml(item.last_name)}</strong>
      <p>Calificación: ${"★".repeat(Number(item.rating || 0))}</p>
      <p>${escapeHtml(item.comment)}</p>
    </div>
  `).join("") : renderEmpty("Todavía no hay reseñas para este libro.");
  reviewFormBlock.classList.toggle("hidden", !currentUser);
  bookDetailSection.scrollIntoView({ behavior: "smooth" });
}

async function toggleUserState() {
  const token = getToken();
  if (!token) {
    currentUser = null;
    updateNavForSession();
    userPill.classList.add("hidden");
    guestActions.classList.remove("hidden");
    btnLogout.classList.add("hidden");
    userSection.classList.add("hidden");
    adminSection.classList.add("hidden");
    notificationPanel.classList.add("hidden");
    renderGuestPanels();
    await loadNotifications();
    applyRouteView();
    return;
  }

  const res = await request("/user/me");
  if (!res.ok) {
    clearToken();
    await toggleUserState();
    return;
  }

  currentUser = await res.json();
  updateNavForSession();
  userGreeting.textContent = `Hola, ${currentUser.first_name}`;
  userPill.classList.remove("hidden");
  guestActions.classList.add("hidden");
  btnLogout.classList.remove("hidden");
  userSection.classList.remove("hidden");
  userProfileSummary.innerHTML = `
    <img src="assets/user-avatar.svg" alt="Avatar de usuario">
    <div>
      <span>${escapeHtml(currentUser.role_name === "admin" ? "Administrador" : "Usuario")}</span>
      <strong>${escapeHtml(currentUser.first_name)} ${escapeHtml(currentUser.last_name)}</strong>
      <p>${escapeHtml(currentUser.email)}</p>
    </div>
  `;

  await loadUserData();
  await loadNotifications();

  if (currentUser.role_name === "admin") {
    adminSection.classList.remove("hidden");
    await loadAdminDashboard();
  } else {
    adminSection.classList.add("hidden");
  }

  applyRouteView();
}

async function loadUserData() {
  userPurchases.innerHTML = renderLoading("Cargando compras...");
  userLoans.innerHTML = renderLoading("Cargando préstamos...");
  if (userHistory) userHistory.innerHTML = renderLoading("Cargando historial...");

  const [purchasesRes, loansRes, historyRes] = await Promise.all([
    request("/user/purchases"),
    request("/user/loans?status=active"),
    request("/user/loans?status=history")
  ]);

  if (purchasesRes.ok) {
    const purchases = await purchasesRes.json();
    userPurchases.innerHTML = purchases.length ? purchases.map(item => `
      <div class="review-card">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(formatDate(item.sale_date))} - ${Number(item.quantity)} unidad(es)</p>
        <p>Total: ${formatMoney(item.total_amount)}</p>
        ${item.card_last4 ? `<p>Tarjeta terminada en ${escapeHtml(item.card_last4)}</p>` : ""}
      </div>
    `).join("") : renderEmpty("Aún no realizaste compras.");
  } else {
    userPurchases.innerHTML = renderEmpty("No se pudieron cargar tus compras.");
  }

  let loans = [];
  if (loansRes.ok) {
    loans = await loansRes.json();
    userLoans.innerHTML = loans.length ? loans.map(item => `
      <div class="review-card">
        <strong>${escapeHtml(item.title)}</strong>
        <p>Vencimiento: ${escapeHtml(formatDate(item.due_date))}</p>
        <p>Estado: ${escapeHtml(item.status)}</p>
      </div>
    `).join("") : renderEmpty("Todavía no tenés préstamos activos.");
  } else {
    userLoans.innerHTML = renderEmpty("No se pudieron cargar tus préstamos.");
  }

  renderLoggedPanels(loans);

  if (userHistory) {
    if (historyRes.ok) {
      const history = await historyRes.json();
      userHistory.innerHTML = history.length ? history.map(item => `
        <div class="review-card">
          <strong>${escapeHtml(item.title)}</strong>
          <p>Fecha: ${escapeHtml(formatDate(item.loan_date))}</p>
          <p>Estado: ${escapeHtml(item.status)}</p>
        </div>
      `).join("") : renderEmpty("Todavia no hay historial para mostrar.");
    } else {
      userHistory.innerHTML = renderEmpty("No se pudo cargar tu historial.");
    }
  }
}

function renderStats(stats = {}) {
  const cards = [
    ["bi-journal-bookmark", "Total libros", stats.total_books],
    ["bi-people", "Usuarios", stats.total_users],
    ["bi-bookmark-check", "Préstamos activos", stats.active_loans],
    ["bi-exclamation-triangle", "Préstamos vencidos", stats.overdue_loans],
    ["bi-receipt", "Ventas", stats.completed_sales],
    ["bi-cash-stack", "Total vendido", formatMoney(stats.total_sold)],
    ["bi-box-seam", "Bajo stock", stats.low_stock_books],
    ["bi-check-circle", "Ejemplares disponibles", stats.available_copies]
  ];

  adminStatsGrid.innerHTML = cards.map(([icon, label, value]) => `
    <article class="admin-stat-card">
      <i class="bi ${icon}"></i>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value ?? 0)}</strong>
    </article>
  `).join("");
}

function table(headers, rows, renderRow, emptyMessage) {
  if (!rows.length) return renderEmpty(emptyMessage);
  return `
    <table>
      <thead><tr>${headers.map(item => `<th>${escapeHtml(item)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(renderRow).join("")}</tbody>
    </table>
  `;
}

function renderOverdue(loans) {
  adminOverdueCount.textContent = loans.length;
  adminOverdue.innerHTML = table(
    ["Libro", "Usuario", "Vencimiento", "Estado"],
    loans,
    item => `
      <tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.first_name)} ${escapeHtml(item.last_name)}</td>
        <td>${escapeHtml(formatDate(item.due_date))}</td>
        <td><span class="status-badge danger">${escapeHtml(item.status)}</span></td>
      </tr>
    `,
    "No hay préstamos vencidos."
  );
}

function renderLowStock(books, target = adminLowStock) {
  if (adminLowStockCount) adminLowStockCount.textContent = books.length;
  target.innerHTML = table(
    ["Libro", "Disponibles", "Mínimo", "Estado"],
    books,
    item => `
      <tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${Number(item.available_copies || 0)}</td>
        <td>${Number(item.stock_minimum || 0)}</td>
        <td><span class="status-badge warning">Revisar</span></td>
      </tr>
    `,
    "No hay libros con bajo stock."
  );
}

async function loadAdminDashboard() {
  if (currentUser?.role_name !== "admin") return;

  adminStatsGrid.innerHTML = `<article class="admin-stat-card loading-card">${renderLoading("Cargando estadísticas...")}</article>`;
  adminOverdue.innerHTML = renderLoading("Cargando préstamos vencidos...");
  adminLowStock.innerHTML = renderLoading("Cargando bajo stock...");

  const [statsRes, overdueRes, lowStockRes] = await Promise.all([
    request("/admin/stats"),
    request("/admin/loans/overdue"),
    request("/admin/books/low-stock")
  ]);

  if (statsRes.ok) renderStats(await statsRes.json());
  else adminStatsGrid.innerHTML = `<article class="admin-stat-card error-card">No se pudieron cargar estadísticas.</article>`;

  if (overdueRes.ok) renderOverdue(await overdueRes.json());
  else adminOverdue.innerHTML = renderEmpty("No se pudieron cargar los préstamos vencidos.");

  if (lowStockRes.ok) renderLowStock(await lowStockRes.json());
  else adminLowStock.innerHTML = renderEmpty("No se pudieron cargar los libros con bajo stock.");

  if (!adminExtra.innerHTML.trim()) {
    adminExtra.innerHTML = renderEmpty("Seleccioná una acción rápida para gestionar la biblioteca.");
  }
}

async function loadAdminOptions() {
  const [categoriesRes, authorsRes, publishersRes] = await Promise.all([
    request("/books/categories"),
    request("/books/authors"),
    request("/books/publishers")
  ]);
  return {
    categories: categoriesRes.ok ? await categoriesRes.json() : [],
    authors: authorsRes.ok ? await authorsRes.json() : [],
    publishers: publishersRes.ok ? await publishersRes.json() : []
  };
}

function setAdminExtra(title, body) {
  adminExtra.innerHTML = `
    <div class="admin-card-head">
      <h3>${escapeHtml(title)}</h3>
    </div>
    ${body}
  `;
}

async function showAddBookForm() {
  setAdminExtra("Agregar nuevo libro", renderLoading("Cargando opciones..."));
  const { categories, authors, publishers } = await loadAdminOptions();
  setAdminExtra("Agregar nuevo libro", `
    <form id="adminAddBookForm" class="auth-form admin-form">
      <input type="text" id="bookTitle" placeholder="Título" required>
      <textarea id="bookDescription" placeholder="Descripción"></textarea>
      <div class="form-grid">
        <select id="bookPublisher" required>
          <option value="">Seleccioná editorial</option>
          ${publishers.map(pub => `<option value="${escapeHtml(pub.publisher_id)}">${escapeHtml(pub.name)}</option>`).join("")}
        </select>
        <input type="number" id="bookYear" placeholder="Año" min="1900" max="2100">
      </div>
      <div class="form-grid">
        <input type="number" id="bookPurchasePrice" placeholder="Precio compra" min="0" step="0.01" required>
        <input type="number" id="bookRentalPrice" placeholder="Precio alquiler" min="0" step="0.01" required>
      </div>
      <select id="bookAuthors" multiple>
        ${authors.map(author => `<option value="${escapeHtml(author.author_id)}">${escapeHtml(author.name)}</option>`).join("")}
      </select>
      <select id="bookCategories" multiple>
        ${categories.map(cat => `<option value="${escapeHtml(cat.category_id)}">${escapeHtml(cat.name)}</option>`).join("")}
      </select>
      <button class="btn btn-primary" type="submit">Crear libro</button>
    </form>
  `);
  document.getElementById("adminAddBookForm").addEventListener("submit", handleAddBook);
  adminExtra.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleAddBook(event) {
  event.preventDefault();
  const title = document.getElementById("bookTitle").value.trim();
  const description = document.getElementById("bookDescription").value.trim();
  const publisher_id = document.getElementById("bookPublisher").value;
  const publication_year = document.getElementById("bookYear").value;
  const purchase_price = Number(document.getElementById("bookPurchasePrice").value);
  const rental_price = Number(document.getElementById("bookRentalPrice").value);
  const authorIds = Array.from(document.getElementById("bookAuthors").selectedOptions).map(opt => Number(opt.value));
  const categoryIds = Array.from(document.getElementById("bookCategories").selectedOptions).map(opt => Number(opt.value));

  if (!title || !publisher_id || !purchase_price || !rental_price) {
    showAlert("Completá los campos obligatorios", "error");
    return;
  }

  const res = await request("/admin/books", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      publisher_id: Number(publisher_id),
      publication_year: publication_year ? Number(publication_year) : null,
      purchase_price,
      rental_price,
      author_ids: authorIds,
      category_ids: categoryIds
    })
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo crear el libro", "error");
    return;
  }
  showToast(result.message);
  await loadAdminDashboard();
  await loadBooks(lastSearch, filterCategory);
  await showAdminBooks();
}

async function showAdminBooks() {
  setAdminExtra("Gestión de libros", renderLoading("Cargando libros..."));
  const res = await request("/admin/books");
  if (!res.ok) {
    setAdminExtra("Gestión de libros", renderEmpty("No se pudieron cargar los libros."));
    return;
  }

  currentAdminBooks = await res.json();
  setAdminExtra("Gestión de libros", table(
    ["Libro", "Precio", "Alquiler", "Stock", "Estado", "Acciones"],
    currentAdminBooks,
    item => `
      <tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${formatMoney(item.purchase_price)}</td>
        <td>${formatMoney(item.rental_price)}</td>
        <td>${Number(item.available_copies || 0)}</td>
        <td><span class="status-badge ${item.is_active ? "success" : "muted"}">${item.is_active ? "Activo" : "Inactivo"}</span></td>
        <td class="table-actions">
          <button type="button" class="btn btn-ghost small-btn" data-admin-action="edit" data-id="${escapeHtml(item.book_id)}">Editar</button>
          <button type="button" class="btn btn-ghost small-btn" data-admin-action="price" data-id="${escapeHtml(item.book_id)}">Precio</button>
          <button type="button" class="btn btn-ghost small-btn" data-admin-action="stock" data-id="${escapeHtml(item.book_id)}">Stock</button>
          <button type="button" class="btn btn-secondary small-btn" data-admin-action="status" data-id="${escapeHtml(item.book_id)}">${item.is_active ? "Desactivar" : "Activar"}</button>
        </td>
      </tr>
    `,
    "No hay libros cargados."
  ));

  adminExtra.querySelectorAll("[data-admin-action]").forEach(btn => {
    btn.addEventListener("click", () => handleAdminBookAction(btn.dataset.adminAction, btn.dataset.id));
  });
  adminExtra.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleAdminBookAction(action, bookId) {
  const book = currentAdminBooks.find(item => String(item.book_id) === String(bookId));
  if (!book) return;

  if (action === "edit") return showEditBookForm(book);
  if (action === "price") return showPriceForm(book);
  if (action === "stock") return showStockForm(book);
  if (action === "status") {
    const res = await request(`/admin/books/${book.book_id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !book.is_active })
    });
    const result = await res.json();
    if (!res.ok) {
      showAlert(result.error || "No se pudo cambiar el estado", "error");
      return;
    }
    showToast(result.message);
    await loadAdminDashboard();
    await showAdminBooks();
  }
}

async function showEditBookForm(book) {
  setAdminExtra(`Editar libro: ${book.title}`, renderLoading("Cargando editoriales..."));
  const { publishers } = await loadAdminOptions();
  setAdminExtra(`Editar libro: ${book.title}`, `
    <form id="adminEditBookForm" class="auth-form admin-form">
      <input type="text" id="editBookTitle" value="${escapeHtml(book.title)}" required>
      <textarea id="editBookDescription" placeholder="Descripción">${escapeHtml(book.description || "")}</textarea>
      <div class="form-grid">
        <select id="editBookPublisher" required>
          ${publishers.map(pub => `<option value="${escapeHtml(pub.publisher_id)}" ${Number(pub.publisher_id) === Number(book.publisher_id) ? "selected" : ""}>${escapeHtml(pub.name)}</option>`).join("")}
        </select>
        <input type="number" id="editBookYear" placeholder="Año" min="1900" max="2100" value="${escapeHtml(book.publication_year || "")}">
      </div>
      <div class="form-grid">
        <input type="number" id="editBookPurchasePrice" min="0" step="0.01" value="${escapeHtml(book.purchase_price)}" required>
        <input type="number" id="editBookRentalPrice" min="0" step="0.01" value="${escapeHtml(book.rental_price)}" required>
      </div>
      <label class="toggle-row">
        <input type="checkbox" id="editBookActive" ${book.is_active ? "checked" : ""}>
        Libro activo
      </label>
      <button class="btn btn-primary" type="submit">Guardar cambios</button>
    </form>
  `);

  document.getElementById("adminEditBookForm").addEventListener("submit", async event => {
    event.preventDefault();
    const res = await request(`/admin/books/${book.book_id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: document.getElementById("editBookTitle").value.trim(),
        description: document.getElementById("editBookDescription").value.trim(),
        publisher_id: Number(document.getElementById("editBookPublisher").value),
        publication_year: document.getElementById("editBookYear").value ? Number(document.getElementById("editBookYear").value) : null,
        purchase_price: Number(document.getElementById("editBookPurchasePrice").value),
        rental_price: Number(document.getElementById("editBookRentalPrice").value),
        is_active: document.getElementById("editBookActive").checked
      })
    });
    const result = await res.json();
    if (!res.ok) {
      showAlert(result.error || "No se pudo actualizar el libro", "error");
      return;
    }
    showToast(result.message);
    await loadAdminDashboard();
    await loadBooks(lastSearch, filterCategory);
    await showAdminBooks();
  });
}

function showPriceForm(book) {
  setAdminExtra(`Cambiar precio: ${book.title}`, `
    <form id="adminPriceForm" class="auth-form admin-form">
      <div class="form-grid">
        <input type="number" id="pricePurchase" min="0" step="0.01" value="${escapeHtml(book.purchase_price)}" required>
        <input type="number" id="priceRental" min="0" step="0.01" value="${escapeHtml(book.rental_price)}" required>
      </div>
      <input type="text" id="priceReason" placeholder="Motivo del cambio">
      <button class="btn btn-primary" type="submit">Actualizar precio</button>
    </form>
  `);

  document.getElementById("adminPriceForm").addEventListener("submit", async event => {
    event.preventDefault();
    const res = await request(`/admin/books/${book.book_id}/prices`, {
      method: "POST",
      body: JSON.stringify({
        purchase_price: Number(document.getElementById("pricePurchase").value),
        rental_price: Number(document.getElementById("priceRental").value),
        reason: document.getElementById("priceReason").value.trim()
      })
    });
    const result = await res.json();
    if (!res.ok) {
      showAlert(result.error || "No se pudo actualizar el precio", "error");
      return;
    }
    showToast(result.message);
    await loadAdminDashboard();
    await showAdminBooks();
  });
}

function showStockForm(book) {
  setAdminExtra(`Agregar stock: ${book.title}`, `
    <form id="adminStockForm" class="auth-form admin-form">
      <div class="form-grid">
        <input type="number" id="stockQuantity" min="1" placeholder="Cantidad" required>
        <select id="stockCondition">
          <option value="new">Nuevo</option>
          <option value="good" selected>Bueno</option>
          <option value="used">Usado</option>
          <option value="damaged">Dañado</option>
        </select>
      </div>
      <button class="btn btn-primary" type="submit">Agregar ejemplares</button>
    </form>
  `);

  document.getElementById("adminStockForm").addEventListener("submit", async event => {
    event.preventDefault();
    const res = await request(`/admin/books/${book.book_id}/copies`, {
      method: "POST",
      body: JSON.stringify({
        quantity: Number(document.getElementById("stockQuantity").value),
        copy_condition: document.getElementById("stockCondition").value,
        status: "available"
      })
    });
    const result = await res.json();
    if (!res.ok) {
      showAlert(result.error || "No se pudo agregar stock", "error");
      return;
    }
    showToast(result.message);
    await loadAdminDashboard();
    await showAdminBooks();
  });
}

async function showLowStock() {
  setAdminExtra("Libros con bajo stock", renderLoading("Cargando bajo stock..."));
  const res = await request("/admin/books/low-stock");
  if (!res.ok) {
    setAdminExtra("Libros con bajo stock", renderEmpty("No se pudieron cargar los libros con bajo stock."));
    return;
  }
  const books = await res.json();
  setAdminExtra("Libros con bajo stock", `<div id="adminLowStockFull"></div>`);
  renderLowStock(books, document.getElementById("adminLowStockFull"));
}

async function showSales() {
  setAdminExtra("Ventas registradas", renderLoading("Cargando ventas..."));
  const res = await request("/admin/sales");
  if (!res.ok) {
    setAdminExtra("Ventas registradas", renderEmpty("No se pudieron cargar las ventas."));
    return;
  }
  const sales = await res.json();
  setAdminExtra("Ventas registradas", table(
    ["ID", "Usuario", "Total", "Fecha", "Pago", "Estado"],
    sales,
    row => `
      <tr>
        <td>${Number(row.sale_id)}</td>
        <td>${escapeHtml(row.first_name)} ${escapeHtml(row.last_name)}</td>
        <td>${formatMoney(row.total_amount)}</td>
        <td>${escapeHtml(formatDate(row.sale_date))}</td>
        <td>${escapeHtml(row.card_last4 ? `Tarjeta **** ${row.card_last4}` : row.payment_method || "N/A")}</td>
        <td><span class="status-badge success">${escapeHtml(row.status)}</span></td>
      </tr>
    `,
    "Todavía no hay ventas registradas."
  ));
}

async function showLoans() {
  setAdminExtra("Préstamos", renderLoading("Cargando préstamos..."));
  const [activeRes, overdueRes] = await Promise.all([
    request("/admin/loans/active"),
    request("/admin/loans/overdue")
  ]);

  const active = activeRes.ok ? await activeRes.json() : [];
  const overdue = overdueRes.ok ? await overdueRes.json() : [];
  const loans = [...overdue, ...active];

  setAdminExtra("Préstamos", table(
    ["Libro", "Usuario", "Vencimiento", "Estado"],
    loans,
    row => `
      <tr>
        <td>${escapeHtml(row.title)}</td>
        <td>${escapeHtml(row.first_name)} ${escapeHtml(row.last_name)}</td>
        <td>${escapeHtml(formatDate(row.due_date))}</td>
        <td><span class="status-badge ${row.status === "overdue" ? "danger" : "success"}">${escapeHtml(row.status)}</span></td>
      </tr>
    `,
    "No hay préstamos activos ni vencidos."
  ));
}

async function showUsers() {
  setAdminExtra("Usuarios", renderLoading("Cargando usuarios..."));
  const res = await request("/admin/users");
  if (!res.ok) {
    setAdminExtra("Usuarios", renderEmpty("No se pudieron cargar los usuarios."));
    return;
  }
  const users = await res.json();
  setAdminExtra("Usuarios", table(
    ["Nombre", "Email", "Rol", "Estado", "Alta"],
    users,
    row => `
      <tr>
        <td>${escapeHtml(row.first_name)} ${escapeHtml(row.last_name)}</td>
        <td>${escapeHtml(row.email)}</td>
        <td>${escapeHtml(row.role_name)}</td>
        <td><span class="status-badge ${row.status === "active" ? "success" : "muted"}">${escapeHtml(row.status)}</span></td>
        <td>${escapeHtml(formatDate(row.created_at))}</td>
      </tr>
    `,
    "No hay usuarios para mostrar."
  ));
}

async function handlePurchase() {
  if (!currentUser) {
    showAlert("Debes iniciar sesion para comprar", "error");
    openLoginModal();
    return;
  }

  openPurchaseModal();
}

async function handlePurchaseSubmit(event) {
  event.preventDefault();

  const validation = validatePaymentForm();
  paintPaymentErrors(validation.errors);

  if (!validation.ok || purchaseSubmitting) {
    return;
  }

  purchaseSubmitting = true;
  confirmPurchase.disabled = true;
  confirmPurchase.textContent = "Procesando...";

  const res = await request("/user/purchases", {
    method: "POST",
    body: JSON.stringify({
      book_id: currentBook.book_id,
      quantity: 1,
      payment: {
        card_number: onlyDigits(cardNumber.value),
        card_holder: cardHolder.value.trim(),
        expiration: cardExpiration.value.trim(),
        cvv: onlyDigits(cardCvv.value)
      }
    })
  });
  const result = await res.json();

  purchaseSubmitting = false;
  confirmPurchase.textContent = "Confirmar compra";

  if (!res.ok) {
    const fieldErrors = result.field_errors || {};
    paintPaymentErrors({
      cardNumber: fieldErrors.card_number,
      cardHolder: fieldErrors.card_holder,
      cardExpiration: fieldErrors.expiration,
      cardCvv: fieldErrors.cvv
    });
    showAlert(result.error || "No se pudo procesar la compra", "error");
    updatePaymentState();
    return;
  }

  closePurchase();
  showToast(result.message || "Compra registrada con exito");
  showAlert("Compra realizada correctamente", "success");
  await Promise.all([loadBooks(lastSearch, filterCategory), loadRecommendedBooks(), loadUserData(), loadNotifications()]);

  if (!bookDetailSection.classList.contains("hidden") && currentBook?.book_id) {
    await openBookDetail(currentBook.book_id);
  }
}

async function handleRent() {
  if (!currentUser) {
    showAlert("Debés iniciar sesión para alquilar", "error");
    openLoginModal();
    return;
  }
  const res = await request("/user/loans", {
    method: "POST",
    body: JSON.stringify({ book_id: currentBook.book_id, days: 7 })
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo procesar el préstamo", "error");
    return;
  }
  showToast(result.message);
  await loadBooks(lastSearch, filterCategory);
  await loadUserData();
  await loadNotifications();
}

async function handleReviewSubmit() {
  if (!currentUser) {
    showAlert("Debés iniciar sesión para dejar una reseña", "error");
    return;
  }
  const rating = Number(reviewRating.value);
  const comment = reviewComment.value.trim();
  if (!rating || !comment) {
    showAlert("Completá la calificación y el comentario", "error");
    return;
  }
  const res = await request(`/books/${currentBook.book_id}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating, comment })
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo enviar la reseña", "error");
    return;
  }
  reviewRating.value = "";
  reviewComment.value = "";
  showToast(result.message);
  openBookDetail(currentBook.book_id);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if (!email || !password) {
    showAlert("Completá email y contraseña", "error");
    return;
  }

  if (authMode === "register") {
    const firstName = authFirstName.value.trim();
    const lastName = authLastName.value.trim();
    if (!firstName || !lastName) {
      showAlert("Completá nombre y apellido", "error");
      return;
    }
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password })
    });
    const result = await res.json();
    if (!res.ok) {
      showAlert(result.error || "No se pudo registrar", "error");
      return;
    }
    setToken(result.token);
    showToast("Registro exitoso");
    closeModal();
    await toggleUserState();
    return;
  }

  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo iniciar sesión", "error");
    return;
  }
  setToken(result.token);
  showToast("Bienvenido nuevamente");
  closeModal();
  await toggleUserState();
}

document.addEventListener("click", event => {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    navigateTo(new URL(routeLink.href, window.location.origin).pathname);
    mainNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    return;
  }

  const scrollLink = event.target.closest("[data-scroll-target]");
  if (scrollLink) {
    event.preventDefault();
    navigateTo("/", scrollLink.dataset.scrollTarget);
    mainNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    return;
  }

  const action = event.target.closest("[data-panel-action]")?.dataset.panelAction;
  if (action === "login") openLoginModal();
  if (action === "user-loans") navigateTo("/mi-cuenta");

  if (!event.target.closest(".notification-wrap")) {
    notificationPanel?.classList.add("hidden");
    notificationButton?.setAttribute("aria-expanded", "false");
  }
});

btnExplore?.addEventListener("click", () => {
  navigateTo("/", "catalogSection");
});

searchForm?.addEventListener("submit", event => {
  event.preventDefault();
  loadBooks(searchInput.value.trim(), filterCategory);
});

clearFilters?.addEventListener("click", event => {
  event.preventDefault();
  filterCategory = null;
  lastSearch = "";
  searchInput.value = "";
  loadBooks();
});

viewAllCategories?.addEventListener("click", event => {
  event.preventDefault();
  filterCategory = null;
  loadBooks();
});

loadRecommended?.addEventListener("click", event => {
  event.preventDefault();
  loadRecommendedBooks();
});

btnOpenLogin?.addEventListener("click", openLoginModal);
btnOpenRegister?.addEventListener("click", () => {
  setAuthMode("register");
  openModal();
});
switchToRegister?.addEventListener("click", event => {
  event.preventDefault();
  setAuthMode(event.target.dataset.mode === "register" ? "register" : "login");
});
closeAuthModal?.addEventListener("click", closeModal);
modalOverlay?.addEventListener("click", () => {
  closeModal();
  closePurchase();
});
authForm?.addEventListener("submit", handleAuthSubmit);
closeDetail?.addEventListener("click", () => bookDetailSection.classList.add("hidden"));
btnBuy?.addEventListener("click", handlePurchase);
btnRent?.addEventListener("click", handleRent);
btnSubmitReview?.addEventListener("click", handleReviewSubmit);
closePurchaseModal?.addEventListener("click", closePurchase);
purchaseForm?.addEventListener("submit", handlePurchaseSubmit);
cardNumber?.addEventListener("input", () => {
  formatCardNumberInput();
  updatePaymentState();
});
cardHolder?.addEventListener("input", updatePaymentState);
cardExpiration?.addEventListener("input", () => {
  formatExpirationInput();
  updatePaymentState();
});
cardCvv?.addEventListener("input", () => {
  cardCvv.value = onlyDigits(cardCvv.value).slice(0, 4);
  updatePaymentState();
});
notificationButton?.addEventListener("click", async event => {
  event.stopPropagation();
  if (!currentUser) {
    openLoginModal();
    return;
  }
  const isHidden = notificationPanel.classList.toggle("hidden");
  notificationButton.setAttribute("aria-expanded", String(!isHidden));
  if (!isHidden) await loadNotifications();
});
notificationPanel?.addEventListener("click", event => event.stopPropagation());
markNotificationsRead?.addEventListener("click", markAllNotificationsRead);
btnLogout?.addEventListener("click", async () => {
  clearToken();
  await toggleUserState();
  showToast("Sesión cerrada");
});

adminNavLink?.addEventListener("click", event => {
  event.preventDefault();
  navigateTo("/", "adminSection");
  loadAdminDashboard();
});
btnAdminRefresh?.addEventListener("click", loadAdminDashboard);
btnAddBookElem?.addEventListener("click", showAddBookForm);
btnViewBooks?.addEventListener("click", showAdminBooks);
btnViewLowStock?.addEventListener("click", showLowStock);
btnViewSales?.addEventListener("click", showSales);
btnViewLoans?.addEventListener("click", showLoans);
btnViewUsers?.addEventListener("click", showUsers);
window.addEventListener("popstate", applyRouteView);

async function init() {
  setAuthMode("login");
  renderGuestPanels();
  await Promise.all([loadCategories(), loadBooks(), loadRecommendedBooks()]);
  await toggleUserState();
}

init();
