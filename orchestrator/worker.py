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


# ============================================================
#  Worker: Jalankan agen secara OTOMATIS (--print mode)
#  Tidak perlu interaksi manusia. Robot murni.
# ============================================================
def run_agy(agent, prompt):
    """Jalankan agy dalam mode otomatis --print. Output ditampilkan live."""
    command = [
        "agy",
        "--agent", agent,
        "--print", prompt,
    ]

    # Tidak capture output agar user bisa melihat proses live di terminal
    result = subprocess.run(command, cwd=PROJECT)
    return result.returncode == 0


def process_task(task_file, role):
    # Pindahkan dari todo -> doing
    doing_file = DOING_DIR / task_file.name
    shutil.move(str(task_file), str(doing_file))
    print(f"\n{'='*50}")
    print(f"🚀 [{role} AGENT] Memulai: {doing_file.name}")
    print(f"{'='*50}")

    task_content = doing_file.read_text(encoding="utf-8")

    agent_name = "self"  # default agent

    if role == "BE":
        prompt = f"""Anda adalah BACKEND ENGINEER AGENT.

Tugas Anda:
Kerjakan task backend berikut secara tuntas:
{task_content}

Aturan:
- Modifikasi hanya folder backend/ dan file terkait backend.
- Jalankan test backend untuk memastikan tidak ada error.
- Berikan ringkasan hasil pekerjaan Anda."""

    elif role == "FE":
        prompt = f"""Anda adalah FRONTEND ENGINEER AGENT.

Tugas Anda:
Kerjakan task frontend berikut secara tuntas:
{task_content}

Aturan:
- Modifikasi hanya folder frontend/ dan file terkait frontend.
- Pastikan antarmuka bersih, responsif, validasi client berfungsi, dan terintegrasi dengan backend.
- Berikan ringkasan hasil pekerjaan Anda."""

    elif role == "QA":
        prompt = f"""Anda adalah QA ENGINEER AGENT.

Tugas Anda:
Lakukan pengujian menyeluruh (API, UI, validasi, E2E) untuk task berikut:
{task_content}

Aturan:
- Jalankan test runner automatis dan verifikasi fungsionalitas.
- Jika ada bug, laporkan.
- Jika semua PASS, nyatakan status PASS dan buat laporan verifikasi."""
    else:
        prompt = task_content

    # Jalankan agen secara otomatis (tanpa interaksi)
    print(f"🤖 [{role}] Agen sedang bekerja...\n")
    success = run_agy(agent_name, prompt)

    # Pindahkan dari doing -> done
    done_file = DONE_DIR / doing_file.name
    if doing_file.exists():
        shutil.move(str(doing_file), str(done_file))

    if success:
        print(f"\n✅ [{role} AGENT] Selesai! → {done_file.relative_to(PROJECT)}")
    else:
        print(f"\n❌ [{role} AGENT] Gagal/dihentikan → {done_file.relative_to(PROJECT)}")

    return success


def main():
    if len(sys.argv) < 2:
        print("Penggunaan: python worker.py <ROLE>")
        print("Contoh:     python worker.py BE")
        print("            python worker.py FE")
        print("            python worker.py QA")
        return

    role = sys.argv[1].upper()
    if role not in ["FE", "BE", "QA"]:
        print("Role tidak valid. Harus FE, BE, atau QA.")
        return

    print("========================================")
    print(f"  🤖 WORKER: {role} AGENT (MODE OTOMATIS)")
    print("========================================")
    print(f"Memantau folder {TODO_DIR.relative_to(PROJECT)}...")
    print("Akan otomatis mengerjakan tugas yang masuk.\n")

    try:
        while True:
            task_files = list(TODO_DIR.glob(f"{role}*.md"))

            if task_files:
                task_file = task_files[0]
                process_task(task_file, role)
                print(f"\n⏳ Kembali memantau folder {TODO_DIR.relative_to(PROJECT)}...\n")

            time.sleep(3)
    except KeyboardInterrupt:
        print("\n\n👋 Worker dihentikan.")


if __name__ == "__main__":
    main()
