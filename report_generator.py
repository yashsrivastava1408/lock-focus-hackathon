"""
Report Generation Module for PeriQuest
Generates comprehensive session reports with visualizations, charts, and analysis
"""

import os
import json
import csv
from datetime import datetime
from typing import Dict, List, Any, Optional
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.patches import Rectangle
from matplotlib.backends.backend_pdf import PdfPages
import pandas as pd

class ReportGenerator:
    """Generates comprehensive reports for therapy sessions"""
    
    def __init__(self, output_dir: str = "reports"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Set style for plots
        sns.set_style("darkgrid")
        plt.rcParams['figure.figsize'] = (12, 8)
        plt.rcParams['font.size'] = 10
        
    def generate_session_report(self, session_data: Dict[str, Any], 
                                eye_tracking_data: Optional[List] = None,
                                format: str = 'pdf') -> str:
        """
        Generate comprehensive session report
        format: 'pdf', 'html', or 'both'
        """
        session_id = session_data.get('session_id', 'unknown')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        report_files = []
        
        report_files = []
        
        if format in ['pdf', 'both']:
            pdf_path = self.export_pdf(session_data, eye_tracking_data, session_id, timestamp)
            report_files.append(pdf_path)
            
        if format in ['html', 'both']:
            html_path = self._generate_html_report(session_data, eye_tracking_data, session_id, timestamp)
            report_files.append(html_path)
        
        # Also generate CSV data
        csv_path = self.export_excel(session_data, session_id, timestamp)
        report_files.append(csv_path)
        
        return report_files
    
    def export_pdf(self, session_data: Dict, eye_data: Optional[List], 
                            session_id: str, timestamp: str) -> str:
        """Generate PDF report with visualizations"""
        pdf_filename = os.path.join(self.output_dir, f"report_{session_id}_{timestamp}.pdf")
        
        with PdfPages(pdf_filename) as pdf:
            # Page 1: Session Summary
            self._create_summary_page(pdf, session_data)
            
            # Page 2: Performance Metrics
            self._create_performance_page(pdf, session_data)
            
            # Page 3: Visual Field Analysis
            self._create_visual_field_page(pdf, session_data)
            
            # Page 4: Reaction Time Analysis
            self._create_reaction_time_page(pdf, session_data)
            
            # Page 5: Eye Tracking Analysis (if available)
            if eye_data:
                self._create_eye_tracking_page(pdf, eye_data, session_data)
            
            # Page 6: Progress Over Time (if multiple sessions)
            # This would compare with previous sessions
            
            # Add metadata
            d = pdf.infodict()
            d['Title'] = f'PeriQuest Session Report - {session_id}'
            d['Author'] = 'PeriQuest Therapy System'
            d['Subject'] = 'Peripheral Vision Therapy Session Analysis'
            d['CreationDate'] = datetime.now()
        
        print(f"✓ PDF report generated: {pdf_filename}")
        return pdf_filename
    
    def _create_summary_page(self, pdf: PdfPages, data: Dict):
        """Create session summary page"""
        fig, ax = plt.subplots(figsize=(11, 8.5))
        ax.axis('off')
        
        # Title
        title_text = "PeriQuest Therapy Session Report"
        ax.text(0.5, 0.95, title_text, ha='center', va='top', 
                fontsize=24, fontweight='bold', color='#2c3e50')
        
        # Session Info
        info_y = 0.85
        session_info = [
            f"Patient ID: {data.get('patient_id', 'N/A')}",
            f"Session ID: {data.get('session_id', 'N/A')}",
            f"Date: {data.get('start_time', 'N/A')[:10]}",
            f"Duration: {self._format_duration(data)}",
        ]
        
        for info in session_info:
            ax.text(0.1, info_y, info, fontsize=12, color='#34495e')
            info_y -= 0.05
        
        # Key Metrics Box
        metrics_y = 0.60
        ax.add_patch(Rectangle((0.1, metrics_y - 0.25), 0.8, 0.25, 
                               fill=True, facecolor='#ecf0f1', edgecolor='#3498db', linewidth=2))
        
        ax.text(0.5, metrics_y + 0.02, "Key Performance Metrics", 
                ha='center', fontsize=16, fontweight='bold', color='#2c3e50')
        
        # Metrics in columns
        col1_x, col2_x = 0.15, 0.55
        metrics_y -= 0.05
        
        metrics = [
            (f"Final Level: {data.get('level', 'N/A')}", 
             f"Total Score: {data.get('score', 0)}"),
            (f"Accuracy: {data.get('accuracy_percentage', 0):.1f}%", 
             f"Avg Reaction Time: {data.get('average_reaction_time_ms', 0):.0f}ms"),
            (f"Total Stimuli: {data.get('total_stimuli', 0)}", 
             f"Correct Reactions: {data.get('correct_reactions', 0)}"),
            (f"Missed Stimuli: {data.get('missed_stimuli', 0)}", 
             f"False Positives: {data.get('false_positives', 0)}"),
        ]
        
        for metric1, metric2 in metrics:
            ax.text(col1_x, metrics_y, metric1, fontsize=11, color='#2c3e50')
            ax.text(col2_x, metrics_y, metric2, fontsize=11, color='#2c3e50')
            metrics_y -= 0.04
        
        # Side Bias Info
        side_bias = data.get('side_bias', {})
        bias_y = 0.25
        ax.text(0.1, bias_y, "Visual Field Analysis:", fontsize=14, fontweight='bold', color='#2c3e50')
        bias_y -= 0.05
        
        weaker_side = side_bias.get('weaker_side', 'N/A').upper()
        bias_pct = abs(side_bias.get('bias_percentage', 0))
        
        ax.text(0.1, bias_y, f"Weaker Side: {weaker_side} ({bias_pct:.1f}% bias)", 
                fontsize=11, color='#e74c3c' if bias_pct > 20 else '#27ae60')
        bias_y -= 0.04
        
        ax.text(0.1, bias_y, f"Left Accuracy: {side_bias.get('left_accuracy', 0):.1f}%", 
                fontsize=11, color='#34495e')
        bias_y -= 0.04
        
        ax.text(0.1, bias_y, f"Right Accuracy: {side_bias.get('right_accuracy', 0):.1f}%", 
                fontsize=11, color='#34495e')
        
        # Head Movement Info
        head_y = 0.10
        ax.text(0.1, head_y, "Head Movement Tracking:", fontsize=14, fontweight='bold', color='#2c3e50')
        head_y -= 0.05
        
        ax.text(0.1, head_y, f"Head Movements: {data.get('head_movements', 0)}", 
                fontsize=11, color='#34495e')
        head_y -= 0.04
        
        ax.text(0.1, head_y, f"Fixation Breaks: {data.get('fixation_breaks', 0)}", 
                fontsize=11, color='#34495e')
        
        pdf.savefig(fig, bbox_inches='tight')
        plt.close()
    
    def _create_performance_page(self, pdf: PdfPages, data: Dict):
        """Create performance metrics visualization page"""
        fig = plt.figure(figsize=(11, 8.5))
        
        # Create grid
        gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.3)
        
        # 1. Accuracy Gauge
        ax1 = fig.add_subplot(gs[0, 0])
        self._plot_gauge(ax1, data.get('accuracy_percentage', 0), 
                        "Accuracy", "%", [0, 50, 75, 90, 100])
        
        # 2. Reaction Time Gauge
        ax2 = fig.add_subplot(gs[0, 1])
        avg_rt = data.get('average_reaction_time_ms', 0)
        self._plot_gauge(ax2, min(avg_rt, 2000), "Avg Reaction Time", "ms", 
                        [0, 500, 1000, 1500, 2000], reverse=True)
        
        # 3. Score Progress Bar
        ax3 = fig.add_subplot(gs[1, :])
        score = data.get('score', 0)
        max_score = data.get('total_stimuli', 1) * 100  # Assuming max 100 per stimulus
        self._plot_score_bar(ax3, score, max_score)
        
        # 4. Stimuli Breakdown Pie Chart
        ax4 = fig.add_subplot(gs[2, 0])
        self._plot_stimuli_breakdown(ax4, data)
        
        # 5. Performance Rating
        ax5 = fig.add_subplot(gs[2, 1])
        self._plot_performance_rating(ax5, data)
        
        fig.suptitle('Performance Metrics Overview', fontsize=16, fontweight='bold', y=0.98)
        
        pdf.savefig(fig, bbox_inches='tight')
        plt.close()
    
    def _create_visual_field_page(self, pdf: PdfPages, data: Dict):
        """Create visual field performance analysis page"""
        fig = plt.figure(figsize=(11, 8.5))
        gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.3)
        
        field_performance = data.get('field_performance', {})
        
        # 1. Visual Field Heatmap
        ax1 = fig.add_subplot(gs[0, :])
        self._plot_visual_field_heatmap(ax1, field_performance)
        
        # 2. Field Accuracy Comparison
        ax2 = fig.add_subplot(gs[1, 0])
        self._plot_field_accuracy(ax2, field_performance)
        
        # 3. Field Reaction Times
        ax3 = fig.add_subplot(gs[1, 1])
        self._plot_field_reaction_times(ax3, field_performance)
        
        fig.suptitle('Visual Field Performance Analysis', fontsize=16, fontweight='bold', y=0.98)
        
        pdf.savefig(fig, bbox_inches='tight')
        plt.close()
    
    def _create_reaction_time_page(self, pdf: PdfPages, data: Dict):
        """Create reaction time analysis page"""
        fig = plt.figure(figsize=(11, 8.5))
        gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.3)
        
        reaction_times = data.get('reaction_times', [])
        
        if not reaction_times:
            ax = fig.add_subplot(gs[:, :])
            ax.text(0.5, 0.5, 'No reaction time data available', 
                   ha='center', va='center', fontsize=14)
            ax.axis('off')
        else:
            # 1. Reaction Time Distribution
            ax1 = fig.add_subplot(gs[0, :])
            self._plot_rt_distribution(ax1, reaction_times)
            
            # 2. Reaction Time Over Time
            ax2 = fig.add_subplot(gs[1, 0])
            self._plot_rt_over_time(ax2, reaction_times)
            
            # 3. Reaction Time Statistics
            ax3 = fig.add_subplot(gs[1, 1])
            self._plot_rt_statistics(ax3, reaction_times)
        
        fig.suptitle('Reaction Time Analysis', fontsize=16, fontweight='bold', y=0.98)
        
        pdf.savefig(fig, bbox_inches='tight')
        plt.close()
    
    def _create_eye_tracking_page(self, pdf: PdfPages, eye_data: List, session_data: Dict):
        """Create eye tracking analysis page"""
        fig = plt.figure(figsize=(11, 8.5))
        gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.3)
        
        # 1. Gaze Heatmap
        ax1 = fig.add_subplot(gs[0, :])
        self._plot_gaze_heatmap(ax1, eye_data)
        
        # 2. Fixation Stability
        ax2 = fig.add_subplot(gs[1, 0])
        self._plot_fixation_stability(ax2, eye_data)
        
        # 3. Eye Tracking Statistics
        ax3 = fig.add_subplot(gs[1, 1])
        self._plot_eye_statistics(ax3, eye_data)
        
        fig.suptitle('Eye Tracking Analysis', fontsize=16, fontweight='bold', y=0.98)
        
        pdf.savefig(fig, bbox_inches='tight')
        plt.close()
    
    # Plotting helper methods
    
    def _plot_gauge(self, ax, value, title, unit, thresholds, reverse=False):
        """Plot a gauge chart"""
        ax.axis('off')
        
        # Determine color based on thresholds
        if reverse:
            if value <= thresholds[1]:
                color = '#27ae60'
            elif value <= thresholds[2]:
                color = '#f39c12'
            else:
                color = '#e74c3c'
        else:
            if value >= thresholds[3]:
                color = '#27ae60'
            elif value >= thresholds[2]:
                color = '#f39c12'
            else:
                color = '#e74c3c'
        
        # Draw gauge
        theta = np.linspace(0, np.pi, 100)
        r = 1
        x = r * np.cos(theta)
        y = r * np.sin(theta)
        
        ax.plot(x, y, 'k-', linewidth=2)
        ax.fill_between(x, 0, y, alpha=0.1, color='gray')
        
        # Draw value indicator
        max_val = thresholds[-1]
        angle = np.pi * (1 - value / max_val)
        ax.plot([0, np.cos(angle)], [0, np.sin(angle)], 
               color=color, linewidth=4, marker='o', markersize=10)
        
        # Add text
        ax.text(0, -0.3, f"{value:.1f}{unit}", ha='center', fontsize=16, fontweight='bold')
        ax.text(0, 1.2, title, ha='center', fontsize=12, fontweight='bold')
        
        ax.set_xlim(-1.5, 1.5)
        ax.set_ylim(-0.5, 1.5)
        ax.set_aspect('equal')
    
    def _plot_score_bar(self, ax, score, max_score):
        """Plot score progress bar"""
        percentage = (score / max_score * 100) if max_score > 0 else 0
        
        ax.barh([0], [percentage], color='#3498db', height=0.5)
        ax.barh([0], [100 - percentage], left=[percentage], color='#ecf0f1', height=0.5)
        
        ax.text(50, 0, f"Score: {score} / {max_score} ({percentage:.1f}%)", 
               ha='center', va='center', fontsize=14, fontweight='bold', color='white')
        
        ax.set_xlim(0, 100)
        ax.set_ylim(-0.5, 0.5)
        ax.axis('off')
        ax.set_title('Total Score Progress', fontsize=12, fontweight='bold', pad=10)
    
    def _plot_stimuli_breakdown(self, ax, data):
        """Plot stimuli breakdown pie chart"""
        correct = data.get('correct_reactions', 0)
        missed = data.get('missed_stimuli', 0)
        false_pos = data.get('false_positives', 0)
        
        sizes = [correct, missed, false_pos]
        labels = ['Correct', 'Missed', 'False Positives']
        colors = ['#27ae60', '#e74c3c', '#f39c12']
        explode = (0.05, 0.05, 0.05)
        
        if sum(sizes) > 0:
            ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%',
                  explode=explode, startangle=90, textprops={'fontsize': 10})
            ax.set_title('Stimuli Response Breakdown', fontsize=12, fontweight='bold')
        else:
            ax.text(0.5, 0.5, 'No data', ha='center', va='center')
            ax.axis('off')
    
    def _plot_performance_rating(self, ax, data):
        """Plot overall performance rating"""
        ax.axis('off')
        
        accuracy = data.get('accuracy_percentage', 0)
        avg_rt = data.get('average_reaction_time_ms', 2000)
        
        # Calculate rating (0-5 stars)
        accuracy_score = accuracy / 20  # 0-5
        rt_score = max(0, 5 - (avg_rt / 400))  # 0-5, lower RT is better
        overall_rating = (accuracy_score + rt_score) / 2
        
        # Determine performance level
        if overall_rating >= 4.5:
            level = "EXCELLENT"
            color = '#27ae60'
        elif overall_rating >= 3.5:
            level = "GOOD"
            color = '#3498db'
        elif overall_rating >= 2.5:
            level = "FAIR"
            color = '#f39c12'
        else:
            level = "NEEDS IMPROVEMENT"
            color = '#e74c3c'
        
        # Draw stars
        star_y = 0.6
        for i in range(5):
            star_x = 0.2 + i * 0.15
            if i < int(overall_rating):
                ax.text(star_x, star_y, '★', fontsize=30, color=color, ha='center')
            else:
                ax.text(star_x, star_y, '☆', fontsize=30, color='gray', ha='center')
        
        ax.text(0.5, 0.3, level, ha='center', fontsize=16, fontweight='bold', color=color)
        ax.text(0.5, 0.1, f"Rating: {overall_rating:.1f}/5.0", ha='center', fontsize=12)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_title('Overall Performance Rating', fontsize=12, fontweight='bold')
    
    def _plot_visual_field_heatmap(self, ax, field_performance):
        """Plot visual field performance heatmap"""
        # Create 3x3 grid for visual fields
        fields = ['top_left', 'top', 'top_right', 
                 'left', 'center', 'right',
                 'bottom_left', 'bottom', 'bottom_right']
        
        grid = np.zeros((3, 3))
        
        for i, field in enumerate(fields):
            row, col = i // 3, i % 3
            if field in field_performance:
                stats = field_performance[field]
                total = stats.get('total', 0)
                correct = stats.get('correct', 0)
                accuracy = (correct / total * 100) if total > 0 else 0
                grid[row, col] = accuracy
        
        im = ax.imshow(grid, cmap='RdYlGn', vmin=0, vmax=100, aspect='auto')
        
        # Add text annotations
        for i in range(3):
            for j in range(3):
                text = ax.text(j, i, f'{grid[i, j]:.0f}%',
                             ha='center', va='center', color='black', fontsize=12, fontweight='bold')
        
        ax.set_xticks([0, 1, 2])
        ax.set_yticks([0, 1, 2])
        ax.set_xticklabels(['Left', 'Center', 'Right'])
        ax.set_yticklabels(['Top', 'Middle', 'Bottom'])
        ax.set_title('Visual Field Accuracy Heatmap', fontsize=12, fontweight='bold', pad=10)
        
        plt.colorbar(im, ax=ax, label='Accuracy (%)')
    
    def _plot_field_accuracy(self, ax, field_performance):
        """Plot field accuracy bar chart"""
        fields = []
        accuracies = []
        
        for field, stats in field_performance.items():
            total = stats.get('total', 0)
            if total > 0:
                correct = stats.get('correct', 0)
                accuracy = (correct / total) * 100
                fields.append(field.replace('_', ' ').title())
                accuracies.append(accuracy)
        
        if fields:
            colors = ['#27ae60' if acc >= 75 else '#f39c12' if acc >= 50 else '#e74c3c' 
                     for acc in accuracies]
            
            ax.barh(fields, accuracies, color=colors)
            ax.set_xlabel('Accuracy (%)', fontsize=10)
            ax.set_title('Accuracy by Visual Field', fontsize=12, fontweight='bold')
            ax.set_xlim(0, 100)
            
            for i, v in enumerate(accuracies):
                ax.text(v + 2, i, f'{v:.1f}%', va='center', fontsize=9)
        else:
            ax.text(0.5, 0.5, 'No data', ha='center', va='center', transform=ax.transAxes)
            ax.axis('off')
    
    def _plot_field_reaction_times(self, ax, field_performance):
        """Plot average reaction times by field"""
        fields = []
        rts = []
        
        for field, stats in field_performance.items():
            avg_rt = stats.get('avg_rt', 0)
            if avg_rt > 0:
                fields.append(field.replace('_', ' ').title())
                rts.append(avg_rt)
        
        if fields:
            colors = ['#27ae60' if rt <= 500 else '#f39c12' if rt <= 1000 else '#e74c3c' 
                     for rt in rts]
            
            ax.barh(fields, rts, color=colors)
            ax.set_xlabel('Reaction Time (ms)', fontsize=10)
            ax.set_title('Avg Reaction Time by Field', fontsize=12, fontweight='bold')
            
            for i, v in enumerate(rts):
                ax.text(v + 20, i, f'{v:.0f}ms', va='center', fontsize=9)
        else:
            ax.text(0.5, 0.5, 'No data', ha='center', va='center', transform=ax.transAxes)
            ax.axis('off')
    
    def _plot_rt_distribution(self, ax, reaction_times):
        """Plot reaction time distribution histogram"""
        if reaction_times:
            ax.hist(reaction_times, bins=20, color='#3498db', edgecolor='black', alpha=0.7)
            ax.axvline(np.mean(reaction_times), color='#e74c3c', linestyle='--', 
                      linewidth=2, label=f'Mean: {np.mean(reaction_times):.0f}ms')
            ax.axvline(np.median(reaction_times), color='#27ae60', linestyle='--', 
                      linewidth=2, label=f'Median: {np.median(reaction_times):.0f}ms')
            
            ax.set_xlabel('Reaction Time (ms)', fontsize=10)
            ax.set_ylabel('Frequency', fontsize=10)
            ax.set_title('Reaction Time Distribution', fontsize=12, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
    
    def _plot_rt_over_time(self, ax, reaction_times):
        """Plot reaction time progression over session"""
        if reaction_times:
            trials = list(range(1, len(reaction_times) + 1))
            ax.plot(trials, reaction_times, marker='o', markersize=4, 
                   color='#3498db', linewidth=1, alpha=0.7)
            
            # Add trend line
            z = np.polyfit(trials, reaction_times, 1)
            p = np.poly1d(z)
            ax.plot(trials, p(trials), "r--", linewidth=2, alpha=0.8, label='Trend')
            
            ax.set_xlabel('Trial Number', fontsize=10)
            ax.set_ylabel('Reaction Time (ms)', fontsize=10)
            ax.set_title('Reaction Time Over Session', fontsize=12, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
    
    def _plot_rt_statistics(self, ax, reaction_times):
        """Plot reaction time statistics box"""
        ax.axis('off')
        
        if reaction_times:
            stats = {
                'Mean': np.mean(reaction_times),
                'Median': np.median(reaction_times),
                'Std Dev': np.std(reaction_times),
                'Min': np.min(reaction_times),
                'Max': np.max(reaction_times),
                'Q1': np.percentile(reaction_times, 25),
                'Q3': np.percentile(reaction_times, 75)
            }
            
            y_pos = 0.9
            ax.text(0.5, y_pos, 'Reaction Time Statistics', 
                   ha='center', fontsize=12, fontweight='bold')
            y_pos -= 0.15
            
            for label, value in stats.items():
                ax.text(0.2, y_pos, f'{label}:', fontsize=10, fontweight='bold')
                ax.text(0.7, y_pos, f'{value:.1f} ms', fontsize=10)
                y_pos -= 0.12
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
    
    def _plot_gaze_heatmap(self, ax, eye_data):
        """Plot gaze point heatmap"""
        gaze_points = [d.gaze_point for d in eye_data if hasattr(d, 'gaze_point') and d.gaze_point]
        
        if gaze_points:
            x_coords = [p[0] for p in gaze_points]
            y_coords = [1 - p[1] for p in gaze_points]  # Flip Y for display
            
            # Create 2D histogram
            heatmap, xedges, yedges = np.histogram2d(x_coords, y_coords, bins=50, 
                                                     range=[[0, 1], [0, 1]])
            
            extent = [xedges[0], xedges[-1], yedges[0], yedges[-1]]
            im = ax.imshow(heatmap.T, extent=extent, origin='lower', cmap='hot', 
                          interpolation='gaussian', aspect='auto')
            
            # Add center fixation point
            ax.plot(0.5, 0.5, 'g+', markersize=20, markeredgewidth=3, label='Center Fixation')
            
            ax.set_xlabel('Horizontal Position', fontsize=10)
            ax.set_ylabel('Vertical Position', fontsize=10)
            ax.set_title('Gaze Point Heatmap', fontsize=12, fontweight='bold')
            ax.legend()
            plt.colorbar(im, ax=ax, label='Gaze Density')
        else:
            ax.text(0.5, 0.5, 'No gaze data available', ha='center', va='center')
            ax.axis('off')
    
    def _plot_fixation_stability(self, ax, eye_data):
        """Plot fixation stability over time"""
        fixation_data = [d.is_fixating for d in eye_data if hasattr(d, 'is_fixating')]
        
        if fixation_data:
            # Calculate rolling fixation percentage
            window_size = 30
            fixation_pct = []
            
            for i in range(len(fixation_data)):
                start = max(0, i - window_size)
                window = fixation_data[start:i+1]
                pct = sum(window) / len(window) * 100
                fixation_pct.append(pct)
            
            ax.plot(fixation_pct, color='#3498db', linewidth=2)
            ax.axhline(y=80, color='#27ae60', linestyle='--', label='Good (80%)')
            ax.axhline(y=50, color='#f39c12', linestyle='--', label='Fair (50%)')
            
            ax.set_xlabel('Frame', fontsize=10)
            ax.set_ylabel('Fixation Stability (%)', fontsize=10)
            ax.set_title('Fixation Stability Over Time', fontsize=12, fontweight='bold')
            ax.set_ylim(0, 100)
            ax.legend()
            ax.grid(True, alpha=0.3)
        else:
            ax.text(0.5, 0.5, 'No fixation data', ha='center', va='center')
            ax.axis('off')
    
    def _plot_eye_statistics(self, ax, eye_data):
        """Plot eye tracking statistics"""
        ax.axis('off')
        
        # Calculate statistics
        blinks = sum(1 for d in eye_data if hasattr(d, 'blink_detected') and d.blink_detected)
        total_frames = len(eye_data)
        
        if total_frames > 0:
            duration = eye_data[-1].timestamp - eye_data[0].timestamp if len(eye_data) > 1 else 1
            blink_rate = (blinks / duration) * 60  # blinks per minute
            
            fixation_frames = sum(1 for d in eye_data if hasattr(d, 'is_fixating') and d.is_fixating)
            fixation_pct = (fixation_frames / total_frames) * 100
            
            stats_text = [
                "Eye Tracking Statistics",
                "",
                f"Total Frames: {total_frames}",
                f"Duration: {duration:.1f}s",
                f"Blink Rate: {blink_rate:.1f} blinks/min",
                f"Total Blinks: {blinks}",
                f"Fixation: {fixation_pct:.1f}%",
            ]
            
            y_pos = 0.9
            for i, text in enumerate(stats_text):
                if i == 0:
                    ax.text(0.5, y_pos, text, ha='center', fontsize=12, fontweight='bold')
                else:
                    ax.text(0.5, y_pos, text, ha='center', fontsize=10)
                y_pos -= 0.12
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
    
    def _generate_html_report(self, session_data: Dict, eye_data: Optional[List],
                             session_id: str, timestamp: str) -> str:
        """Generate HTML report"""
        html_filename = os.path.join(self.output_dir, f"report_{session_id}_{timestamp}.html")
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PeriQuest Session Report - {session_id}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }}
        .container {{
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }}
        h1 {{
            color: #2c3e50;
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
        }}
        .section {{
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #3498db;
        }}
        .metric {{
            display: inline-block;
            margin: 10px 20px;
            padding: 15px 25px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .metric-label {{
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
        }}
        .metric-value {{
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }}
        .good {{ color: #27ae60; }}
        .warning {{ color: #f39c12; }}
        .bad {{ color: #e74c3c; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{
            background: #3498db;
            color: white;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            color: #7f8c8d;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 PeriQuest Therapy Session Report</h1>
        
        <div class="section">
            <h2>Session Information</h2>
            <div class="metric">
                <div class="metric-label">Patient ID</div>
                <div class="metric-value">{session_data.get('patient_id', 'N/A')}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Session ID</div>
                <div class="metric-value">{session_data.get('session_id', 'N/A')}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Date</div>
                <div class="metric-value">{session_data.get('start_time', 'N/A')[:10]}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Performance Metrics</h2>
            <div class="metric">
                <div class="metric-label">Accuracy</div>
                <div class="metric-value {self._get_accuracy_class(session_data.get('accuracy_percentage', 0))}">{session_data.get('accuracy_percentage', 0):.1f}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Avg Reaction Time</div>
                <div class="metric-value {self._get_rt_class(session_data.get('average_reaction_time_ms', 0))}">{session_data.get('average_reaction_time_ms', 0):.0f}ms</div>
            </div>
            <div class="metric">
                <div class="metric-label">Total Score</div>
                <div class="metric-value">{session_data.get('score', 0)}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Final Level</div>
                <div class="metric-value">{session_data.get('level', 'N/A')}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Detailed Statistics</h2>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Total Stimuli</td>
                    <td>{session_data.get('total_stimuli', 0)}</td>
                </tr>
                <tr>
                    <td>Correct Reactions</td>
                    <td>{session_data.get('correct_reactions', 0)}</td>
                </tr>
                <tr>
                    <td>Missed Stimuli</td>
                    <td>{session_data.get('missed_stimuli', 0)}</td>
                </tr>
                <tr>
                    <td>False Positives</td>
                    <td>{session_data.get('false_positives', 0)}</td>
                </tr>
                <tr>
                    <td>Head Movements</td>
                    <td>{session_data.get('head_movements', 0)}</td>
                </tr>
                <tr>
                    <td>Fixation Breaks</td>
                    <td>{session_data.get('fixation_breaks', 0)}</td>
                </tr>
            </table>
        </div>
        
        <div class="footer">
            <p>Generated by PeriQuest Therapy System</p>
            <p>{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
    </div>
</body>
</html>
"""
        
        with open(html_filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✓ HTML report generated: {html_filename}")
        return html_filename
    
    def export_excel(self, session_data: Dict, session_id: str, timestamp: str) -> str:
        """Export session data to CSV (Excel compatible)"""
        csv_filename = os.path.join(self.output_dir, f"session_data_{session_id}_{timestamp}.csv")
        
        # Flatten the data
        flat_data = {}
        for key, value in session_data.items():
            if isinstance(value, (dict, list)):
                flat_data[key] = json.dumps(value)
            else:
                flat_data[key] = value
        
        # Write to CSV
        with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=flat_data.keys())
            writer.writeheader()
            writer.writerow(flat_data)
        
        print(f"✓ CSV data exported: {csv_filename}")
        return csv_filename
    
    # Helper methods
    
    def _format_duration(self, data: Dict) -> str:
        """Format session duration"""
        try:
            start = datetime.fromisoformat(data.get('start_time', ''))
            end = datetime.fromisoformat(data.get('end_time', ''))
            duration = (end - start).total_seconds()
            minutes = int(duration // 60)
            seconds = int(duration % 60)
            return f"{minutes}m {seconds}s"
        except:
            return "N/A"
    
    def _get_accuracy_class(self, accuracy: float) -> str:
        """Get CSS class for accuracy"""
        if accuracy >= 75:
            return "good"
        elif accuracy >= 50:
            return "warning"
        else:
            return "bad"
    
    def _get_rt_class(self, rt: float) -> str:
        """Get CSS class for reaction time"""
        if rt <= 500:
            return "good"
        elif rt <= 1000:
            return "warning"
        else:
            return "bad"
