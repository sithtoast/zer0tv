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

// Function to show the button if the table body is populated
function showButtonIfNeeded() {
  var button = document.getElementById('embedRandomStreamsAndChat');
  if (document.getElementById('search-result-list').getElementsByTagName('tr').length > 0){
	button.style.display = 'block';
  } else {
	button.style.display = 'none';
  }
}

// Check initially if the table body is populated
showButtonIfNeeded();