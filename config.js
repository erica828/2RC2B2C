/* ==========================================================
   SITE SETTINGS  -  edit this file to change texts and options
   ========================================================== */
window.SITE_CONFIG = {
  siteName: "2RC2C2B Leaderboard",
  tagline: "Official times for the 2 Rubik's Cubes · 2 Cigs · 2 Beers speedrun",

  // Where run submissions go.
  // Option A (recommended): create a free form at https://formspree.io and paste
  //   the endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
  //   Submissions then arrive in your email inbox.
  // Option B: leave formEndpoint empty. The form then opens the visitor's
  //   email app with the run details pre-filled, sent to contactEmail.
  formEndpoint: "",
  contactEmail: "you@example.com",

  // The categories (tabs). "id" must match the "category" field in runs.js.
  categories: [
    { id: "2rc2c2b", short: "2RC2C2B", label: "2 Cubes · 2 Cigs · 2 Beers" },
    { id: "1rc1c1b", short: "1RC1C1B", label: "1 Cube · 1 Cig · 1 Beer" }
  ],

  // Rules shown on the page. These are EXAMPLES - replace them with your own.
  rules: [
    "The whole run must be filmed in one continuous, unedited video.",
    "The cubes must be properly scrambled and shown on camera before the timer starts.",
    "Both cubes must be fully solved, all cigarettes smoked and all beers finished before the timer stops.",
    "The video must show the timer or be clearly frame-countable.",
    "Runners must be 18 or older and must include a safety disclaimer in the video."
  ],

  // Shown in the footer and in the submit form.
  safetyNote:
    "18+ only. Drinking alcohol quickly and smoking are dangerous to your health. " +
    "This site records times for entertainment and does not encourage anyone to attempt this challenge."
};
