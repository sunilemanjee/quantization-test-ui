// Vector Quantization Search Comparison - Frontend JavaScript

// Global variables
let currentResults = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Vector Quantization Search Comparison initialized');
    
    // Add event listeners
    document.getElementById('quantizationSelect').addEventListener('change', function() {
        updateQuantizedTitle();
    });
    
    // Initial title update
    updateQuantizedTitle();
    
    // Initialize tooltips
    initializeTooltips();
});

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Update quantized title when selection changes
function updateQuantizedTitle() {
    const select = document.getElementById('quantizationSelect');
    const titleElement = document.getElementById('quantizedTitle');
    
    const quantizationType = select.options[select.selectedIndex].text;
    titleElement.textContent = `${quantizationType} Results`;
}

// Run comparison
async function runComparison() {
    const quantizationSelect = document.getElementById('quantizationSelect');
    const compareBtn = document.getElementById('compareBtn');
    
    const quantization = quantizationSelect.value;
    
    // Show loading state
    showLoading(true);
    hideError();
    
    try {
        // Disable compare button
        compareBtn.disabled = true;
        compareBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Comparison...';
        
        // Make API call for comparison
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quantization: quantization
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Comparison failed');
        }
        
        const data = await response.json();
        currentResults = data;
        
        // Display comparison results
        displayComparisonResults(data);
        
    } catch (error) {
        console.error('Comparison error:', error);
        showError(error.message || 'An error occurred during comparison');
    } finally {
        // Hide loading state
        showLoading(false);
        
        // Re-enable compare button
        compareBtn.disabled = false;
        compareBtn.innerHTML = '<i class="fas fa-balance-scale me-2"></i>Run Comparison';
    }
}

// Display comparison results
function displayComparisonResults(data) {
    const {
        query_text,
        full_fidelity,
        quantized,
        comparison,
        baseline_query,
        quantized_query
    } = data;
    
    // Display queries
    displayQueries(baseline_query, quantized_query);
    
    // Update summary statistics
    updateSummaryStatistics(comparison);
    
    // Display full fidelity results with highlighting
    displayResultsListWithHighlighting(full_fidelity, 'fullFidelityResults', 'fullFidelityCount', comparison, 'baseline');
    
    // Display quantized results with highlighting
    displayResultsListWithHighlighting(quantized, 'quantizedResults', 'quantizedCount', comparison, 'quantized');
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Display the Elasticsearch queries
function displayQueries(baselineQuery, quantizedQuery) {
    const queryDisplay = document.getElementById('queryDisplay');
    
    const queryText = `Baseline Query (properties index):
${JSON.stringify(baselineQuery, null, 2)}

Quantized Query (${getQuantizedIndexName()} index):
${JSON.stringify(quantizedQuery, null, 2)}`;
    
    queryDisplay.textContent = queryText;
}

// Get the quantized index name based on selected quantization type
function getQuantizedIndexName() {
    const select = document.getElementById('quantizationSelect');
    const quantizationType = select.value;
    
    switch(quantizationType) {
        case 'int8': return 'properties_int8';
        case 'int4': return 'properties_int4';
        case 'bbq': return 'properties_bbq';
        default: return 'properties_int8';
    }
}

// Update summary statistics
function updateSummaryStatistics(comparison) {
    document.getElementById('perfectMatches').textContent = comparison.green_matches.length;
    document.getElementById('positionMismatches').textContent = comparison.yellow_matches.length;
    document.getElementById('missingResults').textContent = comparison.red_missing.length;
    document.getElementById('extraResults').textContent = comparison.red_extra.length;
    
    // Calculate matches found
    const totalFullFidelity = comparison.green_matches.length + comparison.yellow_matches.length + comparison.red_missing.length;
    const matchesFound = comparison.green_matches.length + comparison.yellow_matches.length;
    
    document.getElementById('recallCount').textContent = `${matchesFound}/${totalFullFidelity}`;
}

// Toggle query display
function toggleQueryDisplay() {
    const container = document.getElementById('queryDisplayContainer');
    const button = document.getElementById('toggleQueryBtn');
    const icon = button.querySelector('i');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        button.innerHTML = '<i class="fas fa-eye-slash me-2"></i>Hide Elasticsearch Query';
        button.classList.remove('btn-outline-info');
        button.classList.add('btn-outline-secondary');
    } else {
        container.style.display = 'none';
        button.innerHTML = '<i class="fas fa-code me-2"></i>Show Elasticsearch Query';
        button.classList.remove('btn-outline-secondary');
        button.classList.add('btn-outline-info');
    }
}

// Display results list with highlighting
function displayResultsListWithHighlighting(results, containerId, countId, comparison, type) {
    const container = document.getElementById(containerId);
    const countElement = document.getElementById(countId);
    
    countElement.textContent = results.length;
    
    container.innerHTML = '';
    
    // Create lookup sets for quick checking
    const greenMatches = new Set(comparison.green_matches.map(m => m.title));
    const yellowMatches = new Set(comparison.yellow_matches.map(m => m.title));
    const redMissing = new Set(comparison.red_missing.map(m => m.title));
    const redExtra = new Set(comparison.red_extra.map(m => m.title));
    
    results.forEach((result, index) => {
        let cssClass = 'result';
        let tooltip = '';
        
        if (type === 'baseline') {
            // For baseline results
            if (redMissing.has(result.title)) {
                cssClass = 'result red-missing';
                tooltip = 'Missing from quantized results';
            } else if (greenMatches.has(result.title)) {
                cssClass = 'result green-match';
                tooltip = 'Perfect match with quantized results';
            } else if (yellowMatches.has(result.title)) {
                cssClass = 'result yellow-match';
                const match = comparison.yellow_matches.find(m => m.title === result.title);
                tooltip = `Position mismatch: found at position ${match.quantized_position} in quantized results`;
            }
        } else {
            // For quantized results
            if (redExtra.has(result.title)) {
                cssClass = 'result red-extra';
                tooltip = 'Extra result not found in baseline';
            } else if (greenMatches.has(result.title)) {
                cssClass = 'result green-match';
                tooltip = 'Perfect match with baseline results';
            } else if (yellowMatches.has(result.title)) {
                cssClass = 'result yellow-match';
                const match = comparison.yellow_matches.find(m => m.title === result.title);
                tooltip = `Position mismatch: found at position ${match.full_fidelity_position} in baseline results`;
            }
        }
        
        const resultElement = createResultElement(result, index + 1, type, cssClass, tooltip);
        container.appendChild(resultElement);
    });
}



// Create result element
function createResultElement(result, position, type, cssClass = '', tooltip = '') {
    const div = document.createElement('div');
    div.className = `result-item ${cssClass}`;
    
    if (tooltip) {
        div.title = tooltip;
        div.setAttribute('data-bs-toggle', 'tooltip');
        div.setAttribute('data-bs-placement', 'top');
    }
    
    div.innerHTML = `
        <div class="result-title">${escapeHtml(result.title)}</div>
        <div class="result-position">Position: ${position}</div>
    `;
    
    // Initialize tooltip if present
    if (tooltip) {
        new bootstrap.Tooltip(div);
    }
    
    return div;
}



// Show loading state
function showLoading(show) {
    const loadingSection = document.getElementById('loadingSection');
    loadingSection.style.display = show ? 'block' : 'none';
}

// Show error message
function showError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    
    // Scroll to error
    errorSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Hide error message
function hideError() {
    document.getElementById('errorSection').style.display = 'none';
}

// Clear results
function clearResults() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('fullFidelityResults').innerHTML = '';
    document.getElementById('quantizedResults').innerHTML = '';
    document.getElementById('queryDisplay').textContent = '';
    
    // Hide query display and reset button
    document.getElementById('queryDisplayContainer').style.display = 'none';
    const toggleBtn = document.getElementById('toggleQueryBtn');
    toggleBtn.innerHTML = '<i class="fas fa-code me-2"></i>Show Elasticsearch Query';
    toggleBtn.classList.remove('btn-outline-secondary');
    toggleBtn.classList.add('btn-outline-info');
    
    // Reset counts
    document.getElementById('fullFidelityCount').textContent = '0';
    document.getElementById('quantizedCount').textContent = '0';
    
    // Reset summary statistics
    document.getElementById('perfectMatches').textContent = '0';
    document.getElementById('positionMismatches').textContent = '0';
    document.getElementById('missingResults').textContent = '0';
    document.getElementById('extraResults').textContent = '0';
    document.getElementById('recallCount').textContent = '0/0';
    
    hideError();
    currentResults = null;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export results function (for future use)
function exportResults() {
    if (!currentResults) {
        showError('No results to export');
        return;
    }
    
    const dataStr = JSON.stringify(currentResults, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `quantization_comparison_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    link.click();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to search
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        performSearch();
    }
    
    // Escape to clear results
    if (e.key === 'Escape') {
        clearResults();
    }
});

// Health check function
async function checkHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        
        if (data.status === 'healthy') {
            console.log('Application is healthy');
        } else {
            console.warn('Application health check failed:', data.error);
        }
    } catch (error) {
        console.error('Health check error:', error);
    }
}

// Perform health check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkHealth();
});
