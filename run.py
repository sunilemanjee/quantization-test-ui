#!/usr/bin/env python3
"""
Startup script for Vector Quantization Search Comparison Tool
"""

import os
import sys
from dotenv import load_dotenv

def check_environment():
    """Check if all required environment variables are set"""
    load_dotenv('variables.env')
    
    required_vars = [
        'ES_URL',
        'ES_API_KEY', 
        'ES_INDEX'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Error: Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease check your variables.env file and ensure all variables are set.")
        return False
    
    print("✅ Environment variables loaded successfully")
    return True

def main():
    """Main startup function"""
    print("🚀 Starting Vector Quantization Search Comparison Tool")
    print("=" * 60)
    
    # Check if virtual environment is activated
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Virtual environment may not be activated.")
        print("   Consider running: source venv/bin/activate")
        print()
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Import and run Flask app
    try:
        from app import app
        print("✅ Flask application loaded successfully")
        print("🌐 Starting web server...")
        print("📱 Open your browser and navigate to: http://localhost:5001")
        print("⏹️  Press Ctrl+C to stop the server")
        print("=" * 60)
        
        app.run(debug=True, host='0.0.0.0', port=5001)
        
    except ImportError as e:
        print(f"❌ Error importing Flask app: {e}")
        print("Please ensure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
