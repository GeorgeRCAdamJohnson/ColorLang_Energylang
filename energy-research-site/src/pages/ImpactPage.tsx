import {
  Leaf,
  Zap,
  Globe,
  TrendingUp,
  Users,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export function ImpactPage() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="heading-xl mb-4">Impact & Recommendations</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Practical applications and recommendations from our energy efficiency research.
              Understanding the broader implications for sustainable software development and
              performance optimization.
            </p>
          </header>

          <div className="space-y-12">
            {/* Environmental Impact */}
            <section>
              <h2 className="heading-lg mb-8">Environmental Impact</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Leaf className="text-green-600 mr-3" size={24} />
                    <h3 className="heading-sm">Carbon Footprint Reduction</h3>
                  </div>
                  <p className="text-body mb-4">
                    Switching from Python to C++ for compute-intensive operations could reduce data
                    center energy consumption by up to 83%, significantly lowering carbon emissions.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-700 mb-1">83%</div>
                    <div className="text-sm text-green-600">Potential energy reduction</div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <Globe className="text-blue-600 mr-3" size={24} />
                    <h3 className="heading-sm">Global Scale Impact</h3>
                  </div>
                  <p className="text-body mb-4">
                    If applied across major cloud providers and data centers worldwide, these
                    optimizations could save terawatt-hours of electricity annually.
                  </p>
                  <ul className="space-y-2 text-body">
                    <li>• Reduced cooling requirements</li>
                    <li>• Lower infrastructure costs</li>
                    <li>• Extended hardware lifespan</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Industry Applications */}
            <section>
              <h2 className="heading-lg mb-8">Industry Applications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Zap className="text-yellow-600 mr-3" size={24} />
                    <h3 className="heading-sm">High-Performance Computing</h3>
                  </div>
                  <p className="text-body mb-4">
                    Scientific computing, machine learning training, and simulation workloads can
                    achieve dramatic energy savings through language optimization.
                  </p>
                  <div className="text-sm text-gray-600">Target: 60-80% energy reduction</div>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="text-purple-600 mr-3" size={24} />
                    <h3 className="heading-sm">Financial Services</h3>
                  </div>
                  <p className="text-body mb-4">
                    High-frequency trading, risk calculations, and real-time analytics benefit from
                    both performance and energy efficiency improvements.
                  </p>
                  <div className="text-sm text-gray-600">Target: 40-60% energy reduction</div>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <Users className="text-indigo-600 mr-3" size={24} />
                    <h3 className="heading-sm">Mobile Applications</h3>
                  </div>
                  <p className="text-body mb-4">
                    Battery life improvements for mobile apps through strategic use of
                    energy-efficient languages for compute-intensive operations.
                  </p>
                  <div className="text-sm text-gray-600">
                    Target: 20-40% battery life improvement
                  </div>
                </div>
              </div>
            </section>

            {/* Recommendations */}
            <section>
              <h2 className="heading-lg mb-8">Strategic Recommendations</h2>
              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 mr-4 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="heading-sm mb-2">Hybrid Language Architecture</h3>
                      <p className="text-body mb-3">
                        Use Python for rapid prototyping and business logic, but implement
                        compute-intensive operations in C++ or Rust for production systems.
                      </p>
                      <div className="flex items-center text-sm text-blue-600">
                        <span>Learn more about implementation strategies</span>
                        <ArrowRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 mr-4 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="heading-sm mb-2">Energy-Aware Development Practices</h3>
                      <p className="text-body mb-3">
                        Integrate energy profiling into CI/CD pipelines to catch energy regressions
                        early and maintain performance standards.
                      </p>
                      <div className="flex items-center text-sm text-blue-600">
                        <span>Explore profiling tools and techniques</span>
                        <ArrowRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 mr-4 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="heading-sm mb-2">Visual Programming Adoption</h3>
                      <p className="text-body mb-3">
                        ColorLang demonstrates the potential for visual programming paradigms to
                        make complex algorithms more accessible and maintainable.
                      </p>
                      <div className="flex items-center text-sm text-blue-600">
                        <span>Try the ColorLang interactive demo</span>
                        <ArrowRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Future Research */}
            <section>
              <h2 className="heading-lg mb-8">Future Research Directions</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Lightbulb className="text-orange-600 mr-3" size={24} />
                    <h3 className="heading-sm">Compiler Optimizations</h3>
                  </div>
                  <p className="text-body mb-4">
                    Investigate energy-aware compiler optimizations that prioritize energy
                    efficiency alongside traditional performance metrics.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Energy-guided instruction selection</li>
                    <li>• Power-aware memory management</li>
                    <li>• Dynamic voltage scaling integration</li>
                  </ul>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <Globe className="text-cyan-600 mr-3" size={24} />
                    <h3 className="heading-sm">Distributed Systems</h3>
                  </div>
                  <p className="text-body mb-4">
                    Extend energy efficiency research to distributed computing environments and
                    cloud-native architectures.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Container energy profiling</li>
                    <li>• Microservice optimization</li>
                    <li>• Edge computing efficiency</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
                <h2 className="heading-lg mb-4">Ready to Optimize Your Applications?</h2>
                <p className="text-body mb-6 max-w-2xl mx-auto">
                  Start implementing energy-efficient practices in your development workflow. Every
                  optimization contributes to a more sustainable digital future.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-primary">Download Benchmarking Tools</button>
                  <button className="btn-outline">View Implementation Guide</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
