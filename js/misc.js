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

function reallyLongTimeAgo(created_at) {
	const createdDate = new Date(created_at);
	const currentTime = new Date();
	const timeDifference = currentTime - createdDate;
	
	const minutes = Math.floor(timeDifference / (1000 * 60));
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const years = Math.floor(days / 365.25);
	
	if (years > 0) {
		return `${years} ${years === 1 ? 'year' : 'years'} ago`;
	} else {
		return `${days} ${days === 1 ? 'day' : 'days'} ago`;
	}
	if (hours > 0) {
		return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
	} else {
		return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
	}
}

function showTopIfNeeded() {
	var topFifty = document.getElementById('categories');
	if (document.getElementById('category-list').getElementsByTagName('span').length > 0){
		topFifty.style.display = 'block';
	} else {
		topFifty.style.display = 'none';
	}
}

showTopIfNeeded();

function showSearchIfNeeded() {
	var search = document.getElementById('category-search-results');
	if (document.getElementById('category-search-result-list').getElementsByTagName('span').length > 0){
		search.style.display = 'block';
	} else {
		search.style.display = 'none';
	}
}

showSearchIfNeeded();

function showTableifNeeded() {
	var table = document.getElementById('theTable');
	if (document.getElementById('search-result-list').getElementsByTagName('tr').length > 0){
		table.style.display = 'block';
	} else {
		table.style.display = 'none';
	}
}

showTableifNeeded();
