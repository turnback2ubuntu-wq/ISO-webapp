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
        Schema::table('document_files', function (Blueprint $table) {
            $table->text('drive_url')->nullable()->after('storage_path');
            $table->string('source_type', 40)->default('direct_upload')->after('drive_url'); // direct_upload, google_drive_link, google_drive_synced
            $table->boolean('is_external_link')->default(false)->after('source_type');
            $table->boolean('sync_to_git')->default(false)->after('is_external_link');
            $table->timestamp('last_synced_at')->nullable()->after('sync_to_git');

            // Make physical file paths nullable to support link-only documents
            $table->string('file_name', 255)->nullable()->change();
            $table->string('original_name', 255)->nullable()->change();
            $table->string('storage_path', 500)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_files', function (Blueprint $table) {
            $table->dropColumn([
                'drive_url',
                'source_type',
                'is_external_link',
                'sync_to_git',
                'last_synced_at',
            ]);

            $table->string('file_name', 255)->nullable(false)->change();
            $table->string('original_name', 255)->nullable(false)->change();
            $table->string('storage_path', 500)->nullable(false)->change();
        });
    }
};
