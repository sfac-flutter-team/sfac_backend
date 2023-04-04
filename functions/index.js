const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const fetch = require("node-fetch");

// 전체 팀 순위를 firebase에 저장
exports.readStandings = onSchedule("every day 00:00", async (event) => {
      await fetch("https://v3.football.api-sports.io/standings?league=39&season=2022", {
        "method": "GET",
        "headers": {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_KEY,
        },
      })
          .then(async (response) => {
            const data = await response.json();
            const standings = data.response[0].league.standings[0];
            standings.forEach((value) => {
              admin.firestore()
                  .collection("standings")
                  .doc(value.rank.toString())
                  .set(value);
            });
          })
          .catch((err) => console.log(err));
});

// 전체 팀 정보를 읽어 firestore에 저장
exports.readTeams = onSchedule("every day 00:00", async (event) => {
  await fetch("https://v3.football.api-sports.io/teams?league=39&season=2022", {
        "method": "GET",
        "headers": {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_KEY,
        },
      })
          .then(async (response) => {
            const data = await response.json();
            const teams = data.response;
            teams.forEach((value) => {
              admin.firestore()
                  .collection("teams")
                  .doc(value.team.code)
                  .set(value);
            });
          })
          .catch((err) => console.log(err));
});

// 선수 득점 순위 가져와 파이어베이스에 저장
exports.readPlayers = onSchedule("every day 00:00", async (event) => {
      await fetch("https://v3.football.api-sports.io/players/topscorers?league=39&season=2022", {
        "method": "GET",
        "headers": {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_KEY,
        },
      })
          .then(async (response) => {
            const data = await response.json();
            const players = data.response;
            admin.firestore()
                .collection("players")
                .doc("topscorers")
                .set({topscorers: players});
          })
          .catch((err) => console.log(err));
});

// deploy 테스트 예시
// exports.readPlayers = functions.pubsub.schedule("every 1 minutes")
//     .onRun(async (context) => {
//       await fetch("https://v3.football.api-sports.io/players/topscorers?league=39&season=2022", {
//         "method": "GET",
//         "headers": {
//           "x-rapidapi-host": "v3.football.api-sports.io",
//           "x-rapidapi-key": process.env.API_KEY,
//         },
//       })
//           .then(async (response) => {
//             const data = await response.json();
//             const players = data.response;
//             admin.firestore()
//                 .collection("players")
//                 .doc("topscorers")
//                 .set({topscorers: players});
//           })
//           .catch((err) => console.log(err));
//     });

// 웹 테스트 예시
// exports.readStandings = functions.https.onRequest(async (req, res) => {
//       await fetch("https://v3.football.api-sports.io/standings?league=39&season=2022", {
//         "method": "GET",
//         "headers": {
//           "x-rapidapi-host": "v3.football.api-sports.io",
//           "x-rapidapi-key": process.env.API_KEY,
//         },
//       })
//           .then(async (response) => {
//             const data = await response.json();
//             res.send(data.response[0].league.standings[0]);
//           })
//           .catch((err) => console.log(err));
//     });

