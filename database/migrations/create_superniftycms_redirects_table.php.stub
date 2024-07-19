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
        Schema::create('superniftycms_redirects', function (Blueprint $table) {
            $table->uuid('id', 36)->primary();
            $table->string('old_url',2500)->nullable();
            $table->string('new_url',2500)->nullable();
            $table->string('type',10)->default('301');
            $table->boolean('active')->nullable();
            $table->uuid('created_by')->default('eaac9ce2-80ab-11ed-a1eb-0242ac120002');
            $table->uuid('last_updated_by')->default('eaac9ce2-80ab-11ed-a1eb-0242ac120002');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('superniftycms_redirects');
    }
};
