// Your Twitch application credentials
const CLIENT_ID = 'o5n16enllu8dztrwc6yk15ncrxdcvc';
const REDIRECT_URI = 'https://zer0.tv';
//const REDIRECT_URI = `http://localhost:63488`;


// Twitch API Endpoints
const TWITCH_API_BASE_URL = 'https://api.twitch.tv/helix';
const LOGIN_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token`;
const STREAMS_URL = `${TWITCH_API_BASE_URL}/streams`;
const TOP_CATEGORIES_URL = `${TWITCH_API_BASE_URL}/games/`; // Fetch top 10 categories initially
const SEARCH_CATEGORIES_URL = `${TWITCH_API_BASE_URL}/search/categories`;

// Elements
const loginButton = document.getElementById('login-button');
const content = document.getElementById('content');
const categoryList = document.getElementById('category-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categorySearchResults = document.getElementById('category-search-results');
const categorySearchResultList = document.getElementById('category-search-result-list');
const loggedInUser = document.getElementById('logged-in-user'); // Add an element to display logged-in user
const userInfo = document.getElementById('user-info'); // Add an element for user information
const userLogin = document.getElementById('user-login'); // Add an element to display user login
const userProfileImage = document.getElementById('profile-image'); // Add an element for the profile image


// Event listener for the login button
loginButton.addEventListener('click', () => {
	window.location.href = LOGIN_URL;
});

// Event listener for the category search button
searchButton.addEventListener('click', () => {
	const searchText = searchInput.value.trim();
	if (searchText) {
		searchCategories(searchText);
	}
});

// ... (previous JavaScript code)

// Function to update the top bar based on login status
function updateTopBar(loggedIn) {
	const loginButton = document.getElementById('login-button');
	const userInfo = document.getElementById('user-info');
	const userLogin = document.getElementById('user-login');

	if (loggedIn) {
		// User is logged in
		loginButton.style.display = 'none';
		userInfo.style.display = 'block';
		userLogin.textContent = 'Logged in';
		userLogin.style.display = 'block';

		// Fetch and display user details
		fetchUserDetails(accessToken);
	} else {
		// User is not logged in
		loginButton.style.display = 'block';
		userInfo.style.display = 'none';
		userLogin.textContent = 'Not logged in';
	}
}

// Check if there's a Twitch access token in the URL after authentication
const params = new URLSearchParams(window.location.hash.substring(1));
const accessToken = params.get('access_token');

if (accessToken) {
	// User is authenticated
	updateTopBar(true);
	// Fetch and display categories
	fetchCategories();
	// Fetch streams on initial load
	fetchStreams();
	streams10OrLess();
} else {
	// User is not authenticated
	updateTopBar(false);
}

// Function to fetch and display the logged-in user's details and profile image
async function fetchUserDetails(accessToken) {
	try {
		const response = await fetch(`${TWITCH_API_BASE_URL}/users`, {
			headers: {
				'Client-ID': CLIENT_ID,
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (response.ok) {
			const data = await response.json();
			const user = data.data[0];

			if (user) {
				// Display the logged-in user's login information
				userLogin.textContent = `Welcome, ${user.login}`;
				// Show user information
				userInfo.style.display = 'block';

				// Fetch and display the user's profile image
				fetchUserProfileImage(user.id, accessToken);
			} else {
				userLogin.textContent = 'User details not found.';
			}
		} else {
			userLogin.textContent = 'Error fetching user details.';
		}
	} catch (error) {
		console.error(error);
		userLogin.textContent = 'An error occurred while fetching user details.';
	}
}

// Function to fetch and display the user's profile image
async function fetchUserProfileImage(userId, accessToken) {
	try {
		const response = await fetch(`${TWITCH_API_BASE_URL}/users?id=${userId}`, {
			headers: {
				'Client-ID': CLIENT_ID,
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (response.ok) {
			const data = await response.json();
			const user = data.data;

			if (user && user[0] && user[0].profile_image_url) {
				// Display the user's profile image
				userProfileImage.src = user[0].profile_image_url;
				userProfileImage.style.display = 'block';
			}
		}
	} catch (error) {
		console.error(error);
	}
}

// Function to fetch and display Twitch categories
async function fetchCategories() {
	try {
		const response = await fetch(`${TOP_CATEGORIES_URL}top?first=50`, {
			headers: {
				'Client-ID': CLIENT_ID,
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (response.ok) {
			const data = await response.json();
			const categories = data.data;
			
			content.textContent = 'Top 50 Categories';
			categories.forEach((category) => {
				const listItem = document.createElement('span');
				listItem.classList.add('badge', 'badge-primary', 'mr-2');
				listItem.textContent = category.name;
				listItem.addEventListener('click', () => {
					// When a category is clicked, fetch streams in that category
					fetchStreams(category.id, category.name);
				});
				categoryList.appendChild(listItem);
			});
		} else {
			content.textContent = 'Error fetching categories. Try logging in?';
		}
	} catch (error) {
		console.error(error);
		content.textContent = 'An error occurred.';
	}
}

// Function to search for Twitch categories by name
async function searchCategories(categoryName) {

	try {
		const response = await fetch(`${SEARCH_CATEGORIES_URL}?query=${encodeURIComponent(categoryName)}`, {
			headers: {
				'Client-ID': CLIENT_ID,
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (response.ok) {
			const data = await response.json();
			const categories = data.data;

			if (categories.length > 0) {
				// Clear the existing category search results
				categorySearchResultList.innerHTML = '';
				categorySearchResultList.textContent = 'Search Results';
				categories.forEach((category) => {
					const listItem = document.createElement('span');
					listItem.classList.add('badge', 'badge-primary', 'mr-2');
					listItem.textContent = category.name;
					listItem.addEventListener('click', () => {
						// When a category is clicked, fetch streams in that category
						fetchStreams(category.id, category.name);
					});
					categorySearchResultList.appendChild(listItem);
				});

				// Display the category search results container
				categorySearchResults.style.display = 'block';
			} else {
				categorySearchResultList.textContent = 'No matching categories found.';
				categorySearchResults.style.display = 'block';
			}
		} else {
			content.textContent = 'Error fetching categories.';
		}
	} catch (error) {
		console.error(error);
		content.textContent = 'An error occurred.';
	}
}

// Function to format the time difference as "X minutes ago" or "X hours ago"
function formatTimeDifference(startedAt) {
	const startTime = new Date(startedAt);
	const currentTime = new Date();
	const timeDifferenceInMilliseconds = currentTime - startTime;
	
	// Calculate minutes and hours
	const minutes = Math.floor(timeDifferenceInMilliseconds / (1000 * 60));
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
	} else {
		return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
	}
}

// Function to fetch and display Twitch streams within a category with fewer than 10 viewers
function fetchStreams(categoryId, categoryName) {
	
	const MAX_STREAMS = 1000;
	const streamArray = [];
	const apiUrl = `${STREAMS_URL}?game_id=${categoryId}&first=100&language=en`;
	
	const headers = {
		'Client-ID': CLIENT_ID,
		'Authorization': `Bearer ${accessToken}` // Replace with your Twitch access token
	};
	
	function fetchStreamsRecursive(url) {
		$.ajax({
			url,
			method: 'GET',
			headers,
			success: (response) => {
				const streams = response.data;
				streamArray.push(...streams);
	
				if (streamArray.length < MAX_STREAMS && response.pagination && response.pagination.cursor) {
					// Continue fetching streams if not reached the limit
					fetchStreamsRecursive(`${apiUrl}&after=${response.pagination.cursor}`);
				} else {
					// Display the streams in the table
					console.log(streamArray);
					streams10OrLess(streamArray);
				}
			},
			error: (error) => {
				console.error(error);
			}
		});
	}
	fetchStreamsRecursive(apiUrl);
	console.log(streamArray);
}
			// Filter streams with fewer than 10 viewers
function streams10OrLess(streams) {
			const filteredStreams = streams.filter((stream) => stream.viewer_count < 4);

			if (filteredStreams.length > 0) {
			// Display filtered streams in a table
			const table = document.createElement('table');
			table.classList.add('table', 'table-striped', 'table-hover');
			table.innerHTML = `
				<thead>
					<tr>
						<th>Streamer</th>
						<th>Title</th>
						<th>Game</th>
						<th>Viewers</th>
						<th>Started</th> <!-- New column for stream start time -->
					</tr>
				</thead>
				<tbody>
					<!-- Streams will be added here -->
				</tbody>
			`;


			filteredStreams.forEach((stream) => {
				const row = document.createElement('tr');
				const formattedTime = formatTimeDifference(stream.started_at);
				row.innerHTML = `
				<td><a href="https://www.twitch.tv/${stream.user_name}" target="_blank">${stream.user_name}</a></td>
				<td>${stream.title}</td>
				<td>${stream.game_name}</td>
				<td>${stream.viewer_count}</td>
				<td>${formattedTime}</td>
				`;
				table.querySelector('tbody').appendChild(row);
				});
				
								// Replace the content with the table
								content.innerHTML = '';
								content.appendChild(table);
							} else {
								content.textContent = `No streams found.`;
							}
						}