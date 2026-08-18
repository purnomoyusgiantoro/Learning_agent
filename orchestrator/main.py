import subprocess
from pathlib import Path
import sys
import re
import time
import threading

# Configure UTF-8 encoding for standard output on Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Root project path
PROJECT = Path(__file__).parent.parent

TASK_DIR = PROJECT / "tasks"
TODO_DIR = TASK_DIR / "todo"
DOING_DIR = TASK_DIR / "doing"
DONE_DIR = TASK_DIR / "done"

for directory in [TODO_DIR, DOING_DIR, DONE_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


# ============================================================
#  Parser: Pecah PLAN.md menjadi file tugas per role
# ============================================================
def parse_plan_section(plan_text, section_title):
    pattern = rf"##\s+{section_title}\s*\n([\s\S]*?)(?=\n##\s+|$)"
    match = re.search(pattern, plan_text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return "- Belum ada detail spesifik."


def parse_and_create_tasks(plan_text, requirement):
    print("\n📂 [WATCHER] Memecah PLAN.md → tasks/todo/...")

    fe_content = parse_plan_section(plan_text, "FRONTEND")
    be_content = parse_plan_section(plan_text, "BACKEND")
    qa_content = parse_plan_section(plan_text, "QA")
    dep_content = parse_plan_section(plan_text, "DEPENDENCY")
    acc_content = parse_plan_section(plan_text, "ACCEPTANCE CRITERIA")

    # 1. BE Task
    be_task_file = TODO_DIR / "BE_Task.md"
    be_task_file.write_text(f"""# Task: BE-TASK - Backend Implementation

- **ID:** BE-TASK-01
- **Agent:** BE Agent
- **Status:** TODO
- **Requirement:** {requirement}
- **Dependency:** None

---

## 1. Tujuan
Mengimplementasikan backend API, database layer, dan validasi server sesuai requirement: {requirement}.

---

## 2. Pekerjaan (Dari LEAD PLAN)
{be_content}

---

## 3. Dependencies
{dep_content}

---

## 4. Acceptance Criteria
{acc_content}
""", encoding="utf-8")
    print(f"  ✅ BE_Task.md")

    # 2. FE Task
    fe_task_file = TODO_DIR / "FE_Task.md"
    fe_task_file.write_text(f"""# Task: FE-TASK - Frontend Implementation

- **ID:** FE-TASK-01
- **Agent:** FE Agent
- **Status:** TODO
- **Requirement:** {requirement}
- **Dependency:** BE-TASK-01

---

## 1. Tujuan
Mengimplementasikan UI, validasi client, dan integrasi API sesuai requirement: {requirement}.

---

## 2. Pekerjaan (Dari LEAD PLAN)
{fe_content}

---

## 3. Dependencies
{dep_content}

---

## 4. Acceptance Criteria
{acc_content}
""", encoding="utf-8")
    print(f"  ✅ FE_Task.md")

    # 3. QA Task
    qa_task_file = TODO_DIR / "QA_Task.md"
    qa_task_file.write_text(f"""# Task: QA-TASK - Quality Assurance & E2E Testing

- **ID:** QA-TASK-01
- **Agent:** QA Agent
- **Status:** TODO
- **Requirement:** {requirement}
- **Dependency:** BE-TASK-01 & FE-TASK-01

---

## 1. Tujuan
Melakukan pengujian menyeluruh untuk memvalidasi implementasi requirement: {requirement}.

---

## 2. Skenario Pengujian (Dari LEAD PLAN)
{qa_content}

---

## 3. Dependencies
{dep_content}

---

## 4. Acceptance Criteria & Sign-Off
{acc_content}
""", encoding="utf-8")
    print(f"  ✅ QA_Task.md")

    print("📂 [WATCHER] ✅ Semua tugas sudah dikirim ke workers!\n")


# ============================================================
#  Watcher: Pantau PLAN.md — otomatis pecah saat berubah
# ============================================================
def watch_plan_file(requirement):
    plan_file = TASK_DIR / "PLAN.md"
    last_mtime = 0

    # Catat waktu modifikasi terakhir agar tidak trigger ulang untuk file lama
    if plan_file.exists():
        last_mtime = plan_file.stat().st_mtime

    while True:
        time.sleep(2)
        try:
            if plan_file.exists():
                current_mtime = plan_file.stat().st_mtime
                if current_mtime > last_mtime:
                    last_mtime = current_mtime
                    print("\n\n👁️  [WATCHER] PLAN.md berubah! Mendistribusikan tugas...")
                    plan_text = plan_file.read_text(encoding="utf-8")
                    parse_and_create_tasks(plan_text, requirement)
        except Exception as e:
            print(f"\n[WATCHER] ❌ Error: {e}")


# ============================================================
#  MAIN — Cukup 1 terminal. Semuanya otomatis.
# ============================================================
def main():
    print("========================================")
    print("   LEARNING AGENT AI ORCHESTRATOR")
    print("========================================")

    if len(sys.argv) < 2:
        print()
        print("Cara penggunaan:")
        print('  python main.py "Buat fitur login"')
        return

    requirement = " ".join(sys.argv[1:])

    print(f"\n📋 REQUIREMENT: {requirement}")

    # --------------------------------------------------
    #  1. Jalankan 3 Workers otomatis di belakang layar
    # --------------------------------------------------
    worker_script = Path(__file__).parent / "worker.py"
    worker_procs = []

    for role in ["BE", "FE", "QA"]:
        proc = subprocess.Popen(
            [sys.executable, str(worker_script), role],
            cwd=str(PROJECT),
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
        )
        worker_procs.append(proc)
        print(f"  🤖 Worker {role} aktif (PID: {proc.pid})")

    print("✅ Semua workers berjalan di belakang layar!\n")

    # --------------------------------------------------
    #  2. Jalankan Watcher (pantau PLAN.md)
    # --------------------------------------------------
    print("👁️  [WATCHER] Aktif — memantau tasks/PLAN.md...")
    watcher = threading.Thread(target=watch_plan_file, args=(requirement,), daemon=True)
    watcher.start()

    # --------------------------------------------------
    #  3. Langsung buka chat interaktif dengan Lead Agent
    # --------------------------------------------------
    print("💬 Membuka sesi chat dengan Lead Agent...\n")

    lead_prompt = f"""Anda adalah LEAD SOFTWARE ENGINEER & ORCHESTRATOR untuk project Learning Agent.

REQUIREMENT DARI USER:
{requirement}

TUGAS ANDA:
1. Analisis requirement di atas.
2. Buat rencana implementasi terstruktur.
3. SIMPAN rencana tersebut ke file tasks/PLAN.md menggunakan tools Anda.

FORMAT WAJIB untuk isi PLAN.md:

## FRONTEND
- [Daftar tugas FE]

## BACKEND
- [Daftar tugas BE]

## QA
- [Daftar skenario testing]

## DEPENDENCY
- [Urutan ketergantungan]

## ACCEPTANCE CRITERIA
- [Kriteria selesai]

PENTING:
- Anda HARUS menulis/menyimpan rencana ke file tasks/PLAN.md menggunakan write tools Anda.
- Setelah menyimpan, sistem otomatis akan mendistribusikan tugas ke agen FE, BE, dan QA.
- User bisa meminta Anda merevisi rencana kapan saja. Jika direvisi, simpan ulang ke tasks/PLAN.md.
"""

    command = [
        "agy",
        "--prompt-interactive", lead_prompt,
    ]

    try:
        subprocess.run(command, cwd=PROJECT)
    finally:
        # Bersihkan worker saat Lead Agent ditutup
        print("\n🧹 Menghentikan semua workers...")
        for proc in worker_procs:
            try:
                proc.terminate()
                proc.wait(timeout=5)
            except Exception:
                proc.kill()
        print("👋 Semua proses telah dihentikan.")


if __name__ == "__main__":
    main()

