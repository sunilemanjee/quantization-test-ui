# Vector Quantization Search Comparison Tool

A Flask-based web application that demonstrates the impact of vector quantization on Elasticsearch search results. This tool allows you to compare full-fidelity vector search results with quantized versions (INT8, INT4, INT4 with Rescore, BBQ) and provides visual analysis of the differences.

## Features

- **Side-by-side Comparison**: Compare full-fidelity search results with quantized versions
- **Visual Result Coding**: 
  - 🟢 **Green**: Perfect matches (same title and position)
  - 🟡 **Yellow**: Title matches but position differs
  - 🔴 **Red**: Missing from quantized results or extra results not in full fidelity
- **Summary Statistics**: Quick overview of comparison metrics
- **Modern UI**: Responsive design with Bootstrap 5 and custom styling
- **Real-time Statistics**: Live comparison metrics and statistics
- **Interactive Tooltips**: Detailed information on hover
- **Collapsible Query Display**: View actual Elasticsearch queries being executed

## Prerequisites

- Python 3.8 or higher
- Elasticsearch 9.0.3+ with vector search capabilities
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

5. **Perform a comparison**:
   - Select the quantization type (INT8, INT4, INT4 with Rescore, or BBQ)
   - Click "Run Comparison"
   - View the side-by-side results with visual highlighting

6. **Analyze the results**:
   - View the summary statistics at the top
   - Check the color-coded results in both panels
   - Hover over results for detailed tooltips
   - Click "Show Elasticsearch Query" to see the actual queries being executed

## How It Works

### Search Process
1. **Full Fidelity Search**: Queries the `properties` index without quantization
2. **Quantized Search**: Queries the appropriate quantized index based on selection:
   - INT8: `properties_int8` index
   - INT4: `properties_int4` index
   - INT4 with Rescore: `properties_int4` index with rescore_vector parameter
   - BBQ: `properties_bbq` index
3. **Comparison**: Analyzes differences in results and positions
4. **Visual Analysis**: Provides color-coded highlighting and summary statistics

### Result Classification
- **Perfect Matches (Green)**: Results that appear in the same position in both searches
- **Position Mismatches (Yellow)**: Results that appear in both searches but at different positions
- **Missing Results (Red)**: Results that appear in full fidelity but not in quantized
- **Extra Results (Red)**: Results that appear in quantized but not in full fidelity

### Fixed Query
The application uses a fixed search query: "Luxury waterfront property with pool and garage near downtown Orlando"

## API Endpoints

- `GET /`: Main application interface
- `POST /search`: Perform search comparison
  - Body: `{"quantization": "int8|int4|int4_with_rescore|bbq"}`
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

2. **No Results Returned**:
   - Verify the index contains data
   - Check if vector embeddings are properly indexed
   - Ensure the search query is appropriate

3. **Missing Quantized Indices**:
   - Ensure you have the required quantized indices: `properties_int8`, `properties_int4`, `properties_bbq`
   - Check that the indices contain the same data as the baseline `properties` index

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
├── run.py                # Startup script
├── setup_env.sh          # Environment setup script
├── test_connection.py    # Connection test utility
├── variables.env.template # Environment variables template
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── style.css     # Custom styles
    └── js/
        └── app.js        # Frontend JavaScript
```

### Adding New Features
1. **New Quantization Types**: Add options to the quantization selector in `app.py`
2. **Additional Metrics**: Extend the comparison logic in `compare_results()`
3. **Custom Queries**: Modify the fixed query in `get_fixed_query()`

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
2. Review the Elasticsearch documentation
3. Open an issue in the repository

## Acknowledgments

- Elasticsearch for vector search capabilities
- Bootstrap for the UI framework
- Flask for the web framework
