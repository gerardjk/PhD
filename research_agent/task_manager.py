import json
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
from config import TASKS_DIR


class TaskManager:
    """Manages task state, persistence, and resumption."""

    def __init__(self, task_id: str):
        self.task_id = task_id
        self.task_dir = TASKS_DIR / task_id
        self.task_dir.mkdir(parents=True, exist_ok=True)

        self.state_file = self.task_dir / "state.json"
        self.output_file = self.task_dir / "output.md"
        self.log_file = self.task_dir / "log.txt"

        self.state = self._load_state()

    def _load_state(self) -> Dict:
        """Load task state from disk or create new state."""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        else:
            return {
                "task_id": self.task_id,
                "created_at": datetime.now().isoformat(),
                "status": "initialized",
                "iteration": 0,
                "description": "",
                "subtasks": [],
                "completed_subtasks": [],
                "current_subtask": None,
                "results": [],
                "messages": []
            }

    def save_state(self):
        """Save current state to disk."""
        self.state["updated_at"] = datetime.now().isoformat()
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)

    def log(self, message: str):
        """Append message to log file."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_file, 'a') as f:
            f.write(f"[{timestamp}] {message}\n")

    def append_output(self, content: str):
        """Append content to output file."""
        with open(self.output_file, 'a') as f:
            f.write(content + "\n\n")

    def update_status(self, status: str):
        """Update task status."""
        self.state["status"] = status
        self.save_state()
        self.log(f"Status changed to: {status}")

    def add_subtask(self, subtask: str):
        """Add a subtask to the list."""
        self.state["subtasks"].append(subtask)
        self.save_state()

    def complete_subtask(self, subtask: str, result: str):
        """Mark subtask as completed and store result."""
        if subtask in self.state["subtasks"]:
            self.state["completed_subtasks"].append(subtask)
            self.state["results"].append({
                "subtask": subtask,
                "result": result,
                "completed_at": datetime.now().isoformat()
            })
            self.save_state()

    def increment_iteration(self):
        """Increment iteration counter."""
        self.state["iteration"] += 1
        self.save_state()

    def get_progress(self) -> Dict:
        """Get current progress summary."""
        total = len(self.state["subtasks"])
        completed = len(self.state["completed_subtasks"])
        return {
            "total_subtasks": total,
            "completed_subtasks": completed,
            "progress_percent": (completed / total * 100) if total > 0 else 0,
            "iteration": self.state["iteration"],
            "status": self.state["status"]
        }
