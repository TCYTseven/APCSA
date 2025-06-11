ok, now the frontend for the website is complete. setup the supabase MCP to support:

- 1) user auth with email (dont worry about sign in with google or apple for now)

- 2) making all the tables neccesery for this app. there should be a profiles tables which takes info from auth, and also takes into account gender, height, weight from onboarding, as well as desired physqiue.

- 3) there should be a new table for the calandar/supabase storage buckets -- il let you handle image uploads and how they work.


Prompt for Ranking:
You are an expert fitness evaluator. Based on the provided image and the following user data:

Height: 68 inches

Weight: 165 pounds

Gender: male

Desired Physique: bodybuilder

Previous Scores: { "Deltoids": 72, "Biceps": 66, "Triceps": 64, "Chest": 78, "Forearm": 60, "Abs": 70, "Upper back": 68, "Obliques": 62, "Quadriceps": 75, "Hamstring": 67, "Calves": 58, "Gluteal": 63 }

Please analyze the image and assess the user’s current physique relative to a realistic, naturally attainable version of a "bodybuilder" body type. Be generous in your scoring, rounding up where applicable. The evaluation is not based on a professional Olympian standard, but on natural fitness expectations.

Return the results strictly in this JSON format:
{
"identified parts": ["Chest", "Deltoids", "Biceps", "Triceps", "Abs", "Quadriceps"],
"scores": {
"Chest": 84,
"Deltoids": 78,
"Biceps": 75,
"Triceps": 71,
"Abs": 69,
"Quadriceps": 81
}
}

Do not include any extra explanation, comments, or formatting—only return the valid JSON object shown above.