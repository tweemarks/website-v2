//importing libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js"
import {
  getAuth,
  signInWithPopup,
  TwitterAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js"
import {
  getFirestore,
  collection,
  query,
  setDoc,
  getDoc,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  deleteField,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js"

//firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDBcrOw2M0fPWVsNM0KX31AlTOGWBuTUlE",
  authDomain: "tweemarks-2021.firebaseapp.com",
  projectId: "tweemarks-2021",
  storageBucket: "tweemarks-2021.appspot.com",
  messagingSenderId: "318179878664",
  appId: "1:318179878664:web:ac5195ecffe028def02ebd",
  measurementId: "G-DB5K82Z30X",
}

// initializing firebase variables
const app = initializeApp(firebaseConfig)
const auth = getAuth()
const provider = new TwitterAuthProvider()
const db = getFirestore()

auth.languageCode = "it"

//local variables
let cred,
  currentTweets = [],
  docRef
//  cred = logged in user credentials
// currentTweets = to store loaded tweets of a category
// docRef = reference to the document where user data is stored

// DOM variables
const DOMrightNav = document.querySelector(".rightNav")
const DOMrightCategory = document.querySelector(".rightCategories")
const DOMrightPrompt = document.querySelector(".prompt")
const DOMtitle = document.querySelector(".title")

// on auth state change programs
auth.onAuthStateChanged((user) => {
  if (user) {
    //set user credentials
    cred = user

    // set docRef
    docRef = doc(db, "users", cred.uid)
    setInnerHTMnullL(DOMrightNav)
    statusLoggedIn()
  } else {
    window.location.href = "../"
  }
})

function statusLoggedIn() {
  setProfile() // set user pfp and display name
  setCategoryButton() // display the categories button
  addLogoutButton() // add logout button into the DOM

  loadCategories() //load the categories
}

// set profile image and name
function setProfile() {
  const profile = document.querySelector(".profile")
  const pfpURL = cred.photoURL.replace("_normal", "")
  profile.innerHTML = `
        <div class="image">
        <img src="${pfpURL}" alt="pfp" class="pfp">
        </div>
        <div class="displayName">
            <h3>
                ${cred.displayName}
            </h2>
        </div>
    `
}

// set category button
function setCategoryButton() {
  document.querySelector(".buttons").innerHTML = `
        <div>
        <a class='HiddenLink' href='../categories/'>
            <button class="categoryLoadingButton active" >Categories</button>
        </a>
        </div>
    
        <div>
        <a class='HiddenLink' href='../'>
            <button class="home"><i class="fa fa-home"></i> Home </button>
        </a>
        </div>
    `
}

// adding logout button
function addLogoutButton() {
  DOMrightNav.innerHTML += `
    <div>    
    <button class="logout" id="logOut">
            <i class="fa fa-sign-out"></i> Logout
        </button>
    </div>
    `

  // twitter logout
  const DOMlogoutButton = document.querySelector("#logOut")
  DOMlogoutButton.addEventListener("click", () => {
    auth.signOut()
    window.location.reload()
  })
}

//loading categories
function loadCategories() {
  setInnerHTMnullL(DOMrightCategory)

  DOMrightCategory.innerHTML = `
        <div class="categories"></div>  
    `
  let categoriesHTML = document.querySelector(".categories")

  let categories = []

  getDoc(docRef).then((docSnap) => {
    // console.log(docSnap.data())

    if (docSnap.exists() && !isEmpty(docSnap.data())) {
      for (let doc of Object.keys(docSnap.data())) {
        categories.push(doc)
      }
      categories = categories.sort()
      categories.forEach((doc) => {
        categoriesHTML.innerHTML += `
            <a class='HiddenLink' href='../tweets/?category=${encodeURIComponent(
              doc
            )}'>
                <button class="categoryButton" doc-id="${doc}">${doc}</button>
            <a>
        `
      })
    } else {
      categoriesHTML.innerHTML = "No any Categories"
    }

    createNavBtns()
    addLogoutButton()

    document
      .querySelector(".add-category")
      .addEventListener("click", addCategoryPrompt)

    document
      .querySelector(".searchTweetsInput")
      .addEventListener("keyup", searchForCategories)
    const searchContainer = document.querySelector(".search-container")
    document.querySelector(".searchTweetsBtn").addEventListener("click", () => {
      searchContainer.classList.toggle("active")
      if (searchContainer.classList.contains("active")) {
        searchContainer.querySelector("input").focus()
      }
      document.querySelector(".searchTweetsInput").value = ""
      searchForCategories()
    })

    setInnerHTMnullL(DOMrightPrompt)
    DOMtitle.style.display = "flex"
  })
}

function searchForCategories() {
  const searchTxt = document
    .querySelector(".searchTweetsInput")
    .value.toLowerCase()

  const AllCategories = document.querySelectorAll(".categoryButton")

  AllCategories.forEach((category) => {
    category.style.display = "inline"
  })

  if (searchTxt == "") return

  AllCategories.forEach((category) => {
    const categoryName = category.getAttribute("doc-id").toLocaleLowerCase()
    if (!categoryName.includes(searchTxt)) {
      category.style.display = "none"
    }
  })
}

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false
  }

  return true
}

function createNavBtns() {
  DOMrightNav.innerHTML = `
    <div>
        <div class="search-container">
            <input type='text' class='searchTweetsInput' placeholder='Search..' />
            <button class='searchTweetsBtn' ><i class='fa fa-search'></i></button>
        </div>
        </div>
    `

  DOMrightNav.innerHTML += `
        <div>
            <button class='add-category'>
                <i class="fa fa-plus-circle"></i> Add Category
            </button>
        </div>
    `
}

function addCategory() {
  const categoryName = document.getElementById("addCategoryBox").value
  document.querySelectorAll(".categoryButton").forEach((btn) => {
    if (categoryName == btn.getAttribute("doc-id")) {
      alert("A Category with same name exists.")
      return
    }
  })
  if (
    categoryName !== "" &&
    !categoryName.includes("~") &&
    !categoryName.includes("/") &&
    !categoryName.includes("*") &&
    !categoryName.includes("[") &&
    !categoryName.includes("]") &&
    categoryName.length < 40
  ) {
    setDoc(
      docRef,
      {
        [categoryName]: [],
      },
      {
        merge: true,
      }
    ).then(() => {
      setInnerHTMnullL(DOMrightPrompt)
      loadCategories()
    })
  } else {
    alert(
      `
      Category Name cannot be an empty string and must not contain '~', '*', '/', '[', or ']' 
      Category Name must be less than 40 characters
      `
    )
  }
}

function addCategoryPrompt() {
  DOMrightPrompt.innerHTML = `
        <div class="close">
            <button id="close"><i class="fa fa-close"></i></button>
        </div>
        <div class="textbox">
            <input type="text" placeholder="Enter Category Name.." id="addCategoryBox" autocomplete="off">
        </div>
        <div class="prompt-button">
            <button id="addCategoryBtn">Add</button>
        </div>

        <style>
        .prompt{
            margin: 0 0 40px 0;
        }
        </style>
    `
  document.getElementById("addCategoryBox").focus()
  document
    .getElementById("addCategoryBtn")
    .addEventListener("click", addCategory)

  document.getElementById("close").addEventListener("click", () => {
    setInnerHTMnullL(DOMrightPrompt)
  })
}

function setInnerHTMnullL(element) {
  element.innerHTML = ``
}
