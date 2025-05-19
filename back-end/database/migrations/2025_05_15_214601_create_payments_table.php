<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\PaymentStatus; // If you create this

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was paymentID
            $table->foreignUuid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->timestamp('payment_date')->useCurrent();
            $table->string('method'); 
            $table->enum('status', array_column(PaymentStatus::cases(), 'value'))
            ->default(PaymentStatus::PENDING->value); 
            $table->string('transaction_id')->nullable()->unique(); // From payment gateway
            $table->text('notes')->nullable();
            $table->timestamps(); // Record creation/update time
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};