let userNames = ["winnifred", "lorene", "cyril", "vella", "erich", "pedro", "madaline", "leoma", "merrill",  "jacquie"];
let users = [];

userNames.forEach(name =>{
	let u = {};
	u.username = name;
	u.password = name;
	u.privacy = false;
	users.push(u);
});

const mongoose = require("mongoose");
const User = require("./models/userModel");

// let mongo = require('mongodb');
// let MongoClient = mongo.MongoClient;
// let db;

mongoose.connect("mongodb://localhost/a4", {useNewUrlParser: true, useUnifiedTopology: true}); 
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
	// Delete the previous database
	db.dropDatabase((err) => {
	  if (err) {
		console.log("Could not drop database.");
		throw err;
	  }
	  console.log("Database cleared successfully. Re-creating data...");
	  User.init((err) => {
		  if(err) throw err;
		  User.insertMany(users, (err) =>{
			  if(err){
				  console.log('Could not drop database.');
				  throw err;
			  }
			  console.log(`${users.length} users added.`);
			  db.close();
		  });
	  });	
	});
});

// MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
//   if(err) throw err;	

//   db = client.db('a4');
  
//   db.listCollections().toArray(function(err, result){
// 	 if(result.length == 0){
// 		 db.collection("users").insertMany(users, function(err, result){
// 			if(err){
// 				throw err;
// 			}
			
// 			console.log(result.insertedCount + " users successfully added (should be 10).");
// 			client.close();
// 		});
// 		return;
// 	 }
	 
// 	 let numDropped = 0;
// 	 let toDrop = result.length;
// 	 result.forEach(collection => {
// 		db.collection(collection.name).drop(function(err, delOK){
// 			if(err){
// 				throw err;
// 			}
			
// 			console.log("Dropped collection: " + collection.name);
// 			numDropped++;
			
// 			if(numDropped == toDrop){
// 				db.collection("users").insertMany(users, function(err, result){
// 					if(err){
// 						throw err;
// 					}
					
// 					console.log(result.insertedCount + " users successfully added (should be 10).");
// 					client.close();
// 				});
// 			}
// 		});		
// 	 });
//   });
// });