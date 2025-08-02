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
      const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
      document.getElementById("store-location").value = coords;
    },
    err => {
      alert("تعذر الحصول على الموقع. تأكد من السماح للمتصفح.");
    }
  );
}

async function submitRegistration() {
  const success = document.getElementById("store-success");
  const error = document.getElementById("store-error");
  success.textContent = "";
  error.textContent = "";

  const fileInput = document.getElementById("logo-file");
  const file = fileInput.files[0];

  if (!file) {
    error.textContent = "يرجى اختيار صورة شعار المكان";
    return;
  }

  const base64 = await toBase64(file);
  const storeId = generateId();

  let uploadResponse;
  try {
    const formData = new URLSearchParams();
    formData.append("image", base64.split(",")[1]);
    formData.append("storeId", storeId);

    const res = await fetch(API, {
      method: "POST",
      body: formData
    });
    uploadResponse = await res.json();
  } catch (err) {
    error.textContent = "فشل رفع الصورة: " + err.message;
    return;
  }

  if (uploadResponse.status !== "success") {
    error.textContent = "لم يتم رفع صورة الشعار.";
    return;
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
    logoPath: uploadResponse.path,
    placeId: storeId,
    near: ""
  };

  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.status === "success") {
      success.textContent = "✅ تم إنشاء الحساب بنجاح!";
      fileInput.value = "";
    } else {
      error.textContent = result.message || "حدث خطأ أثناء الحفظ!";
    }
  } catch (err) {
    error.textContent = "خطأ أثناء الإرسال: " + err.message;
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function generateId() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
