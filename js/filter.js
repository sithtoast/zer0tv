function isAffiliate(filteredStreams) {
	const userFilteredStreams = filteredStreams.filter((filteredStreams) => filteredStreams.user.broadcaster_type === "affiliate");
	console.log(userFilteredStreams);
}

function totalFollowers(filteredStreams) {
	const userFilteredStreams = filteredStreams.filter((filteredStreams) => filteredStreams.follower_count < 101);
	console.log(userFilteredStreams);
}