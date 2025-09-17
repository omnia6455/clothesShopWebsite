document.addEventListener("DOMContentLoaded", function () {
  let currentPage = window.location.pathname.split("/").pop();

  if (!currentPage) {
    currentPage = "home.html";
  }

  let links = document.querySelectorAll(".navBar a");

  links.forEach(link => {
    let href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
    }
  });
});
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const body = document.body;
const toggleBtn = document.getElementById("themeToggle");
const toggleIcon = toggleBtn.querySelector("img");

let savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

toggleBtn.addEventListener("click", () => {
  let newTheme = body.classList.contains("light") ? "dark" : "light";
  setTheme(newTheme);
  localStorage.setItem("theme", newTheme);
});

function setTheme(theme) {
  body.className = theme;
  document.documentElement.setAttribute("data-theme", theme);

  if (theme === "dark") {
    toggleIcon.src = "Icons/dark_mode.png";
  } else {
    toggleIcon.src = "Icons/light_mode.png";
  }
}
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  const breadcrumbDiv = document.getElementById("breadcrumb");

  const pageLinks = {
    Home: "index.html",
    Shop: "shop.html",
    Men: "shopMen.html",
    Women: "shopWomen.html",
    "New Arrivals": "newArrivals.html",
    "On Sale": "onSale.html"
  };

  let currentPage = document.body.getAttribute("data-page")?.toLowerCase() ||
    window.location.pathname.split("/").pop().replace(".html", "").toLowerCase();

  if (currentPage === "index" || currentPage === "home" || currentPage === "") {
    breadcrumbDiv.innerHTML = "";
    localStorage.setItem("breadcrumbPath", JSON.stringify([]));
    return;
  }

  let breadcrumbPath = JSON.parse(localStorage.getItem("breadcrumbPath")) || [];

  if (!breadcrumbPath.find(item => item.name === "Home")) {
    breadcrumbPath.unshift({ name: "Home", href: "index.html" });
  }

  let currentName = "";
  let currentHref = "";

  if (currentPage === "productinfo") {
    const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));
    if (selectedProduct && selectedProduct.type) {
      currentName = selectedProduct.type;
      currentHref = "#";
    }
  } else {
    currentName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    currentHref = pageLinks[currentName] || "#";
  }

  const existingIndex = breadcrumbPath.findIndex(item => item.name === currentName);
  if (existingIndex !== -1) {
    breadcrumbPath = breadcrumbPath.slice(0, existingIndex + 1);
  } else {
    breadcrumbPath.push({ name: currentName, href: currentHref });
  }

  localStorage.setItem("breadcrumbPath", JSON.stringify(breadcrumbPath));

  if (breadcrumbPath.length > 0) {
    breadcrumbDiv.innerHTML = breadcrumbPath
      .map((item, index) => {
        if (index === breadcrumbPath.length - 1) return `<span>${item.name}</span>`;
        return `<a href="${item.href}">${item.name}</a> <span>›</span>`;
      })
      .join(" ");
  } else {
    breadcrumbDiv.innerHTML = "";
  }
});

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const sizes = [
  "Small", "Medium", "Large", "X-Large", "X-Large", "Large", "Medium", "Small",
  "Large", "Medium", "X-Large", "Small", "Large", "Small", "X-Large", "Medium",
  "X-Large", "Small", "Medium", "Large", "X-Large", "Medium", "Small", "Large",
  "Medium", "X-Large", "Small", "Large", "Medium", "Small", "Large", "Small",
  "Small", "Large", "X-Large", "Medium"
];

const types = [
  "T-shirts", "Jeans", "Shirts", "T-shirts", "T-shirts", "Shorts", "Shirts", "T-shirts",
  "T-shirts", "Jeans", "Shirts", "T-shirts", "Shirts", "T-shirts", "Shorts", "Jeans",
  "Shirts", "T-shirts", "Shorts", "Jeans", "Shirts", "T-shirts", "Shorts", "Jeans",
  "T-shirts", "T-shirts", "T-shirts", "T-shirts", "Blouses", "Blouses", "Shirts", "Jeans",
  "T-shirts", "Hoodies", "Hoodies", "Jeans"
];

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function () {

  const SELECTORS = {
    arrivalCard: ".arrivalsImagesBigDiv",
    cardAddBtn: ".addToCartButtonImage",
    productPageAddBtn: "#addToCartBtn",
    cartListWrapper: ".cartListDiv",
    orderSubtotal: ".subTotalValue",
    orderDiscount: ".discountValue",
    orderTotal: ".totalValue",
    clearCartBtn: ".clearcart"
  };

  function parsePriceString(str) {
    if (!str && str !== 0) return null;
    const num = String(str).replace(/[^\d.,]/g, "").replace(",", ".");
    const parsed = parseFloat(num);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function formatPrice(num) {
    if (num == null) return "$0.00";
    return `$${Number(num).toFixed(2)}`;
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("shoppingCart")) || [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
  }

  function saveSelectedProduct(product) {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
  }

  function buildProductFromCard(cardEl, index) {
    const imageEl = cardEl.querySelector(".arrivalsImagesDiv img");
    const titleEl = cardEl.querySelector(".titleInfo");
    const priceEl = cardEl.querySelector(".priceInfo");
    const oldEl = cardEl.querySelector(".oldPreice");
    const discountEl = cardEl.querySelector(".discount");

    const price = parsePriceString(priceEl?.textContent || priceEl?.innerText);
    const oldPrice = parsePriceString(oldEl?.textContent || oldEl?.innerText);
    let discountPercent = null;
    if (discountEl && /-?\d+%/.test(discountEl.textContent)) {
      discountPercent = Number((discountEl.textContent.match(/-?\d+/) || [0])[0]);
      discountPercent = Math.abs(discountPercent);
    }

    const id = cardEl.dataset.id || titleEl?.textContent?.trim() || Math.random().toString(36).slice(2, 9);

    return {
      id: String(id),
      image: imageEl?.getAttribute("src") || "Images/example.png",
      title: titleEl?.textContent?.trim() || "Product",
      price: price ?? 0,
      oldPrice: oldPrice ?? null,
      discountPercent: discountPercent ?? null,
      size: sizes[index % sizes.length],
      type: types[index % types.length],
      quantity: 1
    };
  }

  function buildProductFromProductPage() {
    const imageEl = document.querySelector(".ClotheImageDynamic") || document.querySelector(".detailsTabImage");
    const titleEl = document.querySelector(".shirtTitle") || document.querySelector(".detailsTabTitle") || document.querySelector(".titleInfo");
    const priceEl = document.querySelector(".priceInfo");
    const oldEl = document.querySelector(".oldPreice");
    const discountEl = document.querySelector(".discount");

    const price = parsePriceString(priceEl?.textContent || priceEl?.innerText);
    const oldPrice = parsePriceString(oldEl?.textContent || oldEl?.innerText);
    let discountPercent = null;
    if (discountEl && /-?\d+%/.test(discountEl.textContent)) {
      discountPercent = Number((discountEl.textContent.match(/-?\d+/) || [0])[0]);
      discountPercent = Math.abs(discountPercent);
    }

    return {
      id: (titleEl?.textContent || "product").replace(/\s+/g, "_"),
      image: imageEl?.getAttribute("src") || "Images/example.png",
      title: titleEl?.textContent?.trim() || "Product",
      price: price ?? 0,
      oldPrice: oldPrice ?? null,
      discountPercent: discountPercent ?? null,
      size: document.querySelector(".sizeValue")?.textContent?.trim() || "M",
      type: document.querySelector(".typeValue")?.textContent?.trim() || "Default",
      quantity: 1
    };
  }


  function addToCart(product) {
    const cart = loadCart();
    const matchIndex = cart.findIndex(
      (p) => p.id === product.id && p.size === product.size && p.type === product.type
    );
    if (matchIndex > -1) {
      cart[matchIndex].quantity = (cart[matchIndex].quantity || 1) + (product.quantity || 1);
    } else {
      cart.push(Object.assign({}, product));
    }
    saveCart(cart);
    renderCart();
    alert(`"${product.title}" was added succefully in your cart`);
  }

  function deleteCartItem(item) {
    let cart = loadCart();
    cart = cart.filter((p) => !(p.id === item.id && p.size === item.size && p.type === item.type));
    saveCart(cart);
    renderCart();
  }

  function updateCartItemQuantity(item, newQty) {
    const cart = loadCart();
    const idx = cart.findIndex((p) => p.id === item.id && p.size === item.size && p.type === item.type);
    if (idx > -1) {
      cart[idx].quantity = Math.max(1, newQty);
      saveCart(cart);
      renderCart();
    }
  }

  function clearCart() {
    localStorage.removeItem("shoppingCart");
    renderCart();
  }

  function computeTotals(cart) {
    let subtotal = 0;
    let discount = 0;

    cart.forEach((p) => {
      const qty = p.quantity || 1;
      const price = Number(p.price) || 0;
      let original = p.oldPrice != null ? Number(p.oldPrice) : null;

      if (original == null && p.discountPercent != null && p.discountPercent > 0) {
        const denom = 1 - (Number(p.discountPercent) / 100);
        if (denom > 0) original = price / denom;
      }

      if (original == null) original = price;

      subtotal += original * qty;
      discount += Math.max(0, (original - price)) * qty;
    });

    const total = subtotal - discount;
    return { subtotal, discount, total };
  }

  function renderCart() {
    const wrapper = document.querySelector(SELECTORS.cartListWrapper);
    const subtotalEl = document.querySelector(SELECTORS.orderSubtotal);
    const discountEl = document.querySelector(SELECTORS.orderDiscount);
    const totalEl = document.querySelector(SELECTORS.orderTotal);
    const clearBtn = document.querySelector(SELECTORS.clearCartBtn);

    if (!wrapper || !subtotalEl || !discountEl || !totalEl) return;

    const cart = loadCart();

    wrapper.innerHTML = "";

    if (!cart.length) {

      const emptyP = document.createElement("p");
      emptyP.style.textAlign = "center";
      emptyP.style.padding = "40px";
      emptyP.style.color = "var(--small-text)";
      emptyP.style.fontSize = "28px";
      emptyP.style.fontWeight = "700";
      emptyP.textContent = "There are no items yet :)";
      wrapper.appendChild(emptyP);

      const border = document.createElement("div");
      border.className = "borderSummry";
      wrapper.appendChild(border);

      subtotalEl.textContent = formatPrice(0);
      discountEl.textContent = formatPrice(0);
      totalEl.textContent = formatPrice(0);

      if (clearBtn) clearBtn.disabled = true;
      return;
    }

    cart.forEach((p) => {
      const item = document.createElement("div");
      item.className = "cartItem";

      const left = document.createElement("div");
      left.className = "itemDetails";

      const img = document.createElement("img");
      img.className = "itemImage";
      img.src = p.image || "Images/example.png";
      img.alt = p.title || "product";

      const detailsText = document.createElement("div");
      detailsText.className = "itemDetailsText";

      const titlesItem = document.createElement("div");
      titlesItem.className = "titlesItem";

      const nameP = document.createElement("p");
      nameP.className = "itemName";
      nameP.textContent = p.title;

      const sizeP = document.createElement("p");
      sizeP.className = "itemSize";
      sizeP.innerHTML = `<span class="itemSizeLable">Size: </span><span class="itemSizeValue">${p.size || "-"}</span>`;

      const typeP = document.createElement("p");
      typeP.className = "itemType";
      typeP.innerHTML = `<span class="itemTypeLable">Type: </span><span class="itemTypeValue">${p.type || "-"}</span>`;

      titlesItem.appendChild(nameP);
      titlesItem.appendChild(sizeP);
      titlesItem.appendChild(typeP);

      const priceP = document.createElement("p");
      priceP.className = "priceInfoCart";
      priceP.textContent = formatPrice((Number(p.price) || 0) * (p.quantity || 1));

      detailsText.appendChild(titlesItem);
      detailsText.appendChild(priceP);

      left.appendChild(img);
      left.appendChild(detailsText);

      const right = document.createElement("div");
      right.className = "deleteAndIncrementItem";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "deletebtn";
      deleteBtn.innerHTML = `<img src="Icons/deleteItem.png" width="30" height="30" alt="delete">`;

      const counter = document.createElement("div");
      counter.className = "counterForProductCart";

      const minus = document.createElement("img");
      minus.className = "minusProduct";
      minus.src = "Icons/minus.png";
      minus.width = 24;
      minus.height = 24;
      minus.style.cursor = "pointer";

      const qtyP = document.createElement("p");
      qtyP.className = "counterNumber";
      qtyP.textContent = p.quantity || 1;

      const plus = document.createElement("img");
      plus.className = "plusProduct";
      plus.src = "Icons/plus.png";
      plus.width = 24;
      plus.height = 24;
      plus.style.cursor = "pointer";

      counter.appendChild(minus);
      counter.appendChild(qtyP);
      counter.appendChild(plus);

      right.appendChild(deleteBtn);
      right.appendChild(counter);

      item.appendChild(left);
      item.appendChild(right);

      wrapper.appendChild(item);

      deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const confirmDelete = confirm(`Are you really sure you want to delete"${p.title}"?`);
        if (!confirmDelete) return;
        deleteCartItem(p);
      });

      plus.addEventListener("click", function (e) {
        e.stopPropagation();
        updateCartItemQuantity(p, (p.quantity || 1) + 1);
      });

      minus.addEventListener("click", function (e) {
        e.stopPropagation();
        const newQty = (p.quantity || 1) - 1;
        if (newQty < 1) return;
        updateCartItemQuantity(p, newQty);
      });
    });

    const border = document.createElement("div");
    border.className = "borderSummry";
    wrapper.appendChild(border);

    const totals = computeTotals(cart);
    subtotalEl.textContent = formatPrice(totals.subtotal);
    discountEl.textContent = formatPrice(totals.discount);
    totalEl.textContent = formatPrice(totals.total);

    if (clearBtn) clearBtn.disabled = false;
  }

  function initAddButtonsOnCards() {
    document.querySelectorAll(SELECTORS.arrivalCard).forEach((card) => {
      card.addEventListener("click", function (ev) {
        const clickedIsAddBtn = ev.target.closest(SELECTORS.cardAddBtn);
        if (clickedIsAddBtn) return;
        const prod = buildProductFromCard(card);
        saveSelectedProduct(prod);
      });

      const addBtn = card.querySelector(SELECTORS.cardAddBtn);
      if (addBtn) {
        addBtn.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          const prod = buildProductFromCard(card);
          addToCart(prod);
        });
      }
    });
  }

  function initAddButtonOnProductPage() {
    const btn = document.querySelector(SELECTORS.productPageAddBtn);
    if (!btn) return;
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      const prod = buildProductFromProductPage();
      addToCart(prod);
    });
  }

  function initClearCart() {
    const clearBtn = document.querySelector(SELECTORS.clearCartBtn);
    if (!clearBtn) return;
    clearBtn.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (!confirm("Are you really sure you want to delete all items?")) return;
      clearCart();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAddButtonsOnCards();
    initAddButtonOnProductPage();
    initClearCart();
    renderCart();
  });

  window.__shop = {
    addToCartManual: addToCart,
    getCart: loadCart,
    clearCart
  };
})();

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  const descriptions = [
    "This t-shirt with tape details combines minimal design with a unique touch. The subtle tape accents add a sporty element that makes it stand out from basic tees. Made from soft cotton, it ensures comfort and style, perfect for casual everyday looks.",

    "Skinny fit jeans designed to give you a sharp, modern silhouette. Crafted from stretchable denim, they adapt to your movement while keeping their shape. A versatile piece that pairs effortlessly with both casual tees and smart shirts.",

    "A timeless checkered shirt that never goes out of style. Its bold checks bring character, while the soft fabric ensures comfort throughout the day. Wear it buttoned up for a smart look or open over a t-shirt for a relaxed vibe.",

    "This sleeve striped t-shirt adds a fun, sporty twist to your wardrobe. The striped detail along the arms gives it a dynamic look without being overwhelming. Lightweight and breathable, it’s perfect for a casual, laid-back outfit.",

    "A t-shirt in pink color that brings freshness and charm to your everyday wear. The vibrant tone is eye-catching and perfect for summer. Made from breathable fabric, it’s a great choice for both comfort and style.",

    "These skinny fit short jeans are ideal for warm-weather days. With a slim cut and durable denim, they provide a stylish yet comfortable fit. Pair them with casual tops for a relaxed summer look.",

    "A green checkered shirt that adds bold personality to your outfit. The striking color blends with the classic checkered pattern, creating a balance of fun and style. Great for layering or wearing on its own.",

    "This burgundy t-shirt delivers depth and richness to your casual wardrobe. The dark shade adds sophistication, while the soft material keeps it comfortable. A great choice for simple yet stylish looks.",

    "A brown t-shirt inspired by earthy tones for a natural, grounded look. The color makes it versatile to style with both light and dark bottoms. Breathable fabric ensures comfort for everyday wear.",

    "Black skinny fit jeans that are sleek and timeless. The slim fit enhances your silhouette, while the fabric offers durability and stretch. Perfect for casual outings, nights out, or even semi-formal events.",

    "A purple checkered shirt that adds a playful yet stylish twist to classic checks. The rich color brings vibrancy, while the comfortable fabric ensures all-day ease. Ideal for casual occasions or smart-casual layering.",

    "This yellow t-shirt radiates positivity and energy. Bright and cheerful, it’s perfect for sunny days and uplifting outfits. Soft cotton makes it a comfortable piece for daily wear.",

    "Vertical striped shirt that brings elegance and a slimming effect to your look. The clean lines elongate your figure, while the light fabric makes it breathable. Perfect for both casual and semi-formal styling.",

    "Courage graphic t-shirt that speaks confidence and personality. The bold print is eye-catching, while the cotton base ensures comfort. Pair it with jeans or shorts for an effortless casual statement.",

    "Loose fit Bermuda shorts crafted for comfort and freedom of movement. The relaxed design makes them perfect for hot days and laid-back outings. Easy to pair with tees or polos for a casual summer look.",

    "Faded skinny jeans combining a worn-in style with a modern slim cut. The washed effect adds character, while the stretchable fabric keeps them comfortable. A versatile pair for both daytime and night wear.",

    "A striped brown shirt that blends earthy tones with classic styling. The stripes add dimension without overpowering, making it a versatile piece. Lightweight fabric ensures comfort for all-day wear.",

    "Graphic black t-shirt designed to make a bold statement. The striking graphic stands out against the dark backdrop, adding an edgy touch. Comfortable and versatile, it works perfectly for casual outfits.",

    "Black fit Bermuda shorts that balance simplicity and sharpness. The tailored fit creates a clean silhouette, while the color makes them versatile. A staple choice for casual summer outfits.",

    "Skinny blue jeans in a timeless shade that never goes out of fashion. The slim cut provides a sleek fit, while stretch denim ensures comfort. A must-have for pairing with anything from t-shirts to shirts.",

    "A striped black shirt that combines minimalism with a modern edge. The dark color base with fine stripes makes it easy to dress up or down. Comfortable and breathable, it works well for versatile occasions.",

    "One Life graphic t-shirt that captures boldness and individuality. The strong message pairs with a modern design, making it a statement piece. Lightweight and easy to style with denim or shorts.",

    "White fit Bermuda shorts that bring freshness and sophistication to summer looks. The tailored cut offers a neat silhouette, while the light shade keeps it breezy. Perfect for pairing with colorful or patterned tops.",

    "Skinny black jeans crafted for a sleek, modern vibe. Their slim cut creates a sharp outline, while the dark shade makes them versatile. Durable and comfortable, they’re a wardrobe essential for any occasion.",

    "This classic polo shirt features stylish contrast trims along the collar and sleeves, giving it a refined yet casual look. Crafted from soft breathable cotton, it ensures comfort and effortless style for everyday wear.",

    "A modern graphic t-shirt with a stunning gradient design that adds depth and personality. Made from lightweight cotton, it’s perfect for casual outings, layering, or making a bold statement.",

    "This polo shirt is elevated with elegant tipping details along the edges, providing a subtle sporty touch. Its soft fabric guarantees comfort, making it ideal for both casual and smart-casual occasions.",

    "A sleek black t-shirt featuring fine stripes that give it a minimal yet stylish look. Lightweight and breathable, it pairs effortlessly with jeans, shorts, or chinos for versatile everyday wear.",

    "A light and airy pink blouse perfect for summer days. Crafted from breathable fabric, it ensures comfort while adding a fresh and feminine touch to your everyday wardrobe.",

    "This green striped blouse brings a playful yet elegant vibe. Its lightweight, breathable fabric makes it ideal for layering or casual wear during warmer days.",

    "A timeless pink checkered shirt that combines classic style with a modern touch. Made from soft, comfortable fabric, it’s perfect for casual or smart-casual outfits.",

    "Wide-leg jeans made from soft cotton for maximum comfort and effortless style. The relaxed fit offers freedom of movement while maintaining a modern, chic look.",

    "A classic white t-shirt crafted from soft, breathable cotton. Its minimal design makes it a versatile wardrobe staple, perfect for layering or wearing on its own.",

    "A cozy purple hoodie designed for comfort and casual style. Soft and warm, it’s perfect for lounging, layering, or casual outings during cooler days.",

    "A sleek black hoodie combining comfort with a modern edge. Its soft fabric keeps you warm, while the minimalist design makes it versatile for everyday wear.",

    "High-waist wide-leg jeans that offer both style and comfort. The flattering fit elongates the legs, while the durable fabric ensures long-lasting wear for versatile outfits."
  ];
  document.querySelectorAll(".arrivalsImagesBigDiv").forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();

      const idAttr = card.getAttribute("data-id");
      const id = idAttr ? parseInt(idAttr, 10) : null;

      if (!id || isNaN(id)) {
        return;
      }

      const product = {
        image: card.querySelector("img").src,
        title: card.querySelector(".titleInfo").textContent,
        price: card.querySelector(".priceInfo").textContent,
        stars: card.querySelector(".stars").innerHTML,
        oldPrice: card.querySelector(".oldPreice") ? card.querySelector(".oldPreice").textContent : null,
        discount: card.querySelector(".discount") ? card.querySelector(".discount").textContent : null,
        description: descriptions[id - 1] || "No description available.",
        size: sizes[id - 1] || "Not available",
        type: types[id - 1] || "Not available"
      };

      localStorage.setItem("selectedProduct", JSON.stringify(product));
      window.location.href = "productInfo.html";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const product = JSON.parse(localStorage.getItem("selectedProduct"));

  if (!product) {
    console.warn("No product data found in localStorage!");
    return;
  }

  const imgEl = document.getElementById("productImage");
  const titleEl = document.getElementById("productTitle");
  const starsEl = document.getElementById("productStars");
  const priceEl = document.getElementById("productPrice");
  const oldPriceEl = document.getElementById("productOldPrice");
  const discountEl = document.getElementById("productDiscount");
  const descEl = document.getElementById("productDescription");
  const sizeEl = document.getElementById("productSize");

  if (imgEl) imgEl.src = product.image || "";
  if (titleEl) titleEl.textContent = product.title || "";
  if (starsEl) starsEl.innerHTML = product.stars || "";
  if (priceEl) priceEl.textContent = product.price || "";
  if (oldPriceEl) oldPriceEl.textContent = product.oldPrice || "";
  if (discountEl) discountEl.textContent = product.discount || "";
  if (descEl) descEl.textContent = product.description || "";
  if (sizeEl) sizeEl.textContent = product.size || "";
  if (oldPriceEl && discountEl) {

    if (product.oldPrice && product.discount) {
      oldPriceEl.classList.remove("hidden");
      discountEl.classList.remove("hidden");
      oldPriceEl.textContent = product.oldPrice;
      discountEl.textContent = product.discount;
    } else {
      oldPriceEl.classList.add("hidden");
      discountEl.classList.add("hidden");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const detailsTab = document.getElementById("details");

  if (detailsTab) {
    const product = JSON.parse(localStorage.getItem("selectedProduct")) || {
      image: "Images/example.png",
      title: "Sample Product",
      stars: "<i class='fa-solid fa-star'></i>".repeat(5),
      price: "$50",
      oldPrice: "$70",
      discount: "20% OFF",
      description: "This is a sample description.",
      size: "M",
      type: "T-shirt"
    };

    detailsTab.innerHTML = `
      <div class="productDetailsTab">
      <div class="imageAndProductTitle">
        <img src="${product.image}" alt="${product.title}" class="detailsTabImage">
        <h2 class="detailsTabTitle">${product.title}</h2>
        </div>
        <div class="productDetailsInfo">
         <p class="productRatingsAndPriceInfo">Product Details</p>
        <div class="productDetailsPriceStarsDes">
        <div class="stars">${product.stars || ""}</div>
        <div class="priceDiv">
        <p class="priceInfo">${product.price}</p>
        ${product.oldPrice ? `<p class="oldPreice">${product.oldPrice}</p>` : ""}
        ${product.discount ? `<p class="discount">${product.discount}</p>` : ""}
        </div>
        <p class="detailsOfTheShirt">${product.description}</p>
        <p class="productSize">
          <span class="sizeLabel">Size: </span>
          <span class="sizeValue">${product.size || "Not available"}</span>
        </p>
         <p class="productType">
          <span class="typeLabel">Type: </span>
          <span class="typeValue">${product.type || "Not available"}</span>
        </p>
        <div>
        </div>
      </div>
    `;
  }
});

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const tabs = document.querySelectorAll(".DetailsRatingFaqsTitles");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.target).classList.add("active");
  });
});
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const searchInput = document.getElementById("search");
const allCards = Array.from(document.querySelectorAll(".arrivalsImagesBigDiv"));

const cardsContainer = document.querySelector(".clothesImages");
const noResultMsg = document.createElement("p");
noResultMsg.textContent = "There is no item match your search!";
noResultMsg.style.width="100%";
noResultMsg.style.maxWidth="1350px";
noResultMsg.style.margin="auto";
noResultMsg.style.textAlign = "center";
noResultMsg.style.fontSize = "40px";
noResultMsg.style.fontWeight = "700";
noResultMsg.style.color = "var(--border-button)";
noResultMsg.style.display = "none";
cardsContainer.appendChild(noResultMsg);

searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    let anyVisible = false;

    allCards.forEach(card => {
        const titleEl = card.querySelector(".titleInfo");
        if (titleEl) {
            const matches = titleEl.textContent.toLowerCase().includes(query);
            card.style.display = matches ? "" : "none";
            if (matches) anyVisible = true;
        }
    });

    noResultMsg.style.display = anyVisible ? "none" : "block";
});

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  let scrollContainer = document.querySelector(".cardsBigDiv");
  let backBtn = document.getElementById("backBtn");
  let nextBtn = document.getElementById("nextBtn");

  if (scrollContainer && backBtn && nextBtn) {
    nextBtn.addEventListener("click", () => {
      scrollContainer.scrollLeft += 400;
      scrollContainer.style.scrollBehavior = "smooth";
    });

    backBtn.addEventListener("click", () => {
      scrollContainer.scrollLeft -= 300;
      scrollContainer.style.scrollBehavior = "smooth";
    });
  }
});

const cards = document.querySelectorAll(".card");
const options = {
  root: document.querySelector(".cardsBigDiv"),
  threshold: Array.from({ length: 101 }, (_, i) => i / 100)
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (window.innerWidth <= 480) {
      entry.target.classList.remove("partially-visible");
      return;
    }
    if (entry.intersectionRatio < 0.98) {
      entry.target.classList.add("partially-visible");
    } else {
      entry.target.classList.remove("partially-visible");
    }
  });
}, options);

cards.forEach(card => observer.observe(card));

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("beforeunload", () => {
  const scrollPos = window.scrollY;
  localStorage.setItem(window.location.pathname + "_scroll", scrollPos);
});

window.addEventListener("load", () => {
  const savedScroll = localStorage.getItem(window.location.pathname + "_scroll");
  if (savedScroll) {
    window.scrollTo(0, parseInt(savedScroll, 10));
  }
});
