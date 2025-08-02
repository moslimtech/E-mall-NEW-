// register.js

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

function submitRegistration() {
  const fileInput = document.getElementById("logo-file");
  const file = fileInput.files[0];
  const storeId = crypto.randomUUID();
  const storeSuccess = document.getElementById("store-success");
  const storeError = document.getElementById("store-error");

  if (!file) {
    storeError.textContent = "يرجى اختيار صورة الشعار.";
    return;
  }

  const reader = new FileReader();
  reader.onloadend = function () {
    const base64Image = reader.result.split(",")[1];

    fetch(API, {
      method: "POST",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        image: base64Image,
        storeId: storeId
      })
    })
      .then(res => res.json())
      .then(imgRes => {
        if (imgRes.status === "success") {
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
            logoPath: imgRes.path,
            logoUrl: "https://drive.google.com/uc?id=" + imgRes.fileId,
            placeId: storeId,
            near: ""
          };

          fetch(API, {
            method: "POST",
            body: JSON.stringify(data)
          })
            .then(res => res.json())
            .then(res => {
              if (res.status === "success") {
                storeSuccess.textContent = "✅ تم إنشاء الحساب بنجاح!";
              } else {
                storeError.textContent = res.message || "حدث خطأ أثناء الحفظ!";
              }
            })
            .catch(err => {
              storeError.textContent = "❌ فشل في الحفظ: " + err.message;
            });

        } else {
          storeError.textContent = "❌ فشل رفع صورة الشعار";
        }
      })
      .catch(err => {
        storeError.textContent = "❌ فشل رفع الصورة: " + err.message;
      });
  };
  reader.readAsDataURL(file);
}
