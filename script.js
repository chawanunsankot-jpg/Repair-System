document.addEventListener("DOMContentLoaded", () => {
    // ป้องกันการเข้าถึงหน้าเว็บหากยังไม่เข้าสู่ระบบ
    if (!localStorage.getItem("loggedIn") &&
        !location.pathname.includes("login.html") &&
        !location.pathname.includes("register.html")) {
        location.href = "login.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const current = localStorage.getItem("currentUser");
    const currentUser = users.find(u => u.username === current);

    // ================= REGISTER =================
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", e => {
            e.preventDefault();

            let users = JSON.parse(localStorage.getItem("users")) || [];
            
            const regUser = document.getElementById("regUser").value;
            const regEmail = document.getElementById("regEmail").value;
            const regPass = document.getElementById("regPass").value;
            const regRank = document.getElementById("regRank").value;

            if (users.find(u => u.username === regUser)) {
                alert("ชื่อผู้ใช้นี้มีในระบบแล้ว");
                return;
            }

            const newUser = {
                username: regUser,
                email: regEmail,
                password: regPass,
                rank: regRank,
                avatar: ""
            };

            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));

            // ล็อกอินอัตโนมัติหลังสมัครเสร็จ
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("currentUser", newUser.username);

            setTimeout(() => {
                location.href = "index.html";
            }, 100);
        });
    }

    // ================= LOGIN =================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", e => {
            e.preventDefault();

            let users = JSON.parse(localStorage.getItem("users")) || [];
            const loginUser = document.getElementById("loginUser").value;
            const loginPass = document.getElementById("loginPass").value;

            let user = users.find(u =>
                u.username === loginUser &&
                u.password === loginPass
            );

            if (!user) {
                alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                return;
            }

            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("currentUser", user.username);

            location.href = "index.html";
        });
    }

    // ================= PROFILE =================
    const profileEmail = document.getElementById("profileEmail");
    if (profileEmail && currentUser) {
        document.getElementById("profileName").innerText = currentUser.username;
        profileEmail.innerText = currentUser.email;
        document.getElementById("profileRank").innerText = currentUser.rank;

        if (currentUser.avatar) {
            document.getElementById("profileImage").src = currentUser.avatar;
        }
    }

    // ================= PREVIEW IMAGE =================
    const imageUpload = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");
    if (imageUpload && previewImage) {
        imageUpload.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImage.src = event.target.result;
                    previewImage.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ================= LOAD REPAIRS =================
    if (document.getElementById("repairList")) {
        renderRepairs();
    }
});

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    location.href = "login.html";
}

// ================= ADD REPAIR =================
function addRepair() {
    const itemInput = document.getElementById("item");
    const detailInput = document.getElementById("detail");
    const previewImage = document.getElementById("previewImage");
    
    const item = itemInput.value.trim();
    const detail = detailInput.value.trim();
    const imageSrc = previewImage.src;

    if (!item || !detail) {
        alert("กรุณากรอกชื่ออุปกรณ์และรายละเอียดให้ครบถ้วน");
        return;
    }

    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    const currentUser = localStorage.getItem("currentUser") || "ผู้ใช้งานทั่วไป";

    const newRepair = {
        id: Date.now(),
        user: currentUser,
        item: item,
        detail: detail,
        // ตรวจสอบว่ารูปภาพเป็น base64 จริงๆ ไม่ใช่ URL ของหน้า index
        image: (imageSrc && imageSrc.startsWith("data:image")) ? imageSrc : "",
        status: "รอดำเนินการ",
        date: new Date().toLocaleDateString('th-TH')
    };

    repairs.push(newRepair);
    localStorage.setItem("repairs", JSON.stringify(repairs));

    // ล้างข้อมูลในฟอร์มหลังจากส่งเสร็จ
    itemInput.value = "";
    detailInput.value = "";
    document.getElementById("imageUpload").value = "";
    previewImage.style.display = "none";
    previewImage.src = "";

    renderRepairs();
    alert("ส่งคำร้องสำเร็จ!");
}

// ================= RENDER REPAIRS =================
function renderRepairs() {
    const repairList = document.getElementById("repairList");
    if (!repairList) return;

    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    repairList.innerHTML = "";

    // เรียงให้รายการใหม่สุดอยู่ด้านบน
    repairs.reverse().forEach(r => {
        let li = document.createElement("li");
        li.className = "repair-card";
        li.style.listStyle = "none";
        li.style.marginBottom = "15px";
        
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h4 style="margin-bottom: 5px;">🔧 ${r.item}</h4>
                <span style="font-size: 0.8em; color: #888;">${r.date || ''}</span>
            </div>
            <p style="margin-bottom: 5px;"><strong>รายละเอียด:</strong> ${r.detail}</p>
            <p style="margin-bottom: 10px;"><strong>ผู้แจ้ง:</strong> ${r.user}</p>
            ${r.image ? `<img src="${r.image}" style="width: 150px; border-radius: 10px; margin-bottom: 10px; display: block; object-fit: cover;">` : ""}
            <p class="status">สถานะ: ${r.status}</p>
        `;
        repairList.appendChild(li);
    });
}