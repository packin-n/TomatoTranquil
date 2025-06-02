let countdownIntervalId = null;
let totalDuration = 0;
let isStudySession = false;

// DOM Elements
const studyCountdownElement = document.getElementById('studyCountdown');
const countdownElement = document.getElementById('countdown');
const breakButton = document.getElementById('getBreakBtn');
const breakIdeaParagraph = document.getElementById('breakIdea');
const progressBarFill = document.querySelector('.progress-bar-fill');
const timerEndSound = document.getElementById('timerEndSound');
const breakCountElement = document.getElementById('breakCount');
const startStudyBtn = document.getElementById('startStudyBtn');
const studyMinutesInput = document.getElementById('studyMinutes');
const breakSection = document.querySelector('.break-section');
const timeAdjustBtns = document.querySelectorAll('.time-adjust-btn');

// Initialize break count from localStorage
let breakCount = parseInt(localStorage.getItem('breakCount') || '0');
updateBreakCount();

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (breakButton) {
        breakButton.addEventListener('click', getBreakIdea);
    }
    
    if (startStudyBtn) {
        startStudyBtn.addEventListener('click', toggleStudyTimer);
    }

    // Time adjustment buttons
    timeAdjustBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const adjustment = parseInt(btn.dataset.adjust);
            let currentValue = parseInt(studyMinutesInput.value);
            currentValue += adjustment;
            
            // Ensure value stays within bounds
            currentValue = Math.min(Math.max(currentValue, 1), 60);
            studyMinutesInput.value = currentValue;
            updateStudyTimerDisplay(currentValue * 60);
        });
    });

    // Manual input handling
    studyMinutesInput.addEventListener('change', () => {
        let value = parseInt(studyMinutesInput.value);
        value = Math.min(Math.max(value, 1), 60);
        studyMinutesInput.value = value;
        updateStudyTimerDisplay(value * 60);
    });

    // Check for notification permission
    if ("Notification" in window && Notification.permission === "default") {
        setTimeout(() => {
            Notification.requestPermission();
        }, 3000);
    }
});

// Function to update break count
function updateBreakCount() {
    if (breakCountElement) {
        breakCountElement.textContent = breakCount;
        localStorage.setItem('breakCount', breakCount.toString());
    }
}

// Function to show notification
function showNotification(message) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("TomatoTranquil", {
            body: message,
            icon: "/favicon.ico"
        });
    }

    if (timerEndSound) {
        timerEndSound.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Function to update study timer display
function updateStudyTimerDisplay(seconds) {
    if (studyCountdownElement) {
        studyCountdownElement.textContent = formatTime(seconds);
    }
}

// Function to toggle study timer
function toggleStudyTimer() {
    if (countdownIntervalId) {
        // Stop timer
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
        startStudyBtn.textContent = 'Start Study Session';
        studyMinutesInput.disabled = false;
        timeAdjustBtns.forEach(btn => btn.disabled = false);
        progressBarFill.style.width = '0%';
        isStudySession = false;
    } else {
        // Start timer
        const minutes = parseInt(studyMinutesInput.value);
        startCountdown(minutes * 60, true);
        startStudyBtn.textContent = 'Stop Timer';
        studyMinutesInput.disabled = true;
        timeAdjustBtns.forEach(btn => btn.disabled = true);
        isStudySession = true;
    }
}

// Function to Start Countdown
function startCountdown(durationInSeconds, isStudy = false) {
    if (typeof durationInSeconds !== 'number' || durationInSeconds <= 0) {
        console.error("Invalid duration passed to startCountdown:", durationInSeconds);
        return;
    }

    // Clear any existing interval first
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
    }

    totalDuration = durationInSeconds;
    let timeLeft = durationInSeconds;

    // Update initial display
    const displayElement = isStudy ? studyCountdownElement : countdownElement;
    if (displayElement) {
        displayElement.textContent = formatTime(timeLeft);
    }
    if (progressBarFill) {
        progressBarFill.style.width = '100%';
    }

    countdownIntervalId = setInterval(() => {
        timeLeft--;
        
        // Update timer display
        if (displayElement) {
            displayElement.textContent = formatTime(timeLeft);
        }

        // Update progress bar
        if (progressBarFill) {
            const percentage = (timeLeft / totalDuration) * 100;
            progressBarFill.style.width = `${percentage}%`;
        }

        if (timeLeft <= 0) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
            
            if (isStudy) {
                // Study session completed
                showNotification("Study session complete! Time for a mindful break.");
                startStudyBtn.textContent = 'Start Study Session';
                studyMinutesInput.disabled = false;
                timeAdjustBtns.forEach(btn => btn.disabled = false);
                breakSection.style.display = 'block';
                breakCount++;
                updateBreakCount();
            } else {
                // Break completed
                showNotification("Break time is over! Ready for another study session?");
                displayElement.textContent = "Time's up!";
            }
            
            if (progressBarFill) {
                progressBarFill.style.width = '0%';
            }
        }
    }, 1000);
}

// Function to Fetch Break Idea
async function getBreakIdea() {
    console.log("Fetching break idea...");

    let selectedDurationSeconds = 60;
    try {
        const selectedRadio = document.querySelector('input[name="breakDuration"]:checked');
        if (selectedRadio) {
            selectedDurationSeconds = parseInt(selectedRadio.value, 10);
        }
    } catch (e) {
        console.error("Error reading break duration", e);
    }

    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }
    
    if (countdownElement) {
        countdownElement.textContent = "--:--";
    }
    if (progressBarFill) {
        progressBarFill.style.width = '0%';
    }

    breakIdeaParagraph.textContent = "Thinking of a mindful break idea...";

    try {
        const response = await fetch('/api/gemini');
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch break idea');
        }

        const data = await response.json();
        
        if (data.text) {
            if (typeof marked !== 'undefined') {
                breakIdeaParagraph.innerHTML = marked.parse(data.text);
            } else {
                breakIdeaParagraph.textContent = data.text;
            }
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