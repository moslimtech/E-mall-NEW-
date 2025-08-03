
const API = "https://script.google.com/macros/s/AKfycbwcyqY4HfjGUGLAtslLd3m-bXh3pBNz6TsuWpjCXpJpJBzL_ElbaGCi-pjOiISSXKXtkg/exec";

window.onload = () => {
  loadSelect("getCategories", "store-category", "معرف نوع النشاط", "اسم نوع النشاط");
  loadSelect("getCities", "store-city", "IDالمدينة", "المدينة");
  loadSelect("getFloors", "store-floor", "الدور", "الدور");
  loadSelect("getStatuses", "store-status", "حالة المكان", "حالة المكان");
  loadSelect("getDeliveryOptions", "store-delivery", "التوصيل", "التوصيل");
};

function loadSelect(action, elementId, valueKey, textKey) {
  fetch(`${API}?action=${action}`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById(elementId);
      data.forEach(item => {
        select.innerHTML += `<option value="${item[valueKey]}">${item[textKey]}</option>`;
      });
    });
}

function loadRegions() {
  const cityId = document.getElementById("store-city").value;
  const regionSelect = document.getElementById("store-region");
  regionSelect.innerHTML = '<option value="">اختر المنطقة</option>';

  fetch(`${API}?action=getRegions&cityId=${cityId}`)
    .then(res => res.json())
    .then(data => {
      data.forEach(item => {
        regionSelect.innerHTML += `<option value="${item["IDالمنطقة"]}">${item["المنطقة"]}</option>`;
      });
    });
}

function goToStoreSection() {
  const name = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const pass = document.getElementById("user-password").value.trim();
  const error = document.getElementById("user-error");

  if (!name || !email || !pass) {
    error.textContent = "يرجى إدخال كل البيانات";
    return;
  }

  error.textContent = "";
  document.getElementById("user-section").classList.add("hidden");
  document.getElementById("store-section").classList.remove("hidden");
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    alert("المتصفح لا يدعم تحديد الموقع");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    position => {
      const coords = `${position.coords.latitude},${position.coords.longitude}`;
      document.getElementById("store-location").value = coords;
    },
    () => alert("تعذر تحديد الموقع. تأكد من السماح.")
  );
}

async function submitRegistration() {
  const storeId = crypto.randomUUID();
  const fileInput = document.getElementById("logo-file");
  const storeLoading = document.getElementById("store-loading");
  const storeSuccess = document.getElementById("store-success");
  const storeError = document.getElementById("store-error");

  storeLoading.textContent = "⏳ جاري التسجيل، برجاء الانتظار...";
  storeSuccess.textContent = "";
  storeError.textContent = "";

  let logoPath = "", logoUrl = "";

  try {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const base64 = await toBase64(file);

      const upload = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          image: base64,
          storeId: storeId
        })
      }).then(res => res.json());

      if (upload.status === "success") {
        logoPath = upload.path;
        logoUrl = "https://drive.google.com/uc?id=" + upload.fileId;
      } else {
        throw new Error("فشل رفع صورة الشعار");
      }
    }

    const data = {
      userName: document.getElementById("user-name").value,
      userEmail: document.getElementById("user-email").value,
      userPassword: document.getElementById("user-password").value,
      storeName: document.getElementById("store-name").value,
      categoryId: document.getElementById("store-category").value,
      cityId: document.getElementById("store-city").value,
      regionId: document.getElementById("store-region").value,
      phone: document.getElementById("store-phone").value,
      whatsapp: document.getElementById("store-whatsapp").value,
      email: document.getElementById("store-email").value,
      location: document.getElementById("store-location").value,
      floor: document.getElementById("store-floor").value,
      status: document.getElementById("store-status").value,
      delivery: document.getElementById("store-delivery").value,
      logoPath,
      logoUrl,
      placeId: storeId
    };

    const saveRes = await fetch(API, {
      method: "POST",
      body: JSON.stringify(data)
    }).then(res => res.json());

    if (saveRes.status === "success") {
      storeSuccess.textContent = "✅ تم إنشاء الحساب بنجاح!";
    } else if (saveRes.message.includes("البريد الإلكتروني")) {
      storeError.textContent = "❌ هذا البريد مسجل مسبقًا.";
    } else {
      storeError.textContent = saveRes.message || "❌ حدث خطأ!";
    }

  } catch (err) {
    storeError.textContent = "❌ فشل في الإرسال: " + err.message;
  } finally {
    storeLoading.textContent = "";
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
