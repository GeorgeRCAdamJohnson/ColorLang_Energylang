# Energyland Benchmark Analytics Notebook: Quick Start Guide

## What is this?
This Jupyter notebook provides a robust, interactive environment for analyzing and visualizing benchmarking data from your Energyland knowledge base (PostgreSQL database). It is designed for:
- Data validation and integrity checks
- Exploratory data analysis
- Interactive and publication-quality visualizations
- Rapid iteration and sharing of insights

## How to Use
1. **Open the Notebook**
   - Launch JupyterLab or Jupyter Notebook in your project directory.
   - Open `energy_benchmark_analytics.ipynb`.

2. **Configure Database Connection**
   - In the cell labeled `Database Connection`, update the `DB_URL` variable with your actual PostgreSQL credentials if needed.
   - If you use a `.env` file with `DATABASE_URL`, the notebook will pick it up automatically.

3. **Run All Cells**
   - Use the `Run All` command or run each cell in order (Shift+Enter).
   - The notebook will load your data, check for issues, and display summary statistics and visualizations.

## What Can You Do With It?
- **Data Integrity Checks**: Instantly spot duplicates, missing links, or orphaned records in your sources, benchmarks, and results tables.
- **Summary Statistics**: Get a quick overview of your dataset (counts, distributions, etc.).
- **Visualizations**:
  - Box plots of throughput by language
  - Box plots of latency by toolchain
  - Interactive scatter plots (filter by language, compare throughput vs. latency)
- **Interactive Filtering**: Use dropdowns to filter and explore subsets of your data.
- **Custom Analysis**: Add your own queries, charts, or data transformations as needed.
- **Export**: Save summary tables or charts for reports or presentations.

## Extending the Notebook
- Add new cells for additional visualizations (e.g., energy consumption, power usage, trends over time).
- Integrate with Streamlit or Dash for a web dashboard.
- Connect to other data sources or export results to CSV/Excel.

## Requirements
- Python 3.x
- JupyterLab or Jupyter Notebook
- pandas, numpy, plotly, sqlalchemy, psycopg2, ipywidgets

## Support
If you need help customizing or extending the notebook, just ask your AI assistant!
