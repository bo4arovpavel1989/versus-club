
Userschema.find({}, function (err, person) {
	console.log(1);
  console.log(person); // Space Ghost is a talk show host.
});

Userschema.update({login: '@mongo7'}, {$inc: {activity: 1}});

Userschema.update({login: '@mongo7'}, {$set: {session: 1123}});

Userschema.findOne({login: '@mongo7'}, 'session isBanned', function (err, rep) {
		console.log(rep);
		console.log(rep.session);
		console.log(rep.isBanned);
		console.log(rep['isBanned']);
		console.log('answer');
		console.log(rep['isBanned'] === false);
	});
