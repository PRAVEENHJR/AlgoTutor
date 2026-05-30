import { GoogleGenAI } from "https://cdn.jsdelivr.net/npm/@google/genai@1.32.0/+esm";

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const sidebar = document.getElementById('sidebar');
const openSidebar = document.getElementById('openSidebar');
const closeSidebar = document.getElementById('closeSidebar');
const chips = document.querySelectorAll('.chip');
const clearChat = document.getElementById('clearChat');

// Initialize Gemini (Model version updated to 1.5-flash for stability)
const ai = new GoogleGenAI({
    apiKey: "AQ.Ab8RN6ILWdRl0QmAr1QUPPBgJhiB2ydGhS0Bs4Oh0fkAobQsDw" 
});

const chat = ai.chats.create({
    model: "gemini-2.5-flash", 
    config: {
        systemInstruction: `You are AlgoTutor, a first-principles DSA tutor. 
        1. Only answer coding/DSA questions.
        2. If a user asks a non-coding question.
        3. Break down problems into: Core Logic -> Algorithm -> Complexity -> Code.
        4. Use 'First Principles' to explain WHY a data structure is used.
        - give responses in visual and first dot principle with examples unless user ask only in shortRR
        -reply rudely to user if they ask que which is not related to coding,
        Ex:You Dumb or whatever like it, ask question only related to coding,dont generate same output`
    }
});

// Toggle Sidebar
openSidebar.onclick = () => sidebar.classList.add('active');
closeSidebar.onclick = () => sidebar.classList.remove('active');

// Suggestion Chips logic
chips.forEach(chip => {
    chip.onclick = () => {
        userInput.value = chip.textContent;
        handleSend();
    };
});

// Clear Chat logic
clearChat.onclick = () => {
    chatMessages.innerHTML = '';
    addMessage("Chat history cleared. How can I help?", 'assistant');
};

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(text);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessage(text) {
    // Better code block formatting
    text = text.replace(/```(\w+)?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    return text.replace(/\n/g, '<br>');
}

async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    userInput.value = '';
    userInput.style.height = 'auto';
    addMessage(message, 'user');
    
    // Show typing
    const typing = document.createElement('div');
    typing.className = 'message assistant';
    typing.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    typing.id = 'temp-typing';
    chatMessages.appendChild(typing);
 
    try {
        const response = await chat.sendMessage({ message: message });
        document.getElementById('temp-typing').remove();
        addMessage(response.text, 'assistant');
    }
    catch (error) {
    const typing = document.getElementById('temp-typing');
    if (typing) typing.remove();

    let msg = "Something went wrong. Please try again.";

    if (error.message.includes("quota")) {
        msg = "⚠️ Gemini API quota exceeded. Please try again later.";
    }

    addMessage(msg, 'assistant');
    console.error(error);
}
    //  catch (error) {
    //     document.getElementById('temp-typing').remove();
    //     addMessage("Error: " + error.message, 'assistant');
    // }
}


sendBtn.onclick = handleSend;
// userInput.onkeypress = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});
