// Your Twitch application credentials
const CLIENT_ID = 'o5n16enllu8dztrwc6yk15ncrxdcvc';
//const REDIRECT_URI = 'https://zer0.tv';
const REDIRECT_URI = `http://localhost:52709`;


// Twitch API Endpoints
const TWITCH_API_BASE_URL = 'https://api.twitch.tv/helix';
const LOGIN_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token`;
const STREAMS_URL = `${TWITCH_API_BASE_URL}/streams`;
const TOP_CATEGORIES_URL = `${TWITCH_API_BASE_URL}/games/`; // Fetch top 10 categories initially
const SEARCH_CATEGORIES_URL = `${TWITCH_API_BASE_URL}/search/categories`;
const BASE_USERS_URL = `${TWITCH_API_BASE_URL}/users`;
const BASE_CHANNELS_URL = `${TWITCH_API_BASE_URL}/channels`;

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

let streamCount = 0;
let viewerCount = 0;

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


// Function to update the top bar based on login status
function updateTopBar(loggedIn) {
	const loginButton = document.getElementById('login-button');
	const userInfo = document.getElementById('user-info');
	const userLogin = document.getElementById('user-login');

	if (loggedIn) {
		// User is logged in
		loginButton.style.display = 'none';

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
			

			categories.forEach((category) => {
				const listItem = document.createElement('span');
				listItem.classList.add('badge', 'badge-primary', 'mr-2');
				listItem.textContent = category.name;
				listItem.addEventListener('click', () => {
					// When a category is clicked, fetch streams in that category
					//fetchStreams(category.id, category.name);
					actuallyFetch(category.id);
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
			// Get the categories container
			const categoriesContainer = document.querySelector('.category-badges');

			if (categories.length > 0) {
				// Clear the existing category search results
				categorySearchResultList.innerHTML = '';
				categories.forEach((category) => {
						const boxArtDiv = document.createElement('div');
					

						let boxArt = category.box_art_url;
						const boxArtImage = document.createElement('img');
						boxArtImage.src = boxArt.replace('52x72', '150x220');
						boxArtImage.title = `${category.name}`;
					
					boxArtImage.addEventListener('click', () => {
						// When a category is clicked, fetch streams in that category
						//fetchStreams(category.id, category.name);
						actuallyFetch(category.id);
					});
					
					boxArtDiv.appendChild(boxArtImage);
					categorySearchResultList.appendChild(boxArtDiv);
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

async function fetchStreams(gameName, limit = 300, cursor = null) {
 
  const baseUrl = 'https://api.twitch.tv/helix/streams';
  
  // Define query parameters
  const params = new URLSearchParams({
	game_id: gameName,
	first: 100,
  });

  if (cursor) {
	params.set('after', cursor);
  }

  const url = `${baseUrl}?${params.toString()}&language=en`;

  const headers = {
	'Client-ID': CLIENT_ID,
	'Authorization': `Bearer ${accessToken}`, // Replace with your access token
  };

const allStreams = [];
	const userIds = [];
  
	try {
	  const response = await fetch(url, { headers });
	  if (response.ok) {
		const data = await response.json();
		const streams = data.data;
		const pagination = data.pagination;
  
		for (const stream of streams) {
		  allStreams.push(stream);
		  userIds.push(stream.user_id);
		}
  
		if (allStreams.length < limit && pagination && pagination.cursor) {
		  // If there are more streams to fetch, recursively call the function
		  const { allStreams: remainingStreams, userIds: remainingUserIds } = await fetchStreams(gameName, limit - allStreams.length, pagination.cursor);
		  allStreams.push(...remainingStreams);
		  userIds.push(...remainingUserIds);
		}
  
		return { allStreams, userIds };
	  } else {
		throw new Error(`Failed to fetch streams: ${response.status} - ${await response.text()}`);
	  }
	} catch (error) {
	  console.error('Error fetching streams:', error);
	  throw error;
	}
  }


async function fetchUsersInfo(userIds) {
	
	const usersInfo = [];

  for (let i = 0; i < userIds.length; i += 100) {
	const batchUserIds = userIds.slice(i, i + 100);
	const params = new URLSearchParams({ id: batchUserIds.join('&') });

	const url = `${BASE_USERS_URL}?${params.toString()}`;
	const fixedUrl = url.replace(/%26/g, "&id=");

	const headers = {
	  'Client-ID': CLIENT_ID,
	  'Authorization': `Bearer ${accessToken}`,
	};

	try {
	  const response = await fetch(fixedUrl, { headers });

	  if (response.ok) {
		const data = await response.json();
		usersInfo.push(...data.data);
	  } else {
		throw new Error(`Failed to fetch user info: ${response.status} - ${await response.text()}`);
	  }
	} catch (error) {
	  console.error('Error fetching user info:', error);
	  throw error;
	}
  }

  return usersInfo;
}

async function fetchChannelsInfo(userIds) {
  let channelsInfo = [];

  for (let i = 0; i < userIds.length; i += 100) {
	const batchUserIds = userIds.slice(i, i + 100);
	const params = new URLSearchParams({ broadcaster_id: batchUserIds.join('&') });

	const url = `${BASE_CHANNELS_URL}?${params.toString()}`;
	const fixedUrl = url.replace(/%26/g, "&broadcaster_id=");
	

	const headers = {
	  'Client-ID': CLIENT_ID,
	  'Authorization': `Bearer ${accessToken}`,
	};

	try {
	  const response = await fetch(fixedUrl, { headers });

	  if (response.ok) {
		const data = await response.json();
		channelsInfo.push(...data.data);
	  } else {
		throw new Error(`Failed to fetch user info: ${response.status} - ${await response.text()}`);
	  }
	} catch (error) {
	  console.error('Error fetching user info:', error);
	  throw error;
	}
  }

  return channelsInfo;
}

// merge stream array and user array
 function mergeUsers(users, streams) {
   // Create a map of user data using user_id as the key
   const userMap = new Map();
   users.forEach(user => userMap.set(user.id, user));
 
   // Merge user and stream data based on user_id
   const mergedData = streams.map(stream => {
	 const user = userMap.get(stream.user_id);
	 if (user) {
	   return { ...stream, user };
	 }
	 return stream;
   });
 
   return mergedData;
 }


// Merge channel array with user-merged stream array.
function mergeChannels(streams, channelDeets) {
   
   for (let i = 0; i < streams.length; i++) {
	   streams[i].broadcaster_id = streams[i].user.id;
   }

   // Create a map of user data using user_id as the key
   const channelMap = new Map();
   streams.forEach(user => channelMap.set(user.broadcaster_id, user));
 
   // Merge user and stream data based on user_id
   const mergedData = streams.map(stream => {
	 const channel = channelMap.get(stream.broadcaster_id);
	 if (channel) {
	   return { ...stream, channel };
	 }
	 return stream;
   });
 
   return mergedData;
 }

// Number of followers each channel has
function everyMoveYouMake(streams) {
	const headers = {
		'Client-ID': CLIENT_ID,
		'Authorization': `Bearer ${accessToken}` // Replace with your Twitch access token
	};
	
	let promises = [];
	for (let i = 0; i < streams.length; i++) {
		const url = `${TWITCH_API_BASE_URL}/channels/followers?broadcaster_id=${streams[i].user_id}`;
		// Check if the current element is an object
		const promise = $.ajax({
		url,
		method: 'GET',
		headers,
		success: (response) => {
			const channelDeets = response.total;
			streams[i].follower_count = channelDeets;

		},
		error: (error) => {
			console.log(error);
		}
		});
		promises.push(promise);
	}
	$.when.apply($, promises).done(() => { 	streams10OrLess(streams); });
}

// Total number of viewers for retrieved streams
function howManyEyeballs(streams) {
	
	viewerCount = 0;
	
	for (let i = 0; i < streams.length; i++) {
		viewerCount = viewerCount + streams[i].viewer_count;
	}
	streams.viewer_count = viewerCount;
}			

function isMature(streams) {
	const findTrue = true;
	const ratedM = '<img src=img/ratedm.png alt="M">';
	const ratedE = '<img src=img/ratede.png alt="E">';

	streams.forEach((stream) => {
		if (stream.is_mature === findTrue) {
			stream.is_mature = ratedM;
		} else { stream.is_mature = ratedE; }
	}); 
}

// Last minute calls and filtering streams with fewer than 4 viewers
function streamFilter(streams) {
	console.log(streams);
	streamCount = streams.length;
	howManyEyeballs(streams);
	const filteredStreams = streams.filter((stream) => stream.viewer_count < 4);
	if (filteredStreams.length > 0) {
	isMature(filteredStreams);
	everyMoveYouMake(filteredStreams);

} else {
	content.textContent = `No streams found.`;
}
}
			

function streams10OrLess(filteredStreams) {
			
			// Display filtered streams in a table
			const table = document.createElement('table');
			table.classList.add('table', 'caption-top', 'table-striped', 'table-hover', 'table-responsive');
			table.innerHTML = `
				<caption>${filteredStreams[0].game_name} streams. ${viewerCount} viewers in ${streamCount} streams. </caption>
				<thead>
					<tr>
						<th>Streamer</th>
						<th>Type</th>
						<th>Age</th>
						<th>Title</th>
						<th>Game</th>
						<th>Mature</th>
						<th>Viewers</th>
						<th>Followers</th>
						<th>Started</th>
						<th>Tags</th>
					</tr>
				</thead>
				<tbody>
					<!-- Streams will be added here -->
				</tbody>
			`;

			console.log(filteredStreams);
			filteredStreams.forEach((stream) => {
				const row = document.createElement('tr');
				const formattedTime = formatTimeDifference(stream.started_at);
				const createdAt = reallyLongTimeAgo(stream.user.created_at);
				
				//makes tags into badges
				
				if ( stream.tags && stream.tags.length > 0 ) {
					for (let j = 0; j < stream.tags.length; j++) {
						
						const value = stream.tags[j];
						stream.tags[j] = `<a href="#" class="badge badge-info">${value}</a>`;
					}
					tagsWithoutCommas = stream.tags.toString();
					tagsWithoutCommas = tagsWithoutCommas.replace(/,/g, "");
					stream.tags = tagsWithoutCommas;
				} else stream.tags = "";
				
				// puts bits icon or twitch logo for affilate/partner
				
				const partnerIcon = '<img src=img/partner.png alt="partner">';
				const affiliateIcon = '<img src=img/bits.png alt=affiliate>';
				if (stream.user.broadcaster_type === "partner") {
					stream.user.broadcaster_type = partnerIcon;
				}
				if (stream.user.broadcaster_type === "affiliate") {
					stream.user.broadcaster_type = affiliateIcon;
				}
				
				row.innerHTML = `
				<td><a href="https://www.twitch.tv/${stream.user_name}" target="_blank">${stream.user_name}</a></td>
				<td>${stream.user.broadcaster_type}</td>
				<td>${createdAt}</td>
				<td>${stream.title}</td>
				<td>${stream.game_name}</td>
				<td>${stream.is_mature}</td>
				<td>${stream.viewer_count}</td>
				<td>${stream.follower_count}</td>
				<td>${formattedTime}</td>
				<td>${stream.tags}</td>
				`;
				table.querySelector('tbody').appendChild(row);
				});
				
								// Replace the content with the table
								content.innerHTML = '';
								content.appendChild(table);
						}
					
async function actuallyFetch(gameId) {
	try {
		const gameName = gameId; // Replace with the actual game ID
		const { allStreams, userIds } = await fetchStreams(gameName);
		const usersInfo = await everythingAboutYou(userIds, allStreams);
		} catch (error) {
		console.error('An error occurred:', error);
		}
	}

async function everythingAboutYou (userIds, streams) {
	try { // Replace with actual user IDs
		const usersInfo = await fetchUsersInfo(userIds);
		const userMerged = await mergeUsers(usersInfo, streams);
		const channelsInfo = await everythingAboutYourChannel(userIds, userMerged);
		//streamFilter(userMerged);
	  } catch (error) {
		console.error('An error occurred:', error);
	  }
	}

async function everythingAboutYourChannel (userIds, userMerged) {
	  try {
		const channelsInfo = await fetchChannelsInfo(userIds);
		console.log(channelsInfo);
		const fullyMerged = await mergeChannels(userMerged, channelsInfo);
		console.log(fullyMerged);
		streamFilter(fullyMerged);
	  } catch (error) {
		console.error('An error occurred:', error);
	  }
	}
