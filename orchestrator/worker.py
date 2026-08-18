import sys
import time
import shutil
import subprocess
from pathlib import Path

# Configure UTF-8 encoding for standard output on Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT = Path(__file__).parent.parent
TASK_DIR = PROJECT / "tasks"
TODO_DIR = TASK_DIR / "todo"
DOING_DIR = TASK_DIR / "doing"
DONE_DIR = TASK_DIR / "done"

for directory in [TODO_DIR, DOING_DIR, DONE_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

def run_agy(agent, prompt):
    print(f"\n🤖 Menjalankan agen: {agent}...")
    command = [
        "agy",
        "--agent", agent,
        "--print", prompt,
        "--output-format", "text",
    ]
    
    # Kita tidak me-capture output di sini agar Anda bisa
    # melihat proses agen "mengetik/berpikir" secara live di terminal worker!
    result = subprocess.run(command, cwd=PROJECT)
    return result.returncode == 0

def process_task(task_file, role):
    doing_file = DOING_DIR / task_file.name
    shutil.move(str(task_file), str(doing_file))
    print(f"\n🚀 [{role} AGENT] Memulai pengerjaan: {doing_file.name}")

    task_content = doing_file.read_text(encoding="utf-8")
    
    agent_name = "self" # default
    prompt = ""
    
    if role == "BE":
        prompt = f"""Anda adalah BACKEND ENGINEER AGENT.\n\nTugas Anda:\nKerjakan task backend berikut secara tuntas:\n{task_content}\n\nAturan:\n- Modifikasi hanya folder backend/ dan file task backend jika diperlukan.\n- Jalankan test backend untuk memastikan tidak ada error.\n- Berikan ringkasan hasil pekerjaan Anda."""
    elif role == "FE":
        prompt = f"""Anda adalah FRONTEND ENGINEER AGENT.\n\nTugas Anda:\nKerjakan task frontend berikut secara tuntas:\n{task_content}\n\nAturan:\n- Modifikasi hanya folder frontend/ dan file task frontend.\n- Pastikan antarmuka bersih, responsif, validasi client berfungsi, dan terintegrasi dengan backend.\n- Berikan ringkasan hasil pekerjaan Anda."""
    elif role == "QA":
        prompt = f"""Anda adalah QA ENGINEER AGENT.\n\nTugas Anda:\nLakukan pengujian menyeluruh (API, UI, validasi, E2E) untuk task berikut:\n{task_content}\n\nAturan:\n- Jalankan test runner automatis dan verifikasi fungsionalitas.\n- Jika ada bug, laporkan.\n- Jika semua PASS, nyatakan status PASS dan buat laporan verifikasi di tasks/done/."""

    success = run_agy(agent_name, prompt)

    done_file = DONE_DIR / doing_file.name
    if doing_file.exists():
        shutil.move(str(doing_file), str(done_file))
    
    if success:
        print(f"✅ [{role} AGENT] Selesai. Task dipindahkan ke: {done_file.relative_to(PROJECT)}")
    else:
        print(f"❌ [{role} AGENT] Proses agen dihentikan/gagal, tapi file dipindah ke done (harap dicek manual).")

def main():
    if len(sys.argv) < 2:
        print("Penggunaan: python worker.py <ROLE>")
        print("Contoh: python worker.py BE")
        return
        
    role = sys.argv[1].upper()
    if role not in ["FE", "BE", "QA"]:
        print("Role tidak valid. Harus FE, BE, atau QA.")
        return
        
    print("========================================")
    print(f"      WORKER TERMINAL: {role} AGENT")
    print("========================================")
    print(f"Memantau folder {TODO_DIR.relative_to(PROJECT)}...\n")

    try:
        while True:
            task_files = list(TODO_DIR.glob(f"{role}*.md"))
            
            if task_files:
                task_file = task_files[0]
                process_task(task_file, role)
                print(f"\nMemantau folder {TODO_DIR.relative_to(PROJECT)} kembali...\n")
                
            time.sleep(3)
    except KeyboardInterrupt:
        print("\nWorker dihentikan.")

if __name__ == "__main__":
    main()
