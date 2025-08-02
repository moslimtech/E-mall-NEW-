const API_URL = "https://script.google.com/macros/s/AKfycbwcyqY4HfjGUGLAtslLd3m-bXh3pBNz6TsuWpjCXpJpJBzL_ElbaGCi-pjOiISSXKXtkg/exec";

window.onload = () => {
  loadFilters();
  filterStores();
};

function loadFilters() {
  // المدن
  fetch(`${API_URL}?action=getCities`)
    .then(res => res.json())
    .then(cities => {
      const select = document.getElementById("city-filter");
      cities.forEach(city => {
        select.innerHTML += `<option value="${city["IDالمدينة"]}">${city["المدينة"]}</option>`;
      });
    });

  // الأنشطة
  fetch(`${API_URL}?action=getCategories`)
    .then(res => res.json())
    .then(cats => {
      const select = document.getElementById("category-filter");
      cats.forEach(cat => {
        select.innerHTML += `<option value="${cat["معرف نوع النشاط"]}">${cat["اسم نوع النشاط"]}</option>`;
      });
    });

  // الحالات
  fetch(`${API_URL}?action=getStatuses`)
    .then(res => res.json())
    .then(statuses => {
      const select = document.getElementById("status-filter");
      statuses.forEach(st => {
        select.innerHTML += `<option value="${st["حالة المكان"]}">${st["حالة المكان"]}</option>`;
      });
    });
}

function loadRegions() {
  const cityId = document.getElementById("city-filter").value;
  const regionSelect = document.getElementById("region-filter");
  regionSelect.innerHTML = '<option value="">كل المناطق</option>';

  if (!cityId) return;

  fetch(`${API_URL}?action=getRegions&cityId=${cityId}`)
    .then(res => res.json())
    .then(regions => {
      regions.forEach(r => {
        regionSelect.innerHTML += `<option value="${r["IDالمنطقة"]}">${r["المنطقة"]}</option>`;
      });
    });
}

function filterStores() {
  const params = new URLSearchParams({
    action: "getStores",
    city: document.getElementById("city-filter").value,
    region: document.getElementById("region-filter").value,
    categoryId: document.getElementById("category-filter").value,
    status: document.getElementById("status-filter").value
  });

  fetch(`${API_URL}?${params}`)
    .then(res => res.json())
    .then(stores => renderStores(stores));
}

function renderStores(stores) {
  const list = document.getElementById("stores-list");
  list.innerHTML = "";

  if (stores.length === 0) {
    list.innerHTML = "<p>لا توجد نتائج مطابقة.</p>";
    return;
  }

  stores.forEach(store => {
    list.innerHTML += `
      <div class="store-card">
        <img src="${store["رابط صورة شعار المكان"]}" alt="${store["اسم المكان"]}">
        <div class="store-info">
          <h3>${store["اسم المكان"]}</h3>
          <p>الحالة: ${store["حالة المكان الان"]}</p>
          <p>رقم التواصل: ${store["رقم التواصل"]}</p>
          <a href="store-details.html?id=${store["معرف المكان"]}">عرض التفاصيل</a>
        </div>
      </div>
    `;
  });
}
