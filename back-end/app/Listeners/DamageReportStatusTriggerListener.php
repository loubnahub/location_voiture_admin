<?php

namespace App\Listeners;

use App\Models\DamageReport;
use App\Services\VehicleStatusService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class DamageReportStatusTriggerListener 
{

    public function __construct(protected VehicleStatusService $vehicleStatusService) {}

    public function handle(object $event): void
    {
        if ($event->model instanceof DamageReport) {
            // We need to get the vehicle_id from the damage report's booking
            $vehicleId = $event->model->booking?->vehicle_id;
            if ($vehicleId) {
                $this->vehicleStatusService->updateStatus($vehicleId);
            }
        }
    }
}