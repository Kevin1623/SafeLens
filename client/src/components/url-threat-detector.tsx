import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Globe, Lock, Eye } from 'lucide-react';

const URLThreatDetector = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);

  // Simulated threat analysis logic
  const analyzeURL = async (inputUrl) => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

    // Simulate progressive analysis steps
    const steps = [
      { name: 'URL Structure Analysis', weight: 20 },
      { name: 'Domain Reputation Check', weight: 25 },
      { name: 'SSL Certificate Validation', weight: 15 },
      { name: 'Malware Signature Scan', weight: 25 },
      { name: 'Phishing Pattern Detection', weight: 15 }
    ];

    let currentProgress = 0;
    const results = {};

    for (const step of steps) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      currentProgress += step.weight;
      setProgress(currentProgress);

      // Simulate analysis results
      results[step.name] = Math.random() > 0.3; // 70% chance of passing each test
    }

    // Calculate overall safety score
    const passedTests = Object.values(results).filter(Boolean).length;
    const safetyScore = Math.round((passedTests / steps.length) * 100);

    // Additional risk factors based on URL patterns
    let riskFactors = [];
    const urlLower = inputUrl.toLowerCase();

    if (urlLower.includes('bit.ly') || urlLower.includes('tinyurl') || urlLower.includes('t.co')) {
      riskFactors.push('Shortened URL - potential redirect risk');
    }
    if (!urlLower.startsWith('https://')) {
      riskFactors.push('Non-HTTPS connection');
      results['SSL Certificate Validation'] = false;
    }
    if (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(urlLower)) {
      riskFactors.push('IP address instead of domain name');
    }
    if (urlLower.includes('login') || urlLower.includes('signin') || urlLower.includes('verify')) {
      riskFactors.push('Potential phishing keywords detected');
    }
    if (urlLower.includes('urgent') || urlLower.includes('click-now') || urlLower.includes('limited-time')) {
      riskFactors.push('Suspicious urgency indicators');
    }

    // Adjust score based on risk factors
    const adjustedScore = Math.max(0, safetyScore - (riskFactors.length * 15));

    const finalAnalysis = {
      url: inputUrl,
      safetyScore: adjustedScore,
      status: adjustedScore >= 70 ? 'Safe' : 'Unsafe',
      confidence: Math.min(95, 60 + Math.random() * 30),
      riskFactors,
      testResults: results,
      timestamp: new Date().toLocaleTimeString()
    };

    setAnalysis(finalAnalysis);
    setIsAnalyzing(false);
  };

  const handleCheck = () => {
    if (!url.trim()) return;
    analyzeURL(url);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleCheck();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">URL Threat Detection</h2>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter URL to analyze (e.g., https://example.com)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAnalyzing}
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={!url.trim() || isAnalyzing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Check
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Analysis in progress...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Result */}
          <div className={`p-6 rounded-lg border-2 ${
            analysis.status === 'Safe' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                analysis.status === 'Safe' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {analysis.status === 'Safe' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  analysis.status === 'Safe' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {analysis.status}
                </h3>
                <p className="text-gray-600">
                  Safety Score: {analysis.safetyScore}% 
                  <span className="ml-2 text-sm">
                    (Confidence: {Math.round(analysis.confidence)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Test Results */}
            <div className="bg-gray-800 p-4 rounded-lg text-white">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Tests
              </h4>
              <div className="space-y-2">
                {Object.entries(analysis.testResults).map(([test, passed]) => (
                  <div key={test} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{test}</span>
                    <div className={`flex items-center gap-1 ${
                      passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {passed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-gray-800 p-4 rounded-lg text-white">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Factors
              </h4>
              {analysis.riskFactors.length > 0 ? (
                <div className="space-y-2">
                  {analysis.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{factor}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No significant risk factors detected
                </p>
              )}
            </div>
          </div>

          {/* Analysis Info */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            Analysis completed at {analysis.timestamp} • 
            URL: <span className="font-mono">{analysis.url}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!analysis && !isAnalyzing && (
        <div className="text-center text-gray-500 py-8">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg mb-2">Enter a URL to analyze its safety</p>
          <p className="text-sm">
            Our system checks for malware, phishing attempts, SSL certificates, and other security threats
          </p>
        </div>
      )}
    </div>
  );
};

export default URLThreatDetector;