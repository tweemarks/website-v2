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
let cred
//  cred = logged in user credentials

// DOM variables
const DOMrightNav = document.querySelector(".rightNav")
const DOMrightPrompt = document.querySelector(".prompt")

// on auth state change programs
auth.onAuthStateChanged((user) => {
  if (user) {
    //set user credentials
    cred = user

    setInnerHTMnullL(DOMrightPrompt)
    setInnerHTMnullL(DOMrightNav)
    statusLoggedIn()
  } else {
    setInnerHTMnullL(DOMrightPrompt)
    statusLoggedOut()
  }
})

function statusLoggedOut() {
  DOMrightNav.innerHTML = `
        <button class="signOpt login" id="logIn">
                <i class="fa fa-twitter"></i> Sign In
        </button>
        `
  DOMrightPrompt.innerHTML = `
        <div class="Status-loggedout">
            Sign In with Twitter to continue..
        </div>
    `

  // twitter sign in
  const DOMloginButton = document.querySelector("#logIn")
  DOMloginButton.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = TwitterAuthProvider.credentialFromResult(result)
        const token = credential.accessToken
        const secret = credential.secret

        const user = result.user

        const docRef = doc(db, "twitter_usernames", user.uid)
        setDoc(docRef, {
          username: result._tokenResponse.screenName,
          photoUrl: result._tokenResponse.photoUrl,
          fullName: result._tokenResponse.fullName,
          displayName: result._tokenResponse.displayName,
        }).then(() => {
          console.log("check db")
        })

        setCategoryButton()
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        const email = error.email
        const credential = TwitterAuthProvider.credentialFromError(error)
        console.log(error)
      })
  })
}

function statusLoggedIn() {
  DOMrightPrompt.innerHTML = `
        <div class="" >
            Start By Choosing a Category <br>in the Categories Section
        </div>
    `

  setProfile() // set user pfp and display name
  setCategoryButton() // display the categories button

  addLogoutButton() // add logout button into the DOM

  document.querySelector(".token").style.display = "inline" // Enable show telegram token
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
            <button class="categoryLoadingButton" >Categories</button>
        </a>
        </div>
    `

  const DOMcategoryButton = document.querySelector(".categoryLoadingButton")
  DOMcategoryButton.addEventListener(
    "click",
    () => (window.location.href = "../categories/")
  )
}

// adding logout button
function addLogoutButton() {
  DOMrightNav.innerHTML += `
        <button class="logout" id="logOut">
            <i class="fa fa-sign-out"></i> Logout
        </button>
    `

  // twitter logout
  const DOMlogoutButton = document.querySelector("#logOut")
  DOMlogoutButton.addEventListener("click", () => {
    auth.signOut()
    window.location.reload()
  })
}

function setInnerHTMnullL(element) {
  element.innerHTML = ``
}

const tokenBtn = document.querySelector(".tokenBtn")
const tokenDiv = document.querySelector(".tokenDiv")
const tokenInput = document.querySelector(".tokenInput")
tokenBtn.addEventListener("click", (e) => {
  e.target.style.display = "none"
  tokenDiv.style.display = "block"
  tokenInput.value = cred.uid
})
