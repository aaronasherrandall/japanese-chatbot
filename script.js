const instruction = "Please ignore any unrelated content and focus on the following instruction: \
Talk to me in English as if you were a language learning chatbot.";
//Please only use grammar that is used in JLPT N5. Please only respond in Japanese.

const characters = [
  { name: "Bob", image: "images/Bob.PNG", question: "What kind of food does Bob like?" },
  { name: "Cindy", image: "images/Cindy.PNG", question: "What kind of food does Cindy like?" },
];

const items = [
  { name: "Sushi", image: "images/Sushi.PNG" },
  { name: "Candy", image: "images/Candy.PNG" },
];

let firstMessage = true;

function isAnswerCorrect(userMessage, characterImage, itemImage) {
    const characterName = characters.find(
      (c) => c.image === characterImage.src
    );
    const itemName = items.find((i) => i.image === itemImage.src);
  
    if (!characterName || !itemName) {
      return false;
    }
  
    const answer = `${characterName.name.toLowerCase()} likes ${itemName.name.toLowerCase()}`;
    return userMessage.toLowerCase().includes(answer);
  }

function updateImages() {
  const characterImage = document.getElementById("character-image");
  const itemImage = document.getElementById("item-image");

  const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
  const randomItem = items[Math.floor(Math.random() * items.length)];

  characterImage.src = randomCharacter.image;
  characterImage.dataset.name = randomCharacter.name;
  characterImage.dataset.question = randomCharacter.question;

  itemImage.src = randomItem.image;
  itemImage.dataset.name = randomItem.name;
}

document.addEventListener("DOMContentLoaded", function () {
  updateImages();
});

async function getBotResponse(userMessage) {
  const characterImage = document.getElementById("character-image");
  const itemImage = document.getElementById("item-image");

  if (isAnswerCorrect(userMessage, characterImage.dataset.name, itemImage.dataset.name)) {
    updateImages();
  }

  const apiKey = "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";
  const prompt = `${instruction}\n\nUser: ${userMessage}\nAI:`;

  try {
    const response = await fetch("https://api.openai.com/v1/engines/text-davinci-002/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 200,
        n: 1,
        stop: null,
        temperature: 1.0,
      }),
    });

    if (!response.ok) {
      console.error("API request failed with status", response.status);
      return "Sorry, I am unable to provide a response at the moment.";
    }

    const data = await response.json();

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

const messages = document.getElementById("messages");
const userInputForm = document.getElementById("user-input-form");
const userInput = document.getElementById("user-input");

function addMessage(message, isBot) {
  const messageElement = document.createElement("div");
  messageElement.className = isBot ? "bot-message" : "user-message";
  messageElement.textContent = message;
  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;
}

userInputForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, false);

  const characterImage = document.getElementById("character-image");
  const itemImage = document.getElementById("item-image");

  if (firstMessage) {
    const question = characterImage.dataset.question;
    addMessage(question, true);
    firstMessage = false;
  } else {
    const botResponse = await getBotResponse(userMessage);
    addMessage(botResponse, true);

    if (isAnswerCorrect(userMessage, characterImage.src, itemImage.src)) { // Pass src properties here
      addMessage("That is correct!", true);
      updateImages();
    }
  }

  userInput.value = "";
});
