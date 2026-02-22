
// ===== FIX: wait for page load before redirect =====
document.addEventListener("DOMContentLoaded",()=>{

// Protect pages (FIXED)
if(!localStorage.getItem("loggedIn") &&
!location.pathname.includes("login.html") &&
!location.pathname.includes("register.html")){
    location.href="login.html";
    return;
}

const users=JSON.parse(localStorage.getItem("users"))||[];
const current=localStorage.getItem("currentUser");
const currentUser=users.find(u=>u.username===current);

// REGISTER
if(document.getElementById("registerForm")){
registerForm.addEventListener("submit",e=>{
e.preventDefault();

let users=JSON.parse(localStorage.getItem("users"))||[];

if(users.find(u=>u.username===regUser.value)){
    alert("ชื่อซ้ำ");
    return;
}

const newUser={
username:regUser.value,
email:regEmail.value,
password:regPass.value,
rank:regRank.value,
avatar:""
};

users.push(newUser);

localStorage.setItem("users",JSON.stringify(users));

// IMPORTANT FIX
localStorage.setItem("loggedIn","true");
localStorage.setItem("currentUser",newUser.username);

// delay redirect to ensure storage is saved
setTimeout(()=>{
location.href="index.html";
},100);

});
}

// LOGIN
if(document.getElementById("loginForm")){
loginForm.addEventListener("submit",e=>{
e.preventDefault();

let users=JSON.parse(localStorage.getItem("users"))||[];

let user=users.find(u=>
u.username===loginUser.value &&
u.password===loginPass.value
);

if(!user){
alert("ข้อมูลผิด");
return;
}

localStorage.setItem("loggedIn","true");
localStorage.setItem("currentUser",user.username);

location.href="index.html";

});
}

// PROFILE
if(document.getElementById("profileEmail") && currentUser){

profileName.innerText=currentUser.username;
profileEmail.innerText=currentUser.email;
profileRank.innerText=currentUser.rank;

if(currentUser.avatar)
profileImage.src=currentUser.avatar;

}

});

// LOGOUT
function logout(){

localStorage.removeItem("loggedIn");
localStorage.removeItem("currentUser");

location.href="login.html";

}
