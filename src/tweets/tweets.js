//importing libraries
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js'
import {
  getAuth,
  signInWithPopup,
  TwitterAuthProvider,
} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js'
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
} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js'

//firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDBcrOw2M0fPWVsNM0KX31AlTOGWBuTUlE',
  authDomain: 'tweemarks-2021.firebaseapp.com',
  projectId: 'tweemarks-2021',
  storageBucket: 'tweemarks-2021.appspot.com',
  messagingSenderId: '318179878664',
  appId: '1:318179878664:web:ac5195ecffe028def02ebd',
  measurementId: 'G-DB5K82Z30X',
}

// initializing firebase variables
const app = initializeApp(firebaseConfig)
const auth = getAuth()
const provider = new TwitterAuthProvider()
const db = getFirestore()

auth.languageCode = 'it'

//local variables
let cred,
  currentTweets = [],
  docRef,
  category
//  cred = logged in user credentials
// currentTweets = to store loaded tweets of a category
// docRef = reference to the document where user data is stored

// DOM variables
const DOMrightNav = document.querySelector('.rightNav')
const DOMrightPrompt = document.querySelector('.prompt')
const DOMrightTweets = document.querySelector('.rightTweets')
const DOMtitle = document.querySelector('.title')

//window onload get category
window.onload = function () {
  let url = window.location.href,
    params = url.split('?')[1].split('&'),
    data = {},
    tmp
  for (var i = 0, l = params.length; i < l; i++) {
    tmp = params[i].split('=')
    data[tmp[0]] = tmp[1]
  }
  category = decodeURIComponent(data.category)
}

// on auth state change programs
auth.onAuthStateChanged(user => {
  if (user) {
    //set user credentials
    cred = user

    // set docRef
    docRef = doc(db, 'users', cred.uid)
    setInnerHTMnullL(DOMrightNav)
    statusLoggedIn()
  } else {
    window.location.href = '../'
  }
})

function statusLoggedIn() {
  setProfile() // set user pfp and display name
  setCategoryButton() // display the categories button
  addLogoutButton() // add logout button into the DOM

  if (category) {
    loadTweets(category)
  } else {
    window.location.href = '../categories/'
  }
}

// set profile image and name
function setProfile() {
  const profile = document.querySelector('.profile')
  const pfpURL = cred.photoURL.replace('_normal', '')
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
  document.querySelector('.buttons').innerHTML = `
        <div>
        <a class='HiddenLink' href='../categories/'>
            <button class="categoryLoadingButton" >Categories</button>
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
        <button class="logout" id="logOut">
            <i class="fa fa-sign-out"></i> Logout
        </button>
    `

  // twitter logout
  const DOMlogoutButton = document.querySelector('#logOut')
  DOMlogoutButton.addEventListener('click', () => {
    auth.signOut()
    window.location.reload()
  })
}

function loadTweets(id) {
  DOMrightTweets.innerHTML = `
        <div class="tweetsNav">
            <div>
                <button class="deleteCategory tweetNavBtn" cat-id="${id}">
                    <i class="fa fa-trash-o"></i> Delete Category
                </button>
                <button class="editCategory tweetNavBtn" cat-id='${id}'>
                    <i class='fa fa-pencil'></i> Edit Name
                </button>
                <button class="addTweet tweetNavBtn" cat-id="${id}">
                    <i class="fa fa-plus-circle"></i> Add Tweet
                </button>
            </div>
            <div>
                <div class="search-container">
                    <input type='text' class='searchTweetsInput' placeholder='Search..' />
                    <button class='searchTweetsBtn' ><i class='fa fa-search'></i></button>
                </div>
            
                <button class="tweetNavBtn editTweets">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="tweetNavBtn deleteTweets">
                    <i class="fa fa-trash-o"></i>
                </button>
                <button class="tweetNavBtn shareTweets">
                    <i class='fa fa-share-alt'></i>
                </button>
            </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;width:100%" class='tweetsLoader'>
            Loading Tweets..
        </div>
    `

  getDoc(docRef).then(docSnap => {
    if (docSnap.exists() && !isEmpty(docSnap.data()) && docSnap.data()[id]) {
      let tweetsIDs = docSnap.data()[id]
      // console.log(tweetsIDs)
      if (tweetsIDs.length > 0) {
        currentTweets = tweetsIDs
        loadTweetsInfo(tweetsIDs)
      } else {
        document.querySelector('.tweetsLoader').style.display = 'none'
        DOMrightTweets.innerHTML += 'No any Tweets'
      }

      initButtons()
    } else {
      window.location.href = '../categories/'
    }
  })

  category = id
  setInnerHTMnullL(DOMrightPrompt)
  DOMtitle.style.display = 'flex'
  DOMtitle.innerHTML = `
    <h2>${id}</h2>
    `
  document.title = `${id} | Tweemarks`
}

function loadTweetsInfo(ids) {
  let tweetsIDs = ''
  ids.forEach(id => {
    tweetsIDs += id
    tweetsIDs += ','
  })
  tweetsIDs = tweetsIDs.substring(0, tweetsIDs.length - 1)
  // console.log('tweetIDs: ', tweetsIDs)
  let tweets
  var myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

  var urlencoded = new URLSearchParams()
  urlencoded.append('id', tweetsIDs)

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
  }

  fetch('/getTweets/', requestOptions)
    .then(response => response.text())
    .then(result => {
      // console.log(typeof result)
      result = JSON.parse(result)
      // console.log(result)
      result.forEach(tweet => loadDOMtweets(tweet))
    })
    .catch(error => console.log('error', error))

  initButtons()
}

function loadDOMtweets(tweetINFO) {
  document.querySelector('.tweetsLoader').style.display = 'none'
  let tweetText = tweetINFO.full_text

  while (tweetText.includes('\n')) {
    tweetText = tweetText.replace('\n', `<br />`)
  }

  const userPutLinks = []
  const userPutLinksOriginal = []
  tweetINFO.entities.urls.forEach(urlContent => {
    userPutLinks.push(urlContent.url)
    userPutLinksOriginal.push(urlContent.display_url)
  })

  for (let i = 0; i < userPutLinks.length; i++) {
    tweetText = tweetText.replace(userPutLinks[i], userPutLinksOriginal[i])
  }

  const userPutMedia = []
  let mediaHTML = ``
  if (tweetINFO.entities.media) {
    tweetINFO.entities.media.forEach(mediaContent => {
      tweetText = tweetText.replace(mediaContent.url, '')
      mediaHTML = `
                <img src='${mediaContent.media_url_https}' style="width: auto;max-width: 100%; border-radius: 12px; max-height: 300px" />
            `
    })
  }

  const profileURL = tweetINFO.user.profile_image_url_https.replace(
    '_normal',
    ''
  )

  DOMrightTweets.innerHTML += `
            <div class="TWEETcontainer">
                <div class='tweetCheckContainer' id='${tweetINFO.id_str}' style="display:none">
                    <input type='checkbox' id='${tweetINFO.id_str}' url='https://twitter.com/${tweetINFO.user.screen_name}/status/${tweetINFO.id_str}' class='tweetCheck' style="height:20px;width:20px"/>
                </div>
                <a href='https://twitter.com/${tweetINFO.user.screen_name}/status/${tweetINFO.id_str}' target="_blank" class='HiddenLink'>
                    <div class="TWEETmainContainer">
                        <div class="TWEETheader">
                            <div class="TWEETprofile">
                                <div class="TWEETpfp">
                                    <img src="${profileURL}" alt="" />
                                </div>
                                <div class="TWEETname">
                                    <div class="TWEETdisplayName">${tweetINFO.user.name}</div>
                                    <div class="TWEETusername">${tweetINFO.user.screen_name}</div>
                                </div>
                            </div>
                            <div class="TWEETtwitterLogo">
                            <i class="fa fa-twitter" style="color: #1da1f2"></i>
                            </div>
                        </div>
                        <div class="TWEETmain">
                            ${tweetText}
                            <div style="margin-top:10px">${mediaHTML}</div>
                        </div>
                    <div>
                </a>
            </div>
        `
  initButtons()
}

function initButtons() {
  document.querySelector('.addTweet').addEventListener('click', addTweet)
  document
    .querySelector('.deleteCategory')
    .addEventListener('click', deleteCategory)
  document
    .querySelector('.searchTweetsInput')
    .addEventListener('keyup', searchWithinTweets)

  const searchContainer = document.querySelector('.search-container')
  document.querySelector('.searchTweetsBtn').addEventListener('click', () => {
    searchContainer.classList.toggle('active')
    if (searchContainer.classList.contains('active')) {
      searchContainer.querySelector('input').focus()
    }
    document.querySelector('.searchTweetsInput').value = ''
    searchWithinTweets()
  })

  document
    .querySelector('.editTweets')
    .addEventListener('click', editTweetsInit)
  document
    .querySelector('.deleteTweets')
    .addEventListener('click', deleteSelectedTweets)
  document
    .querySelector('.shareTweets')
    .addEventListener('click', shareSelectedTweets)
  document
    .querySelector('.editCategory')
    .addEventListener('click', editCategory)

  initCheckBoxes()
}

function editCategory() {
  document.querySelectorAll('.promptCategory').forEach(el => el.remove())

  DOMrightPrompt.innerHTML = `
    <div class="prompt promptCategory">
        <div class="close">
            <button id="close" class="closeCategory"><i class="fa fa-close"></i></button>
        </div>
        <div class="textbox">
            <input type="text" placeholder="Enter New Category Name" id="editCategoryBox" autocomplete="off" value='${category}'>
        </div>
        <div class="prompt-button">
            <button id="editCategoryBtn">Add</button>
        </div>
    </div>
    `

  document.getElementById('editCategoryBox').focus()
  document.querySelector('.closeCategory').addEventListener('click', () => {
    document.querySelectorAll('.promptCategory').forEach(el => el.remove())
  })
  // document.querySelector('.addTweet').addEventListener('click', addTweet)
  document.getElementById('editCategoryBtn').addEventListener('click', () => {
    if (document.getElementById('editCategoryBox').value) {
      const categoryName = document.getElementById('editCategoryBox').value

      document.querySelectorAll('.promptCategory').forEach(el => el.remove())

      //create new category
      setDoc(
        docRef,
        {
          [categoryName]: currentTweets,
        },
        {
          merge: true,
        }
      ).then(() => {
        //when created, then delete the old one and redirect to categories page
        updateDoc(docRef, {
          [category]: deleteField(),
        }).then(() => {
          window.location.href = '../categories/'
        })
      })
    }
  })
}

function deleteSelectedTweets() {
  let selectedTweets = []
  document.querySelectorAll('.tweetCheck').forEach(checkbox => {
    if (checkbox.checked) {
      if (checkbox.getAttribute('id')) {
        selectedTweets.push(checkbox.getAttribute('id'))
      }
    }
  })

  const confirmTweets = confirm(
    `Are you sure you want to delete ${selectedTweets.length} Tweet(s)?`
  )

  if (confirmTweets) {
    let leftOverTweets = currentTweets.filter(id => {
      if (!selectedTweets.includes(id)) {
        return id
      }
    })
    setDoc(
      docRef,
      {
        [category]: leftOverTweets,
      },
      {
        merge: true,
      }
    ).then(() => {
      loadTweets(category)
    })
  }

  const editBtnIcon = document.querySelector('.editTweets').querySelector('i')
  editBtnIcon.classList.remove('fa-close')
  editBtnIcon.classList.add('fa-edit')
  document
    .querySelectorAll('.tweetCheckContainer')
    .forEach(checkboxContainer => {
      checkboxContainer.style.display = 'none'
      checkboxContainer.querySelector('input').checked = false
    })
  document.querySelector('.deleteTweets').style.display = 'none'
  document.querySelector('.shareTweets').style.display = 'none'
}

async function shareSelectedTweets() {
  let selectedTweetURLs = []
  document.querySelectorAll('.tweetCheck').forEach(checkbox => {
    if (checkbox.checked) {
      selectedTweetURLs.push(checkbox.getAttribute('url'))
    }
  })

  shareableText = `Tweet Links: `
  selectedTweetURLs.forEach(tweetLink => {
    shareableText += '\n'
    shareableText += tweetLink
  })

  let shareText = {
    title: category,
    text: new TextEncoder().encode(shareableText),
  }

  try {
    console.log(shareText)
    await navigator.share(shareText)
  } catch (e) {
    console.log(e)
  }

  const editBtnIcon = document.querySelector('.editTweets').querySelector('i')
  editBtnIcon.classList.remove('fa-close')
  editBtnIcon.classList.add('fa-edit')
  document
    .querySelectorAll('.tweetCheckContainer')
    .forEach(checkboxContainer => {
      checkboxContainer.style.display = 'none'
      checkboxContainer.querySelector('input').checked = false
    })
  document.querySelector('.deleteTweets').style.display = 'none'
  document.querySelector('.shareTweets').style.display = 'none'
}

function initCheckBoxes() {
  document.querySelectorAll('.tweetCheck').forEach(checkbox => {
    checkbox.addEventListener('change', e => {
      if (e.currentTarget.checked) {
        document.querySelector('.deleteTweets').style.display = 'inline'
        document.querySelector('.shareTweets').style.display = 'inline'
      } else {
        let temp = 0
        document.querySelectorAll('.tweetCheck').forEach(checkbox => {
          if (checkbox.checked) {
            temp = 1
          }
        })
        if (temp === 0) {
          document.querySelector('.deleteTweets').style.display = 'none'
          document.querySelector('.shareTweets').style.display = 'none'
        }
      }
    })
  })
}

function editTweetsInit() {
  const editBtnIcon = document.querySelector('.editTweets').querySelector('i')
  if (editBtnIcon.classList.contains('fa-edit')) {
    editBtnIcon.classList.remove('fa-edit')
    editBtnIcon.classList.add('fa-close')
    document
      .querySelectorAll('.tweetCheckContainer')
      .forEach(checkboxContainer => {
        checkboxContainer.style.display = 'block'
      })
  } else {
    editBtnIcon.classList.remove('fa-close')
    editBtnIcon.classList.add('fa-edit')
    document
      .querySelectorAll('.tweetCheckContainer')
      .forEach(checkboxContainer => {
        checkboxContainer.style.display = 'none'
        checkboxContainer.querySelector('input').checked = false
      })
    document.querySelector('.deleteTweets').style.display = 'none'
    document.querySelector('.shareTweets').style.display = 'none'
  }
}

function searchWithinTweets() {
  const searchTxt = document
    .querySelector('.searchTweetsInput')
    .value.toLowerCase()

  const AllTweetContainers = document.querySelectorAll('.TWEETcontainer')

  AllTweetContainers.forEach(tweetContainer => {
    tweetContainer.style.display = 'flex'
  })

  if (searchTxt === '') {
  } else {
    AllTweetContainers.forEach(tweetContainer => {
      const displayName = tweetContainer
        .querySelector('.TWEETdisplayName')
        .textContent.toLowerCase()
      const username = tweetContainer
        .querySelector('.TWEETusername')
        .textContent.toLowerCase()
      const tweetTxt = tweetContainer
        .querySelector('.TWEETmain')
        .textContent.toLowerCase()

      if (
        displayName.includes(searchTxt) ||
        username.includes(searchTxt) ||
        tweetTxt.includes(searchTxt)
      ) {
      } else {
        tweetContainer.style.display = 'none'
      }
    })
  }
}

function deleteCategory() {
  const id = document.querySelector('.deleteCategory').getAttribute('cat-id')

  const promptDelete = prompt(`Type '${id}' to Delete Category.`)

  if (promptDelete == id) {
    updateDoc(docRef, {
      [id]: deleteField(),
    }).then(() => {
      window.location.href = '../categories/'
    })
  }
}

function addTweet() {
  document.querySelectorAll('.promptTweets').forEach(el => el.remove())

  DOMrightPrompt.innerHTML = `
    <div class="prompt promptTweets">
        <div class="close">
            <button id="close" class="closeTweet"><i class="fa fa-close"></i></button>
        </div>
        <div class="textbox">
            <input type="text" placeholder="Enter Tweet URL or Tweet ID" id="addTweetBox" autocomplete="off">
        </div>
        <div class="prompt-button">
            <button id="addTweetBtn">Add</button>
        </div>
    </div>
    `

  document.getElementById('addTweetBox').focus()
  document.querySelector('.closeTweet').addEventListener('click', () => {
    document.querySelectorAll('.promptTweets').forEach(el => el.remove())
  })
  // document.querySelector('.addTweet').addEventListener('click', addTweet)
  document.getElementById('addTweetBtn').addEventListener('click', () => {
    if (document.getElementById('addTweetBox').value) {
      const tweetID = document.getElementById('addTweetBox').value

      document.querySelectorAll('.promptTweets').forEach(el => el.remove())
      const validatedID = validateTweetID(tweetID)
      if (validatedID !== -1) {
        currentTweets.push(validatedID)
        setDoc(
          docRef,
          {
            [category]: currentTweets,
          },
          {
            merge: true,
          }
        ).then(() => {
          loadTweets(category)
        })
      } else {
        alert('Wrong format of Link/ID')
      }
    }
  })
}

function validateTweetID(value) {
  if (
    validURL(value) &&
    value.includes('twitter.com') &&
    value.includes('status/')
  ) {
    let index = value.indexOf('status/')
    index += 7
    return value.substring(index, index + 19)
  } else if (!isNaN(value) && value.length === 19) {
    return value
  } else {
    return -1
  }
}
function validURL(str) {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // fragment locator
  return !!pattern.test(str)
}

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false
  }

  return true
}

function setInnerHTMnullL(element) {
  element.innerHTML = ``
}
