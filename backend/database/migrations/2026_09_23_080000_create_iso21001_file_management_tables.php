<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->boolean('is_active')->default(true);
            $table->date('audit_target_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->string('faculty', 100)->default('Fakultas Teknik');
            $table->string('degree', 20)->default('S1');
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->string('code', 20);
            $table->string('name', 150);
            $table->unsignedTinyInteger('credits')->default(3);
            $table->unsignedTinyInteger('semester')->default(6);
            $table->string('lecturer_name', 150);
            $table->boolean('has_practicum')->default(false);
            $table->timestamps();

            $table->unique(['department_id', 'academic_period_id', 'code']);
        });

        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('item_no');
            $table->string('code', 20);
            $table->string('root_folder', 100);
            $table->string('subfolder', 150);
            $table->string('document_name', 255);
            $table->string('iso_clause', 100);
            $table->string('executor', 150);
            $table->string('level', 100);
            $table->text('instructions')->nullable();
            $table->boolean('is_per_course')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('document_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('document_folders')->cascadeOnDelete();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->foreignId('checklist_item_id')->nullable()->constrained('checklist_items')->nullOnDelete();
            $table->string('name', 150);
            $table->string('slug', 150);
            $table->string('path', 500);
            $table->boolean('is_system')->default(true);
            $table->timestamps();
        });

        Schema::create('document_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_item_id')->constrained('checklist_items')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained('document_folders')->nullOnDelete();
            $table->string('title', 255);
            $table->string('file_name', 255);
            $table->string('original_name', 255);
            $table->string('storage_path', 500);
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('file_hash', 64)->nullable();
            $table->string('current_version', 20)->default('v1.0');
            $table->string('status', 30)->default('missing'); // missing, draft, submitted, verified, rejected, not_applicable
            $table->boolean('is_digitally_signed')->default(false);
            $table->string('uploaded_by', 150)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_file_id')->constrained('document_files')->cascadeOnDelete();
            $table->string('version_number', 20);
            $table->string('storage_path', 500);
            $table->string('original_name', 255);
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('file_hash', 64)->nullable();
            $table->text('changelog')->nullable();
            $table->string('uploaded_by', 150)->nullable();
            $table->timestamps();
        });

        Schema::create('audit_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_file_id')->constrained('document_files')->cascadeOnDelete();
            $table->string('auditor_name', 150);
            $table->string('audit_status', 30)->default('pending'); // compliant, minor_observation, major_ncr, pending
            $table->string('iso_clause_ref', 100)->nullable();
            $table->text('finding_notes')->nullable();
            $table->text('corrective_action_plan')->nullable();
            $table->date('deadline')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_file_id')->constrained('document_files')->cascadeOnDelete();
            $table->string('sender_name', 150);
            $table->string('sender_role', 50); // PIC Mutu, Kaprodi, Auditor Mutu, Dosen
            $table->text('message');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_comments');
        Schema::dropIfExists('audit_verifications');
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('document_files');
        Schema::dropIfExists('document_folders');
        Schema::dropIfExists('checklist_items');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('academic_periods');
    }
};
