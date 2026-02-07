import React from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Chrome, Settings, MousePointer } from 'lucide-react';
import ProjectNavbar from '../components/ProjectNavbar';

const DownloadPage = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
            <ProjectNavbar />

            <main className="container mx-auto px-4 pt-32 pb-20">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
                    >
                        <Chrome className="w-4 h-4" />
                        <span className="text-sm font-medium">Chrome Extension v1.0</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
                    >
                        Get Lock Focus
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
                    >
                        Supercharge your reading and focus. Enhance accessibility with Bionic Reading, Syllable Splitting, and Distraction Shield.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <a
                            href="/lock-focus.zip"
                            download
                            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
                        >
                            <Download className="w-6 h-6" />
                            Download Extension
                        </a>
                        <p className="mt-4 text-sm text-gray-500">Free • Privacy-Focused • Open Source</p>
                    </motion.div>
                </div>

                {/* Installation Guide */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-8 text-center">How to Install</h2>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Settings className="w-24 h-24" />
                            </div>
                            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4">1</div>
                            <h3 className="text-xl font-medium mb-2">Unzip & Open Chrome</h3>
                            <p className="text-gray-400 text-sm mb-4">Unzip the downloaded file. Then, copy and paste this into your browser bar:</p>
                            <code className="block bg-black/50 p-2 rounded text-blue-300 text-sm font-mono select-all">chrome://extensions</code>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle className="w-24 h-24" />
                            </div>
                            <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4">2</div>
                            <h3 className="text-xl font-medium mb-2">Enable Developer Mode</h3>
                            <p className="text-gray-400 text-sm">Top right corner of the Extensions page. Toggle the switch to <span className="text-white font-medium">ON</span>.</p>
                            <div className="mt-4 w-12 h-6 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MousePointer className="w-24 h-24" />
                            </div>
                            <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4">3</div>
                            <h3 className="text-xl font-medium mb-2">Load Unpacked</h3>
                            <p className="text-gray-400 text-sm">Click "Load Unpacked" (top left) and select the <span className="text-white font-mono">chrome-extension</span> folder you just unzipped.</p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DownloadPage;
