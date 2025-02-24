/*
 * Name:        Varush Sivalingam   Farhat Rahman
 * Student ID:  100661860           100953269
 * Date:        January 25th 2025
 */

"use strict";

// IIFE - Immediately Invoked Function Expression
(function () {
  const apiKey = "28a7b3941271481ebb812d71ead3a0cd";
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}`;

  async function fetchSearchData() {
    try {
      // Fetch events from local JSON
      const eventsRes = await fetch("data/events.json");
      const eventsData = await eventsRes.json();
      console.log("Events Data:", eventsData); // Debugging

      // Fetch news from API
      const newsRes = await fetch(url);
      const newsData = await newsRes.json();
      console.log("News API Response:", newsData); // Debugging

      // Handle cases where API response is incorrect
      if (!newsData.articles || !Array.isArray(newsData.articles)) {
        console.error("[ERROR] News API response is invalid:", newsData);
        return [...eventsData]; // Only return events if news fails
      }

      // Format news results
      const newsFormatted = newsData.articles.map((article) => ({
        title: article.title,
        category: "News",
        link: article.url,
      }));

      return [...eventsData, ...newsFormatted]; // Merge data
    } catch (error) {
      console.error("[ERROR] Unable to load search data:", error);
      return []; // Return empty array if an error occurs
    }
  }

  async function setupSearch() {
    console.log("Initializing search...");

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const searchForm = document.getElementById("searchForm");

    // Load data asynchronously
    const data = await fetchSearchData();

    // Handle input for filtering
    searchInput.addEventListener("input", () => {
      let query = searchInput.value.toLowerCase().trim();
      searchResults.innerHTML = "";

      if (!query) {
        searchResults.style.display = "none";
        return;
      }

      // Filter events & news
      const filteredResults = data.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query))
      );

      // Show results
      if (filteredResults.length === 0) {
        searchResults.innerHTML = "<p>No results found.</p>";
      } else {
        const ul = document.createElement("ul");
        filteredResults.forEach((result) => {
          const li = document.createElement("li");
          li.textContent = `${result.title} (${result.category})`;
          li.addEventListener("click", () => {
            if (result.link) {
              window.open(result.link, "_blank"); // Open news articles in a new tab
            } else {
              window.location.href = `events.html#${result.title
                .replace(/\s+/g, "-")
                .toLowerCase()}`;
            }
          });
          ul.appendChild(li);
        });
        searchResults.appendChild(ul);
      }

      searchResults.style.display = "block";
    });

    // Prevent form submission & hide results when clicking outside
    searchForm.addEventListener("submit", (event) => event.preventDefault());
    document.addEventListener("click", (event) => {
      if (
        !searchResults.contains(event.target) &&
        event.target !== searchInput
      ) {
        searchResults.style.display = "none";
      }
    });
  }

  // Check if user is already logged in
  function CheckLogin() {
    console.log("[INFO] Checking user login status...");

    const loginNav = document.getElementById("login");

    if (!loginNav) {
      console.warn(
        "[WARNING] loginNav element not found! Skipping CheckLogin()."
      );
      return;
    }

    // store user session inside session storage
    const userSession = sessionStorage.getItem("user");

    // if user session exists, parse the data and store the user name for welcome message.
    if (userSession) {
      let userObject = JSON.parse(userSession);

      let username = userObject.Username;
      loginNav.innerHTML = `<li class="nav-item dropdown">
          <a
            class="nav-link dropdown-toggle"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="fa fas-sign-out-alt"></i> Welcome ${username}!
          </a>
          <ul class="dropdown-menu">
            <li>
              <a id="logout" class="dropdown-item">Log Out</a>
            </li>
          </ul>
        </li>`;
      loginNav.href = "#";
      // Store the new nav item Logout to a variable and remove session storage to logout.
      let logoutNav = document.getElementById("logout");
      logoutNav.addEventListener("click", (event) => {
        event.preventDefault();
        sessionStorage.removeItem("user");
        location.href = "login.html";
      });
    }
  }

  // Dynamically update nav link
  function updateActiveNavLink() {
    console.log("[INFO] Updating active nav link...");

    const currentPage = document.title.trim().toLowerCase();
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach((link) => {
      if (link.textContent.trim().toLowerCase() === currentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  /**
   * Dynamically load the header from the header.html
   */
  async function LoadHeader() {
    console.log("[INFO] Loading Header...");

    return fetch("header.html")
      .then((response) => response.text())
      .then((data) => {
        document.querySelector("header").innerHTML = data;
        updateActiveNavLink();
      })
      .catch((error) => {
        console.error("[ERROR] Unable to load header");
      });
  }

  // Dynamically load the gallery using data in the JSON file.
  async function LoadGallery() {
    console.log("[INFO] Loading Gallery...");
    const galleryContent = document.getElementById("gallery-content");
    return fetch("data/gallery.json")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((image) => {
          let img = document.createElement("img");
          img.src = image.src;
          img.alt = image.alt;
          img.classList.add("gallery-img");

          // Event listener to open Lightbox on click
          img.addEventListener("click", () =>
            OpenLightBox(image.src, image.caption)
          );
          galleryContent.appendChild(img);
        });
      })
      .catch((error) => {
        console.error("[ERROR] Unable to Load Gallery", error);
        galleryContent.textContent = "Unable to load images.";
      });
  }

  // Lightbox
  function OpenLightBox(src, caption) {
    document.getElementById("lightbox").style.display = "flex";
    document.getElementById("lightbox-img").src = src;
    document.getElementById("lightbox-caption").textContent = caption;
  }

  // Load news API , Key is as constant at begining of code.
  async function LoadNews() {
    console.log("[INFO] Loading News...");

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetchnew data from newsapi.org");
        }
        return response.json();
      })
      .then((data) => {
        console.log("News API Response", data);
        const newsDataElement = document.getElementById("news-data");

        // Clear previous Data
        newsDataElement.innerHTML = "";

        if (data.articles.length === 0) {
          newsDataElement.innerHTML = `<p>No news articles found.</p>`;
          return;
        }

        data.articles.forEach((article) => {
          let newsItem = document.createElement("div");
          newsItem.classList.add("news-item");
          newsItem.innerHTML = `
                <h4>${article.title}</h4>
                <p class="news-description">${
                  article.description || "No description available"
                }</p>
                <a href="${article.url}" target="_blank">Read More</a>
              `;
          newsDataElement.appendChild(newsItem);
        });
      })
      .catch((error) => {
        console.error("[ERROR] Unable to Fetch News Data", error);
        document.getElementById("news-data").textContent =
          "Unable to contact news data at this time";
      });
  }

  function DisplayHomePage() {
    console.log("Calling DisplayHomePage()...");

    let opportunitiesBtn = document.getElementById("OpportunitiesBtn");
    opportunitiesBtn.addEventListener("click", () => {
      location.href = "opportunities.html";
    });
  }

  function DisplayOpportunitiesPage() {
    console.log("Calling DisplayOpportunitiesPage()...");

    let opportunities = [
      "Opportunity #1, Planting Trees, January 25th 8:30am - 10:30am",
      "Opportunity #2, Cleaning Parks, January 27th 9:30am - 11:30am",
      "Opportunity #3, Planting Plants, January 29th 10:30am - 12:30am",
    ];

    let opportunitiesList = document.getElementById("opportunitiesList");
    let data = "";

    let index = 1;
    for (let i = 0; i < opportunities.length; i++) {
      let opportunityData = opportunities[i];

      opportunityData = opportunityData.split(",");
      let title = opportunityData[0];
      let description = opportunityData[1];
      let dateTime = opportunityData[2];

      data += `<tr><th scope="row" class="text-center">${index}</th>
                 <td>${title}</td>
                 <td>${description}</td>
                 <td>${dateTime}</td>
                 </tr>`;
      index++;
    }
    opportunitiesList.innerHTML = data;

    let volunteerBtn = document.getElementById("volunteerBtn");
    let confirmation = document.getElementById("confirmation");
    let resetModal = document.getElementById("resetModal");

    // If submit button is clicked in modal --> Add a confirmation msg inside the p tag.
    volunteerBtn.addEventListener("click", (event) => {
      event.preventDefault();
      let form = document.querySelector("form");
      let fullName = document.getElementById("fullName");
      if (form.checkValidity()) {
        let volunteerName = fullName.value;
        form.reset();

        let confirmationMsg = `<p id="confirmationMsg" class="mb-3">Thank you for Signing Up - ${volunteerName}</p>`;
        confirmation.innerHTML = confirmationMsg;
      } else {
        form.reportValidity();
      }
    });

    resetModal.addEventListener("click", () => {
      confirmation.innerHTML = "";
    });
  }

  function DisplayEventsPage() {
    console.log("Calling DisplayEventsPage()...");
  }

  function DisplayContactPage() {
    console.log("Calling DisplayContactPage()...");

    let sendButton = document.getElementById("sendButton");
    let form = document.querySelector("form");

    sendButton.addEventListener("click", (event) => {
      event.preventDefault();

      // If form is valid, open Modal for confirmation msg and then redirect user to home page.
      if (form.checkValidity()) {
        const fullName = document.getElementById("fullName").value.trim();
        const emailAddress = document
          .getElementById("emailAddress")
          .value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        // Inject form data into the confirmation modal to let the user know that the information has been recieved.
        document.getElementById("submittedDetails").innerHTML = `
        <strong>Full Name:</strong> ${fullName}<br>
        <strong>Email:</strong> ${emailAddress}<br>
        <strong>Subject:</strong> ${subject}<br>
        <strong>Message:</strong> ${message}
        `;

        let modalForm = document.querySelector("#confirmationModal");
        const modal = new bootstrap.Modal(modalForm); // Bootstrap Documentation
        modal.show();

        setInterval(() => {
          window.location.href = "index.html";
        }, 5000);
      } else {
        form.reportValidity();
      }
    });
  }

  function DisplayAboutPage() {
    console.log("Calling DisplayAboutPage()...");
  }

  function DisplayPrivacyPage() {
    console.log("Calling DisplayPrivacyPage()...");
  }

  function DisplayToSPage() {
    console.log("Calling DisplayToSPage()...");
  }

  function DisplayDonatePage() {
    console.log("Calling DisplayDonatePage()...");
    let donate = document.querySelector(".donate");
    donate.classList.add("active");
    donate.setAttribute("aria-current", "page");
  }

  async function DisplayNewsPage() {
    console.log("Calling DisplayNewsPage()...");
    // Load asynchronous News
    await LoadNews();
  }

  async function DisplayGalleryPage() {
    console.log("Calling DisplayGalleryPage()...");

    await LoadGallery();

    let closeLightBox = document.getElementById("closeLightBox");
    closeLightBox.addEventListener("click", () => {
      document.getElementById("lightbox").style.display = "none";
    });
  }

  function DisplayLoginPage() {
    console.log("[INFO] DisplayLoginPage called...");

    const messageArea = document.getElementById("messageArea");
    const loginButton = document.getElementById("loginButton");
    const cancelButton = document.getElementById("cancelButton");

    // messageArea
    messageArea.style.display = "none";

    if (!loginButton) {
      console.error("[ERROR] Unable to login button not found");
      return;
    }

    loginButton.addEventListener("click", async (event) => {
      // prevent default form submission
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        // The await keyword tells JavaScript to pause here (thread) until the fetch request completes
        const response = await fetch("../data/users.json");

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("[DEBUG] Fetched JSON Data:", jsonData);

        const users = jsonData.users;

        if (!Array.isArray(users)) {
          throw new Error("[ERROR] Json data does not contain a valid array");
        }

        let success = false;
        let authenticateUser = null;
        // Authenticate user login
        for (const user of users) {
          if (user.Username === username && user.Password === password) {
            success = true;
            authenticateUser = user;
            break;
          }
        }

        if (success) {
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              DisplayName: authenticateUser.DisplayName,
              Username: authenticateUser.Username,
            })
          );
          // Error messages for validation to make sure user submits valid data.
          messageArea.classList.remove("alert", "alert-danger");
          messageArea.style.display = "none";
          location.href = "opportunities-list.html";
        } else {
          messageArea.classList.add("alert", "alert-danger");
          messageArea.textContent =
            "Invalid username or password. Please try again";
          messageArea.style.display = "block";

          document.getElementById("username").focus();
          document.getElementById("username").select();
        }
      } catch (error) {
        console.error("[ERROR] Login failed", error);
      }
    });

    // Handle cancel event
    cancelButton.addEventListener("click", (event) => {
      document.getElementById("loginForm").reset();
      location.href = "index.html";
    });
  }

  async function Start() {
    console.log("Starting Assignment 1...");

    // Load header first, then run CheckLogin after
    await LoadHeader().then(() => {
      CheckLogin();
    });

    // Setup Search on page load
    await setupSearch();

    // Dynamically Add Donate Link text to NavBar when page loads.
    console.log("Adding 'Donate' link to NavBar");
    let navbar = document.querySelector(".navbar-nav");
    let donateNav = document.createElement("li");
    donateNav.classList.add("nav-item");
    donateNav.innerHTML = `<a class="nav-link donate" href="donate.html">Donate</a>`;
    navbar.appendChild(donateNav);

    let navLinks = document.querySelectorAll("a");
    navLinks.forEach((navLink) => {
      if (navLink.innerHTML == "Opportunities") {
        navLink.innerHTML = "Volunteer Now";
      }
    });

    // Back to Top Logic
    let backToTop = document.getElementById("btn-back-to-top");
    backToTop.addEventListener("click", () => {
      console.log("click -> Scroll to Top");
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });

    switch (document.title) {
      case "Home":
        DisplayHomePage();
        break;
      case "Opportunities":
        DisplayOpportunitiesPage();
        break;
      case "Events":
        DisplayEventsPage();
        break;
      case "Contact Us":
        DisplayContactPage();
        break;
      case "About Us":
        DisplayAboutPage();
        break;
      case "Privacy Policy":
        DisplayPrivacyPage();
        break;
      case "Terms of Service":
        DisplayToSPage();
        break;
      case "Donate":
        DisplayDonatePage();
        break;
      case "News":
        DisplayNewsPage();
        break;
      case "Gallery":
        DisplayGalleryPage();
        break;
      case "Login":
        DisplayLoginPage();
        break;
    }
  }
  window.addEventListener("load", Start);
})();
