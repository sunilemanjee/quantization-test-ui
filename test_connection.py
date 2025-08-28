#!/usr/bin/env python3
"""
Test script to verify Elasticsearch and OpenAI connections
"""

import os
import sys
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
import openai

def test_elasticsearch():
    """Test Elasticsearch connection"""
    print("🔍 Testing Elasticsearch connection...")
    
    try:
        es_url = os.getenv('ES_URL')
        es_api_key = os.getenv('ES_API_KEY')
        es_index = os.getenv('ES_INDEX')
        
        # Initialize client
        es_client = Elasticsearch(
            [es_url],
            api_key=es_api_key,
            verify_certs=False
        )
        
        # Test connection
        if not es_client.ping():
            print("❌ Failed to connect to Elasticsearch")
            return False
        
        print("✅ Elasticsearch connection successful")
        
        # Test index access
        if not es_client.indices.exists(index=es_index):
            print(f"❌ Index '{es_index}' does not exist")
            return False
        
        print(f"✅ Index '{es_index}' exists")
        
        # Test sample search
        try:
            response = es_client.search(
                index=es_index,
                body={
                    "query": {"match_all": {}},
                    "size": 1
                }
            )
            
            if response['hits']['total']['value'] > 0:
                print(f"✅ Index contains {response['hits']['total']['value']} documents")
            else:
                print("⚠️  Index is empty")
                
        except Exception as e:
            print(f"❌ Error testing search: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Elasticsearch connection error: {e}")
        return False

def test_openai():
    """Test OpenAI/Azure connection"""
    print("\n🤖 Testing OpenAI/Azure connection...")
    
    try:
        openai_endpoint = os.getenv('OPENAI_ENDPOINT')
        openai_api_key = os.getenv('OPENAI_API_KEY')
        openai_model = os.getenv('OPENAI_MODEL')
        openai_api_version = os.getenv('OPENAI_API_VERSION')
        
        # Initialize client
        openai_client = openai.AzureOpenAI(
            azure_endpoint=openai_endpoint,
            api_key=openai_api_key,
            api_version=openai_api_version
        )
        
        # Test with a simple completion
        response = openai_client.chat.completions.create(
            model=openai_model,
            messages=[
                {"role": "user", "content": "Hello, this is a test message. Please respond with 'Connection successful'."}
            ],
            max_tokens=10,
            temperature=0
        )
        
        if response.choices[0].message.content:
            print("✅ OpenAI/Azure connection successful")
            return True
        else:
            print("❌ No response from OpenAI/Azure")
            return False
            
    except Exception as e:
        print(f"❌ OpenAI/Azure connection error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing Vector Quantization Search Comparison Tool Connections")
    print("=" * 70)
    
    # Load environment variables
    load_dotenv('variables.env')
    
    # Test Elasticsearch
    es_success = test_elasticsearch()
    
    # Test OpenAI
    openai_success = test_openai()
    
    print("\n" + "=" * 70)
    
    if es_success and openai_success:
        print("🎉 All connections successful! You can now run the application.")
        print("Run: python run.py")
        return True
    else:
        print("❌ Some connections failed. Please check your configuration.")
        if not es_success:
            print("   - Check ES_URL, ES_API_KEY, and ES_INDEX in variables.env")
        if not openai_success:
            print("   - Check OpenAI configuration in variables.env")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
