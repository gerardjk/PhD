import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-sonnet-4-20250514"  # Latest Claude model

# Task Configuration
TASKS_DIR = Path(__file__).parent / "tasks"
TASKS_DIR.mkdir(exist_ok=True)

# Agent Configuration
MAX_ITERATIONS = 100  # Maximum iterations before requiring manual continuation
CHECKPOINT_INTERVAL = 5  # Save progress every N iterations
