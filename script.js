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
    const avatarUpload = document.getElementById("avatarUpload");
    const profileImage = document.getElementById("profileImage");

    if (profileEmail && currentUser) {
        document.getElementById("profileName").innerText = currentUser.username;
        profileEmail.innerText = currentUser.email;
        document.getElementById("profileRank").innerText = currentUser.rank;
        
        // ดึงรูปจากข้อมูลผู้ใช้มาแสดง
        if (currentUser.avatar) {
            profileImage.src = currentUser.avatar;
        }

        // เพิ่มฟังก์ชันอัปโหลดรูป
        if (avatarUpload) {
            avatarUpload.addEventListener("change", function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const base64Image = event.target.result;
                        
                        // 1. แสดงรูปทันที
                        profileImage.src = base64Image;

                        // 2. บันทึกลงฐานข้อมูล (users array)
                        let allUsers = JSON.parse(localStorage.getItem("users")) || [];
                        const userIndex = allUsers.findIndex(u => u.username === currentUser.username);
                        
                        if (userIndex !== -1) {
                            allUsers[userIndex].avatar = base64Image;
                            localStorage.setItem("users", JSON.stringify(allUsers));
                            alert("อัปเดตรูปโปรไฟล์สำเร็จ!");
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
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
        
        // ตรวจสอบสิทธิ์แอดมิน (เปลี่ยนเป็น "แอดมิน" เพื่อให้แอดมินเห็นคนเดียว)
        if (currentUser && currentUser.rank === "แอดมิน") {
            const adminPanel = document.getElementById("adminPanel");
            if (adminPanel) {
                adminPanel.style.display = "block";
                renderUsers();
            }
        }
    }
});

// ================= GLOBAL FUNCTIONS =================
function resizeImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const maxWidth = 600;

            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // บีบคุณภาพรูป
            const compressed = canvas.toDataURL("image/jpeg", 0.6);
            callback(compressed);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.logout = function() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    location.href = "login.html";
};

window.addRepair = function() {

    const itemInput = document.getElementById("item");
    const detailInput = document.getElementById("detail");
    const file = document.getElementById("imageUpload").files[0];

    // ✅ ต้องมี 2 บรรทัดนี้
    const item = itemInput.value.trim();
    const detail = detailInput.value.trim();

    if (!item || !detail) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    if (file && file.size > 2 * 1024 * 1024) {
        alert("รูปต้องไม่เกิน 2MB");
        return;
    }

    if (file) {
        resizeImage(file, function(imageData) {
            saveRepair(imageData);
        });
    } else {
        saveRepair("");
    }

    function saveRepair(imageData) {
        let repairs = JSON.parse(localStorage.getItem("repairs")) || [];

        const newRepair = {
            id: Date.now(),
            user: localStorage.getItem("currentUser"),
            item: item,
            detail: detail,
            image: imageData,
            status: "รอดำเนินการ",
            date: new Date().toLocaleDateString('th-TH')
        };

        try {
            repairs.push(newRepair);
            localStorage.setItem("repairs", JSON.stringify(repairs));
        } catch (e) {
            alert("❌ พื้นที่เต็ม กรุณาลบข้อมูลเก่า");
            return;
        }

        // reset form
        itemInput.value = "";
        detailInput.value = "";
        document.getElementById("imageUpload").value = "";

        const previewImage = document.getElementById("previewImage");
        if (previewImage) {
            previewImage.src = "";
            previewImage.style.display = "none";
        }

        renderRepairs();

        alert("✅ ส่งคำร้องสำเร็จ!");
    }
};

window.renderRepairs = function() {
    const repairList = document.getElementById("repairList");
    if (!repairList) return;

    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    repairList.innerHTML = "";
    
    // ดึงข้อมูลผู้ใช้ปัจจุบันเพื่อเช็คสิทธิ์
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const current = localStorage.getItem("currentUser");
    const currentUser = users.find(u => u.username === current);
    
    // ทั้ง "แอดมิน" และ "เจ้าหน้าที่" สามารถจัดการงานได้ (แก้สถานะ / ลบงาน)
    const canManageRepair = currentUser && (currentUser.rank === "เจ้าหน้าที่" || currentUser.rank === "แอดมิน");

    repairs.reverse().forEach(r => {
        let li = document.createElement("li");
        li.className = "repair-card";
        li.style.listStyle = "none";
        li.style.marginBottom = "15px";
        
        let statusHtml = `<p class="status">สถานะ: ${r.status}</p>`;
        if (canManageRepair) {
            statusHtml = `
            <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                <p class="status" style="margin: 0;">สถานะ: 
                    <select onchange="updateRepairStatus(${r.id}, this.value)" style="width: auto; padding: 5px; margin-left: 5px;">
                        <option value="รอดำเนินการ" ${r.status === 'รอดำเนินการ' ? 'selected' : ''}>รอดำเนินการ</option>
                        <option value="กำลังซ่อม" ${r.status === 'กำลังซ่อม' ? 'selected' : ''}>กำลังซ่อม</option>
                        <option value="เสร็จสิ้น" ${r.status === 'เสร็จสิ้น' ? 'selected' : ''}>เสร็จสิ้น</option>
                    </select>
                </p>
                <button onclick="deleteRepair(${r.id})" style="background: #e74a3b; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 13px;">ลบงาน</button>
            </div>`;
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

// เพิ่มฟังก์ชันลบงานซ่อม
window.deleteRepair = function(id) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบงานซ่อมนี้?")) {
        let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
        repairs = repairs.filter(r => r.id !== id);
        localStorage.setItem("repairs", JSON.stringify(repairs));
        alert("ลบงานซ่อมเรียบร้อยแล้ว");
        renderRepairs();
    }
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
    const currentUsername = localStorage.getItem("currentUser");
    const myData = users.find(u => u.username === currentUsername);
    
    // ดึงค่าจากช่องค้นหา
    const searchInput = document.getElementById("searchUser");
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

    // กรองรายชื่อผู้ใช้หากมีการพิมพ์ค้นหา
    if (searchTerm !== "") {
        users = users.filter(u => u.username.toLowerCase().includes(searchTerm));
    }

    userList.innerHTML = "";

    // กรณีค้นหาแล้วไม่พบผู้ใช้
    if (users.length === 0) {
        userList.innerHTML = `<li style="text-align: center; padding: 10px; color: #888; list-style: none;">ไม่พบชื่อผู้ใช้ที่ค้นหา</li>`;
        return;
    }

    users.forEach(u => {
        let li = document.createElement("li");
        li.style.listStyle = "none";
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        
        const isSelf = u.username === currentUsername;
        
        // บังคับว่าต้องเป็น "แอดมิน" เท่านั้น ถึงจะเห็นปุ่มจัดการ
        const isAdmin = myData && myData.rank === "แอดมิน";

        li.innerHTML = `
            <div>
                <strong>${u.username}</strong> <span style="color:#888; font-size:0.9em;">(${u.rank})</span><br>
                <small>${u.email}</small>
            </div>
            <div>
                ${isAdmin ? `<button onclick="editUserRank('${u.username}')" class="btn-secondary" style="padding: 5px 10px; font-size: 12px; cursor: pointer;">แก้ตำแหน่ง</button>` : ''}
                ${isAdmin && !isSelf ? `<button onclick="deleteUser('${u.username}')" style="padding: 5px 10px; font-size: 12px; cursor: pointer; background: #e74a3b; color: white; border: none; border-radius: 5px; margin-left: 5px;">ลบ</button>` : ''}
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
        let newRank = prompt(`กรุณาพิมพ์ตำแหน่งใหม่สำหรับ ${username} \n(เช่น: นักศึกษา, อาจารย์, เจ้าหน้าที่, แอดมิน):`, currentRank);
        
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

window.deleteUser = function(username) {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}"?`)) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users = users.filter(u => u.username !== username);
        localStorage.setItem("users", JSON.stringify(users));
        alert("ลบผู้ใช้เรียบร้อยแล้ว");
        renderUsers();
    }
};

// ===== USER REPAIR HISTORY =====
document.addEventListener("DOMContentLoaded", function(){
    const historyList = document.getElementById("historyList");
    if(historyList){
        let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
        const currentUser = localStorage.getItem("currentUser");
        let myRepairs = repairs.filter(r => r.user === currentUser).reverse();

        if(myRepairs.length === 0){
            historyList.innerHTML = "<p style='text-align:center;color:#888;'>ยังไม่มีประวัติการแจ้งซ่อม</p>";
            return;
        }

        myRepairs.forEach(r => {
            let li = document.createElement("li");
            li.className = "repair-card";
            li.style.listStyle = "none";
            li.style.marginBottom = "15px";

            li.innerHTML = `
                <h4>🔧 ${r.item}</h4>
                <p><strong>รายละเอียด:</strong> ${r.detail}</p>
                <p><strong>สถานะ:</strong> ${r.status}</p>
                <p><strong>วันที่แจ้ง:</strong> ${r.date}</p>
                ${r.image ? `<img src="${r.image}" style="width:150px;border-radius:10px;margin-top:10px;">` : ""}
            `;

            historyList.appendChild(li);
        });
    }
});


// ===== Tutorial Popup Auto Show =====
document.addEventListener("DOMContentLoaded", function(){
    const modal = document.getElementById("tutorialModal");
    if(modal){
        modal.style.display = "flex";
    }
});

window.closeTutorial = function(){
    const modal = document.getElementById("tutorialModal");
    if(modal){
        modal.style.display = "none";
    }
};


// ===== Advanced User History (User Page) =====
window.renderHistory = function(){
    const historyList = document.getElementById("historyList");
    if(!historyList) return;

    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    const currentUser = localStorage.getItem("currentUser");
    const search = document.getElementById("historySearch")?.value.toLowerCase() || "";
    const filter = document.getElementById("historyFilter")?.value || "";

    let myRepairs = repairs.filter(r => r.user === currentUser);

    if(search){
        myRepairs = myRepairs.filter(r => r.item.toLowerCase().includes(search));
    }

    if(filter){
        myRepairs = myRepairs.filter(r => r.status === filter);
    }

    historyList.innerHTML = "";

    if(myRepairs.length === 0){
        historyList.innerHTML = "<p style='text-align:center;color:#888;'>ไม่พบข้อมูล</p>";
        return;
    }

    myRepairs.reverse().forEach(r=>{
        let li=document.createElement("li");
        li.className="repair-card";
        li.style.listStyle="none";
        li.style.marginBottom="15px";

        li.innerHTML=`
        <h4>🔧 ${r.item}</h4>
        <p><strong>รายละเอียด:</strong> ${r.detail}</p>
        <p><strong>สถานะ:</strong> ${r.status}</p>
        <p><strong>วันที่:</strong> ${r.date}</p>
        ${r.image?`<img src="${r.image}" style="width:150px;border-radius:10px;margin-top:10px;">`:""}
        `;
        historyList.appendChild(li);
    });
};

document.addEventListener("DOMContentLoaded", function(){
    if(document.getElementById("historyList")){
        renderHistory();
    }
});

// ===== Admin Search User Repair History =====
window.renderAdminHistory = function(){
    const result = document.getElementById("adminHistoryResult");
    if(!result) return;

    const username = document.getElementById("adminHistorySearch").value.trim();
    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];

    result.innerHTML="";

    if(username===""){
        result.innerHTML="<li style='list-style:none;color:#888;'>พิมพ์ชื่อผู้ใช้เพื่อค้นหา</li>";
        return;
    }

    let userRepairs = repairs.filter(r=>r.user===username);

    if(userRepairs.length===0){
        result.innerHTML="<li style='list-style:none;color:#888;'>ไม่พบประวัติการแจ้ง</li>";
        return;
    }

    userRepairs.reverse().forEach(r=>{
        let li=document.createElement("li");
        li.className="repair-card";
        li.style.listStyle="none";
        li.style.marginBottom="10px";

        li.innerHTML=`
        <div style="display:flex;gap:12px;align-items:center;">
            ${r.image ? `<img src="${r.image}" style="width:70px;height:70px;object-fit:cover;border-radius:10px;">` : ""}
            <div>
                <strong>🔧 ${r.item}</strong><br>
                สถานะ: ${r.status}<br>
                วันที่: ${r.date}
            </div>
        </div>
        `;

        result.appendChild(li);
    });
};


// ===== Realtime Search Enhancement (Non-destructive) =====
document.addEventListener("DOMContentLoaded", function(){
    const historyInput = document.getElementById("historySearch");
    if(historyInput){
        historyInput.addEventListener("input", function(){
            renderHistory();
        });
    }

    const adminInput = document.getElementById("adminHistorySearch");
    if(adminInput){
        adminInput.addEventListener("input", function(){
            renderAdminHistory();
        });
    }
});

// ================= PROFILE REPAIR HISTORY =================
window.renderProfileRepairs = function(){
    const list = document.getElementById("profileRepairList");
    if(!list) return;

    let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    const currentUser = localStorage.getItem("currentUser");

    let myRepairs = repairs.filter(r => r.user === currentUser);

    list.innerHTML = "";

    if(myRepairs.length === 0){
        list.innerHTML = "<p style='text-align:center;color:#888;'>ยังไม่มีรายการแจ้งซ่อม</p>";
        return;
    }

    myRepairs.reverse().forEach(r=>{
        let li = document.createElement("li");
        li.className = "repair-card";
        li.style.listStyle = "none";
        li.style.marginBottom = "10px";

        li.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
                ${r.image ? `<img src="${r.image}" style="width:60px;height:60px;object-fit:cover;border-radius:10px;">` : ""}
                
                <div>
                    <strong>🔧 ${r.item}</strong><br>
                    สถานะ: ${r.status}<br>
                    วันที่: ${r.date}
                </div>
            </div>
        `;

        list.appendChild(li);
    });
};


// ===== Dashboard Self History Search (Non-destructive) =====
document.addEventListener("DOMContentLoaded", function(){
    const searchInput = document.getElementById("dashboardHistorySearch");
    const filterInput = document.getElementById("dashboardHistoryFilter");
    const resultBox = document.getElementById("dashboardHistoryResult");

    if(!searchInput || !resultBox) return;

    function renderDashboardHistory(){
        let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
        const currentUser = localStorage.getItem("currentUser");
        let myRepairs = repairs.filter(r => r.user === currentUser);

        const search = searchInput.value.toLowerCase();
        const filter = filterInput ? filterInput.value : "";

        if(search){
            myRepairs = myRepairs.filter(r => r.item.toLowerCase().includes(search));
        }

        if(filter){
            myRepairs = myRepairs.filter(r => r.status === filter);
        }

        resultBox.innerHTML = "";

        if(myRepairs.length === 0){
            resultBox.innerHTML = "<li style='list-style:none;color:#888;'>ไม่พบข้อมูล</li>";
            return;
        }

        myRepairs.reverse().forEach(r=>{
            let li = document.createElement("li");
            li.className="repair-card";
            li.style.listStyle="none";
            li.style.marginBottom="10px";

            li.innerHTML = `
                <strong>🔧 ${r.item}</strong><br>
                สถานะ: ${r.status}<br>
                วันที่: ${r.date}
            `;
            resultBox.appendChild(li);
        });
    }

    searchInput.addEventListener("input", renderDashboardHistory);
    if(filterInput){
        filterInput.addEventListener("change", renderDashboardHistory);
    }
});

// ===== CALL PROFILE REPAIR =====
document.addEventListener("DOMContentLoaded", function(){
    if(document.getElementById("profileRepairList")){
        renderProfileRepairs();
    }
});

// ================= REMOVE IMAGE =================
document.addEventListener("DOMContentLoaded", function () {

    const imageUpload = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");
    const removeBtn = document.getElementById("removeImageBtn");

    // ===== แสดงรูป + ปุ่มลบ =====
    if (imageUpload) {
        imageUpload.addEventListener("change", function (e) {
            const file = e.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    previewImage.src = event.target.result;
                    previewImage.style.display = "block";

                    if (removeBtn) {
                        removeBtn.style.display = "inline-block";
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ===== ลบรูป =====
    if (removeBtn) {
        removeBtn.addEventListener("click", function () {

            // ลบรูป preview
            previewImage.src = "";
            previewImage.style.display = "none";

            // ล้างไฟล์
            imageUpload.value = "";

            // ซ่อนปุ่ม
            removeBtn.style.display = "none";
        });
    }

});
