# Vector Quantization Search Comparison Tool

A Flask-based web application that demonstrates the impact of vector quantization on Elasticsearch search results. This tool allows you to compare full-fidelity vector search results with quantized versions (INT8, INT4, BBQ) and provides AI-powered analysis of the differences.

## Features

- **Side-by-side Comparison**: Compare full-fidelity search results with quantized versions
- **Visual Result Coding**: 
  - 🟢 **Green**: Perfect matches (same title and position)
  - 🟡 **Yellow**: Title matches but position differs
  - 🔴 **Red**: Missing from quantized results or extra results not in full fidelity
- **AI Analysis**: Automated summary of quantization impact using OpenAI/Azure
- **Modern UI**: Responsive design with Bootstrap 5 and custom styling
- **Real-time Statistics**: Live comparison metrics and statistics
- **Interactive Tooltips**: Detailed information on hover

## Prerequisites

- Python 3.8 or higher
- Elasticsearch 9.0.3+ with vector search capabilities
- OpenAI/Azure OpenAI API access
- Properties index with vector embeddings

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd quantization-test-ui
   ```

2. **Configure environment variables**:
   Copy the template and fill in your credentials:
   ```bash
   cp variables.env.template variables.env
   ```
   
   **⚠️ Important**: The `variables.env` file contains sensitive API keys and is excluded from git. Never commit this file to version control.
   
   Edit `variables.env` with your actual values:
   ```env
   ES_URL="https://your-cluster.region.elastic.cloud:443"
   ES_API_KEY="your-elasticsearch-api-key"
   ES_INDEX=properties
   
   OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   OPENAI_API_KEY=your-azure-openai-api-key
   OPENAI_MODEL=gpt-4o-global
   OPENAI_API_VERSION=2025-01-01-preview
   ```

3. **Setup the environment** (creates virtual environment and installs dependencies):
   ```bash
   source setup_env.sh
   ```
   
   This script will:
   - Create a Python virtual environment (`venv`)
   - Install all required dependencies from `requirements.txt`
   - Validate your environment variables
   - Create a `.env` file
   - Set up `.gitignore` to exclude sensitive files

## Usage

1. **Activate the virtual environment** (if not already active):
   ```bash
   source venv/bin/activate
   ```

2. **Test connections** (optional but recommended):
   ```bash
   python test_connection.py
   ```

3. **Start the application**:
   ```bash
   python run.py
   ```
   
   Or run directly:
   ```bash
   python app.py
   ```

4. **Access the web interface**:
   The application binds to all network interfaces (0.0.0.0) on port 5001.
   
   You can access it via:
   - **Local**: `http://localhost:5001` or `http://127.0.0.1:5001`
   - **Network**: `http://[your-ip-address]:5001` (accessible from other devices on the network)

3. **Perform a search**:
   - Enter your search query in the text field
   - Select the quantization type (INT8, INT4, or BBQ)
   - Click "Compare Search Results"

4. **Analyze the results**:
   - View the side-by-side comparison
   - Check the color-coded results
   - Read the AI-generated analysis
   - Review the statistics

## How It Works

### Search Process
1. **Full Fidelity Search**: Queries the Elasticsearch index without quantization
2. **Quantized Search**: Queries the same index with the selected quantization method
3. **Comparison**: Analyzes differences in results and positions
4. **AI Analysis**: Generates insights about the quantization impact

### Result Classification
- **Perfect Matches (Green)**: Results that appear in the same position in both searches
- **Position Mismatches (Yellow)**: Results that appear in both searches but at different positions
- **Missing Results (Red)**: Results that appear in full fidelity but not in quantized
- **Extra Results (Red)**: Results that appear in quantized but not in full fidelity

## API Endpoints

- `GET /`: Main application interface
- `POST /search`: Perform search comparison
  - Body: `{"query": "search text", "quantization": "int8|int4|bbq"}`
- `GET /health`: Health check endpoint

## Security

### Environment Variables
- **Never commit `variables.env` to version control** - it contains sensitive API keys
- The file is automatically excluded via `.gitignore`
- Use `variables.env.template` as a reference for required variables
- Keep your API keys secure and rotate them regularly

## Configuration
Ensure your Elasticsearch cluster has:
- Vector search capabilities enabled
- A properties index with vector embeddings
- Proper API key authentication

### OpenAI/Azure Configuration
The application uses Azure OpenAI for AI-powered analysis. Configure:
- Azure OpenAI endpoint
- API key
- Model name (default: gpt-4o-global)
- API version

### Network Configuration
The application binds to `0.0.0.0:5001` by default, making it accessible from:
- Local machine: `localhost:5001`
- Other devices on the same network: `[your-ip]:5001`
- For production, consider using a reverse proxy and proper firewall rules

## Troubleshooting

### Common Issues

1. **Elasticsearch Connection Error**:
   - Verify your ES_URL and ES_API_KEY
   - Check if your cluster is accessible
   - Ensure the properties index exists

2. **OpenAI API Error**:
   - Verify your Azure OpenAI credentials
   - Check API quota and limits
   - Ensure the model is available in your region

3. **No Results Returned**:
   - Verify the index contains data
   - Check if vector embeddings are properly indexed
   - Ensure the search query is appropriate

### Debug Mode
Run the application in debug mode for detailed logging:
```bash
source venv/bin/activate
export FLASK_ENV=development
python app.py
```

## Development

### Project Structure
```
quantization-test-ui/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── variables.env         # Environment configuration
├── README.md            # This file
├── templates/
│   └── index.html       # Main HTML template
└── static/
    ├── css/
    │   └── style.css    # Custom styles
    └── js/
        └── app.js       # Frontend JavaScript
```

### Adding New Features
1. **New Quantization Types**: Add options to the quantization selector
2. **Additional Metrics**: Extend the comparison logic in `compare_results()`
3. **Custom Analysis**: Modify the AI prompt in `generate_ai_summary()`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the Elasticsearch and OpenAI documentation
3. Open an issue in the repository

## Acknowledgments

- Elasticsearch for vector search capabilities
- OpenAI/Azure for AI analysis
- Bootstrap for the UI framework
- Flask for the web framework
