import os
import json
from flask import Flask, render_template, request, jsonify
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv('variables.env')

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

# Configure Elasticsearch client
es_url = os.getenv('ES_URL')
es_api_key = os.getenv('ES_API_KEY')
es_index = os.getenv('ES_INDEX')

# Initialize Elasticsearch client
es_client = Elasticsearch(
    [es_url],
    api_key=es_api_key,
    verify_certs=False
)

@app.route('/')
def index():
    """Main page with the search interface"""
    return render_template('index.html')



@app.route('/search', methods=['POST'])
def search():
    """Handle search requests and return comparison results"""
    try:
        data = request.get_json()
        quantization_type = data.get('quantization', 'int8')
        
        # Get the fixed query
        query_text = get_fixed_query()
        
        # Get full fidelity results
        full_fidelity_results = get_search_results(query_text, None)
        
        # Get quantized results
        quantized_results = get_search_results(query_text, quantization_type)
        
        # Compare results
        comparison = compare_results(full_fidelity_results, quantized_results)
        
        return jsonify({
            'query_text': query_text,
            'full_fidelity': full_fidelity_results,
            'quantized': quantized_results,
            'comparison': comparison,
            'baseline_query': get_search_query(query_text, None),
            'quantized_query': get_search_query(query_text, quantization_type)
        })
        
    except Exception as e:
        app.logger.error(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_fixed_query():
    """Return the fixed query text"""
    return "Luxury waterfront property with pool and garage near downtown Orlando"

def get_search_query(query_text, quantization_type=None):
    """Generate the Elasticsearch query structure"""
    search_body = {
        "_source": False,
        "fields": [
            "title"
        ],
        "query": {
            "knn": {
                "field": "body_content_e5",
                "k": 10,
                "num_candidates": 100,
                "filter": {
                    "geo_distance": {
                        "distance": "25mi",
                        "location": {
                            "lat": 28.5383,
                            "lon": -81.3792
                        }
                    }
                },
                "query_vector_builder": {
                    "text_embedding": {
                        "model_id": ".multilingual-e5-small-elasticsearch",
                        "model_text": query_text
                    }
                }
            }
        }
    }
    
    # Add rescore_vector parameter for int4
    if quantization_type == 'int4':
        search_body["query"]["knn"]["rescore_vector"] = {
            "oversample": 2.0
        }
    
    return search_body

def get_search_results(query_text, quantization_type=None):
    """Get search results from Elasticsearch using the exact query structure provided"""
    try:
        # Get the search query structure
        search_body = get_search_query(query_text, quantization_type)
        
        # Use different indices based on quantization type
        if quantization_type == 'int8':
            index_name = 'properties_int8'
        elif quantization_type == 'int4':
            index_name = 'properties_int4'
        elif quantization_type == 'bbq':
            index_name = 'properties_bbq'
        else:
            # Baseline/float uses the properties index
            index_name = 'properties'
        
        response = es_client.search(
            index=index_name,
            body=search_body
        )
        
        results = []
        for hit in response['hits']['hits']:
            # Extract title from fields since _source is False
            title = hit['fields'].get('title', ['No title'])[0] if 'title' in hit['fields'] else 'No title'
            results.append({
                'title': title,
                'score': hit['_score'],
                'id': hit['_id']
            })
        
        return results
        
    except Exception as e:
        app.logger.error(f"Elasticsearch error: {str(e)}")
        raise e

def compare_results(full_fidelity, quantized):
    """Compare full fidelity and quantized results"""
    comparison = {
        'green_matches': [],
        'yellow_matches': [],
        'red_missing': [],
        'red_extra': []
    }
    
    # Create lookup for full fidelity results
    full_fidelity_lookup = {item['title']: idx for idx, item in enumerate(full_fidelity)}
    
    # Check quantized results against full fidelity
    for idx, quantized_item in enumerate(quantized):
        title = quantized_item['title']
        
        if title in full_fidelity_lookup:
            full_fidelity_idx = full_fidelity_lookup[title]
            
            if idx == full_fidelity_idx:
                # Perfect match - same title and position
                comparison['green_matches'].append({
                    'title': title,
                    'quantized_position': idx,
                    'full_fidelity_position': full_fidelity_idx,
                    'quantized_score': quantized_item['score'],
                    'full_fidelity_score': full_fidelity[full_fidelity_idx]['score']
                })
            else:
                # Title matches but position different
                comparison['yellow_matches'].append({
                    'title': title,
                    'quantized_position': idx,
                    'full_fidelity_position': full_fidelity_idx,
                    'quantized_score': quantized_item['score'],
                    'full_fidelity_score': full_fidelity[full_fidelity_idx]['score']
                })
        else:
            # Title not in full fidelity results
            comparison['red_extra'].append({
                'title': title,
                'quantized_position': idx,
                'quantized_score': quantized_item['score']
            })
    
    # Find items in full fidelity that are missing from quantized
    quantized_titles = {item['title'] for item in quantized}
    for idx, full_item in enumerate(full_fidelity):
        if full_item['title'] not in quantized_titles:
            comparison['red_missing'].append({
                'title': full_item['title'],
                'full_fidelity_position': idx,
                'full_fidelity_score': full_item['score']
            })
    
    return comparison



@app.route('/health')
def health():
    """Health check endpoint"""
    try:
        # Test Elasticsearch connection
        es_client.ping()
        return jsonify({'status': 'healthy', 'elasticsearch': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
