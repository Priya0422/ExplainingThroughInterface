from flask import request, jsonify, Flask, render_template, send_file
import os
from explain.crossencoder import generate_response_cross


app = Flask(__name__)
# app.static_folder = 'static'
app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    

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


