/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

exports.simulateMatch = functions.https.onCall(async (data, context) => {
  const { teamA, teamB } = data;

  if (!teamA || !teamB) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Both teamA and teamB must be provided."
    );
  }

  const apiKey = functions.config().openai.key;
  const prompt = `Simulate a fun and dramatic football match between these two teams:\n\nTeam A: ${teamA.join(", ")}\nTeam B: ${teamB.join(", ")}\n\nInclude key moments and the final score.`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const matchSummary = response.data.choices[0].message.content;
    return { result: matchSummary };
  } catch (error) {
    console.error("OpenAI Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate match summary"
    );
  }
});

const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
