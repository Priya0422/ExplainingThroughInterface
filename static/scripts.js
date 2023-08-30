  // Selecting elements
  const msgerForm = document.querySelector(".msger-inputarea");
  const msgerInput = document.querySelector(".msger-input");
  const msgerChat = document.querySelector(".msger-chat");

  const BOT_NAME = "chatbot";
  const PERSON_NAME = "You";

    // Define a variable to store the selected model
    let selectedModel = null;

    // Function to get the selected model
    function getSelectedModel() {
    return selectedModel;
    }   


  document.addEventListener('DOMContentLoaded', function() {
    const crossButton = document.querySelector('.cross-button');
    const monoButton = document.querySelector('.mono-button');
    const chatBubble = document.querySelector('.msg-text');
    const chatMain = document.querySelector('.msger-chat');

    crossButton.addEventListener('click', function() {
        selectedModel = "Cross Encoder";
        monoButton.disabled = true;
        crossButton.disabled = true;
        // Show loading bubble
        const loadingBubble = document.createElement('div');
        loadingBubble.classList.add('msg', 'right-msg');
        loadingBubble.innerHTML = `
            <div class="msg-img"></div>
            <div class="msg-bubble">
                <div class="msg-text">Loading...</div>
            </div>
        `;
        chatMain.appendChild(loadingBubble);


        // Simulate a delay before showing the model selection
        setTimeout(function() {
            // Remove the loading bubble
            chatMain.removeChild(loadingBubble);

            // Display the selected model
            const modelBubble = document.createElement('div');
            modelBubble.classList.add('msg', 'right-msg');
            modelBubble.innerHTML = `
                <div class="msg-img"></div>
                <div class="msg-bubble">
                    <div class="msg-text">Cross Encoder</div>
                </div>
            `;
            chatMain.appendChild(modelBubble);

            // Display the "Let's get started" message on the left side
            const startMessage = document.createElement('div');
            startMessage.classList.add('msg', 'left-msg');
            startMessage.innerHTML = `
                <div class="msg-img"></div>
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">chatbot</div>
                    </div>
                    <div class="msg-text">
                    
                        selected model trained with MSMarco Passage Ranking dataset. 
                        <br><br>
                        Let's get started!
                    </div>
                </div>
            `;
            chatMain.appendChild(startMessage);
        }, 1500); // Simulate a delay of 1.5 seconds
    });

    monoButton.addEventListener('click', function() {
        selectedModel = "Mono-T5";
        crossButton.disabled = true;
        monoButton.disabled = true;
        // Show loading bubble
        const loadingBubble = document.createElement('div');
        loadingBubble.classList.add('msg', 'right-msg');
        loadingBubble.innerHTML = `
            <div class="msg-img"></div>
            <div class="msg-bubble">
                <div class="msg-text">Loading...</div>
            </div>
        `;
        chatMain.appendChild(loadingBubble);


        // Simulate a delay before showing the model selection
        setTimeout(function() {
            // Remove the loading bubble
            chatMain.removeChild(loadingBubble);

            // Display the selected model
            const modelBubble = document.createElement('div');
            modelBubble.classList.add('msg', 'right-msg');
            modelBubble.innerHTML = `
                <div class="msg-img"></div>
                <div class="msg-bubble">
                    <div class="msg-text">Mono-T5</div>
                </div>
            `;
            chatMain.appendChild(modelBubble);

            // Display the "Let's get started" message on the left side
            const startMessage = document.createElement('div');
            startMessage.classList.add('msg', 'left-msg');
            startMessage.innerHTML = `
                <div class="msg-img"></div>
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">chatbot</div>
                    </div>
                    <div class="msg-text">
                        selected model trained with MSMarco Passage Ranking dataset. 
                        <br><br>
                        Let's get started!
                    </div>
                </div>
            `;
            chatMain.appendChild(startMessage);
        }, 1500); // Simulate a delay of 1.5 seconds
    });



msgerForm.addEventListener("submit", event => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;
    appendMessage(PERSON_NAME, "right", msgText);
    msgerInput.value = "";

    // Send user message to the bot for response
    botResponse(msgText);
});

function appendMessage(name, side, text) {
    const msgHTML = `
        <div class="msg ${side}-msg">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${name}</div>
                </div>
                <div class="msg-text">${text}</div>
            </div>
        </div>
    `;
    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
}

function botResponse(rawText) {
    // Get the selected model
    const selectedModel = getSelectedModel(); // Replace this with the actual function to get the selected model

    // Send AJAX request to Flask endpoint for processing
    $.ajax({
        url: "/process", // Use the appropriate endpoint URL
        type: "POST",   // Use POST method for sending data
        contentType: "application/json",
        data: JSON.stringify({ message: rawText, model: selectedModel }), // Send message and model as JSON
        success: function(response) {
            // Display bot's response in the chat
            appendMessage(BOT_NAME, "left", response.top_document);
            appendImage(response.explanation_image_path);
            const rerankedLinks = response.reranked_doc_ids.map(docId => {
                return `<a href="#" onclick="getExplanation(${docId})">${docId}</a>`;
            });

            const rerankedLinksHtml = rerankedLinks.join(" , "); // Separate links by line break
            appendMessage(BOT_NAME, "left", "If you need explanation for specific document - click the document Id: <br>" + rerankedLinksHtml);
        },
        error: function(error) {
            console.error("Error sending message to Flask:", error);
        }
    });
}


function appendImage(imagePath) {
    // Create an image element
    var img = document.createElement("img");
    img.src = "/static/images/explanation_image.png" + "?_=" + new Date().getTime(); // Add a changing query parameter
    img.alt = "Explanation Image";

    // Append the image element to the chat
    var chatContainer = document.querySelector(".msger-chat");
    var imageDiv = document.createElement("div");
    imageDiv.classList.add("msg", "left-msg");
    imageDiv.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-text">
          <img src="${img.src}" alt="Explanation Image" style="max-width: 100%;" />
        </div>
      </div>
    `;

    chatContainer.appendChild(imageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

   

});

