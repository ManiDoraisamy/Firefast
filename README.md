# Firefast

Firefast is a Firebase SDK for Apps Script V8 Runtime. You can use it to read and write data in Firebase using apps script.
Firebase Realtime Database is a cloud-hosted NoSQL database. Data is stored as JSON and can be accessed in your Web, iOS, Android app using Google's Firebase SDK. But, Google doesn't provide such SDK for Apps Script. This library solves that problem. It gives you Firebase SDK for Apps Script.

Recently, Google announced that Apps Script will support V8 runtime. This lets apps script developers to take advantage of modern JavaScript features such as Promise. Firefast leverages these features to achieve 2 goals:

1. Easy
Romain Vialard's Firebase library does an excellent job of simplifying the REST API and providing an apps script wrapper on top it. But, it doesn't follow the same API as Google. Firefast makes the API similar to the official Google Node.js SDK, so that it is easy to use.

2. Fast
The older version of Apps Script is based on Rhino engine. It executes the code synchronously. Firefast uses the new V8 engine's promise to improve performance. Even this promise is synchronous. But, we use it as syntactic sugar to make batch url calls (using Romain's FirebaseApp) to improve performance.



Documentation: https://formfacade.com/firefast/docs.html
