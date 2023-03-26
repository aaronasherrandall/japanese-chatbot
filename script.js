const messages = document.getElementById("messages");
const userInputForm = document.getElementById("user-input-form");
const userInput = document.getElementById("user-input");

const instruction = "Please ignore any unrelated content and focus on the following instruction: \
Talk to me in Japanese as if you were a language learning chatbot. Do not translate what I say into Japanese. \
Please only use grammar that is used in JLPT N5. Please only respond in Japanese.";


const instruction2 = "When responding to my questions or statements, please act enthusiastic and excited. Continue asking me one simple question at a time related to the following topics: \
1. Where do you live? \
2. What is your favorite kind of food? \
3. Where do you want to travel to?";
// Please only use grammar that is used in JLPT N5. \
// Whenever I use any grammar, vocabulary or anything from the JLPT curriculum, 
// please point it out to me in English. Keep everything else in Japanese.

function addMessage(message, isBot) {
  const messageElement = document.createElement("div");
  messageElement.className = isBot ? "bot-message" : "user-message";
  messageElement.textContent = message;
  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;
}

// Add a counter to track the number of messages
let messageCounter = 0;

// Add a flag to track if it's the first message
let firstMessage = true;

async function getBotResponse(userMessage) {
    const apiKey = "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";
    
    if (firstMessage) {
      fullPrompt = `${instruction}\n\n${userMessage}\n`;
    } else {
      messageCounter++;
      fullPrompt = messageCounter % 2 === 0 ? `${instruction2}\n\n${userMessage}\n` : `${userMessage}\n`;
    }
  
    // Set firstMessage to false after sending the instruction
    firstMessage = false;

  
    try {
      const response = await fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          max_tokens: 200,
          n: 1,
          stop: null,
          temperature: .5,
        }),
      });
  
      if (!response.ok) {
        console.error("API request failed with status", response.status);
        return "Sorry, I am unable to provide a response at the moment.";
      }
  
      const data = await response.json();
      console.log(data);
      
      if (!data.choices || data.choices.length === 0) {
        console.error("Unexpected API response:", data);
        return "Sorry, I am unable to provide a response at the moment.";
      }
  
      return data.choices[0].text.trim();
    } catch (error) {
      console.error("Error fetching API response:", error);
      return "Sorry, I am unable to provide a response at the moment.";
    }
  }
   

userInputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInput.value.trim();

  if (userMessage === "") return;

  addMessage(userMessage, false);

  const botResponse = await getBotResponse(userMessage);
  addMessage(botResponse, true);
  userInput.value = "";
});
