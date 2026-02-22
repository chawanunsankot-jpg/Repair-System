
// NETLIFY FIX VERSION

document.addEventListener("DOMContentLoaded", function(){

const path = window.location.pathname.split("/").pop();

// Allow access to login and register
const publicPages = ["login.html","register.html"];

if(!localStorage.getItem("loggedIn") && !publicPages.includes(path)){
    window.location.href = "login.html";
    return;
}

// REGISTER
const registerForm = document.getElementById("registerForm");
if(registerForm){

registerForm.addEventListener("submit", function(e){

e.preventDefault();

let users = JSON.parse(localStorage.getItem("users")) || [];

const username = document.getElementById("regUser").value;
const email = document.getElementById("regEmail").value;
const password = document.getElementById("regPass").value;
const rank = document.getElementById("regRank").value;

if(users.find(u=>u.username===username)){
alert("ชื่อผู้ใช้นี้มีอยู่แล้ว");
return;
}

const newUser = {
username: username,
email: email,
password: password,
rank: rank,
avatar: ""
};

users.push(newUser);

localStorage.setItem("users", JSON.stringify(users));

localStorage.setItem("loggedIn", "true");
localStorage.setItem("currentUser", username);

// Important fix for Netlify
window.location.replace("index.html");

});

}

// LOGIN
const loginForm = document.getElementById("loginForm");
if(loginForm){

loginForm.addEventListener("submit", function(e){

e.preventDefault();

let users = JSON.parse(localStorage.getItem("users")) || [];

const username = document.getElementById("loginUser").value;
const password = document.getElementById("loginPass").value;

const user = users.find(u=>u.username===username && u.password===password);

if(!user){
alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
return;
}

localStorage.setItem("loggedIn", "true");
localStorage.setItem("currentUser", username);

// Important fix for Netlify
window.location.replace("index.html");

});

}

// PROFILE
const users = JSON.parse(localStorage.getItem("users")) || [];
const currentUserName = localStorage.getItem("currentUser");
const currentUser = users.find(u=>u.username===currentUserName);

if(document.getElementById("profileEmail") && currentUser){

document.getElementById("profileName").innerText = currentUser.username;
document.getElementById("profileEmail").innerText = currentUser.email;
document.getElementById("profileRank").innerText = currentUser.rank;

if(currentUser.avatar){
document.getElementById("profileImage").src = currentUser.avatar;
}

}

});

// LOGOUT
function logout(){

localStorage.removeItem("loggedIn");
localStorage.removeItem("currentUser");

window.location.replace("login.html");

}
