import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Download, Eye, Zap, Type, Check, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Initialize PDF.js worker
// Using unpkg for better reliability with versions
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const AdaptivePdfReader = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [extractedText, setExtractedText] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('dyslexia');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [error, setError] = useState(null);

    const conditions = [
        {
            id: 'dyslexia',
            title: 'Dyslexia Friendly',
            icon: Type,
            description: 'Optimized for reduced letter crowding and flipping.',
            color: 'bg-yellow-50 dark:bg-amber-900/20',
            activeColor: 'ring-yellow-400',
            settings: {
                font: 'Helvetica',
                size: 18, // Larger standard size
                lineSpacing: 2.0, // Double spacing
                letterSpacing: 0.1, // significant tracking
                align: 'left',
                bg: '#FAF3E0', // Cream
                text: '#000000',
            }
        },
        {
            id: 'adhd',
            title: 'ADHD Focus',
            icon: Zap,
            description: 'Structured layout to reduce cognitive overload.',
            color: 'bg-blue-50 dark:bg-blue-900/20',
            activeColor: 'ring-blue-400',
            settings: {
                font: 'Arial',
                size: 16,
                lineSpacing: 1.8,
                maxWidth: 60,
                align: 'left',
                bg: '#F0F4F8',
                text: '#111827',
                paragraphSpacing: 10
            }
        },
        {
            id: 'vision',
            title: 'Vision Stress',
            icon: Eye,
            description: 'Softer contrast to reduce eye strain and fatigue.',
            color: 'bg-green-50 dark:bg-emerald-900/20',
            activeColor: 'ring-green-400',
            settings: {
                font: 'Verdana',
                size: 16,
                lineSpacing: 1.6,
                align: 'left',
                bg: '#E3F2ED', // Muted mint
                text: '#2D3748', // Soft slate
            }
        }
    ];

    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile && uploadedFile.type === 'application/pdf') {
            setFile(uploadedFile);
            setDownloadUrl(null);
            setExtractedText('');
            setProgress(0);
            setError(null);
            setStatusText("");
        }
    };

    const processPdf = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(5);
        setStatusText("Initializing PDF engine...");
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // 1. Load Document
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

            loadingTask.onProgress = (p) => {
                if (p.total > 0) {
                    const percent = Math.round((p.loaded / p.total) * 20); // First 20% is loading
                    setProgress(Math.max(5, percent));
                }
            };

            const pdf = await loadingTask.promise;

            let fullText = '';
            const totalPages = pdf.numPages;
            setStatusText(`Scanning ${totalPages} pages...`);

            // 2. Extract Text Page by Page
            for (let i = 1; i <= totalPages; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Simple text extraction logic - create separate lines based on transform Y
                    // Ideally we'd do advanced sorting, but simplistic join is okay for MVP reading
                    const pageText = textContent.items
                        .map(item => item.str)
                        .filter(str => str.trim().length > 0) // Remove empty strings
                        .join(' ');

                    fullText += pageText + '\n\n';

                    // Update Progress (20% -> 80%)
                    const percent = 20 + Math.round((i / totalPages) * 60);
                    setProgress(percent);
                    setStatusText(`Extracting page ${i} of ${totalPages}...`);
                } catch (pageErr) {
                    console.warn(`Skipping page ${i} due to error`, pageErr);
                }
            }

            if (fullText.trim().length === 0) {
                throw new Error("No text found. This might be a scanned image PDF.");
            }

            setExtractedText(fullText);

            // 3. Generate PDF
            setStatusText("Reconstructing PDF with accessibility rules...");
            setProgress(90);

            // Give UI a moment to update before blocking main thread with generation
            setTimeout(() => {
                generateAccessiblePdf(fullText);
                setIsProcessing(false);
                setProgress(100);
            }, 500);

        } catch (error) {
            console.error("Error processing PDF:", error);
            setError(error.message || "Failed to process PDF.");
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const generateAccessiblePdf = (text) => {
        try {
            const condition = conditions.find(c => c.id === selectedCondition);
            const settings = condition.settings;

            // Create new PDF
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            // Larger margins for ADHD/Dyslexia to reduce clutter
            const margin = selectedCondition === 'adhd' ? 30 : 20;
            const maxLineWidth = pageWidth - (margin * 2);

            // Apply background
            doc.setFillColor(settings.bg);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            // Font settings
            // Note: jsPDF default fonts are limited.
            // Helvetica = Sans Serif (cleaner for Dyslexia)
            // Times = Serif (avoid for Dyslexia)
            // Courier = Monospace (good for coding but maybe not reading flow)

            let fontName = 'helvetica';
            if (selectedCondition === 'vision') fontName = 'times'; // Serif can be softer for some vision stress
            if (selectedCondition === 'adhd') fontName = 'helvetica'; // Clean sans-serif

            doc.setFont(fontName, "normal");
            doc.setFontSize(settings.size);
            doc.setTextColor(settings.text);

            // Apply Character Spacing (Kerning)
            // jsPDF allows setting extra space between characters
            if (settings.letterSpacing) {
                doc.setCharSpace(settings.letterSpacing);
            } else {
                doc.setCharSpace(0);
            }

            // Clean text
            const cleanText = text.replace(/[^\x20-\x7E\n]/g, ''); // Remove non-printable chars

            // Split into lines
            const lines = doc.splitTextToSize(cleanText, maxLineWidth);

            let cursorY = margin + 10;
            // Calculating line height in mm
            // 1pt = 0.352778mm
            // Line Height = FontSize (pt) * Factor * Conversion
            const lineHeight = settings.size * settings.lineSpacing * 0.3528;

            lines.forEach((line, index) => {
                // Check if we need new page
                if (cursorY + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    doc.setFillColor(settings.bg); // Re-apply background
                    doc.rect(0, 0, pageWidth, pageHeight, 'F');
                    cursorY = margin + 10;

                    // Reset font settings after new page just in case
                    doc.setFont(fontName, "normal");
                    doc.setFontSize(settings.size);
                    doc.setTextColor(settings.text);
                    if (settings.letterSpacing) doc.setCharSpace(settings.letterSpacing);
                }

                doc.text(line, margin, cursorY);
                cursorY += lineHeight;
            });

            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setDownloadUrl(url);

        } catch (err) {
            console.error("Generation Error:", err);
            setError("Failed to generate PDF file.");
            setIsProcessing(false);
        }
    };

    // Re-generate if condition changes
    useEffect(() => {
        if (extractedText && !isProcessing) {
            generateAccessiblePdf(extractedText);
        }
    }, [selectedCondition]);


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-gray-100 font-sans transition-colors duration-300">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <FileText className="text-teal-600 dark:text-teal-400" />
                            <h1 className="font-bold text-lg">Adaptive PDF Reader</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">

                {/* File Upload Section */}
                <section className="text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400">
                        Transform PDFs for Your Eyes
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Upload a document and our system will reconstruct it with accessibility-first formatting designed for Dyslexia, ADHD, and Vision Stress.
                    </p>

                    <div className="relative group max-w-xl mx-auto">
                        <div className={`
                            border-2 border-dashed rounded-3xl p-10 transition-all duration-300
                            ${file ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'border-gray-300 dark:border-slate-700 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-slate-900/50'}
                        `}>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-full ${file ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                    {file ? <Check size={32} /> : <Upload size={32} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-lg">
                                        {file ? file.name : "Click or Drag PDF here"}
                                    </p>
                                    {!file && <p className="text-sm text-gray-500">Supports PDF files up to 10MB</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center justify-center gap-3 max-w-xl mx-auto border border-red-100 dark:border-red-900/50"
                    >
                        <XCircle size={20} />
                        <p>{error}</p>
                    </motion.div>
                )}

                {/* Condition Selection */}
                {file && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Select Optimization Mode</h3>
                            <p className="text-gray-500 text-sm">Choose the profile that best fits your needs.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {conditions.map((condition) => (
                                <div
                                    key={condition.id}
                                    onClick={() => setSelectedCondition(condition.id)}
                                    className={`
                                        relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200
                                        ${selectedCondition === condition.id ? `border-teal-500 shadow-xl scale-[1.02] ${condition.color}` : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300'}
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${selectedCondition === condition.id ? 'bg-white/80' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                        <condition.icon size={20} className="text-gray-700 dark:text-gray-300" />
                                    </div>
                                    <h4 className="font-bold mb-2">{condition.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{condition.description}</p>

                                    {selectedCondition === condition.id && (
                                        <div className="absolute top-4 right-4 text-teal-600">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar & Actions */}
                        <div className="flex flex-col items-center gap-6 pt-4">
                            {isProcessing && (
                                <div className="w-full max-w-md space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                                        <span>{statusText}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-teal-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {!downloadUrl && !isProcessing && (
                                <button
                                    onClick={processPdf}
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Zap className="fill-current" /> Transform PDF
                                </button>
                            )}
                        </div>
                    </motion.section>
                )}

                {/* Preview & Download */}
                {downloadUrl && (
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                    <Check size={14} /> Ready for Download
                                </div>
                                <h3 className="text-3xl font-bold">Your Optimized PDF is Ready</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We've processed your document using the <strong>{conditions.find(c => c.id === selectedCondition)?.title}</strong> profile.
                                    The layout has been simplified, fonts adjusted, and contrast optimized for easier reading.
                                </p>
                                <a
                                    href={downloadUrl}
                                    download={`optimized-${selectedCondition}-${file.name}`}
                                    className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-teal-500/20"
                                >
                                    <Download size={24} />
                                    Download PDF
                                </a>

                                <button
                                    onClick={() => setFile(null)}
                                    className="block text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-4"
                                >
                                    Process another file
                                </button>
                            </div>

                            {/* Live Preview Card */}
                            <div className="relative aspect-[3/4] rounded-xl shadow-inner overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                {/* Simulating the PDF look with HTML/CSS for preview */}
                                <div
                                    className="absolute inset-4 shadow-xl overflow-hidden bg-white"
                                    style={{
                                        backgroundColor: conditions.find(c => c.id === selectedCondition)?.settings.bg,
                                        color: conditions.find(c => c.id === selectedCondition)?.settings.text,
                                    }}
                                >
                                    <div
                                        className="p-6 text-[10px] leading-relaxed"
                                        style={{
                                            fontFamily: conditions.find(c => c.id === selectedCondition)?.settings.font,
                                            lineHeight: conditions.find(c => c.id === selectedCondition)?.settings.lineSpacing,
                                            letterSpacing: `${conditions.find(c => c.id === selectedCondition)?.settings.letterSpacing}em`,
                                        }}
                                    >
                                        <h4 className="font-bold mb-4 text-sm border-b border-gray-300/50 pb-2">PREVIEW</h4>
                                        {extractedText.slice(0, 1200)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

            </main>
        </div>
    );
};

export default AdaptivePdfReader;
