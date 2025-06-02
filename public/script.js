let countdownIntervalId = null; // Variable to store the timer interval ID

const countdownElement = document.getElementById('countdown');
const breakButton = document.getElementById('getBreakBtn');
const breakIdeaParagraph = document.getElementById('breakIdea');

// Add event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (breakButton) {
        breakButton.addEventListener('click', getBreakIdea);
    } else {
        console.error("Error: Could not find button with ID 'getBreakBtn'");
    }

    // Automatically fetch a break idea when page loads
    getBreakIdea();
});

// Function to Start Countdown
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

// Function to Fetch Break Idea from our API
async function getBreakIdea() {
    console.log("Fetching break idea...");

    // Get selected break duration
    let selectedDurationSeconds = 60; // Default
    try {
        const selectedRadio = document.querySelector('input[name="breakDuration"]:checked');
        if (selectedRadio) {
            selectedDurationSeconds = parseInt(selectedRadio.value, 10);
        } else {
            console.warn("No break duration selected, defaulting to 60 seconds.");
        }
    } catch (e) {
        console.error("Error reading break duration", e);
    }

    // Reset UI elements
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }
    if (countdownElement) {
        countdownElement.textContent = "--";
    }
    
    // Check if essential elements exist
    if (!breakIdeaParagraph || !countdownElement) {
        console.error("Error: Could not find required UI elements.");
        if (breakIdeaParagraph) {
            breakIdeaParagraph.textContent = "Error: UI elements missing.";
        }
        return;
    }

    breakIdeaParagraph.textContent = "Thinking of a break idea...";

    try {
        // Call our backend API
        const response = await fetch('/api/gemini');
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch break idea');
        }

        const data = await response.json();
        
        if (data.text) {
            // Parse Markdown if the library is available
            if (typeof marked !== 'undefined') {
                breakIdeaParagraph.innerHTML = marked.parse(data.text);
            } else {
                breakIdeaParagraph.textContent = data.text;
            }

            // Start the countdown timer
            startCountdown(selectedDurationSeconds);
        } else {
            throw new Error('No break idea received from server');
        }

    } catch (error) {
        console.error("Error fetching break idea:", error);
        breakIdeaParagraph.textContent = `Sorry, couldn't get an idea: ${error.message}`;
        if (countdownElement) {
            countdownElement.textContent = "Error";
        }
    }
} 