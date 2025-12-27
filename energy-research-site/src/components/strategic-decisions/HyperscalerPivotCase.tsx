import React, { useState } from 'react'
import {
  Cloud,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Users,
  Scale,
  Gavel,
} from 'lucide-react'

interface ResearchEvidence {
  source: string
  type: 'sustainability' | 'legal' | 'operational' | 'market'
  findings: string[]
  implications: string[]
}

interface PersonaAnalysis {
  persona: string
  icon: React.ReactNode
  concerns: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

const researchEvidence: ResearchEvidence[] = [
  {
    source: 'Hyperscaler Sustainability Pages',
    type: 'sustainability',
    findings: [
      'AWS: Commitment to 100% renewable energy by 2025, detailed carbon footprint reporting',
      'Azure: Carbon negative by 2030, comprehensive sustainability dashboard',
      'GCP: Carbon neutral since 2007, detailed PUE (Power Usage Effectiveness) metrics',
    ],
    implications: [
      'All major providers have strong sustainability commitments',
      'Detailed energy metrics already available through provider APIs',
      'Our energy measurement would duplicate existing, more accurate data',
    ],
  },
  {
    source: 'Green Software Foundation Materials',
    type: 'operational',
    findings: [
      'Software Carbon Intensity (SCI) specification for standardized measurement',
      'Existing tools: Cloud Carbon Footprint, CodeCarbon, Green Metrics Tool',
      'Focus on developer education and tooling integration over raw measurement',
    ],
    implications: [
      'Industry already has standardized measurement approaches',
      'Developer adoption requires seamless workflow integration',
      'Educational content more valuable than new measurement tools',
    ],
  },
  {
    source: 'WattTime & ElectricityMap Analysis',
    type: 'operational',
    findings: [
      'WattTime API provides real-time grid carbon intensity data',
      'ElectricityMap offers comprehensive regional energy mix visualization',
      'Both services require API keys and have usage limitations',
    ],
    implications: [
      'Grid carbon intensity data readily available from specialized providers',
      'Integration complexity would require significant operational overhead',
      'Cost and rate limiting concerns for large-scale deployment',
    ],
  },
  {
    source: 'Legal & Compliance Research',
    type: 'legal',
    findings: [
      'GDPR implications for collecting system performance data',
      'Corporate security policies often prohibit external monitoring',
      'Liability concerns for performance impact on production systems',
    ],
    implications: [
      'Significant legal barriers to invasive system monitoring',
      'Enterprise adoption would require extensive compliance review',
      'Risk of performance impact could create liability issues',
    ],
  },
]

const personaAnalyses: PersonaAnalysis[] = [
  {
    persona: 'Security-Focused',
    icon: <Shield className="w-5 h-5" />,
    concerns: [
      'System telemetry collection creates potential attack surface',
      'Data exfiltration risks from performance monitoring',
      'Compliance violations with corporate security policies',
    ],
    recommendations: [
      'Avoid invasive system monitoring approaches',
      'Focus on opt-in, local processing solutions',
      'Prioritize developer tools over system-level collection',
    ],
    riskLevel: 'high',
  },
  {
    persona: 'Operations-Focused',
    icon: <Users className="w-5 h-5" />,
    concerns: [
      'Complex multi-cloud deployment and maintenance overhead',
      'Vendor lock-in risks with cloud-specific implementations',
      'Operational dependencies on external APIs and services',
    ],
    recommendations: [
      'Minimize operational complexity and dependencies',
      'Design for self-contained, portable solutions',
      'Avoid requiring specialized infrastructure or expertise',
    ],
    riskLevel: 'high',
  },
  {
    persona: 'Legal/Compliance',
    icon: <Gavel className="w-5 h-5" />,
    concerns: [
      'GDPR and privacy regulation compliance for data collection',
      'Corporate policy violations with external monitoring',
      'Liability exposure from performance impact on production systems',
    ],
    recommendations: [
      'Ensure explicit user consent and data minimization',
      'Design for local processing without external data transmission',
      'Focus on development-time tools rather than production monitoring',
    ],
    riskLevel: 'high',
  },
  {
    persona: 'Product/Business',
    icon: <Scale className="w-5 h-5" />,
    concerns: [
      'High switching costs and integration friction for developers',
      'Market already served by existing tools and cloud provider metrics',
      'Adoption barriers due to operational and security concerns',
    ],
    recommendations: [
      'Focus on seamless developer workflow integration',
      'Leverage existing measurement infrastructure rather than replacing it',
      'Prioritize education and guidance over new measurement tools',
    ],
    riskLevel: 'medium',
  },
]

export function HyperscalerPivotCase() {
  const [selectedEvidence, setSelectedEvidence] = useState<string>(researchEvidence[0].source)
  const [selectedPersona, setSelectedPersona] = useState<string>(personaAnalyses[0].persona)

  const currentEvidence = researchEvidence.find(e => e.source === selectedEvidence)!
  const currentPersona = personaAnalyses.find(p => p.persona === selectedPersona)!

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sustainability':
        return <Cloud className="w-5 h-5 text-green-600" />
      case 'legal':
        return <Gavel className="w-5 h-5 text-red-600" />
      case 'operational':
        return <Users className="w-5 h-5 text-blue-600" />
      case 'market':
        return <Scale className="w-5 h-5 text-purple-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">Hyperscaler Pivot Decision Case Study</h2>
        <p className="text-body max-w-3xl mx-auto">
          A comprehensive analysis of our strategic decision to pivot away from invasive hyperscaler
          energy monitoring toward developer-focused tools. This case study demonstrates
          evidence-based decision making with systematic risk assessment.
        </p>
      </div>

      {/* Decision Timeline */}
      <div className="card">
        <h3 className="heading-md mb-6">Decision Timeline & Process</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Initial Hypothesis</h4>
              <p className="text-sm text-blue-800">
                Build comprehensive energy monitoring for hyperscaler environments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
            <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium text-yellow-900">Comprehensive Research Phase</h4>
              <p className="text-sm text-yellow-800">
                Systematic analysis of sustainability pages, industry standards, and existing tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium text-purple-900">Multi-Persona Analysis</h4>
              <p className="text-sm text-purple-800">
                Security, operations, legal, and business perspective evaluation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <h4 className="font-medium text-green-900">Strategic Pivot Decision</h4>
              <p className="text-sm text-green-800">
                Focus on developer tools and CI/CD integration with preserved research value
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Research Evidence */}
      <div className="card">
        <h3 className="heading-md mb-6">Comprehensive Research Evidence</h3>

        {/* Evidence Source Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {researchEvidence.map(evidence => (
            <button
              key={evidence.source}
              onClick={() => setSelectedEvidence(evidence.source)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedEvidence === evidence.source
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTypeIcon(evidence.type)}
              {evidence.source}
            </button>
          ))}
        </div>

        {/* Selected Evidence Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Research Findings</h4>
            <ul className="space-y-2">
              {currentEvidence.findings.map((finding, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {finding}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Strategic Implications</h4>
            <ul className="space-y-2">
              {currentEvidence.implications.map((implication, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {implication}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Multi-Persona Analysis */}
      <div className="card">
        <h3 className="heading-md mb-6">Multi-Persona Risk Analysis</h3>

        {/* Persona Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {personaAnalyses.map(persona => (
            <button
              key={persona.persona}
              onClick={() => setSelectedPersona(persona.persona)}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedPersona === persona.persona
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {persona.icon}
              {persona.persona}
            </button>
          ))}
        </div>

        {/* Selected Persona Analysis */}
        <div className="space-y-6">
          <div className={`p-4 rounded-lg border ${getRiskColor(currentPersona.riskLevel)}`}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">Risk Level: {currentPersona.riskLevel.toUpperCase()}</h4>
              {currentPersona.riskLevel === 'high' && <XCircle className="w-5 h-5" />}
              {currentPersona.riskLevel === 'medium' && <AlertTriangle className="w-5 h-5" />}
              {currentPersona.riskLevel === 'low' && <CheckCircle className="w-5 h-5" />}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Concerns Identified</h4>
              <ul className="space-y-2">
                {currentPersona.concerns.map((concern, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {currentPersona.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final Decision & Value Preservation */}
      <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <h3 className="heading-md mb-6">Final Decision & Value Preservation</h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Strategic Pivot Decision</h4>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Decision:</strong> Pivot away from invasive hyperscaler monitoring toward
                developer-focused energy efficiency tools and education.
              </p>
              <p>
                <strong>Rationale:</strong> Multiple high-risk factors (security, legal,
                operational) combined with existing market solutions made the original approach
                non-viable.
              </p>
              <p>
                <strong>Timeline:</strong> Decision made after 2 weeks of comprehensive research and
                multi-persona analysis, preventing months of high-risk development.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Research Value Preserved</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Energy measurement methodology and benchmarking expertise retained
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Cross-language performance analysis findings still valuable
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Developer education and CI/CD integration approach identified
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Strategic decision-making methodology validated and documented
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
