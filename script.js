const apiBase = "/api";
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");
const alertBanner = document.getElementById("alertBanner");
const categoryGrid = document.getElementById("categoryGrid");
const booksGrid = document.getElementById("booksGrid");
const recommendedList = document.getElementById("recommendedList");
const bookDetailSection = document.getElementById("bookDetailSection");
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
const adminSection = document.getElementById("adminSection");
const sideUserStatus = document.getElementById("sideUserStatus");
const userPill = document.getElementById("userPill");
const userGreeting = document.getElementById("userGreeting");
const guestActions = document.getElementById("guestActions");
const btnLogout = document.getElementById("btnLogout");
const btnOpenLogin = document.getElementById("btnOpenLogin");
const btnOpenRegister = document.getElementById("btnOpenRegister");
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
const adminSummary = document.getElementById("adminSummary");
const adminOverdue = document.getElementById("adminOverdue");
const adminExtra = document.getElementById("adminExtra");
const btnViewSales = document.getElementById("btnViewSales");
const btnAddBookElem = document.getElementById("btnAddBook");
const userPurchases = document.getElementById("userPurchases");
const userLoans = document.getElementById("userLoans");

let toastTimer;
let currentBook = null;
let filterCategory = null;
let lastSearch = "";
let currentUser = null;

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
  alertBanner.style.background = type === "error" ? "#e64c3c" : "linear-gradient(135deg, #2f6bff, #6a56f6)";
  alertBanner.classList.remove("hidden");
  setTimeout(() => alertBanner.classList.add("hidden"), 3600);
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });
  return response;
}

async function loadCategories() {
  const res = await request("/books/categories");
  if (!res.ok) return;
  const categories = await res.json();
  categoryGrid.innerHTML = categories.map(cat => `
    <article class="category-card pastel-blue" data-id="${cat.category_id}">
      <i class="bi bi-tags"></i>
      <p>${cat.name}</p>
    </article>
  `).join("");
  categoryGrid.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      filterCategory = card.dataset.id;
      loadBooks(lastSearch, filterCategory);
    });
  });
}

function createBookCard(book) {
  return `
    <article class="book-card" data-id="${book.book_id}">
      <div class="cover cover-a"></div>
      <h3>${book.title}</h3>
      <p class="author">${book.authors || "Autor desconocido"}</p>
      <p class="rating"><span>★</span> ${book.available_copies || 0} disponibles</p>
      <p class="rating"><span>💲</span> ${book.purchase_price} / ${book.rental_price}</p>
      <button class="btn btn-secondary action-btn btn-detail" data-id="${book.book_id}">Ver detalle</button>
    </article>
  `;
}

async function loadBooks(search = "", categoryId = null) {
  lastSearch = search;
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categoryId) params.append("category", categoryId);
  const res = await request(`/books?${params.toString()}`);
  if (!res.ok) {
    showAlert("No se pudo cargar el catálogo", "error");
    return;
  }
  const books = await res.json();
  booksGrid.innerHTML = books.map(createBookCard).join("");
  booksGrid.querySelectorAll(".btn-detail").forEach(btn => {
    btn.addEventListener("click", () => openBookDetail(btn.dataset.id));
  });
  if (!books.length) {
    booksGrid.innerHTML = `<p class="empty-state">No se encontraron libros con esos filtros.</p>`;
  }
}

async function loadRecommendedBooks() {
  const res = await request(`/books?`);
  if (!res.ok) return;
  const books = await res.json();
  const top = books.slice(0, 4);
  recommendedList.innerHTML = top.map(book => `
    <article class="recommended-card">
      <div class="mini-cover cover-g"></div>
      <div class="recommended-info">
        <h3>${book.title}</h3>
        <p>${book.authors || "Autor"}</p>
        <span>${book.available_copies} disponibles</span>
      </div>
      <button class="btn btn-ghost action-btn btn-detail" data-id="${book.book_id}">Ver más</button>
    </article>
  `).join("");
  recommendedList.querySelectorAll(".btn-detail").forEach(btn => {
    btn.addEventListener("click", () => openBookDetail(btn.dataset.id));
  });
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
  detailBookTitle.textContent = book.title;
  detailDescription.textContent = book.description || "Sin descripción disponible.";
  detailAuthors.textContent = `Autores: ${authors.map(a => a.name).join(", ")}`;
  detailCategories.textContent = `Categorías: ${categories.map(c => c.name).join(", ")}`;
  detailPublisher.textContent = `Editorial: ${book.publisher_name || "N/A"}`;
  detailAvailability.textContent = `Disponibles: ${availability.available || 0}`;
  detailPurchasePrice.textContent = book.purchase_price;
  detailRentalPrice.textContent = book.rental_price;
  reviewsList.innerHTML = reviews.length ? reviews.map(item => `
      <div class="review-card">
        <strong>${item.first_name} ${item.last_name}</strong>
        <p>Calificación: ${'★'.repeat(item.rating)}</p>
        <p>${item.comment}</p>
      </div>
    `).join("") : `<p class="empty-state">Todavía no hay reseñas para este libro.</p>`;
  if (currentUser) {
    reviewFormBlock.classList.remove("hidden");
  } else {
    reviewFormBlock.classList.add("hidden");
  }
  bookDetailSection.scrollIntoView({ behavior: "smooth" });
}

async function toggleUserState() {
  const token = getToken();
  if (!token) {
    currentUser = null;
    userPill.classList.add("hidden");
    guestActions.classList.remove("hidden");
    btnLogout.classList.add("hidden");
    userSection.classList.add("hidden");
    adminSection.classList.add("hidden");
    sideUserStatus.textContent = "Ingresá para ver tu historial, préstamos y compras.";
    return;
  }
  const res = await request("/user/me");
  if (!res.ok) {
    clearToken();
    toggleUserState();
    return;
  }
  currentUser = await res.json();
  userGreeting.textContent = `Hola, ${currentUser.first_name}`;
  userPill.classList.remove("hidden");
  guestActions.classList.add("hidden");
  btnLogout.classList.remove("hidden");
  sideUserStatus.textContent = `Sesión activa: ${currentUser.email}`;
  if (currentUser.role_name === "admin") {
    adminSection.classList.remove("hidden");
    loadAdminDashboard();
  }
  userSection.classList.remove("hidden");
  loadUserData();
}

async function loadUserData() {
  const purchasesRes = await request("/user/purchases");
  const loansRes = await request("/user/loans?status=active");
  if (purchasesRes.ok) {
    const purchases = await purchasesRes.json();
    if (purchases.length) {
      userPurchases.innerHTML = purchases.map(item => `
        <div class="review-card">
          <strong>${item.title}</strong>
          <p>${item.sale_date.split('T')[0]} - ${item.quantity} unidad(es)</p>
          <p>Total: $${item.total_amount}</p>
        </div>
      `).join("");
    } else {
      userPurchases.innerHTML = `<p class="empty-state">Aún no has realizado compras.</p>`;
    }
  }
  if (loansRes.ok) {
    const loans = await loansRes.json();
    if (loans.length) {
      userLoans.innerHTML = loans.map(item => `
        <div class="review-card">
          <strong>${item.title}</strong>
          <p>Vencimiento: ${item.due_date.split('T')[0]}</p>
          <p>Estado: ${item.status}</p>
        </div>
      `).join("");
    } else {
      userLoans.innerHTML = `<p class="empty-state">No tenés préstamos activos.</p>`;
    }
  }
}

async function loadAdminDashboard() {
  const dashRes = await request("/admin/dashboard");
  const overdueRes = await request("/admin/loans/overdue");
  if (dashRes.ok) {
    const summary = await dashRes.json();
    adminSummary.innerHTML = `
      <p>Libros activos: ${summary.active_books}</p>
      <p>Ejemplares disponibles: ${summary.available_copies}</p>
      <p>Préstamos activos: ${summary.active_loans}</p>
      <p>Préstamos vencidos: ${summary.overdue_loans}</p>
      <p>Ventas completadas: ${summary.completed_sales}</p>
    `;
  }
  if (overdueRes.ok) {
    const loans = await overdueRes.json();
    if (loans.length) {
      adminOverdue.innerHTML = loans.map(item => `
        <div class="review-card">
          <strong>${item.title}</strong>
          <p>${item.first_name} ${item.last_name}</p>
          <p>Vencimiento: ${item.due_date.split('T')[0]}</p>
        </div>
      `).join("");
    } else {
      adminOverdue.innerHTML = `<p class="empty-state">No hay préstamos vencidos.</p>`;
    }
  }
}

async function loadAdminOptions() {
  const [categoriesRes, authorsRes, publishersRes] = await Promise.all([
    request("/books/categories"),
    request("/books/authors"),
    request("/books/publishers")
  ]);
  const categories = categoriesRes.ok ? await categoriesRes.json() : [];
  const authors = authorsRes.ok ? await authorsRes.json() : [];
  const publishers = publishersRes.ok ? await publishersRes.json() : [];
  return { categories, authors, publishers };
}

function renderAdminForm({ categories, authors, publishers }) {
  adminExtra.innerHTML = `
    <div class="panel-card">
      <h3>Agregar nuevo libro</h3>
      <form id="adminAddBookForm" class="auth-form">
        <input type="text" id="bookTitle" placeholder="Título" required>
        <textarea id="bookDescription" placeholder="Descripción"></textarea>
        <div class="form-grid">
          <select id="bookPublisher" required>
            <option value="">Seleccioná editorial</option>
            ${publishers.map(pub => `<option value="${pub.publisher_id}">${pub.name}</option>`).join("")}
          </select>
          <input type="number" id="bookYear" placeholder="Año" min="1900" max="2025">
        </div>
        <div class="form-grid">
          <input type="number" id="bookPurchasePrice" placeholder="Precio compra" min="0" step="0.01" required>
          <input type="number" id="bookRentalPrice" placeholder="Precio alquiler" min="0" step="0.01" required>
        </div>
        <select id="bookAuthors" multiple>
          ${authors.map(author => `<option value="${author.author_id}">${author.name}</option>`).join("")}
        </select>
        <select id="bookCategories" multiple>
          ${categories.map(cat => `<option value="${cat.category_id}">${cat.name}</option>`).join("")}
        </select>
        <button class="btn btn-primary" type="submit">Crear libro</button>
      </form>
    </div>
  `;
  const adminAddBookForm = document.getElementById("adminAddBookForm");
  adminAddBookForm.addEventListener("submit", handleAddBook);
}

async function showAddBookForm() {
  const data = await loadAdminOptions();
  renderAdminForm(data);
  adminSection.scrollIntoView({ behavior: "smooth" });
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
    showAlert("Completa los campos obligatorios", "error");
    return;
  }

  const res = await request(`/admin/books`, {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      publisher_id: Number(publisher_id),
      publication_year: publication_year ? Number(publication_year) : null,
      purchase_price,
      rental_price,
      author_ids: authorIds,
      category_ids: categoryIds,
    }),
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo crear el libro", "error");
    return;
  }
  showToast(result.message);
  loadAdminDashboard();
  loadBooks(lastSearch, filterCategory);
  adminExtra.innerHTML = "";
}

async function showSales() {
  const res = await request("/admin/sales");
  if (!res.ok) {
    showAlert("No se pudieron cargar las ventas", "error");
    return;
  }
  const sales = await res.json();
  adminExtra.innerHTML = `
    <div class="panel-card">
      <h3>Ventas registradas</h3>
      <div class="admin-extra">
        <table>
          <thead>
            <tr><th>ID</th><th>Usuario</th><th>Total</th><th>Fecha</th><th>Estado</th></tr>
          </thead>
          <tbody>
            ${sales.map(row => `
              <tr>
                <td>${row.sale_id}</td>
                <td>${row.first_name} ${row.last_name}</td>
                <td>$${row.total_amount}</td>
                <td>${row.sale_date.split('T')[0]}</td>
                <td>${row.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openModal() {
  authModal.classList.remove("hidden");
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  authModal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
}

function setAuthMode(mode) {
  if (mode === "register") {
    authModalTitle.textContent = "Registrarse";
    authSubmit.textContent = "Crear cuenta";
    registerFields.classList.remove("hidden");
    switchToRegister.textContent = "Iniciar sesión";
    switchToRegister.dataset.mode = "login";
  } else {
    authModalTitle.textContent = "Iniciar sesión";
    authSubmit.textContent = "Ingresar";
    registerFields.classList.add("hidden");
    switchToRegister.textContent = "Registrarse";
    switchToRegister.dataset.mode = "register";
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const mode = switchToRegister.dataset.mode === "login" ? "register" : "login";
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if (!email || !password) {
    showAlert("Completa email y contraseña", "error");
    return;
  }
  if (mode === "register") {
    const firstName = authFirstName.value.trim();
    const lastName = authLastName.value.trim();
    if (!firstName || !lastName) {
      showAlert("Completa nombre y apellido", "error");
      return;
    }
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
    });
    const result = await res.json();
    if (!res.ok) {
      showAlert(result.error || "No se pudo registrar", "error");
      return;
    }
    setToken(result.token);
    showToast("Registro exitoso");
    closeModal();
    toggleUserState();
    return;
  }
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo iniciar sesión", "error");
    return;
  }
  setToken(result.token);
  showToast("Bienvenido nuevamente");
  closeModal();
  toggleUserState();
}

async function handlePurchase() {
  if (!currentUser) {
    showAlert("Debés iniciar sesión para comprar", "error");
    openModal();
    setAuthMode("login");
    return;
  }
  const res = await request("/user/purchases", {
    method: "POST",
    body: JSON.stringify({ book_id: currentBook.book_id, quantity: 1 }),
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo procesar la compra", "error");
    return;
  }
  showToast(result.message);
  loadBooks(lastSearch, filterCategory);
  loadUserData();
}

async function handleRent() {
  if (!currentUser) {
    showAlert("Debés iniciar sesión para alquilar", "error");
    openModal();
    setAuthMode("login");
    return;
  }
  const res = await request("/user/loans", {
    method: "POST",
    body: JSON.stringify({ book_id: currentBook.book_id, days: 7 }),
  });
  const result = await res.json();
  if (!res.ok) {
    showAlert(result.error || "No se pudo procesar el préstamo", "error");
    return;
  }
  showToast(result.message);
  loadBooks(lastSearch, filterCategory);
  loadUserData();
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
    body: JSON.stringify({ rating, comment }),
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

btnExplore?.addEventListener("click", () => {
  document.getElementById("catalogSection").scrollIntoView({ behavior: "smooth" });
});

searchForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const value = searchInput.value.trim();
  loadBooks(value, filterCategory);
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

btnOpenLogin?.addEventListener("click", () => {
  setAuthMode("login");
  openModal();
});

btnOpenRegister?.addEventListener("click", () => {
  setAuthMode("register");
  openModal();
});

switchToRegister?.addEventListener("click", event => {
  event.preventDefault();
  const mode = event.target.dataset.mode === "register" ? "register" : "login";
  setAuthMode(mode);
});

closeAuthModal?.addEventListener("click", closeModal);
modalOverlay?.addEventListener("click", closeModal);

authForm?.addEventListener("submit", handleAuthSubmit);

closeDetail?.addEventListener("click", () => bookDetailSection.classList.add("hidden"));

btnBuy?.addEventListener("click", handlePurchase);
btnRent?.addEventListener("click", handleRent);
btnSubmitReview?.addEventListener("click", handleReviewSubmit);
btnLogout?.addEventListener("click", () => {
  clearToken();
  toggleUserState();
  showToast("Sesión cerrada");
});

btnAddBookElem?.addEventListener("click", event => {
  event.preventDefault();
  showAddBookForm();
});

btnViewSales?.addEventListener("click", event => {
  event.preventDefault();
  showSales();
});

async function init() {
  await loadCategories();
  await loadBooks();
  await loadRecommendedBooks();
  await toggleUserState();
}

init();
