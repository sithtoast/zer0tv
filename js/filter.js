function isAffiliate(filteredStreams) {
	const userFilteredStreams = filteredStreams.filter((filteredStreams) => filteredStreams.user.broadcaster_type === "affiliate");
	console.log(userFilteredStreams);
}

function totalFollowers(filteredStreams) {
	const userFilteredFollows = filteredStreams.filter((stream) => stream.follower_count < 101);
	console.log(userFilteredFollows);
}