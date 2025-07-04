// Global variables to manage state
let jokes = []; // Array to store all jokes
let showFavoritesOnly = false; // Flag for favorites filter
let searchQuery = ''; // Current search term

// DOM Elements - cached for performance
const btn = document.getElementById("btn");
const txtarea = document.getElementById("joke");
const loading = document.getElementById("loading");
const toggleBtn = document.getElementById("toggle-theme");
const historylist = document.getElementById("joke-history");
const showFavoritesBtn = document.getElementById("show-favorites");
const clearHistoryBtn = document.getElementById("clear-history");
const searchInput = document.getElementById("search-jokes");

// Theme toggle functionality
toggleBtn.addEventListener("click", function() {
  // Toggle dark class on body
  document.body.classList.toggle("dark");
  
  // Save theme preference to localStorage
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load saved theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// Toggle favorites display
showFavoritesBtn.addEventListener("click", function() {
  // Flip the showFavoritesOnly flag
  showFavoritesOnly = !showFavoritesOnly;
  
  // Update button text based on state
  this.textContent = showFavoritesOnly ? '🌟 Show All' : '⭐ Show Favorites';
  
  // Re-render the joke history
  renderJokeHistory();
});

// Render the joke history list
function renderJokeHistory() {
  // Clear the current history list
  historylist.innerHTML = "";
  
  // Start with all jokes
  let jokesToRender = jokes;
  
  // Apply search filter if there's a query
  if (searchQuery) {
    jokesToRender = jokesToRender.filter(joke => 
      joke.text.toLowerCase().includes(searchQuery)
    );
  }
  
  // Apply favorites filter if enabled
  if (showFavoritesOnly) {
    jokesToRender = jokesToRender.filter(joke => joke.favorite);
  }
  
  // Check if we have jokes to display
  if (jokesToRender.length === 0) {
    // Create a message when no jokes are available
    const message = document.createElement("li");
    message.textContent = showFavoritesOnly ? 
      "No favorite jokes yet!" : 
      "No jokes yet! Use the 'Get Joke' button to start!";
    message.style.textAlign = "center";
    message.style.padding = "20px";
    message.style.opacity = "0.7";
    historylist.appendChild(message);
    return;
  }
  
  // Render jokes in reverse chronological order (newest first)
  for (let i = jokesToRender.length - 1; i >= 0; i--) {
    const joke = jokesToRender[i];
    const li = document.createElement("li");
    
    // Add 'favorite' class if joke is favorited
    if (joke.favorite) li.classList.add("favorite");
    
    // Create text element for joke content
    const jokeText = document.createElement("div");
    jokeText.className = "joke-text";
    jokeText.textContent = joke.text;
    
    // Create favorite button
    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn";
    favBtn.innerHTML = joke.favorite ? "★" : "☆";
    favBtn.onclick = () => toggleFavorite(joke);
    
    // Add elements to list item
    li.appendChild(jokeText);
    li.appendChild(favBtn);
    
    // Add list item to history list
    historylist.appendChild(li);
  }
}

// Toggle favorite status of a joke
function toggleFavorite(joke) {
  // Flip the favorite status
  joke.favorite = !joke.favorite;
  
  // Update localStorage with new joke data
  localStorage.setItem("jokes", JSON.stringify(jokes));
  
  // Re-render the joke history
  renderJokeHistory();
}

// Fetch a new joke from API
btn.addEventListener("click", function() {
  // Show loading indicator
  loading.style.display = "block";
  txtarea.value = ""; // Clear previous joke
  
  // Fetch joke from API
  fetch("https://official-joke-api.appspot.com/random_joke")
    .then(res => {
      // Check for network errors
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then(data => {
      // Format joke text
      const jokestext = `Setup: ${data.setup}\nPunchline: ${data.punchline}`;
      
      // Display joke in textarea
      txtarea.value = jokestext;
      
      // Add joke to history
      jokes.push({
        text: jokestext,
        favorite: false,
        id: Date.now() // Unique ID for tracking
      });
      
      // Save to localStorage
      localStorage.setItem("jokes", JSON.stringify(jokes));
      
      // Re-render history
      renderJokeHistory();
      
      // Hide loading indicator
      loading.style.display = "none";
      
      // Add animation effect
      txtarea.classList.add("animate");
      setTimeout(() => txtarea.classList.remove("animate"), 600);
    })
    .catch(error => {
      // Handle errors
      console.error("Error:", error);
      txtarea.value = "😓 Failed to load joke. Please try again.";
      loading.style.display = "none";
    });
});

// Clear history functionality
clearHistoryBtn.addEventListener("click", function() {
  // Confirm with user before clearing
  if (confirm("Are you sure you want to clear all jokes?")) {
    jokes = []; // Clear jokes array
    localStorage.removeItem("jokes"); // Remove from storage
    renderJokeHistory(); // Re-render empty history
    txtarea.value = ""; // Clear displayed joke
  }
});

// Search functionality
searchInput.addEventListener("input", function() {
  // Get search query and convert to lowercase
  searchQuery = this.value.toLowerCase();
  
  // Re-render history with filtered results
  renderJokeHistory();
});

// Initialize the application
function initApp() {
  // Load jokes from localStorage
  const savedJokes = localStorage.getItem("jokes");
  if (savedJokes) {
    jokes = JSON.parse(savedJokes);
  }
  // Start the application
initApp();
  
  // Render initial joke history
  renderJokeHistory();
  
  // Show welcome message if no jokes
  setTimeout(() => {
    if (jokes.length === 0) {
      txtarea.value = "Welcome to Joke Generator!\nClick the 'Get Joke' button to start laughing!";
    }
  }, 500);
}
const copyBtn = document.getElementById("copy-joke");
copyBtn.addEventListener("click", function () {
  const jokeText = txtarea.value;
  if (jokeText.trim() === "") {
    alert("There's no joke to copy!");
    return;
  }

  navigator.clipboard.writeText(jokeText)
    .then(() => {
      copyBtn.textContent = "✅ Copied!";
      setTimeout(() => {
        copyBtn.textContent = "📋 Copy Joke";
      }, 1500);
    })
    .catch(err => {
      console.error("Copy failed:", err);
      alert("Copy failed. Try manually.");
    });
});

