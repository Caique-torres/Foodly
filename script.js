// ==========================================
// CONFIGURAÇÃO
// ==========================================

const API_URL =
    "https://www.themealdb.com/api/json/v1/1/";


// ==========================================
// ELEMENTOS
// ==========================================

const restaurantGrid =
    document.getElementById("restaurantGrid");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const modal =
    document.getElementById("restaurantModal");

const modalClose =
    document.getElementById("modalClose");

const sortSelect =
    document.getElementById("sortSelect");

const filterButtons =
    document.querySelectorAll(".filter");

const clearFilters =
    document.getElementById("clearFilters");

const categoryButtons =
    document.querySelectorAll(".category-card");


// ==========================================
// ESTADO
// ==========================================

let allMeals = [];

let currentMeals = [];

let currentFilter = "all";

let currentSearch = "";

let currentSort = "popular";


// ==========================================
// API
// ==========================================

async function fetchAPI(endpoint) {

    const response =
        await fetch(API_URL + endpoint);

    if (!response.ok) {

        throw new Error(
            "Erro ao acessar a API"
        );

    }

    return response.json();

}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    if (loading) {

        loading.classList.remove("hidden");

    }

    if (emptyState) {

        emptyState.classList.add("hidden");

    }

    if (restaurantGrid) {

        restaurantGrid.innerHTML = "";

    }

}


function hideLoading() {

    if (loading) {

        loading.classList.add("hidden");

    }

}


// ==========================================
// DADOS EXTRAS
// ==========================================

function enrichMeal(meal) {

    const id =
        parseInt(meal.idMeal) || 1;

    const rating =
        4.2 + ((id % 8) / 10);

    const price =
        15 + ((id % 5) * 7);

    const time =
        20 + ((id % 4) * 5);

    return {

        ...meal,

        rating:
            Number(
                rating.toFixed(1)
            ),

        price,

        time

    };

}


// ==========================================
// CARREGAR PRATOS
// ==========================================

async function loadMeals() {

    showLoading();

    try {

        const categories = [
            "Beef",
            "Chicken",
            "Pasta",
            "Seafood",
            "Dessert"
        ];

        const requests =
            categories.map(
                category =>
                    fetchAPI(
                        `filter.php?c=${category}`
                    )
            );

        const responses =
            await Promise.all(requests);

        let meals = [];

        responses.forEach(
            response => {

                if (response.meals) {

                    meals.push(
                        ...response.meals
                    );

                }

            }
        );

        const uniqueMeals =
            Array.from(
                new Map(
                    meals.map(
                        meal => [
                            meal.idMeal,
                            meal
                        ]
                    )
                ).values()
            );

        allMeals =
            uniqueMeals.map(
                meal =>
                    enrichMeal(meal)
            );

        currentMeals =
            [...allMeals];

        currentFilter =
            "all";

        currentSearch =
            "";

        applyFilters();

    } catch (error) {

        console.error(
            "Erro ao carregar pratos:",
            error
        );

        showError();

    }

}


// ==========================================
// FILTROS
// ==========================================

function applyFilters() {

    let result =
        [...allMeals];


    if (currentSearch) {

        result =
            result.filter(
                meal => {

                    const name =
                        (
                            meal.strMeal ||
                            ""
                        ).toLowerCase();

                    const category =
                        (
                            meal.strCategory ||
                            ""
                        ).toLowerCase();

                    return (
                        name.includes(
                            currentSearch
                        ) ||
                        category.includes(
                            currentSearch
                        )
                    );

                }
            );

    }


    if (
        currentFilter === "rating"
    ) {

        result =
            result.filter(
                meal =>
                    meal.rating >= 4.5
            );

    }


    if (
        currentFilter === "price"
    ) {

        result =
            result.filter(
                meal =>
                    meal.price <= 30
            );

    }


    if (
        currentFilter === "fast"
    ) {

        result =
            result.filter(
                meal =>
                    meal.time <= 30
            );

    }


    if (
        currentSort === "rating" ||
        currentSort === "popular"
    ) {

        result.sort(
            (a, b) =>
                b.rating -
                a.rating
        );

    }


    if (
        currentSort === "name"
    ) {

        result.sort(
            (a, b) =>
                (
                    a.strMeal || ""
                ).localeCompare(
                    b.strMeal || ""
                )
        );

    }


    currentMeals =
        result;

    renderMeals(result);

}


// ==========================================
// RENDERIZAR PRATOS
// ==========================================

function renderMeals(meals) {

    hideLoading();

    if (!restaurantGrid) {
        return;
    }

    restaurantGrid.innerHTML = "";

    if (
        !meals ||
        meals.length === 0
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );

        }

        return;

    }

    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }

    meals.forEach(
        meal => {

            restaurantGrid.appendChild(
                createMealCard(meal)
            );

        }
    );

}


// ==========================================
// CARD
// ==========================================

function createMealCard(meal) {

    const card =
        document.createElement("article");

    card.className =
        "restaurant-card";

    card.style.cssText = `
        background: white;
        border: 1px solid var(--border);
        border-radius: 18px;
        overflow: hidden;
        transition: .3s;
    `;

    card.innerHTML = `

        <div
            style="
                height: 190px;
                position: relative;
                overflow: hidden;
            "
        >

            <img
                src="${meal.strMealThumb}"
                alt="${meal.strMeal}"
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                "
            >

            <button
                class="card-favorite"
                type="button"
                aria-label="Favoritar prato"
                style="
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    border: none;
                    background: white;
                    cursor: pointer;
                    font-size: 17px;
                    z-index: 2;
                "
            >
                ♡
            </button>

            <span
                style="
                    position: absolute;
                    left: 12px;
                    bottom: 12px;
                    background: white;
                    padding: 6px 9px;
                    border-radius: 7px;
                    font-size: 11px;
                    font-weight: 700;
                "
            >
                ${meal.strCategory || "Prato"}
            </span>

        </div>

        <div
            style="
                padding: 18px;
            "
        >

            <h3
                style="
                    font-size: 18px;
                    margin-bottom: 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                "
            >
                ${meal.strMeal}
            </h3>

            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    color: #777;
                    font-size: 13px;
                    margin-bottom: 8px;
                "
            >

                <span>
                    ⭐ ${meal.rating}
                </span>

                <span>
                    🕐 ${meal.time} min
                </span>

            </div>

            <div
                style="
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 14px;
                "
            >
                A partir de
                R$ ${meal.price.toFixed(2)}
            </div>

            <button
                class="view-restaurant"
                type="button"
                style="
                    width: 100%;
                    margin-top: 16px;
                    padding: 11px;
                    border: none;
                    border-radius: 9px;
                    background: #fff0e9;
                    color: var(--primary);
                    font-weight: 700;
                    cursor: pointer;
                "
            >
                Ver prato
            </button>

        </div>

    `;


    const favoriteButton =
        card.querySelector(
            ".card-favorite"
        );


    if (favoriteButton) {

        favoriteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                if (
                    favoriteButton.textContent.trim()
                    === "♡"
                ) {

                    favoriteButton.textContent =
                        "❤️";

                } else {

                    favoriteButton.textContent =
                        "♡";

                }

            }
        );

    }


    const viewButton =
        card.querySelector(
            ".view-restaurant"
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () => {

                openMeal(
                    meal.idMeal
                );

            }
        );

    }


    card.addEventListener(
        "mouseenter",
        () => {

            card.style.transform =
                "translateY(-6px)";

            card.style.boxShadow =
                "0 20px 40px rgba(0,0,0,.08)";

        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            card.style.transform =
                "translateY(0)";

            card.style.boxShadow =
                "none";

        }
    );


    return card;

}


// ==========================================
// BUSCA
// ==========================================

function searchMeals() {

    if (!searchInput) {
        return;
    }

    currentSearch =
        searchInput.value
            .toLowerCase()
            .trim();

    applyFilters();

    const restaurants =
        document.getElementById(
            "restaurantes"
        );

    if (restaurants) {

        restaurants.scrollIntoView({
            behavior: "smooth"
        });

    }

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchMeals
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                searchMeals();

            }

        }
    );

}


// ==========================================
// FILTROS
// ==========================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    button === clearFilters
                ) {

                    resetFilters();

                    return;

                }

                currentFilter =
                    button.dataset.filter ||
                    "all";

                filterButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                applyFilters();

            }
        );

    }
);


// ==========================================
// RESETAR FILTROS
// ==========================================

function resetFilters() {

    currentFilter =
        "all";

    currentSearch =
        "";

    currentSort =
        "popular";

    if (searchInput) {

        searchInput.value =
            "";

    }

    if (sortSelect) {

        sortSelect.value =
            "popular";

    }

    filterButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );

    const allFilter =
        document.querySelector(
            '[data-filter="all"]'
        );

    if (allFilter) {

        allFilter.classList.add(
            "active"
        );

    }

    applyFilters();

}


if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        resetFilters
    );

}


// ==========================================
// ORDENAÇÃO
// ==========================================

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        event => {

            currentSort =
                event.target.value;

            applyFilters();

        }
    );

}


// ==========================================
// CATEGORIAS
// ==========================================

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                categoryButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                const category =
                    button.dataset.category;

                showLoading();

                try {

                    let meals = [];

                    if (
                        category === "all"
                    ) {

                        const categories = [
                            "Beef",
                            "Chicken",
                            "Pasta",
                            "Seafood",
                            "Dessert"
                        ];

                        const requests =
                            categories.map(
                                category =>
                                    fetchAPI(
                                        `filter.php?c=${category}`
                                    )
                            );

                        const responses =
                            await Promise.all(
                                requests
                            );

                        responses.forEach(
                            response => {

                                if (
                                    response.meals
                                ) {

                                    meals.push(
                                        ...response.meals
                                    );

                                }

                            }
                        );

                    } else {

                        const data =
                            await fetchAPI(
                                `filter.php?c=${category}`
                            );

                        meals =
                            data.meals || [];

                    }

                    const uniqueMeals =
                        Array.from(
                            new Map(
                                meals.map(
                                    meal => [
                                        meal.idMeal,
                                        meal
                                    ]
                                )
                            ).values()
                        );

                    allMeals =
                        uniqueMeals.map(
                            meal =>
                                enrichMeal(meal)
                        );

                    currentMeals =
                        [...allMeals];

                    currentFilter =
                        "all";

                    currentSearch =
                        "";

                    if (searchInput) {

                        searchInput.value =
                            "";

                    }

                    filterButtons.forEach(
                        btn => {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );

                    const allFilter =
                        document.querySelector(
                            '[data-filter="all"]'
                        );

                    if (allFilter) {

                        allFilter.classList.add(
                            "active"
                        );

                    }

                    applyFilters();

                    const restaurants =
                        document.getElementById(
                            "restaurantes"
                        );

                    if (restaurants) {

                        restaurants.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                } catch (error) {

                    console.error(
                        "Erro ao carregar categoria:",
                        error
                    );

                    showError();

                }

            }
        );

    }
);


// ==========================================
// TRADUÇÃO
// ==========================================

async function translateToPortuguese(text) {

    if (!text) {

        return "Descrição não disponível.";

    }

    try {

        const url =
            "https://translate.googleapis.com/" +
            "translate_a/single" +
            "?client=gtx" +
            "&sl=auto" +
            "&tl=pt" +
            "&dt=t" +
            "&q=" +
            encodeURIComponent(text);

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Erro na tradução"
            );

        }

        const data =
            await response.json();

        if (
            data &&
            data[0]
        ) {

            return data[0]
                .map(
                    item =>
                        item[0]
                )
                .join("");

        }

        return text;

    } catch (error) {

        console.error(
            "Erro ao traduzir:",
            error
        );

        return text;

    }

}


// ==========================================
// MODAL
// ==========================================

async function openMeal(id) {

    try {

        const data =
            await fetchAPI(
                `lookup.php?i=${id}`
            );

        if (
            !data.meals ||
            data.meals.length === 0
        ) {

            return;

        }

        const meal =
            data.meals[0];


        const modalImage =
            document.getElementById(
                "modalImage"
            );

        const modalCategory =
            document.getElementById(
                "modalCategory"
            );

        const modalTitle =
            document.getElementById(
                "modalTitle"
            );

        const modalRating =
            document.getElementById(
                "modalRating"
            );

        const modalDescription =
            document.getElementById(
                "modalDescription"
            );


        /* ID DO PRATO */

        if (modalTitle) {

            modalTitle.dataset.id =
                meal.idMeal;

        }


        /* IMAGEM */

        if (modalImage) {

            modalImage.innerHTML = `

                <img
                    src="${meal.strMealThumb}"
                    alt="${meal.strMeal}"
                    style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    "
                >

            `;

        }


        /* CATEGORIA */

        if (modalCategory) {

            modalCategory.textContent =
                translateCategory(
                    meal.strCategory
                );

        }


        /* NOME */

        if (modalTitle) {

            modalTitle.textContent =
                meal.strMeal;

        }


        /* AVALIAÇÃO */

        if (modalRating) {

            modalRating.textContent =
                generateRating(
                    meal.idMeal
                );

        }


        /* DESCRIÇÃO */

        if (modalDescription) {

            modalDescription.textContent =
                "Traduzindo descrição...";

            const translated =
                await translateToPortuguese(
                    meal.strInstructions
                );

            modalDescription.textContent =
                translated;

        }


        /* ABRIR MODAL */

        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }

        document.body.style.overflow =
            "hidden";


    } catch (error) {

        console.error(
            "Erro ao carregar detalhes:",
            error
        );

    }

}


// ==========================================
// TRADUZIR CATEGORIA
// ==========================================

function translateCategory(category) {

    const categories = {

        Beef:
            "Carnes",

        Chicken:
            "Frango",

        Pasta:
            "Massas",

        Seafood:
            "Frutos do mar",

        Dessert:
            "Sobremesas",

        Lamb:
            "Cordeiro",

        Pork:
            "Porco",

        Vegetarian:
            "Vegetariano",

        Vegan:
            "Vegano",

        Breakfast:
            "Café da manhã",

        Miscellaneous:
            "Diversos"

    };

    return (
        categories[category] ||
        category ||
        "Prato"
    );

}


// ==========================================
// RATING
// ==========================================

function generateRating(id) {

    const number =
        parseInt(id) || 1;

    return (
        4.5 +
        ((number % 5) / 10)
    ).toFixed(1);

}


// ==========================================
// FECHAR MODAL
// ==========================================

function closeModal() {

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

    document.body.style.overflow =
        "";

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


if (modal) {

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


// ==========================================
// ERRO
// ==========================================

function showError() {

    hideLoading();

    if (restaurantGrid) {

        restaurantGrid.innerHTML =
            "";

    }

    if (!emptyState) {
        return;
    }

    emptyState.classList.remove(
        "hidden"
    );

    emptyState.innerHTML = `

        <span>
            😕
        </span>

        <h3>
            Não conseguimos carregar os dados
        </h3>

        <p>
            Verifique sua conexão e tente novamente.
        </p>

        <button
            onclick="loadMeals()"
            style="
                margin-top: 20px;
                padding: 12px 20px;
                border: none;
                border-radius: 9px;
                background: var(--primary);
                color: white;
                font-weight: 700;
                cursor: pointer;
            "
        >
            Tentar novamente
        </button>

    `;

}


// ==========================================
// CARRINHO
// ==========================================

let cart = [];


const cartSidebar =
    document.getElementById(
        "cartSidebar"
    );

const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );

const cartItems =
    document.getElementById(
        "cartItems"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );

const cartCount =
    document.getElementById(
        "cartCount"
    );

const openCart =
    document.getElementById(
        "openCart"
    );

const closeCart =
    document.getElementById(
        "closeCart"
    );

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );

const checkoutMessage =
    document.getElementById(
        "checkoutMessage"
    );

const closeCheckoutMessage =
    document.getElementById(
        "closeCheckoutMessage"
    );


// ==========================================
// ABRIR CARRINHO
// ==========================================

function openCartSidebar() {

    if (!cartSidebar) {
        return;
    }

    cartSidebar.classList.add(
        "open"
    );

    if (cartOverlay) {

        cartOverlay.classList.remove(
            "hidden"
        );

    }

}


// ==========================================
// FECHAR CARRINHO
// ==========================================

function closeCartSidebar() {

    if (!cartSidebar) {
        return;
    }

    cartSidebar.classList.remove(
        "open"
    );

    if (cartOverlay) {

        cartOverlay.classList.add(
            "hidden"
        );

    }

}


if (openCart) {

    openCart.addEventListener(
        "click",
        openCartSidebar
    );

}


if (closeCart) {

    closeCart.addEventListener(
        "click",
        closeCartSidebar
    );

}


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        closeCartSidebar
    );

}


// ==========================================
// ADICIONAR AO CARRINHO
// ==========================================

function addToCart(meal) {

    const existing =
        cart.find(
            item =>
                item.idMeal ===
                meal.idMeal
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            idMeal:
                meal.idMeal,

            name:
                meal.strMeal,

            image:
                meal.strMealThumb,

            price:
                meal.price || 20,

            quantity:
                1

        });

    }


    renderCart();

    openCartSidebar();

}


// ==========================================
// RENDERIZAR CARRINHO
// ==========================================

function renderCart() {

    if (!cartItems) {
        return;
    }


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <p class="cart-empty">
                Seu carrinho está vazio.
            </p>

        `;

    } else {

        cartItems.innerHTML =
            cart.map(
                item => `

                <div class="cart-item">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <div class="cart-item-info">

                        <h3>
                            ${item.name}
                        </h3>

                        <div class="cart-item-price">

                            R$
                            ${(
                                item.price *
                                item.quantity
                            ).toFixed(2)}

                        </div>

                        <div class="cart-quantity">

                            <button
                                onclick="changeQuantity('${item.idMeal}', -1)"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                onclick="changeQuantity('${item.idMeal}', 1)"
                            >
                                +
                            </button>

                            <button
                                class="remove-cart-item"
                                onclick="removeFromCart('${item.idMeal}')"
                            >
                                Remover
                            </button>

                        </div>

                    </div>

                </div>

            `
            ).join("");

    }


    updateCartTotal();

}


// ==========================================
// ALTERAR QUANTIDADE
// ==========================================

function changeQuantity(
    id,
    amount
) {

    const item =
        cart.find(
            item =>
                item.idMeal === id
        );


    if (!item) {
        return;
    }


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item =>
                    item.idMeal !== id
            );

    }


    renderCart();

}


// ==========================================
// REMOVER ITEM
// ==========================================

function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                item.idMeal !== id
        );

    renderCart();

}


// ==========================================
// ATUALIZAR TOTAL
// ==========================================

function updateCartTotal() {

    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    const quantity =
        cart.reduce(
            (sum, item) =>
                sum +
                item.quantity,
            0
        );


    if (cartTotal) {

        cartTotal.textContent =
            `R$ ${total.toFixed(2)}`;

    }


    if (cartCount) {

        cartCount.textContent =
            quantity;

    }

}


// ==========================================
// FINALIZAR COMPRA
// ==========================================

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        () => {

            if (cart.length === 0) {

                alert(
                    "Seu carrinho está vazio!"
                );

                return;

            }


            cart = [];

            renderCart();

            closeCartSidebar();


            if (checkoutMessage) {

                checkoutMessage.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


// ==========================================
// FECHAR MENSAGEM
// ==========================================

if (closeCheckoutMessage) {

    closeCheckoutMessage.addEventListener(
        "click",
        () => {

            checkoutMessage.classList.add(
                "hidden"
            );

        }
    );

}


// ==========================================
// ADICIONAR AO CARRINHO PELO MODAL
// ==========================================

const primaryButton =
    document.querySelector(
        ".primary-button"
    );


if (primaryButton) {

    primaryButton.addEventListener(
        "click",
        () => {

            const modalTitle =
                document.getElementById(
                    "modalTitle"
                );


            if (!modalTitle) {
                return;
            }


            const id =
                modalTitle.dataset.id;


            const meal =
                currentMeals.find(
                    item =>
                        item.idMeal === id
                );


            if (meal) {

                addToCart(meal);

                closeModal();

            } else {

                alert(
                    "Não foi possível adicionar este prato."
                );

            }

        }
    );

}


// ==========================================
// INICIAR
// ==========================================

renderCart();

loadMeals();
