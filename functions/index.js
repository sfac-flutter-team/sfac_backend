const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const fetch = require("node-fetch");

// 함수를 deploy 할 때는 "x-rapidapi-key"에 직접 값을 넣어야 함
// 전체 팀 순위를 firebase에 저장
exports.readStandings = functions.pubsub.schedule("0 18 * * *")
    .onRun(async (context) => {
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
                  .set(value, {merge: true});
            });
          })
          .catch((err) => console.log(err));
    });

// 전체 팀 정보를 읽어 firestore에 저장
exports.readTeams = functions.pubsub.schedule("0 18 * * *")
    .onRun(async (context) => {
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
                  .doc(value.team.id.toString())
                  .set(value, {merge: true});
            });
          })
          .catch((err) => console.log(err));
    });

// 선수 득점 순위 가져와 파이어베이스에 저장
exports.readPlayers = functions.pubsub.schedule("0 18 * * *")
    .onRun(async (context) => {
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
                .set({topscorers: players}, {merge: true});
          })
          .catch((err) => console.log(err));
    });

// 전체 일정과 결과를 가져와 파이어베이스에 저장
exports.readFixtures = functions.pubsub.schedule("0 18 * * *")
    .onRun(async (context) => {
      await fetch("https://v3.football.api-sports.io/fixtures?league=39&season=2022", {
        "method": "GET",
        "headers": {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_KEY,
        },
      })
          .then(async (response) => {
            const data = await response.json();
            const fixtures = data.response.map((e) => ({
              id: e.fixture.id,
              date: e.fixture.date,
              status: e.fixture.status.long,
              home: e.teams.home,
              away: e.teams.away,
              homeGoals: e.goals.home,
              awayGoals: e.goals.away,
            }),
            );
            admin.firestore()
                .collection("fixtures")
                .doc("2022")
                .set({fixtures: fixtures}, {merge: true});
          })
          .catch((err) => console.log(err));
    });

// deploy 테스트 예시
// exports.getTeams = functions.pubsub.schedule("every 1 minutes")
//     .onRun(async (context) => {
//       await fetch("https://v3.football.api-sports.io/fixtures?league=39&season=2022", {
//         "method": "GET",
//         "headers": {
//           "x-rapidapi-host": "v3.football.api-sports.io",
//           "x-rapidapi-key": process.env.API_KEY,
//         },
//       })
//           .then(async (response) => {
//             const data = await response.json();
//             const fixtures = data.response.map((e) => ({
//               id: e.fixture.id,
//               date: e.fixture.date,
//               status: e.fixture.status.long,
//               home: e.teams.home,
//               away: e.teams.away,
//               homeGoals: e.goals.home,
//               awayGoals: e.goals.away,
//             }),
//             );
//             admin.firestore()
//                 .collection("fixtures")
//                 .doc("2022")
//                 .set({fixtures: fixtures}, {merge: true});
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
