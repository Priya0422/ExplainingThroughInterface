  // Selecting elements
  const msgerForm = document.querySelector(".msger-inputarea");
  const msgerInput = document.querySelector(".msger-input");
  const msgerChat = document.querySelector(".msger-chat");

  const BOT_NAME = "Chatbot";
  const PERSON_NAME = "You";

  const BOT_IMG = "/static/styles/Bot.png";
  const PERSON_IMG = "/static/styles/User.png";

  // Define a variable to store the selected model
  let selectedModel = null;
  let savedResponse = null; 

  // Function to get the selected model
  function getSelectedModel() {
    return selectedModel;
    }   


  document.addEventListener('DOMContentLoaded', function() {
    const crossButton = document.querySelector('.cross-button');
    const monoButton = document.querySelector('.mono-button');
    const chatBubble = document.querySelector('.msg-text');
    const chatMain = document.querySelector('.msger-chat');

    //cross Encoder button
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


        
        setTimeout(function() {
            chatMain.removeChild(loadingBubble);

            // Display the selected model
            const modelBubble = document.createElement('div');
            modelBubble.classList.add('msg', 'right-msg');
            modelBubble.innerHTML = `
                <div class="msg-img" style="background-image: url('/static/styles/User.png');"></div>
                <div class="msg-bubble">
                    <div class="msg-info-name" >You</div> <br>
                    <div class="msg-text" >Cross Encoder</div>
                </div>
            `;
            chatMain.appendChild(modelBubble);

            // Display the "Let's get started" message on the left side
            const startMessage = document.createElement('div');
            startMessage.classList.add('msg', 'left-msg');
            startMessage.innerHTML = `
                <div class="msg-img"></div>
                <div class="msg-bubble">
                    <div class="msg-info-name" >Chatbot</div> <br>
                    <div class="msg-text">
                        selected model trained with MSMarco Passage Ranking dataset. 
                        <br><br>
                        Let's get started!
                    </div>
                </div>
            `;
            chatMain.appendChild(startMessage);
        }, 1500);
    });

    //mono T5 button
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


       
        setTimeout(function() {
            chatMain.removeChild(loadingBubble);

            // Display the selected model
            const modelBubble = document.createElement('div');
            modelBubble.classList.add('msg', 'right-msg');
            modelBubble.innerHTML = `
                <div class="msg-img"></div>
                <div class="msg-bubble">
                    <div class="msg-info-name">You</div> <br>
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
                        <div class="msg-info-name">Chatbot</div>
                    </div>
                    <div class="msg-text">
                        selected model trained with MSMarco Passage Ranking dataset. 
                        <br><br>
                        Let's get started!
                    </div>
                </div>
            `;
            chatMain.appendChild(startMessage);
        }, 1500); 
    });
    
    //Send button
    msgerForm.addEventListener("submit", event => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;
    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
    msgerInput.value = "";

    // Show loading bubble
    showLoadingBubble();

    // Send user message to the bot for response
    botResponse(msgText);
});

function showLoadingBubble() {

    // Create and append the loading bubble on the left side
    const loadingBubble = document.createElement('div');
    loadingBubble.classList.add('msg', 'left-msg', 'loading'); 
    loadingBubble.innerHTML = `
        <div class="msg-img"></div>
        <div class="msg-bubble">
            <div class="msg-text">Loading...</div>
        </div>
    `;
    msgerChat.appendChild(loadingBubble);
}

function hideLoadingBubble() {

    // Remove the loading bubble
    const loadingBubble = document.querySelector('.left-msg.loading');
    if (loadingBubble) {
        loadingBubble.remove();
    }
}

function appendMessage(name, img, side, text) {
    const msgHTML = `
    <div class="msg ${side}-msg">
    <div class="msg-img" style="background-image: url(${img})"></div>
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
    const selectedModel = getSelectedModel(); 

    // Send AJAX request to Flask endpoint for processing
    $.ajax({
        url: "/process", 
        type: "POST",   
        contentType: "application/json",
        data: JSON.stringify({ message: rawText, model: selectedModel }), // Send message and model as JSON
        success: function(response) {
            savedResponse = response;
            
            // Display bot's response in the chat
            appendMessage(BOT_NAME, BOT_IMG, "left", response.top_document);
            appendImage(response.explanation_image_path);
            const rerankedLinksHtml = response.reranked_doc_ids.map((docId, index) => `
            <a href="#" class="document-link" data-doc-id="${docId}" data-rank="${index}" data-response-json="${encodeURIComponent(JSON.stringify(response))}">rank ${index} = ${docId}</a>
            `).join(", ");
            appendMessage(BOT_NAME, BOT_IMG,"left", "If you need an explanation for specific documents, click the document IDs:<br><br>" + rerankedLinksHtml);
            
            hideLoadingBubble();
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

document.addEventListener('click', function(event) {
    const target = event.target;
    // Check if the clicked element is an anchor element with the class 'document-link'
    if (target.tagName === 'A' && target.classList.contains('document-link')) {
        event.preventDefault();
        const docId = target.getAttribute('data-doc-id');
        const rank = target.getAttribute('data-rank');
        const responseJsonStr = target.getAttribute('data-response-json');
        showDocumentExplanation(docId, responseJsonStr, rank);
    }
});

function showDocumentExplanation(docId, responseJsonStr, rank) {
    appendMessage(PERSON_NAME,PERSON_IMG, "right", docId);
    const responseJsonEncoded = decodeURIComponent(responseJsonStr);
    const response = JSON.parse(responseJsonEncoded);
    const requestData = {
              rank: rank,
              doc_id: docId,
              doc_ids: response.doc_ids,
              jsondoc: response.jsondoc,
              rerank_scores: response.rerank_scores,
              reranked_doc_ids: response.reranked_doc_ids,
              query: response.query,
          };
          // Make a POST request to the backend using jQuery
          $.ajax({
              type: "POST",
              url: "/get_explanation", 
              data: JSON.stringify(requestData),
              contentType: "application/json",
              success: function(response) {
                  appendImage(response.explanation_image_path);
                  const rerankedLinksHtml = response.reranked_doc_ids.map((docId, index) => `
                  <a href="#" class="document-link" data-doc-id="${docId}" data-rank="${index}" data-response-json="${encodeURIComponent(JSON.stringify(response))}">rank ${index} = ${docId}</a>
                  `).join(", ");
                appendMessage(BOT_NAME, BOT_IMG , "left", "If you need an explanation for specific documents, click the document IDs:<br>" + rerankedLinksHtml);
              },
              error: function(error) {
                  console.error("Error getting explanation from Flask:", error);
              }
             });
            
    }   

});

