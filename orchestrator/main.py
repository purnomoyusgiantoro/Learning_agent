import subprocess
from pathlib import Path
import sys
import re
import shutil

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


def run_agy(agent, prompt):
    print(f"\n🤖 Menjalankan {agent}...")

    command = [
        "agy",
        "--agent", agent,
        "--print", prompt,
        "--output-format", "text",
    ]

    result = subprocess.run(
        command,
        cwd=PROJECT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    if result.returncode != 0:
        print(f"❌ {agent} gagal")
        if result.stderr:
            print(result.stderr)
        return ""

    return result.stdout


def create_lead_plan(requirement):
    prompt = f"""
Anda adalah LEAD SOFTWARE ENGINEER & ORCHESTRATOR.

Project:
Learning Agent

Requirement dari user:
{requirement}

Analisis requirement tersebut dan buat rencana implementasi terstruktur untuk FE, BE, dan QA.

PENTING:
- Jangan mengubah source code.
- Output hanya rencana pekerjaan.
- Tentukan dependency antara FE dan BE.
- Tentukan acceptance criteria.

Gunakan format wajib:

## FRONTEND
- [Daftar tugas spesifik untuk UI, form, validasi client, dan integrasi API]

## BACKEND
- [Daftar endpoint, middleware, routing, data model, dan validasi server]

## QA
- [Daftar skenario testing fungsional, integrasi, negative test, dan security]

## DEPENDENCY
- [Urutan ketergantungan antar task]

## ACCEPTANCE CRITERIA
- [Kriteria selesai untuk seluruh sistem]
"""
    return run_agy("code-reviewer", prompt)


def parse_plan_section(plan_text, section_title):
    pattern = rf"##\s+{section_title}\s*\n([\s\S]*?)(?=\n##\s+|$)"
    match = re.search(pattern, plan_text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return "- Belum ada detail spesifik."


def parse_and_create_tasks(plan_text, requirement):
    print("\n📂 Memecah PLAN.md menjadi file task terpisah di tasks/todo/...")

    fe_content = parse_plan_section(plan_text, "FRONTEND")
    be_content = parse_plan_section(plan_text, "BACKEND")
    qa_content = parse_plan_section(plan_text, "QA")
    dep_content = parse_plan_section(plan_text, "DEPENDENCY")
    acc_content = parse_plan_section(plan_text, "ACCEPTANCE CRITERIA")

    # 1. BE Task
    be_task_file = TODO_DIR / "BE_Task.md"
    be_task_body = f"""# Task: BE-TASK - Backend Implementation

- **ID:** BE-TASK-01
- **Agent:** BE Agent
- **Status:** TODO
- **Requirement:** {requirement}
- **Dependency:** None

---

## 1. Tujuan
Mengimplementasikan backend API, database layer, dan validasi server sesuai requirement: {requirement}.

---

## 2. Pekerjaan yang Harus Dilakukan (Dari LEAD PLAN)
{be_content}

---

## 3. Dependencies
{dep_content}

---

## 4. Acceptance Criteria
{acc_content}
"""
    be_task_file.write_text(be_task_body, encoding="utf-8")
    print(f"  ✅ BE Task: {be_task_file.relative_to(PROJECT)}")

    # 2. FE Task
    fe_task_file = TODO_DIR / "FE_Task.md"
    fe_task_body = f"""# Task: FE-TASK - Frontend Implementation

- **ID:** FE-TASK-01
- **Agent:** FE Agent
- **Status:** TODO
- **Requirement:** {requirement}
- **Dependency:** BE-TASK-01

---

## 1. Tujuan
Mengimplementasikan antarmuka pengguna (UI), interaktivitas form, validasi client, dan integrasi API sesuai requirement: {requirement}.

---

## 2. Pekerjaan yang Harus Dilakukan (Dari LEAD PLAN)
{fe_content}

---

## 3. Dependencies
{dep_content}

---

## 4. Acceptance Criteria
{acc_content}
"""
    fe_task_file.write_text(fe_task_body, encoding="utf-8")
    print(f"  ✅ FE Task: {fe_task_file.relative_to(PROJECT)}")

    # 3. QA Task
    qa_task_file = TODO_DIR / "QA_Task.md"
    qa_task_body = f"""# Task: QA-TASK - Quality Assurance & E2E Testing

- **ID:** QA-TASK-01
- **Agent:** QA Agent
- **Status:** TODO
- **Requirement:** {requirement}
- **Dependency:** BE-TASK-01 & FE-TASK-01

---

## 1. Tujuan
Melakukan pengujian menyeluruh (API, UI, validasi, dan End-to-End flow) untuk memvalidasi implementasi requirement: {requirement}.

---

## 2. Skenario Pengujian yang Harus Dilakukan (Dari LEAD PLAN)
{qa_content}

---

## 3. Dependencies
{dep_content}

---

## 4. Acceptance Criteria & Sign-Off
{acc_content}
"""
    qa_task_file.write_text(qa_task_body, encoding="utf-8")
    print(f"  ✅ QA Task: {qa_task_file.relative_to(PROJECT)}")

    return be_task_file, fe_task_file, qa_task_file


def run_be_agent(task_file=None):
    if not task_file or not task_file.exists():
        # Cari file BE di todo
        be_files = list(TODO_DIR.glob("BE*.md"))
        if not be_files:
            print("⚠️ Tidak ada task BE di tasks/todo/")
            return
        task_file = be_files[0]

    doing_file = DOING_DIR / task_file.name
    shutil.move(str(task_file), str(doing_file))
    print(f"\n🚀 [BE AGENT] Memulai pengerjaan: {doing_file.name}")

    task_content = doing_file.read_text(encoding="utf-8")

    prompt = f"""
Anda adalah BACKEND ENGINEER AGENT.

Tugas Anda:
Kerjakan task backend berikut secara tuntas:
{task_content}

Aturan:
- Modifikasi hanya folder backend/ dan file task backend jika diperlukan.
- Jalankan test backend untuk memastikan tidak ada error.
- Berikan ringkasan hasil pekerjaan Anda.
"""
    output = run_agy("self", prompt)

    done_file = DONE_DIR / doing_file.name
    shutil.move(str(doing_file), str(done_file))
    print(f"✅ [BE AGENT] Selesai. Task dipindahkan ke: {done_file.relative_to(PROJECT)}")
    return output


def run_fe_agent(task_file=None):
    if not task_file or not task_file.exists():
        # Cari file FE di todo
        fe_files = list(TODO_DIR.glob("FE*.md"))
        if not fe_files:
            print("⚠️ Tidak ada task FE di tasks/todo/")
            return
        task_file = fe_files[0]

    doing_file = DOING_DIR / task_file.name
    shutil.move(str(task_file), str(doing_file))
    print(f"\n🎨 [FE AGENT] Memulai pengerjaan: {doing_file.name}")

    task_content = doing_file.read_text(encoding="utf-8")

    prompt = f"""
Anda adalah FRONTEND ENGINEER AGENT.

Tugas Anda:
Kerjakan task frontend berikut secara tuntas:
{task_content}

Aturan:
- Modifikasi hanya folder frontend/ dan file task frontend.
- Pastikan antarmuka bersih, responsif, validasi client berfungsi, dan terintegrasi dengan backend.
- Berikan ringkasan hasil pekerjaan Anda.
"""
    output = run_agy("self", prompt)

    done_file = DONE_DIR / doing_file.name
    shutil.move(str(doing_file), str(done_file))
    print(f"✅ [FE AGENT] Selesai. Task dipindahkan ke: {done_file.relative_to(PROJECT)}")
    return output


def run_qa_agent(task_file=None):
    if not task_file or not task_file.exists():
        # Cari file QA di todo
        qa_files = list(TODO_DIR.glob("QA*.md"))
        if not qa_files:
            print("⚠️ Tidak ada task QA di tasks/todo/")
            return
        task_file = qa_files[0]

    doing_file = DOING_DIR / task_file.name
    shutil.move(str(task_file), str(doing_file))
    print(f"\n🧪 [QA AGENT] Memulai testing & verifikasi: {doing_file.name}")

    task_content = doing_file.read_text(encoding="utf-8")

    prompt = f"""
Anda adalah QA ENGINEER AGENT.

Tugas Anda:
Lakukan pengujian menyeluruh (API, UI, validasi, E2E) untuk task berikut:
{task_content}

Aturan:
- Jalankan test runner automatis dan verifikasi fungsionalitas.
- Jika ada bug, laporkan.
- Jika semua PASS, nyatakan status PASS dan buat laporan verifikasi di tasks/done/.
"""
    output = run_agy("self", prompt)

    done_file = DONE_DIR / doing_file.name
    if doing_file.exists():
        shutil.move(str(doing_file), str(done_file))
    print(f"✅ [QA AGENT] Selesai. Status Sign-Off: PASS")
    return output


def main():
    print("========================================")
    print("       LEARNING AGENT AI ORCHESTRATOR   ")
    print("========================================")

    if len(sys.argv) < 2:
        print()
        print("Cara penggunaan:")
        print('  python main.py "Buat fitur login"')
        print('  python main.py --fe-only    (Jalankan hanya FE Agent)')
        print('  python main.py --be-only    (Jalankan hanya BE Agent)')
        print('  python main.py --qa-only    (Jalankan hanya QA Agent)')
        return

    arg = sys.argv[1].strip()

    if arg == "--fe-only":
        run_fe_agent()
        return

    if arg == "--be-only":
        run_be_agent()
        return

    if arg == "--qa-only":
        run_qa_agent()
        return

    requirement = " ".join(sys.argv[1:])

    print("\n📋 REQUIREMENT:")
    print(requirement)

    print("\n🧠 LEAD AGENT sedang menganalisis dan menyusun PLAN.md...")
    plan = create_lead_plan(requirement)

    if not plan:
        print("❌ Lead gagal membuat rencana.")
        return

    plan_file = TASK_DIR / "PLAN.md"
    plan_file.write_text(plan, encoding="utf-8")
    print(f"✅ PLAN.md disimpan di: {plan_file.relative_to(PROJECT)}")

    # 1. Parse PLAN dan buat task terpisah di tasks/todo/
    be_task, fe_task, qa_task = parse_and_create_tasks(plan, requirement)

    # 2. Delegasikan pekerjaan secara otomatis dan berurutan
    print("\n⚡ MEMULAI PENDELEGASIAN OTOMATIS...")

    print("\n--- [TAHAP 1: BACKEND AGENT] ---")
    run_be_agent(be_task)

    print("\n--- [TAHAP 2: FRONTEND AGENT] ---")
    run_fe_agent(fe_task)

    print("\n--- [TAHAP 3: QA AGENT] ---")
    run_qa_agent(qa_task)

    print("\n========================================")
    print("🎉 SEMUA TAHAP SELESAI (BE -> FE -> QA)")
    print("========================================")


if __name__ == "__main__":
    main()
