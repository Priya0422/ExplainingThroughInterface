from flask import request, jsonify, Flask, render_template, send_file
from pyserini.search import SimpleSearcher
from beir.reranking.models import CrossEncoder
import json
import numpy as np
from exs import ExplainableSearch  
import matplotlib.pyplot as plt
import os
import time

app = Flask(__name__)
# app.static_folder = 'static'
app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')



# Initialize the searcher and reranker
searcher = SimpleSearcher.from_prebuilt_index('msmarco-passage')
model = 'cross-encoder/ms-marco-electra-base'
reranker = CrossEncoder(model)

def visualize(vocabs:np.array, coef: np.array, show_top: int=10, save_path: str = ''):
        if len(coef.shape) > 1:  
            coef = np.squeeze(coef)
        sorted_coef = np.sort(coef)
        sorted_idx = np.argsort(coef)
        pos_y = sorted_coef[-show_top:]
        neg_y = sorted_coef[:show_top]
        pos_idx = sorted_idx[-show_top:]
        neg_idx = sorted_idx[:show_top]

        words = np.append(vocabs[pos_idx], vocabs[neg_idx])
        y = np.append(pos_y, neg_y)
        fig, ax = plt.subplots(figsize=(8, 10))
        colors = ['green' if val >0 else 'red' for val in y]
        pos = np.arange(len(y)) + .5
        ax.barh(pos, y, align='center', color=colors)
        ax.set_yticks(np.arange(len(y)))
        ax.set_yticklabels(words, fontsize=18)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.spines['left'].set_visible(False)
        ax.set_xticks([])
        # fig.savefig('exs.jpg')
        # fig.show()
        # image_path = 'explanation_image.png'
        # plt.savefig(image_path, bbox_inches='tight', pad_inches=0)
        # plt.close()
        # # print(image_path)
        # return image_path/
        image_filename = 'explanation_image.png'
        image_path = os.path.join(save_path, image_filename) if save_path else image_filename
        plt.savefig(image_path, bbox_inches='tight', pad_inches=0)
        plt.close()
        return image_path

def generate_response_cross(user_message):
    query = user_message
    hits = searcher.search(user_message)
    
    sentence_pairs = []
    for i in range(0, 10):
        jsondoc = json.loads(hits[i].raw)
        sentence_pairs.append([query, jsondoc["contents"]])
        rerank_scores = reranker.predict(sentence_pairs, batch_size=10)
    
    r = 0 
    doc_ids = np.array([hits[i].docid for i in range(10)])
    docids_reranked = doc_ids[np.argsort(rerank_scores)[::-1]]
    doc_id = docids_reranked[0]  # Selecting the top-ranked document
    json_data_list = np.array([json.loads(hits[i].raw) for i in range(10)])
    doc_exp = ''
    for jsondoc in json_data_list:
        if 'id' in jsondoc and jsondoc['id'] == doc_id:
            doc_exp = jsondoc.get('contents', '')
            break
    print(doc_exp)  
    EXS = ExplainableSearch(reranker, 'svm')
    exp_input = {}
    exp_input = {query: dict([(a, b) for a, b in zip(doc_ids, rerank_scores)])}
    for key, value in exp_input[query].items():
        print(key, value, '\n')
    exp_doc = {query: {'rank': r,'text':doc_exp}}
    results = EXS.explain(exp_input, exp_doc , 1, 'topk-bin')

    # image_path = visualize(results[query][0], results[query][1])
    # Use the visualize function to generate the explanation image
    image_path = visualize(results[query][0], results[query][1], save_path=os.path.join(app.static_folder, 'images'))



        # Construct and return the response with the image path
    response = {
        'top_document': doc_exp,
        'explanation_image_path': image_path,
        'reranked_doc_ids': docids_reranked.tolist(),  # Convert numpy array to list
        'jsondoc': json_data_list.tolist(),
        'doc_ids': doc_ids.tolist(),  # Convert numpy array to list
        'rerank_scores': rerank_scores.tolist() 
    }
    return response
    

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_data():
    data = request.get_json()  # Parse the incoming JSON data
    user_query = data.get('message')
    selected_model = data.get('model')
    if selected_model == 'Cross Encoder':
        response_data = generate_response_cross(user_query)
    # else:
    #     response_data = generate_response_mono(user_query)
        

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)


