from flask import request, jsonify, Flask, render_template, send_file
import os

app = Flask(__name__)
app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_data():
    data = request.get_json()  
    user_query = data.get('message')
    selected_model = data.get('model')

    
    if selected_model == 'Cross Encoder':
        from explain.crossencoder import generate_response_cross
        response_data = generate_response_cross(user_query)
    else:
        from explain.mono import generate_response_mono
        response_data = generate_response_mono(user_query)

    return jsonify(response_data)

@app.route('/get_explanation', methods=['post'])
def get_explanation():
    data = request.get_json()
    print(data)
    from explain.crossencoder import generate_specific_explanation
    response = generate_specific_explanation(data)

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
