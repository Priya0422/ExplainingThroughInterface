
    // Selecting elements
    const msgerForm = document.querySelector(".msger-inputarea");
    const msgerInput = document.querySelector(".msger-input");
    const msgerChat = document.querySelector(".msger-chat");

    const BOT_NAME = "chatbot";
    const PERSON_NAME = "You";

    msgerForm.addEventListener("submit", event => {
      event.preventDefault();

      const msgText = msgerInput.value;
      if (!msgText) return;
      appendMessage(PERSON_NAME, "right", msgText);
      msgerInput.value = "";
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
  `     ;
    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
    }


    function botResponse(rawText) {
    // Send AJAX request to Flask endpoint for processing
    $.ajax({
        url: "/process",
        type: "GET",  
        contentType: "application/json",
        data: { message: rawText }, 
        success: function(response) {
            // Display bot's response in the chat
            appendMessage(BOT_NAME, "left", response.top_document);
            const rerankedLinks = response.reranked_doc_ids.map(docId => {
                return `<a href="#">${docId}</a>`;
            });
            appendMessage(BOT_NAME, "left", "Reranked Document IDs: " + rerankedLinks.join(", "));
            appendImage(response.explanation_image_path);
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

