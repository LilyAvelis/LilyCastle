"""
User interface module for Collatz polynomial dynamics analysis.

Provides a simple CLI dashboard for running analyses and generating reports.
"""

import argparse
import sys
from helper_utils import log_message
from data_generation_grid import generate_and_save_data
from analysis_dynamics import analyze_degree
from control_checks import run_all_checks
from visualization_plots import create_visualizations


def run_data_generation(args):
    """Run data generation."""
    log_message("Starting data generation")
    generate_and_save_data(
        degree=args.degree,
        num_points=args.num_points,
        start_range=(args.start_min, args.start_max, args.num_starts),
        max_steps=args.max_steps,
        max_value=10**args.max_value_exp,
        output_prefix=args.output_prefix
    )
    log_message("Data generation complete")


def run_analysis(args):
    """Run analysis."""
    log_message("Starting analysis")
    results = analyze_degree(args.degree, args.data_prefix)
    log_message("Analysis complete")
    return results


def run_checks(args):
    """Run validation checks."""
    log_message("Starting validation checks")
    passed = run_all_checks(args.degree, args.data_prefix)
    if passed:
        log_message("All checks passed")
    else:
        log_message("Some checks failed", 'ERROR')
        sys.exit(1)


def run_visualization(args):
    """Run visualization."""
    log_message("Starting visualization")
    create_visualizations(args.degree, args.data_prefix, args.output_prefix)
    log_message("Visualization complete")


def run_full_pipeline(args):
    """Run the full analysis pipeline."""
    log_message("Starting full pipeline")

    # Generate data
    run_data_generation(args)

    # Run checks
    run_checks(args)

    # Analyze
    results = run_analysis(args)

    # Visualize
    run_visualization(args)

    log_message("Full pipeline complete")


def create_parser():
    """Create argument parser."""
    parser = argparse.ArgumentParser(description='Collatz Polynomial Dynamics Analyzer')

    parser.add_argument('--degree', type=int, default=1,
                       help='Polynomial degree (default: 1)')
    parser.add_argument('--data-prefix', type=str, default='data',
                       help='Prefix for data files (default: data)')
    parser.add_argument('--output-prefix', type=str, default='1graph',
                       help='Prefix for output files (default: 1graph)')

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Data generation
    gen_parser = subparsers.add_parser('generate', help='Generate data')
    gen_parser.add_argument('--num-points', type=int, default=50,
                           help='Number of grid points per coefficient (default: 50)')
    gen_parser.add_argument('--start-min', type=int, default=1,
                           help='Minimum starting number (default: 1)')
    gen_parser.add_argument('--start-max', type=int, default=1000,
                           help='Maximum starting number (default: 1000)')
    gen_parser.add_argument('--num-starts', type=int, default=100,
                           help='Number of starting numbers to sample (default: 100)')
    gen_parser.add_argument('--max-steps', type=int, default=1000,
                           help='Maximum steps per trajectory (default: 1000)')
    gen_parser.add_argument('--max-value-exp', type=int, default=18,
                           help='Maximum value exponent (10^exp) (default: 18)')

    # Analysis
    subparsers.add_parser('analyze', help='Run analysis')

    # Checks
    subparsers.add_parser('check', help='Run validation checks')

    # Visualization
    subparsers.add_parser('visualize', help='Create visualizations')

    # Full pipeline
    pipeline_parser = subparsers.add_parser('pipeline', help='Run full pipeline')
    pipeline_parser.add_argument('--num-points', type=int, default=20,
                                help='Number of grid points per coefficient (default: 20)')
    pipeline_parser.add_argument('--start-min', type=int, default=1)
    pipeline_parser.add_argument('--start-max', type=int, default=100)
    pipeline_parser.add_argument('--num-starts', type=int, default=50)
    pipeline_parser.add_argument('--max-steps', type=int, default=1000)
    pipeline_parser.add_argument('--max-value-exp', type=int, default=18)

    return parser


def main():
    """Main function."""
    parser = create_parser()
    args = parser.parse_args()

    if args.command == 'generate':
        run_data_generation(args)
    elif args.command == 'analyze':
        run_analysis(args)
    elif args.command == 'check':
        run_checks(args)
    elif args.command == 'visualize':
        run_visualization(args)
    elif args.command == 'pipeline':
        run_full_pipeline(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()