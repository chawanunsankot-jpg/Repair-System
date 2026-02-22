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
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("currentUser", newUser.username);

            setTimeout(() => { location.href = "index.html"; }, 100);
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

            let user = users.find(u => u.username === loginUser && u.password === loginPass);
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

    // ================= LOAD REPAIRS & ADMIN PANEL =================
    if (document.getElementById("repairList")) {
        renderRepairs();
        
        // ตรวจสอบสิทธิ์แอดมิน (ตำแหน่งเป็น "เจ้าหน้าที่")
        if (currentUser && currentUser.rank === "เจ้าหน้าที่") {
            const adminPanel = document.getElementById("adminPanel");
            if (adminPanel) {
                adminPanel.style.display = "block";
                renderUsers();
            }
        }
    }
});

// ================= GLOBAL FUNCTIONS =================

window.logout = function() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    location.href = "login.html";
};

window.addRepair = function() {
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
        image: (imageSrc && imageSrc.startsWith("data:image")) ? imageSrc : "",
        status: "รอดำเนินการ",
        date: new Date().toLocaleDateString('th-TH')
    };

    repairs.push(newRepair);
    localStorage.setItem("repairs", JSON.stringify(repairs));

    itemInput.value = "";
    detailInput.value = "";
    document.getElementById("imageUpload").value = "";
    previewImage.style.display = "none";
    previewImage.src = "";

    renderRepairs();
    alert("ส่งคำร้องสำเร็จ!");
};

window.renderRepairs = function() {
    const repairList = document.getElementById("repairList");
    if (!repairList) return;

    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    repairList.innerHTML = "";
    
    // ดึงข้อมูลผู้ใช้ปัจจุบันเพื่อเช็คสิทธิ์แอดมิน
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const current = localStorage.getItem("currentUser");
    const currentUser = users.find(u => u.username === current);
    const isAdmin = currentUser && currentUser.rank === "เจ้าหน้าที่";

    repairs.reverse().forEach(r => {
        let li = document.createElement("li");
        li.className = "repair-card";
        li.style.listStyle = "none";
        li.style.marginBottom = "15px";
        
        // หากเป็นแอดมิน ให้แสดง Dropdown เลือกสถานะ
        let statusHtml = `<p class="status">สถานะ: ${r.status}</p>`;
        if (isAdmin) {
            statusHtml = `
            <p class="status" style="margin-top: 10px;">สถานะ: 
                <select onchange="updateRepairStatus(${r.id}, this.value)" style="width: auto; padding: 5px; margin-left: 5px; display: inline-block;">
                    <option value="รอดำเนินการ" ${r.status === 'รอดำเนินการ' ? 'selected' : ''}>รอดำเนินการ</option>
                    <option value="กำลังซ่อม" ${r.status === 'กำลังซ่อม' ? 'selected' : ''}>กำลังซ่อม</option>
                    <option value="เสร็จสิ้น" ${r.status === 'เสร็จสิ้น' ? 'selected' : ''}>เสร็จสิ้น</option>
                </select>
            </p>`;
        }
        
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h4 style="margin-bottom: 5px;">🔧 ${r.item}</h4>
                <span style="font-size: 0.8em; color: #888;">${r.date || ''}</span>
            </div>
            <p style="margin-bottom: 5px;"><strong>รายละเอียด:</strong> ${r.detail}</p>
            <p style="margin-bottom: 10px;"><strong>ผู้แจ้ง:</strong> ${r.user}</p>
            ${r.image ? `<img src="${r.image}" style="width: 150px; border-radius: 10px; margin-bottom: 10px; display: block; object-fit: cover;">` : ""}
            ${statusHtml}
        `;
        repairList.appendChild(li);
    });
};

window.updateRepairStatus = function(id, newStatus) {
    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    let index = repairs.findIndex(r => r.id === id);
    if (index !== -1) {
        repairs[index].status = newStatus;
        localStorage.setItem("repairs", JSON.stringify(repairs));
        alert("อัปเดตสถานะการซ่อมสำเร็จ");
        renderRepairs();
    }
};

window.renderUsers = function() {
    const userList = document.getElementById("userList");
    if (!userList) return;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    userList.innerHTML = "";

    users.forEach(u => {
        let li = document.createElement("li");
        li.style.listStyle = "none";
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        
        li.innerHTML = `
            <div>
                <strong>${u.username}</strong> <span style="color:#888; font-size:0.9em;">(${u.rank})</span><br>
                <small>${u.email}</small>
            </div>
            <div>
                <button onclick="editUserRank('${u.username}')" class="btn-secondary" style="padding: 5px 10px; font-size: 12px; cursor: pointer;">แก้ตำแหน่ง</button>
            </div>
        `;
        userList.appendChild(li);
    });
};

window.editUserRank = function(username) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let index = users.findIndex(u => u.username === username);
    
    if (index !== -1) {
        let currentRank = users[index].rank;
        let newRank = prompt(`กรุณาพิมพ์ตำแหน่งใหม่สำหรับ ${username} \n(เช่น: นักศึกษา, อาจารย์, เจ้าหน้าที่):`, currentRank);
        
        if (newRank && newRank.trim() !== "") {
            users[index].rank = newRank.trim();
            localStorage.setItem("users", JSON.stringify(users));
            alert(`เปลี่ยนตำแหน่งของ ${username} เป็น "${newRank}" เรียบร้อยแล้ว`);
            renderUsers();
            
            // ถ้ายูสเซอร์ถูกแก้สิทธิ์ และกำลังล็อกอินอยู่ ให้โหลดหน้าใหม่เพื่อปรับสิทธิ์ทันที
            if (localStorage.getItem("currentUser") === username) {
                location.reload();
            }
        }
    }
};