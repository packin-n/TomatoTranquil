// --- fill in your specific gemini API 
const API_KEY = 'YOUR API KEY'; 

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

let countdownIntervalId = null; // Variable to store the timer interval ID

const countdownElement = document.getElementById('countdown');
const breakButton = document.getElementById('getBreakBtn');
const breakIdeaParagraph = document.getElementById('breakIdea');



if (breakButton) {
    breakButton.addEventListener('click', getBreakIdea);
} else {
    console.error("Error: Could not find button with ID 'getBreakBtn'");
}

// --- Function to Start Countdown ---
function startCountdown(durationInSeconds) {
    if (typeof durationInSeconds !== 'number' || durationInSeconds <= 0) {
        console.error("Invalid duration passed to startCountdown:", durationInSeconds);
         if (countdownElement) countdownElement.textContent = "Error";
        return;
    }

    // Clear any existing interval first
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
    }

    let timeLeft = durationInSeconds;
    if (countdownElement) {
         countdownElement.textContent = timeLeft; // Show initial time
    } else {
        console.error("Countdown element not found");
        return;
    }

    countdownIntervalId = setInterval(() => {
        timeLeft--;
        if (countdownElement) {
             countdownElement.textContent = timeLeft;
        }

        if (timeLeft <= 0) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
             if (countdownElement) {
                countdownElement.textContent = "Up!"; // Indicate time's up
             }
        }
    }, 1000); // Run every 1000ms (1 second)
}


// --- Function to Fetch Text Idea ---
async function getBreakIdea() {
    console.log("Button clicked!");

    // --- Get selected break duration ---
    let selectedDurationSeconds = 60; // Default
    try {
        const selectedRadio = document.querySelector('input[name="breakDuration"]:checked');
        if (selectedRadio) {
            selectedDurationSeconds = parseInt(selectedRadio.value, 10);
        } else {
            console.warn("No break duration selected, defaulting.");
        }
    } catch (e) {
        console.error("Error reading break duration", e);
    }
    console.log("Selected break duration (seconds):", selectedDurationSeconds);

    // --- Reset UI elements ---
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId); // Clear previous timer
        countdownIntervalId = null;
    }
    if (countdownElement) {
        countdownElement.textContent = "--"; // Reset timer display
    }
    
    // Check if essential elements exist
    if (!breakIdeaParagraph || !countdownElement) {
        console.error("Error: Could not find required text or countdown elements.");
        
         if(breakIdeaParagraph) breakIdeaParagraph.textContent = "Error: UI elements missing.";
        return;
     }

    breakIdeaParagraph.textContent = "Thinking of a break idea...";

    // --- Define Text Prompt ---
    const textPrompt = "Generate a very short (1-2 sentence) description of a simple mindfulness activity or physical stretch suitable for a student taking a quick study break at their desk. Make it actionable and under 1 minute.";

    // --- Define Request Body for Text Generation ---
    const textRequestBody = {
        "contents": [{"parts": [{"text": textPrompt }]}]
    };

    let generatedText = "Error fetching break description."; // Default error text

    try {
         // --- Fetch the Text Idea ---
         const response = await fetch(API_URL, { // Use the main API_URL defined at the top
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(textRequestBody)
         });

         console.log("Text API Response Status:", response.status);

         if (!response.ok) {
             // Try to get specific error from API response
             let errorData = {};
              try { errorData = await response.json(); } catch (e) {}
             console.error("Text API Error Response Body:", errorData);
             throw new Error(`Text API failed: ${response.status} - ${errorData?.error?.message || 'Check Logs'}`);
         }

         const data = await response.json();
         console.log("Text API Response Data:", data); 

         
         if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
             generatedText = data.candidates[0].content.parts[0].text.trim();

             // ---  Parse Markdown and set as HTML ---
             if (typeof marked !== 'undefined') { // Check if the library loaded
                 breakIdeaParagraph.innerHTML = marked.parse(generatedText); // Use marked library
                 console.log("Displayed Idea (parsed as Markdown):", generatedText);
             } else {
                 console.error("Marked library not loaded. Displaying raw text.");
                 breakIdeaParagraph.textContent = generatedText; // Fallback to raw text if marked fails
             }
             

             // --- SUCCESSFUL Text Fetch: Now start timer ---
             startCountdown(selectedDurationSeconds); // Use SELECTED duration

         } else {
             console.error("Error: Unexpected text response structure:", data);
             breakIdeaParagraph.textContent = "Error: Could not parse API response."; // Show specific error
             if (countdownElement) countdownElement.textContent = "Error";
         }

    } catch (error) {
         // Handle fetch errors or errors thrown from response checking
         console.error("Error during Text API call or processing:", error);
         breakIdeaParagraph.textContent = `Sorry, couldn't get an idea: ${error.message}`; // Display the error message
         if (countdownElement) countdownElement.textContent = "Error";
         
    }
}

