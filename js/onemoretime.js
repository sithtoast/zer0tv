// Your Twitch application credentials
const CLIENT_ID = 'o5n16enllu8dztrwc6yk15ncrxdcvc';
//const REDIRECT_URI = 'https://zer0.tv';
const REDIRECT_URI = `http://localhost:53875`;


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
let gameName = "";

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
				showTopIfNeeded();
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
						const searchTag = document.createElement('span');
						searchTag.classList.add('badge', 'badge-warning', 'mr-2');
						searchTag.textContent = category.name;
						
						const popoverDiv = document.createElement('div');
						popoverDiv.classList.add('popover');
						
						let boxArt = category.box_art_url;
						 const boxArtImage = document.createElement('img');
						boxArtImage.src = boxArt.replace('52x72', '150x220');
						boxArtImage.title = `${category.name}`;
						
					
					searchTag.addEventListener('click', () => {
						// When a category is clicked, fetch streams in that category
						//fetchStreams(category.id, category.name);
						actuallyFetch(category.id);
					});
					
					categorySearchResultList.appendChild(searchTag);
					
					
					// categorySearchResultList.appendChild(boxArtDiv);
				});
				

				// Display the category search results container
				categorySearchResults.style.display = 'block';
				showSearchIfNeeded();
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

async function fetchStreams(gameName, limit = 1500, cursor = null) {
 
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
			const followerDeets = response.total;
			streams[i].follower_count = followerDeets;

		},
		error: (error) => {
			console.log(error);
		}
		});
		promises.push(promise);
	}
	$.when.apply($, promises).done(() => { 	totalFollowers(streams); });
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
	streamCount = streams.length;
	gameName = streams[0].game_name;
	howManyEyeballs(streams);
	const filteredStreams = streams.filter((stream) => stream.viewer_count < 4);
	if (filteredStreams.length > 0) {
	//console.log(filteredStreams);
	isMature(filteredStreams);
	isAffiliate(filteredStreams);
	streams10OrLess(filteredStreams);
	//everyMoveYouMake(filteredStreams);
	
	

} else {
	content.textContent = `No streams found.`;
}
}		

function streams10OrLess(filteredStreams) {
	
	
	console.log(gameName, viewerCount, streamCount);
	const criteriaMet = filteredStreams.length;
	const tableCaption = document.getElementById('searchTerms');
	tableCaption.innerHTML = `<h2>${gameName}</h2> ${viewerCount} viewers in ${streamCount} streams. (Give or Take) <br> ${criteriaMet} streams meet our criteria.`;
	
	const resultsPerPage = 30; // Number of results per page
	let currentPage = 1;
	let streamsData = filteredStreams; // Your stream data goes here	
	
	// Function to embed the selected stream and chat
	function embedStreamAndChat(selectedStream) {
		// Create an iframe for the selected stream
		const streamIframe = document.createElement('iframe');
		streamIframe.src = `https://player.twitch.tv/?channel=${selectedStream.user_name}&parent=zer0.tv`;
		streamIframe.width = '600';
		streamIframe.height = '400';
		streamIframe.allowFullscreen = true;
		streamIframe.frameBorder = '0';
	
		// Create an iframe for the chat
		const chatIframe = document.createElement('iframe');
		chatIframe.src = `https://www.twitch.tv/embed/${selectedStream.user_name}/chat?parent=zer0.tv`;
		chatIframe.width = '400';
		chatIframe.height = '400';
		chatIframe.allowFullscreen = true;
		chatIframe.frameBorder = '0';
	
		// Clear the previous embedded content
		const embedContainer = document.getElementById('selected-stream-and-chat-container');
		embedContainer.innerHTML = '';
	
		// Create a container for the stream and chat side by side
		const streamAndChatContainer = document.createElement('div');
		streamAndChatContainer.className = 'stream-and-chat-container';
		streamAndChatContainer.appendChild(streamIframe);
		streamAndChatContainer.appendChild(chatIframe);
	
		// Append the stream and chat container to the selected-stream-and-chat-container
		embedContainer.appendChild(streamAndChatContainer);
	}
	
// Function to embed 3 random streams with chat
	function embedRandomStreamsAndChat() {
		const randomStreams = [];
		
		// Generate 3 unique random indices
		const randomIndices = [];
		while (randomIndices.length < 3) {
			const randomIndex = Math.floor(Math.random() * streamsData.length);
			if (!randomIndices.includes(randomIndex)) {
				randomIndices.push(randomIndex);
			}
		}
	
		// Get the data for the randomly selected streams
		randomIndices.forEach(index => {
			randomStreams.push(streamsData[index]);
		});
	
		// Embed the random streams and chat
		const embedContainer = document.getElementById('selected-stream-and-chat-container');
		embedContainer.innerHTML = ''; // Clear the previous embedded content
	
		randomStreams.forEach(stream => {
			const streamIframe = document.createElement('iframe');
			streamIframe.src = `https://player.twitch.tv/?channel=${stream.user_name}&parent=zer0.tv`;
			streamIframe.width = '600';
			streamIframe.height = '400';
			streamIframe.allowFullscreen = true;
			streamIframe.frameBorder = '0';
	
			const chatIframe = document.createElement('iframe');
			chatIframe.src = `https://www.twitch.tv/embed/${stream.user_name}/chat?parent=zer0.tv`;
			chatIframe.width = '400';
			chatIframe.height = '400';
			chatIframe.allowFullscreen = true;
			chatIframe.frameBorder = '0';
	
			// Create a container for the stream and chat side by side
			const streamAndChatContainer = document.createElement('div');
			streamAndChatContainer.className = 'stream-and-chat-container';
			streamAndChatContainer.appendChild(streamIframe);
			streamAndChatContainer.appendChild(chatIframe);
	
			embedContainer.appendChild(streamAndChatContainer);
		});
	}
	
	// Add a click event listener to the "Embed 3 Random Streams with Chat" button
	document.getElementById('embedRandomStreamsAndChat').addEventListener('click', embedRandomStreamsAndChat);




	
// Function to fetch followers for a user
	async function fetchFollowers(userId, accessToken) {
		try {
			const response = await fetch(`${TWITCH_API_BASE_URL}/channels/followers?broadcaster_id=${userId}`, {
				headers: {
					'Client-ID': CLIENT_ID,
					'Authorization': `Bearer ${accessToken}`,
				},
			});
	
			if (!response.ok) {
				throw new Error(`Error fetching followers: ${response.statusText}`);
			}
	
			const data = await response.json();
			return data.total; // Return the total number of followers
		} catch (error) {
			console.error('An error occurred while fetching followers:', error);
			return 0;
		}
	}	
			
			function updateFollowers() {
				// Get the user IDs or usernames of the displayed streams
				const streamers = streamsData
					.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)
					.map(stream => stream.user_id);
			
				// Fetch and display followers for each streamer
				streamers.forEach(async (userId, index) => {
					const followers = await fetchFollowers(userId, accessToken);
					// Update the corresponding table cell with the follower count
					const followersCell = document.querySelector(`#search-result-list tr:nth-child(${index + 1}) td.followers`);
					followersCell.textContent = followers;
				});
				totalFollowers(filteredStreams);
			}
			
			function renderTable() {
				const startIndex = (currentPage - 1) * resultsPerPage;
				const endIndex = startIndex + resultsPerPage;
				const displayedStreams = streamsData.slice(startIndex, endIndex);
			
				const tableBody = document.getElementById('search-result-list');
				tableBody.innerHTML = '';
			
				displayedStreams.forEach((stream) => {
					const formattedTime = formatTimeDifference(stream.started_at);
					const createdAt = reallyLongTimeAgo(stream.user.created_at);
					const streamLink = `<a href="https://www.twitch.tv/${stream.user_name}" target="_blank">${stream.user_name}</a>`
					
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
					
					const partnerIcon = '<img src=img/partner.png alt="partner" title="Partner" width=16 height=16>';
					const affiliateIcon = '<img src=img/bits.png alt="affiliate" title="Affiliate" width=16 height=16>';
					if (stream.user.broadcaster_type === "partner") {
						stream.user.iconed_name = stream.user_name + partnerIcon;
					}
					if (stream.user.broadcaster_type === "affiliate") {
						stream.user.iconed_name = stream.user_name + affiliateIcon;
					}
					else stream.user.iconed_name = stream.user_name + "";
					
					// Create and append rows for the displayed streams
					const row = tableBody.insertRow();
					const streamerCell = row.insertCell(0);
					const ageCell = row.insertCell(1);
					const titleCell = row.insertCell(2);
					const matureCell = row.insertCell(3);
					const viewersCell = row.insertCell(4);
					const followersCell = row.insertCell(5);
					const startedCell = row.insertCell(6);
					const tagsCell = row.insertCell(7);
					
					streamerCell.innerHTML = stream.user.iconed_name;
					ageCell.textContent = createdAt;
					titleCell.textContent = stream.title;
					matureCell.innerHTML = stream.is_mature;
					viewersCell.textContent = stream.viewer_count;
					followersCell.className = 'followers';
					startedCell.textContent = formattedTime;
					tagsCell.innerHTML = stream.tags;
					// Update the format as needed		
				});
			}
			
			function updatePagination() {
			
				const bottomPaginationContainer = document.getElementById('bottom-pagination-container');
				bottomPaginationContainer.innerHTML = '';
			
				const totalPages = Math.ceil(streamsData.length / resultsPerPage);
			
				for (let page = 1; page <= totalPages; page++) {
					const li = document.createElement('li');
					li.className = 'page-item';
			
					const a = document.createElement('a');
					a.className = 'page-link';
					a.href = '#';
					a.textContent = page;
			
					a.addEventListener('click', () => {
						currentPage = page;
						updatePagination();
					});
			
					li.appendChild(a);
			
					bottomPaginationContainer.appendChild(li); // Add the button to the bottom pagination
				}
			
				const currentButton = bottomPaginationContainer.getElementsByTagName('li')[currentPage - 1];
				if (currentButton) {
					currentButton.classList.add('active');
				}
			
				
				renderTable();
				showButtonIfNeeded();
				showTableifNeeded();
				updateFollowers();
				
			}
			
			// Initial rendering of the table
			updatePagination();
			
			// Add an event listener to each table row for stream selection
			document.getElementById('search-result-list').addEventListener('click', function(event) {
				const clickedRow = event.target.closest('tr');
				if (clickedRow) {
					const rowIndex = clickedRow.rowIndex - 1; // Subtract 1 to account for the table header
					const selectedStream = streamsData[rowIndex];
			
					if (selectedStream) {
						// Embed the selected stream and its chat
						embedStreamAndChat(selectedStream);
					}
				}
			});

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
		//console.log(channelsInfo);
		const fullyMerged = await mergeChannels(userMerged, channelsInfo);
		//console.log(fullyMerged);
		streamFilter(fullyMerged);
	  } catch (error) {
		console.error('An error occurred:', error);
	  }
	}