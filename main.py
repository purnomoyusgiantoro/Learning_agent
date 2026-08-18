import sys
from pathlib import Path

# Set root directory
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from orchestrator.main import main

if __name__ == "__main__":
    main()
